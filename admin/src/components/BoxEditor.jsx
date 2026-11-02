// import React, { useState, useEffect } from "react";
// import SabjiSelector from "./SabjiSelector";
// import BoxFormFields from "./BoxFormFields";
// import { getAllMenuItems, updateBox, createBox } from "../api/boxAPI";
// import { Loader2 } from 'lucide-react'; // Added Loader

// const BoxEditor = ({ boxType, existingBox, refreshBoxes }) => {
//   const [allSabjis, setAllSabjis] = useState([]);
//   const [selectedSabjis, setSelectedSabjis] = useState([]);
//   const [formData, setFormData] = useState({
//     boxType,
//     sabjiCount: 0,
//     rotiType: [],
//     chapptiCount: 0,
//     isRice: false,
//     isDesert: false,
//     desertCount: 0,
//     price: 0,
//     isActive: true,
//   });
//   const [loading, setLoading] = useState(false);

//     // Dialog state
//   const [dialog, setDialog] = useState({
//     isOpen: false,
//     type: "success", // "success" | "error" | "info" | "warning"
//     title: "",
//     message: "",
//     autoClose: true,
//     duration: 1500,
//   });

//  // Helpers to show/close dialog
//   const showDialog = (type, title, message, options = {}) => {
//     setDialog({
//       isOpen: true,
//       type,
//       title,
//       message,
//       autoClose: options.autoClose ?? true,
//       duration: options.duration ?? 1500,
//     });
//   };
//   const closeDialog = () => setDialog((d) => ({ ...d, isOpen: false }));

//   // ✅ Load all sabjis
//   useEffect(() => {
//     getAllMenuItems().then(setAllSabjis);
//   }, []);

//   // ✅ When switching tab or editing an existing box
//   useEffect(() => {
//     if (existingBox) {
//       setFormData({
//         ...existingBox,
//         rotiType: existingBox.rotiType || [],
//       });
//       setSelectedSabjis(
//         allSabjis.filter((s) => existingBox.sabjiId?.includes(s.id))
//       );
//     } else {
//       // reset if no box exists for this type
//       setFormData({
//         boxType,
//         sabjiCount: 0,
//         rotiType: [],
//         chapptiCount: 0,
//         isRice: false,
//         isDesert: false,
//         desertCount: 0,
//         price: 0,
//         isActive: true,
//       });
//       setSelectedSabjis([]);
//     }
//   }, [existingBox, allSabjis, boxType]);

//   // ✅ Save or update
//   const handleSave = async () => {
//     console.log(" Sending box data:", JSON.stringify(formData, null, 2));

//     try {
//       setLoading(true);
//       const payload = {
//         ...formData,
//         sabjiId: selectedSabjis.map((s) => s.id),
//       };

//       let response;
//       if (existingBox?._id) {
//         // UPDATE EXISTING BOX
//         response = await updateBox(existingBox._id, payload);
//         alert(` ${boxType} Box updated successfully!`);
//       } else {
//         // CREATE NEW BOX
//         response = await createBox(payload);
//         alert(` ${boxType} Box created successfully!`);
//       }

//       refreshBoxes(); // reload box data in parent
//     } catch (err) {
//       console.error("Error saving box:", err);
//       alert(" Failed to save box. Please check logs or API response.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <h2 className="text-2xl font-bold mb-4 text-[var(--dark)] pb-2">
//         Configure {boxType} Box Details
//       </h2>

//       {/* Sabji Selector is now a dedicated section */}
//       <SabjiSelector
//         allSabjis={allSabjis}
//         selectedSabjis={selectedSabjis}
//         setSelectedSabjis={setSelectedSabjis}
//       />

//       {/* Form Fields */}
//       <BoxFormFields formData={formData} setFormData={setFormData} />

//       {/* Save Button */}
//       <div className="mt-2 pt-2 flex justify-end">
//       <button
//   onClick={handleSave}
//   disabled={loading}
//   className={`
//     ${existingBox ? "bg-[var(--primary)] hover:bg-[#689407]" : "bg-[var(--primary)] hover:bg-[#689407]"}
//     text-[var(--secondary)] px-8 py-3 rounded-xl font-bold transition flex items-center gap-2 shadow-md disabled:opacity-50
//   `}
// >

//           {loading ? (
//             <>
//               <Loader2 className="animate-spin w-5 h-5" /> Saving...
//             </>
//           ) : existingBox ? (
//             "Update Box Configuration"
//           ) : (
//             "Create New Box"
//           )}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default BoxEditor;


// src/components/BoxEditor.jsx  (or wherever BoxEditor lives)
import React, { useState, useEffect, useRef } from "react";
import SabjiSelector from "./SabjiSelector";
import BoxFormFields from "./BoxFormFields";
import { getAllMenuItems, updateBox, createBox } from "../api/boxAPI";
import { Loader2 } from "lucide-react";
import DialogBox from "./DialogBox";

