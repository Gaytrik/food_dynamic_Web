import React, { useState, useEffect } from "react";
import { getAllBoxes } from "../api/boxAPI";
import BoxEditor from "../components/BoxEditor";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CustomizeBox = () => {
  const [boxes, setBoxes] = useState([]);
  const [activeTab, setActiveTab] = useState("MINI");

  const loadBoxes = async () => {
    // Note: Assuming getAllBoxes is defined and imported correctly
    const data = await getAllBoxes();
    setBoxes(data);
  };

  const navigate= useNavigate()

  useEffect(() => {
    loadBoxes();
  }, []);

   const handleAddDish = () => {
    navigate("/additems");
  };

  const currentBox = boxes.find((b) => b.boxType === activeTab);

  return (
    <div className="p-6 md:p-8 md:mt-0 mt-12 bg-[var(--secondary)] min-h-screen">
      {/* Updated Header Style */}
      <h1 className="text-3xl font-bold mb-6 text-[var(--accent)] border-b border-gray-200 pb-4">
        Tiffin Box Customization
      </h1>

      {/* Box Type Tabs (Updated Styling) */} 
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
  {/* BOX TYPE BUTTONS */}
  <div className="flex justify-center sm:justify-start gap-3 flex-wrap w-full sm:w-auto">
    {["MINI", "HALF", "FULL"].map((type) => (
      <button
        key={type}
        onClick={() => setActiveTab(type)}
        className={`px-5 py-2.5 rounded-lg font-semibold shadow-sm transition-all ${
          activeTab === type
            ? "bg-[var(--primary)] text-white"
            : "bg-gray-100 hover:bg-gray-200 text-[var(--accent)]"
        }`}
      >
        {type} BOX
      </button>
    ))}
  </div>

  {/* ADD NEW DISH BUTTON */}
  <div className="w-full sm:w-auto flex justify-center sm:justify-end">
    <button
      onClick={handleAddDish}
      className="flex items-center justify-center gap-3 w-full sm:w-auto px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-white font-semibold bg-[var(--primary)] hover:bg-[var(--primary)]/90 transform hover:-translate-y-0.5"
    >
      <Plus size={20} /> Add New Dish
    </button>
  </div>
</div>



      {/* Box Editor Container (Updated Styling) */}
      <div className="border border-gray-100 rounded-xl p-5 bg-white shadow-lg">
        <BoxEditor
          key={activeTab}
          boxType={activeTab}
          existingBox={currentBox}
          refreshBoxes={loadBoxes}
        />
      </div>
    </div>
  );
};

export default CustomizeBox;