// import React from "react";
// import { Utensils, IndianRupee, Wheat, Soup } from "lucide-react";

// const BoxFormFields = ({ formData, setFormData }) => {
//   const handleChange = (e) => {
//     const { name, type, value, checked } = e.target;
//     setFormData({
//       ...formData,
//       [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
//     });
//   };

//   const handleRotiTypeChange = (roti) => {
//     const rotiList = formData.rotiType || [];
//     const updated = rotiList.includes(roti)
//       ? rotiList.filter((r) => r !== roti)
//       : [...rotiList, roti];
//     setFormData({ ...formData, rotiType: updated });
//   };

//   const rotiOptions = ["Roti", "Naan", "Paratha"];

//   return (
//     <div className="bg-gray-50 rounded-xl shadow-inner p-4 mt-2 border border-gray-100">
//       <h3 className="font-bold text-xl mb-6 text-[var(--accent)] flex items-center gap-2">
//         <Utensils className="w-6 h-6 text-[var(--primary)]" /> Box Configuration
//       </h3>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

//         {/* Sabji Count */}
//         <label className="flex flex-col">
//           <span className="text-sm font-medium text-[var(--gray)] mb-1">Sabji Count</span>
//           <input
//             type="number"
//             name="sabjiCount"
//             value={formData.sabjiCount}
//             onChange={handleChange}
//             className="border border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition"
//           />
//         </label>

//         {/* Chappti Count */}
//         <label className="flex flex-col">
//           <span className="text-sm font-medium text-[var(--gray)] mb-1">Chapatti Count</span>
//           <input
//             type="number"
//             name="chapptiCount"
//             value={formData.chapptiCount}
//             onChange={handleChange}
//             className="border border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition"
//           />
//         </label>

//         {/* Price */}
//         <label className="flex flex-col">
//           <span className="text-sm font-medium text-[var(--gray)] mb-1 flex items-center">Price (₹) <IndianRupee size={14} className="ml-1 text-[var(--primary)]" /></span>
//           <input
//             type="number"
//             name="price"
//             value={formData.price}
//             onChange={handleChange}
//             className="border border-gray-200 p-2 rounded-lg font-bold text-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition"
//           />
//         </label>
//       </div>

//       <div className="mt-4">
//         {/* Roti Type Checkboxes */}
//         <span className="text-sm font-medium text-[var(--gray)] mb-2 block flex items-center gap-1">
//             <Wheat className="w-4 h-4 text-[var(--primary)]" /> Roti Types Available
//         </span>
//         <div className="flex flex-wrap gap-4 mt-1">
//           {rotiOptions.map((roti) => (
//             <label 
//                 key={roti} 
//                 className={`flex items-center gap-2 text-base font-medium border px-4 py-1.5 rounded-full transition 
//                            ${(formData.rotiType || []).includes(roti) ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-md' : 'bg-white text-[var(--accent)] border-gray-300 hover:bg-gray-100'}`}>
//               <input
//                 type="checkbox"
//                 checked={(formData.rotiType || []).includes(roti)}
//                 onChange={() => handleRotiTypeChange(roti)}
//                 className="hidden" // Hide native checkbox
//               />
//               {roti}
//             </label>
//           ))}
//         </div>
//       </div>

//       {/* Add-ons Section */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-3 pt-4 border-t border-gray-200">

//         {/* Include Rice */}
//         <label className="flex items-center gap-3 text-base font-medium text-[var(--accent)] cursor-pointer p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition">
//           <input
//             type="checkbox"
//             name="isRice"
//             checked={formData.isRice}
//             onChange={handleChange}
//             className="w-5 h-5 text-[var(--primary)] p-3 border-gray-300 rounded focus:ring-[var(--primary)]"
//           />
//           Include Rice 
//         </label>

//         {/* Include Dessert */}
//         <label className="flex items-center gap-3 text-base font-medium text-[var(--accent)] cursor-pointer p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition">
//           <input
//             type="checkbox"
//             name="isDesert"
//             checked={formData.isDesert}
//             onChange={handleChange}
//             className="w-5 h-5 text-[var(--primary)] p-3 border-gray-300 rounded focus:ring-[var(--primary)]"
//           />
//           Include Dessert 
//         </label>

