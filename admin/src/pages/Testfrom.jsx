import React, { useState } from "react";

export default function MenuManager() {
  const [jwt, setJwt] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [menuItemId, setMenuItemId] = useState("");
  const [menuItem, setMenuItem] = useState({
    name: "",
    description: "",
    subCategory: "",
    price: "",
    preparationTime: "",
    spiceLevel: "",
    available: true,
  });
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState("");

  // ✅ Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMenuItem({
      ...menuItem,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ✅ Build FormData for multipart request
  const buildFormData = () => {
    const formData = new FormData();
    formData.append("menuItem", new Blob([JSON.stringify(menuItem)], { type: "application/json" }));
    if (file) formData.append("file", file);
    return formData;
  };

  // ✅ Add Menu Item
  const handleAdd = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/menu/${categoryId}/menu`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        body: buildFormData(),
      });
      setResponse(await res.text());
    } catch (err) {
      setResponse("Error: " + err.message);
    }
  };

  // ✅ Update Menu Item
  const handleUpdate = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/menu/${categoryId}/menu/${menuItemId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        body: buildFormData(),
      });
      setResponse(await res.text());
    } catch (err) {
      setResponse("Error: " + err.message);
    }
  };

  // ✅ Delete Menu Item
  const handleDelete = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/menu/${categoryId}/menu/${menuItemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      setResponse(await res.text());
    } catch (err) {
      setResponse("Error: " + err.message);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center mb-4">🍔 Menu Manager (Admin)</h1>

      {/* JWT Token Input */}
      <div>
        <label className="block mb-1 font-semibold">JWT Token</label>
        <input
          type="text"
          value={jwt}
          onChange={(e) => setJwt(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Paste your JWT token here"
        />
      </div>

      {/* Category & Menu IDs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block mb-1 font-semibold">Category ID</label>
          <input
            type="text"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="e.g. 6902f50f3434d082d04e5ee7"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Menu Item ID (for update/delete)</label>
          <input
            type="text"
            value={menuItemId}
            onChange={(e) => setMenuItemId(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="optional"
          />
        </div>
      </div>

      {/* Menu Fields */}
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          name="name"
          value={menuItem.name}
          onChange={handleChange}
          className="border p-2 rounded"
          placeholder="Item Name"
        />
        <input
          type="text"
          name="subCategory"
          value={menuItem.subCategory}
          onChange={handleChange}
          className="border p-2 rounded"
          placeholder="Sub-category"
        />
        <input
          type="number"
          name="price"
          value={menuItem.price}
          onChange={handleChange}
          className="border p-2 rounded"
          placeholder="Price"
        />
        <input
          type="text"
          name="preparationTime"
          value={menuItem.preparationTime}
          onChange={handleChange}
          className="border p-2 rounded"
          placeholder="Preparation Time"
        />
        <input
          type="text"
          name="spiceLevel"
          value={menuItem.spiceLevel}
          onChange={handleChange}
          className="border p-2 rounded"
          placeholder="Spice Level"
        />
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="available"
            checked={menuItem.available}
            onChange={handleChange}
          />
          <label>Available</label>
        </div>
      </div>

      {/* Description */}
      <textarea
        name="description"
        value={menuItem.description}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        placeholder="Description"
      />

      {/* File Upload */}
      <div>
        <label className="block mb-1 font-semibold">Upload Image (optional)</label>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} className="block" />
      </div>

      {/* Buttons */}
      <div className="flex justify-between mt-4">
        <button onClick={handleAdd} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Add
        </button>
        <button onClick={handleUpdate} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Update
        </button>
        <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
          Delete
        </button>
      </div>

      {/* Server Response */}
      <pre className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap">{response}</pre>
    </div>
  );
}