const BoxEditor = ({ boxType, existingBox, refreshBoxes }) => {
  const [allSabjis, setAllSabjis] = useState([]);
  const [selectedSabjis, setSelectedSabjis] = useState([]);
    const [mealFilter, setMealFilter] = useState("all"); // "all" | "lunch" | "dinner"

  const [formData, setFormData] = useState({
    boxType,
    sabjiCount: 0,
    rotiType: [],
    chapptiCount: 0,
    isRice: false,
    isDesert: false,
    desertCount: 0,
    price: 0,
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const formRef = useRef();

  // ✅ Dialog state
  const [dialog, setDialog] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    autoClose: true,
    duration: 1500,
  });

  // Helper to show dialogs
  const showDialog = (type, title, message, options = {}) => {
    setDialog({
      isOpen: true,
      type,
      title,
      message,
      autoClose: options.autoClose ?? true,
      duration: options.duration ?? 1500,
    });
  };
  const closeDialog = () => setDialog((d) => ({ ...d, isOpen: false }));

  // ✅ Load all sabjis from API
  useEffect(() => {
    getAllMenuItems()
      .then(setAllSabjis)
      .catch((err) => {
        console.error("Failed to fetch menu items:", err);
        showDialog("error", "Load Failed", "Unable to load menu items.");
      });
  }, []);

  // ✅ Update when switching box type or editing existing box
  useEffect(() => {
    if (existingBox) {
      setFormData({
        ...existingBox,
        rotiType: existingBox.rotiType || [],
      });

      // Preselect sabjis based on IDs
      setSelectedSabjis(
        allSabjis.filter((s) => existingBox.sabjiId?.includes(s.id))
      );
    } else {
      // Reset form for new box
      setFormData({
        boxType,
        sabjiCount: 0,
        rotiType: [],
        chapptiCount: 0,
        isRice: false,
        isDesert: false,
        desertCount: 0,
        price: 0,
        isActive: true,
      });
      setSelectedSabjis([]);
    }
  }, [existingBox, allSabjis, boxType]);

  // ✅ Sabji validation rules
  const getRequiredSabjiCount = () => {
    switch (boxType.toUpperCase()) {
      case "MINI":
        return 2;
      case "HALF":
        return 3;
      case "FULL":
        return 5;
      default:
        return 1;
    }
  };

  const validateSabjiSelection = () => {
    const requiredCount = getRequiredSabjiCount();
    if (selectedSabjis.length < requiredCount) {
      showDialog(
        "warning",
        "Insufficient Sabjis Selected",
        `${boxType} box must have at least ${requiredCount} sabjis.`
      );
      return false;
    }
    return true;
  };

  // ✅ Save / Update handler
  const handleSave = async () => {
    // Step 1: Validate sabji selection
    if (!validateSabjiSelection()) {
      return;
    }

    // Step 2: Validate form fields (via BoxFormFields)
    if (formRef.current && !formRef.current.validateForm()) {
      showDialog("warning", "Validation Failed", "Please fix all form errors before saving.");
      return;
    }

    console.log("Sending box data:", JSON.stringify(formData, null, 2));

    try {
      setLoading(true);
      const payload = {
        ...formData,
        sabjiId: selectedSabjis.map((s) => s.id),
      };

      let response;
      if (existingBox?._id) {
        // UPDATE existing box
        response = await updateBox(existingBox._id, payload);
        showDialog("success", `${boxType} Box Updated`, `${boxType} box updated successfully.`);
      } else {
        // CREATE new box
        response = await createBox(payload);
        showDialog("success", `${boxType} Box Created`, `${boxType} box created successfully.`);
      }

      // Step 3: Refresh parent data after success
      if (typeof refreshBoxes === "function") {
        setTimeout(() => refreshBoxes(), 400);
      }
    } catch (err) {
      console.error("Error saving box:", err);
      const errMsg = err?.message || "Failed to save box. Please check API or console logs.";
      showDialog("error", "Save Failed", errMsg, { autoClose: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
       <h1 className="font-bold text-[var(--dark)] pb-2 
  text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight">
  Configure {boxType} Box 
</h1>


        {/* ✅ Lunch/Dinner dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Meal:</label>
          <select
            value={mealFilter}
            onChange={(e) => setMealFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="all">All</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
          </select>
        </div>
      </div>

      {/* ✅ Sabji Selector */}
      <SabjiSelector
        allSabjis={allSabjis}
        selectedSabjis={selectedSabjis}
        setSelectedSabjis={setSelectedSabjis}
        mealFilter={mealFilter} 
      />

      {/* ✅ Box Form Fields */}
      <BoxFormFields ref={formRef} formData={formData} setFormData={setFormData} />

      {/* ✅ Save / Update Button */}
      <div className="mt-2 pt-2 flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className={`bg-[var(--primary)] hover:bg-[#689407] text-[var(--secondary)] px-8 py-3 rounded-xl font-bold transition flex items-center gap-2 shadow-md disabled:opacity-50`}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5" /> Saving...
            </>
          ) : existingBox ? (
            "Update Box Configuration"
          ) : (
            "Create New Box"
          )}
        </button>
      </div>

      {/* ✅ DialogBox (local to this component) */}
      <DialogBox
        isOpen={dialog.isOpen}
        onClose={closeDialog}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        autoClose={dialog.autoClose}
        duration={dialog.duration}
      />
    </div>
  );
};

export default BoxEditor;