//         {/* Dessert Count (Conditional) */}
//         {formData.isDesert && (
//           <label className="flex flex-col">
//             <span className="text-sm font-medium text-[var(--gray)] mb-1">Dessert Count</span>
//             <input
//               type="number"
//               name="desertCount"
//               value={formData.desertCount}
//               onChange={handleChange}
//               className="border border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition"
//             />
//           </label>
//         )}
//       </div>
//     </div>
//   );
// };

// export default BoxFormFields;



import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Utensils, IndianRupee, Wheat } from "lucide-react";

const BoxFormFields = forwardRef(({ formData, setFormData }, ref) => {
  const [errors, setErrors] = useState({});
  // Dynamic Roti handling
  const [rotiOptions, setRotiOptions] = useState(formData.rotiType || []);
  const [newRoti, setNewRoti] = useState("");

  // 🧾 API sync - update backend rotiType when changed
  const updateRotiBackend = async (updatedRotis) => {
    try {
      await fetch(`/api/customizebox/${formData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, rotiType: updatedRotis }),
      });
    } catch (err) {
      console.error("Error updating rotiType:", err);
    }
  };

  // 🧩 Sync roti options when formData updates (e.g., from backend)
  useEffect(() => {
    if (Array.isArray(formData.rotiType) && formData.rotiType.length > 0) {
      setRotiOptions(formData.rotiType);
    }
  }, [formData.rotiType]);


  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleRotiTypeChange = (roti) => {
    const rotiList = formData.rotiType || [];
    const updated = rotiList.includes(roti)
      ? rotiList.filter((r) => r !== roti)
      : [...rotiList, roti];
    setFormData({ ...formData, rotiType: updated });
    setErrors((prev) => ({ ...prev, rotiType: "" }));
  };

  // ✅ Validation logic for all fields
  const validate = () => {
    const newErrors = {};

    // Sabji Count
    if (!formData.sabjiCount || formData.sabjiCount <= 0) {
      newErrors.sabjiCount = "Please enter a valid sabji count.";
    }

    // Chapatti Count
    if (!formData.chapptiCount || formData.chapptiCount <= 0) {
      newErrors.chapptiCount = "Please enter a valid chapatti count.";
    }

    // Roti Type
    if (!formData.rotiType || formData.rotiType.length === 0) {
      newErrors.rotiType = "Please select at least one roti type.";
    }

    // Price
    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Please enter a valid price greater than 0.";
    }

    // Dessert Validation
    if (formData.isDesert) {
      if (!formData.desertCount || formData.desertCount <= 0) {
        newErrors.desertCount = "Please enter dessert count.";
      }
    }

    // Rice and Dessert should not both be false if box type is main meal
    if (!formData.isRice && !formData.isDesert && formData.boxType?.toLowerCase().includes("meal")) {
      newErrors.isRice = "Select at least one add-on (Rice or Dessert).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Expose validate to parent
  useImperativeHandle(ref, () => ({
    validateForm: validate,
  }));

  return (
    <div className="bg-gray-50 rounded-xl shadow-inner p-4 mt-2 border border-gray-100">
      <h3 className="font-bold text-xl mb-6 text-[var(--accent)] flex items-center gap-2">
        <Utensils className="w-6 h-6 text-[var(--primary)]" /> Box Configuration
      </h3>

      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sabji Count */}
        <label className="flex flex-col">
          <span className="text-sm font-medium text-[var(--gray)] mb-1">Sabji Count</span>
          <input
            type="number"
            name="sabjiCount"
            value={formData.sabjiCount}
            onChange={handleChange}
            className={`border p-2 rounded-lg focus:ring-2 focus:ring-[var(--primary)] ${errors.sabjiCount ? "border-red-500" : "border-gray-200"
              }`}
          />
          {errors.sabjiCount && <p className="text-red-500 text-xs mt-1">{errors.sabjiCount}</p>}
        </label>

        {/* Chapatti Count */}
        <label className="flex flex-col">
          <span className="text-sm font-medium text-[var(--gray)] mb-1">Chapatti Count</span>
          <input
            type="number"
            name="chapptiCount"
            value={formData.chapptiCount}
            onChange={handleChange}
            className={`border p-2 rounded-lg focus:ring-2 focus:ring-[var(--primary)] ${errors.chapptiCount ? "border-red-500" : "border-gray-200"
              }`}
          />
          {errors.chapptiCount && <p className="text-red-500 text-xs mt-1">{errors.chapptiCount}</p>}
        </label>

        {/* Price */}
        <label className="flex flex-col">
          <span className="text-sm font-medium text-[var(--gray)] mb-1 flex items-center">
            Price (₹) <IndianRupee size={14} className="ml-1 text-[var(--primary)]" />
          </span>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className={`border p-2 rounded-lg font-bold text-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] ${errors.price ? "border-red-500" : "border-gray-200"
              }`}
          />
          {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
        </label>
      </div>

      {/* Roti Types */}
      <div className="mt-5">
        <span className="text-sm font-medium text-[var(--gray)] mb-2 block flex items-center gap-1">
          <Wheat className="w-4 h-4 text-[var(--primary)]" /> Roti Types Available
        </span>
        {/* Dynamic Roti Types with Add/Delete */}
        <div className="flex flex-wrap gap-3 mt-2">
          {/* Input to add new roti */}
          <input
            type="text"
            placeholder="Add new roti (e.g. Missi Roti)"
            value={newRoti}
            onChange={(e) => setNewRoti(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const clean = newRoti.trim();
                if (clean && !rotiOptions.some(r => r.toLowerCase() === clean.toLowerCase())) {
                  const updated = [...rotiOptions, clean];
                  setRotiOptions(updated);
                  setFormData({ ...formData, rotiType: updated });
                  updateRotiBackend(updated); // 🔄 update backend immediately
                }
                setNewRoti("");
              }
            }}
            className="border border-gray-300 rounded-full px-4 py-1.5 text-sm focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
          />

          {/* Show rotis as pills */}
          {rotiOptions.map((roti) => (
            <div
              key={roti}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full cursor-pointer transition ${(formData.rotiType || []).includes(roti)
                ? "bg-[var(--primary)] text-white"
                : "bg-gray-100 text-[var(--accent)] hover:bg-gray-200"
                }`}
              onClick={() => {
                const alreadySelected = (formData.rotiType || []).includes(roti);
                const updated = alreadySelected
                  ? formData.rotiType.filter((r) => r !== roti)
                  : [...(formData.rotiType || []), roti];
                setFormData({ ...formData, rotiType: updated });
                updateRotiBackend(updated);
              }}
            >
              {roti}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  const updatedRotis = rotiOptions.filter((r) => r !== roti);
                  setRotiOptions(updatedRotis);
                  const updatedSelected = (formData.rotiType || []).filter((r) => r !== roti);
                  setFormData({ ...formData, rotiType: updatedSelected });
                  updateRotiBackend(updatedSelected);
                }}
                className="ml-1 text-xs font-bold hover:text-red-500"
              >
                ✕
              </span>
            </div>
          ))}
        </div>



        {errors.rotiType && <p className="text-red-500 text-xs mt-1">{errors.rotiType}</p>}
      </div>

      {/* Add-ons Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-4 border-t border-gray-200">
        {/* Include Rice */}
        <label className="flex items-center gap-3 text-base font-medium text-[var(--accent)] cursor-pointer p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition">
          <input
            type="checkbox"
            name="isRice"
            checked={formData.isRice}
            onChange={handleChange}
            className="w-5 h-5 text-[var(--primary)] p-3 border-gray-300 rounded focus:ring-[var(--primary)]"
          />
          Include Rice
        </label>
        {errors.isRice && (
          <p className="text-red-500 text-xs mt-1 col-span-3">{errors.isRice}</p>
        )}

        {/* Include Dessert */}
        <label className="flex items-center gap-3 text-base font-medium text-[var(--accent)] cursor-pointer p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition">
          <input
            type="checkbox"
            name="isDesert"
            checked={formData.isDesert}
            onChange={handleChange}
            className="w-5 h-5 text-[var(--primary)] p-3 border-gray-300 rounded focus:ring-[var(--primary)]"
          />
          Include Dessert
        </label>

        {/* Dessert Count */}
        {formData.isDesert && (
          <label className="flex flex-col">
            <span className="text-sm font-medium text-[var(--gray)] mb-1">Dessert Count</span>
            <input
              type="number"
              name="desertCount"
              value={formData.desertCount}
              onChange={handleChange}
              className={`border p-2 rounded-lg focus:ring-2 focus:ring-[var(--primary)] ${errors.desertCount ? "border-red-500" : "border-gray-200"
                }`}
            />
            {errors.desertCount && (
              <p className="text-red-500 text-xs mt-1">{errors.desertCount}</p>
            )}
          </label>
        )}
      </div>
    </div>
  );
});

export default BoxFormFields;

