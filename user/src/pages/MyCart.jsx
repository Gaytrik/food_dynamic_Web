import React, { useEffect, useState, useMemo } from "react";
import axiosInstance from "../api/axiosInstance";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function MyCart() {
  const { removeFromCart, updateCartFromBackend } = useCart();
  const navigate = useNavigate();
  const [cartData, setCartData] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [boxItems, setBoxItems] = useState([]);
  const [fruitBowls, setFruitBowls] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return;
    fetchCart();
  }, [userId]);

  const fetchCart = async () => {
    try {
      const res = await axiosInstance.get(`/api/cart/${userId}`);
      const data = res.data;
      setCartData(data);
      updateCartFromBackend(data);

      const items = data.items || [];
      const detailedMenu = await Promise.all(
        items.map(async (item) => {
          try {
            const res2 = await axiosInstance.get(`/api/menu/${item.menuItemId}`);
            return { ...item, menuData: res2.data };
          } catch {
            return { ...item, menuData: null };
          }
        })
      );

      const boxes = data.box || [];
      const detailedBoxes = await Promise.all(
        boxes.map(async (box) => {
          try {
            const res2 = await axiosInstance.get(`/api/box/${box.customizeBoxId}`);
            const boxData = res2.data;
            const sabjiDetails = await Promise.all(
              (box.sabjiId || []).map(async (sid) => {
                try {
                  const r = await axiosInstance.get(`/api/menu/${sid}`);
                  return r.data;
                } catch {
                  return { _id: sid, menuName: `Sabji ${sid}` };
                }
              })
            );
            const sabjiNames = sabjiDetails
              .map((s) => s?.menuName || `Sabji ${s?._id || ""}`)
              .join(", ");

            return { ...box, boxData, sabjiDetails, sabjiNames };
          } catch {
            return { ...box, boxData: null, sabjiDetails: [], sabjiNames: "" };
          }
        })
      );

      const bowls = data.fruiteBowlOrders || [];
      const detailedBowls = await Promise.all(
        bowls.map(async (b) => {
          try {
            const cfgRes = await axiosInstance.get(`/api/fruit-bowl/${b.customizeBowlId}`);
            const cfg = cfgRes.data;
            const fruitDetails = await Promise.all(
              (b.menuId || []).map(async (fid) => {
                try {
                  const fr = await axiosInstance.get(`/api/menu/${fid}`);
                  return fr.data;
                } catch {
                  return null;
                }
              })
            );
            return { ...b, bowlConfig: cfg, fruitDetails: fruitDetails.filter(Boolean) };
          } catch {
            return { ...b, bowlConfig: null, fruitDetails: [] };
          }
        })
      );

      setMenuItems(detailedMenu);
      setBoxItems(detailedBoxes);
      setFruitBowls(detailedBowls);
    } catch (err) {
      console.error("Cart Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (menuItemId) => {
    try {
      await axiosInstance.delete(`/api/cart/${userId}/item/${menuItemId}`);
      removeFromCart(menuItemId);
      fetchCart();
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  const removeBox = async (boxId) => {
    if (!boxId) return;
    try {
      await axiosInstance.delete(`/api/box-order/cart/${userId}/${boxId}`);
      const boxContextId = `tiffinbox:${boxId}`;
      removeFromCart(boxContextId);
      fetchCart();
    } catch (err) {
      console.error(" Error removing box:", err);
    }
  };

  const removeFruitBowl = async (bowlOrderId) => {
    if (!bowlOrderId) return;
    try {
      await axiosInstance.delete(`/api/fruit-bowl-order/cart/${userId}/${bowlOrderId}`);
      const bowlContextId = `fruitbowl:${bowlOrderId}`;
      removeFromCart(bowlContextId);
      fetchCart();
    } catch (err) {
      console.error(" Error removing fruit bowl:", err);
    }
  };

  const changeItemQty = async (menuItemId, delta) => {
    try {
      const target = menuItems.find((i) => i.menuItemId === menuItemId);
      if (delta < 0 && (target?.quantity || 0) <= 1) {
        await removeItem(menuItemId);
        return;
      }
      await axiosInstance.post(`/api/cart/${userId}/add`, {
        menuItemId,
        quantity: delta,
        price: target?.price,
      });
      await fetchCart();
    } catch (err) {
      console.error(" Error updating item quantity:", err);
    }
  };

  const changeFruitBowlQty = async (order, delta) => {
    try {
      if (delta < 0 && (order?.quantity || 0) <= 1) {
        await removeFruitBowl(order.id);
        return;
      }
      await axiosInstance.post(`/api/fruit-bowl-order/add`, {
        userId,
        customizeBowlId: order.customizeBowlId,
        fruitIds: order.menuId || [],
        quantity: delta,
      });
      await fetchCart();
    } catch (err) {
      console.error(" Error updating fruit plate quantity:", err);
    }
  };

  const changeBoxQty = async (box, delta) => {
    try {
      if (delta < 0 && (box?.quantity || 0) <= 1) {
        await removeBox(box.id);
        return;
      }
      await axiosInstance.post(`/api/box-order/add`, {
        userId,
        customizeBoxId: box.customizeBoxId,
        sabjiIds: box.sabjiId || [],
        rotiTypes: box.rotis?.map((r) => r.type) || [],
        quantity: delta,
      });
      await fetchCart();
    } catch (err) {
      console.error(" Error updating box quantity:", err);
    }
  };

  const [pricingBreakdown, setPricingBreakdown] = useState({
    subtotal: 0,
    gstAmount: 0,
    deliveryCharge: 0,
    totalAmount: 0,
    gstPercentage: 5,
    freeDeliveryThreshold: 150,
  });

  const subtotal = useMemo(() => {
    const menuTotal = menuItems.reduce((sum, i) => sum + (i.quantity || 0) * (i.price || 0), 0);
    const boxTotal = boxItems.reduce((sum, i) => sum + (i.totalPrice || 0) * (i.quantity || 1), 0);
    const fruitTotal = fruitBowls.reduce((sum, b) => sum + (b.totalPrice || 0) * (b.quantity || 1), 0);
    return menuTotal + boxTotal + fruitTotal;
  }, [menuItems, boxItems, fruitBowls]);

  useEffect(() => {
    const fetchPricingBreakdown = async () => {
      if (subtotal > 0) {
        try {
          const response = await axiosInstance.get(
            `/api/settings/pricing-breakdown?subtotal=${subtotal}`
          );
          setPricingBreakdown(response.data);
        } catch {
          const gstAmount = subtotal * 0.05;
          const deliveryCharge = subtotal >= 150 ? 0 : 50;
          const totalAmount = subtotal + gstAmount + deliveryCharge;
          setPricingBreakdown({
            subtotal,
            gstAmount,
            deliveryCharge,
            totalAmount,
            gstPercentage: 5,
            freeDeliveryThreshold: 150,
          });
        }
      } else {
        setPricingBreakdown({
          subtotal: 0,
          gstAmount: 0,
          deliveryCharge: 0,
          totalAmount: 0,
          gstPercentage: 5,
          freeDeliveryThreshold: 150,
        });
      }
    };
    fetchPricingBreakdown();
  }, [subtotal, userId]);

  if (loading) return <div className="p-6 text-center text-[var(--accent)]">Loading cart...</div>;

  if ((!menuItems.length && !boxItems.length && !fruitBowls.length) || !cartData)
    return (
      <div className="flex flex-col items-center justify-center text-center py-32 px-4">
        <ShoppingCart className="w-24 h-24 text-gray-400 mb-4 opacity-90" />
        <h1 className="text-3xl font-bold text-[var(--primary)]">Your Cart is Empty</h1>
        <p className="text-gray-500 mt-2 text-base">Looks like you haven't added anything yet.</p>
        <button
          onClick={() => navigate("/menu")}
          className="mt-5 px-6 py-3 text-base font-semibold hover:shadow-md transition bg-[var(--primary)] text-[var(--secondary)]"
        >
          Browse Menu
        </button>
      </div>
    );

  return (
    <div className="bg-[var(--secondary)] min-h-screen py-4">
      <div className="container mx-auto px-4 md:px-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--accent)] mb-6">Your Cart</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT SIDE ITEMS */}
          <div className="lg:w-2/3 space-y-6">
            {/* Menu Items */}
            {menuItems.length > 0 && (
              <div className="bg-[var(--secondary)] rounded-lg shadow border border-gray-200">
                <h2 className="text-lg md:text-xl font-bold text-[var(--accent)] border-b border-gray-200 px-4 md:px-6 py-3">
                  Menu Items
                </h2>
                <div className="divide-y divide-gray-200">
                  {menuItems.map((item) => (
                    <div
                      key={item.menuItemId}
                      className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center sm:gap-6"
                    >
                      <img
                        src={item.menuData?.imageUrl}
                        className="w-46 sm:w-24 h-32 sm:h-24 rounded object-cover mx-auto sm:mx-0 mb-3 sm:mb-0"
                      />
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-base md:text-lg font-semibold text-[var(--accent)]">
                          {item.menuData?.menuName}
                        </h3>
                        <p className="text-gray-500 text-sm">{item.menuData?.menuCategory}</p>
                        <p className="text-lg font-bold mt-1 text-[var(--accent)]">₹{item.price}</p>
                        {/* <button
                          onClick={() => removeItem(item.menuItemId)}
                          className="text-red-500 text-sm mt-2 hover:underline"
                        >
                          Remove
                        </button> */}
                      </div>
                      <div className="flex justify-center sm:justify-end items-center gap-2 mt-3 sm:mt-0">
                        <button
                          onClick={() => changeItemQty(item.menuItemId, -1)}
                          className="p-2 border border-gray-300 rounded hover:bg-gray-100"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => changeItemQty(item.menuItemId, 1)}
                          className="p-2 border border-gray-300 rounded hover:bg-gray-100"
                        >
                          <Plus size={14} />
                        </button>
                        <span className="ml-3 font-bold text-base text-[var(--accent)]">
                          ₹{(item.quantity * item.price).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fruit Bowls */}
            {fruitBowls.length > 0 && (
              <div className="bg-[var(--secondary)] rounded-lg shadow border border-gray-200">
                <h2 className="text-lg md:text-xl font-bold text-[var(--accent)] border-b border-gray-200 px-4 md:px-6 py-3">
                  Custom Fruit Plate
                </h2>
                <div className="divide-y divide-gray-200">
                  {fruitBowls.map((fb) => (
                    <div
                      key={fb.id}
                      className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center sm:gap-6"
                    >
                      <img
                        src={fb.imageUrl || "/Images/fruit-plate.jpg"}
                        alt="Fruit Plate"
                        className="w-46 sm:w-24 h-32 sm:h-24 rounded object-cover mx-auto sm:mx-0 mb-3 sm:mb-0"
                        onError={(e) => (e.target.src = "/Images/fruit-plate.jpg")}
                      />
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-base md:text-lg font-semibold text-[var(--accent)]">
                          Custom Fruit Plate
                          {fb.bowlConfig?.type && (
                            <span className="text-sm text-gray-500">
                              {" "}
                              ({fb.bowlConfig.type})
                            </span>
                          )}
                        </h3>
                        <p className="text-gray-500 text-sm mb-1">
                          Fruits: {fb.fruitDetails?.map((f) => f.menuName).join(", ")}
                        </p>
                        <p className="text-lg font-bold text-[var(--accent)]">
                          ₹{fb.totalPrice || fb.bowlConfig?.price || 0}
                        </p>
                        {/* <button
                          onClick={() => removeFruitBowl(fb.id)}
                          className="text-red-500 text-sm mt-2 hover:underline"
                        >
                          Remove
                        </button> */}
                      </div>
                      <div className="flex justify-center sm:justify-end items-center gap-2 mt-3 sm:mt-0">
                        <button
                          onClick={() => changeFruitBowlQty(fb, -1)}
                          className="p-2 border border-gray-300 rounded hover:bg-gray-100"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-semibold">{fb.quantity}</span>
                        <button
                          onClick={() => changeFruitBowlQty(fb, 1)}
                          className="p-2 border border-gray-300 rounded hover:bg-gray-100"
                        >
                          <Plus size={14} />
                        </button>
                        <span className="ml-3 font-bold text-base text-[var(--accent)]">
                          ₹{(
                            (fb.totalPrice || fb.bowlConfig?.price || 0) * (fb.quantity || 1)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customized Boxes */}
            {boxItems.length > 0 && (
              <div className="bg-[var(--secondary)] rounded-lg shadow border border-gray-200">
                <h2 className="text-lg md:text-xl font-bold text-[var(--accent)] border-b border-gray-200 px-4 md:px-6 py-3">
                  Customized Boxes
                </h2>
                <div className="divide-y divide-gray-200">
                  {boxItems.map((box) => (
                    <div
                      key={box.id || box._id}
                      className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center sm:gap-6"
                    >
                      <img
                        src={box.imageUrl || "/Images/custom-tiffin.jpg"}
                        alt="Customized Tiffin Box"
                        className="w-46 sm:w-24 h-32 sm:h-24 rounded object-cover mx-auto sm:mx-0 mb-3 sm:mb-0"
                        onError={(e) => (e.target.src = "/Images/custom-tiffin.jpg")}
                      />
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-base md:text-lg font-semibold text-[var(--accent)]">
                          {box.boxData?.boxType} Box
                        </h3>
                        <p className="text-gray-500 text-sm">
                          Sabjis: {box.sabjiNames || "No sabjis selected"}
                        </p>
                        <p className="text-gray-500 text-sm">
                          Rotis: {box.rotis
                            ?.map((r) => `${r.type} (${r.count})`)
                            .join(", ")}
                        </p>
                        {box.includeRice && (
                          <p className="text-gray-500 text-sm">Includes Rice</p>
                        )}
                        <p className="text-lg font-bold text-[var(--accent)] mt-1">
                          ₹{box.totalPrice || 0}
                        </p>
                        {/* <button
                          onClick={() => removeBox(box.id)}
                          className="text-red-500 text-sm mt-2 hover:underline"
                        >
                          Remove Box
                        </button> */}
                      </div>
                      <div className="flex justify-center sm:justify-end items-center gap-2 mt-3 sm:mt-0">
                        <button
                          onClick={() => changeBoxQty(box, -1)}
                          className="p-2 border border-gray-300 rounded hover:bg-gray-100"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {box.quantity}
                        </span>
                        <button
                          onClick={() => changeBoxQty(box, 1)}
                          className="p-2 border border-gray-300 rounded hover:bg-gray-100"
                        >
                          <Plus size={14} />
                        </button>
                        <span className="ml-3 font-bold text-base text-[var(--accent)]">
                          ₹{(box.totalPrice * box.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ORDER SUMMARY */}
          <div className="lg:w-1/3 bg-[var(--secondary)] rounded-lg shadow border border-gray-200 p-5 h-fit sticky top-24">
            <h2 className="text-lg md:text-xl font-bold mb-3 text-[var(--accent)]">
              Order Summary
            </h2>
            <div className="space-y-1 text-sm md:text-base">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{pricingBreakdown.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST ({pricingBreakdown.gstPercentage}%):</span>
                <span>₹{pricingBreakdown.gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span>
                  {pricingBreakdown.deliveryCharge === 0
                    ? "Free"
                    : `₹${pricingBreakdown.deliveryCharge.toFixed(2)}`}
                </span>
              </div>
              <div className="border-t border-gray-300 my-2"></div>
              <div className="flex justify-between text-base md:text-lg font-bold text-[var(--accent)]">
                <span>Total:</span>
                <span>₹{pricingBreakdown.totalAmount.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={() => navigate("/checkout")}
              className="w-full py-3 mt-4 bg-[var(--primary)] rounded-md text-[var(--secondary)] font-semibold hover:shadow-lg transition-all"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
