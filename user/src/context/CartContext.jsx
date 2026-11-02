// // src/context/CartContext.jsx
// import React, { createContext, useContext, useState, useEffect } from "react";

// const CartContext = createContext();

// export const CartProvider = ({ children }) => {
//   const [cartItems, setCartItems] = useState(() => {
//     return JSON.parse(localStorage.getItem("cartItems")) || [];
//   });

//   useEffect(() => {
//     localStorage.setItem("cartItems", JSON.stringify(cartItems));
//   }, [cartItems]);

//   return (
//     <CartContext.Provider value={{ cartItems, setCartItems }}>
//       {children}
//     </CartContext.Provider>
//   );
// };

// export const useCart = () => useContext(CartContext);



import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // Load from localStorage on initial render
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });


  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item) => {
    setCartItems((prev) => {
      // Handle both id and menuItemId for compatibility.
      const itemId = item.id || item.menuItemId;
      const existing = prev.find((i) => (i.id || i.menuItemId) === itemId);
      if (existing) {
        return prev.map((i) =>
          (i.id || i.menuItemId) === itemId ? { ...i, quantity: (i.quantity || 0) + (item.quantity || 1) } : i
        );
      }
      return [...prev, { ...item, id: itemId }];
    });
  };

  const removeFromCart = (id) => {
    console.log("🗑️ Removing from cart context:", id);
    setCartItems((prev) => {
      const filtered = prev.filter((i) => (i.id || i.menuItemId) !== id);
      console.log("🗑️ Cart before removal:", prev);
      console.log("🗑️ Cart after removal:", filtered);
      return filtered;
    });
  };

  const updateCartFromBackend = (backendCartData) => {
    console.log("🔄 Updating cart context from backend:", backendCartData);
    // Convert backend cart data to context format
    const contextItems = [];

    // Add regular menu items
    if (backendCartData.items) {
      backendCartData.items.forEach(item => {
        contextItems.push({
          id: item.menuItemId,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price
        });
      });
    }

    // Add box items
    if (backendCartData.box) {
      backendCartData.box.forEach(box => {
        contextItems.push({
          id: `tiffinbox:${box.customizeBoxId}:${box.id}`,
          quantity: box.quantity || 1,
          price: box.totalPrice
        });
      });
    }

    // Add fruit bowl items
    if (backendCartData.fruiteBowlOrders) {
      backendCartData.fruiteBowlOrders.forEach(bowl => {
        contextItems.push({
          id: `fruitbowl:${bowl.customizeBowlId}:${bowl.id}`,
          quantity: bowl.quantity || 1,
          price: bowl.totalPrice
        });
      });
    }

    console.log("🔄 Setting cart context items:", contextItems);
    setCartItems(contextItems);
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateCartFromBackend, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);


