import React, { useState, useEffect } from "react";
import {
  FaBell,
  FaStar,
  FaSearch,
  FaTrashAlt,
  FaTimes,
} from "react-icons/fa";
import { FaRegStar } from "react-icons/fa6"; // Unfilled star
import NOTIFICATIONS_DATA from "../data/notification.json";

// 🔹 Single Notification Item
const NotificationItem = ({
  id,
  text,
  time,
  isNew,
  isFavorite,
  isArchived,
  onOpen,
  onDelete,
  onToggleFavorite,
  onToggleArchive,
}) => (
  <div
    className={`flex items-start py-3 px-4 border-b border-gray-100 hover:bg-[var(--secondary)] transition-all duration-300 cursor-pointer ${
      isArchived ? "opacity-60" : isNew ? "bg-green-50" : "bg-white"
    }`}
    onClick={() => onOpen(id)}
  >
    {/* New Dot */}
    <div className="w-6 pt-1 flex justify-center flex-shrink-0">
      <div
        className={`w-2 h-2 rounded-full ${
          isNew ? "bg-[var(--highlight)]" : "bg-transparent"
        } mr-4`}
      ></div>
    </div>

    {/* Notification Content */}
    <div className="flex-1 flex justify-between items-start">
      <div className="flex-1 pr-4">
        <p className="text-sm text-[var(--accent)] font-medium leading-relaxed">
          <span className="font-bold text-[var(--primary)]">
            {text.split(",")[0] + (text.includes(",") ? "," : "")}
          </span>
          <span className="font-normal">
            {text.includes(",")
              ? text.substring(text.indexOf(",") + 1)
              : text}
          </span>
        </p>
        <span className="text-xs text-gray-500 whitespace-nowrap">{time}</span>
      </div>

      {/* Icons on Right */}
      <div className="flex items-center space-x-4 ml-4 flex-shrink-0">
        {/* Favorite */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(id);
          }}
          className="text-gray-400 hover:text-yellow-400 transition-colors"
        >
          {isFavorite ? (
            <FaStar className="w-4 h-4 text-yellow-400" />
          ) : (
            <FaRegStar className="w-4 h-4" />
          )}
        </button>

        {/* Archive */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleArchive(id);
          }}
          className="text-gray-400 hover:text-blue-500 transition-colors"
        >
          {isArchived ? (
            <span className="text-xs font-semibold text-blue-500">Unarchive</span>
          ) : (
            <span className="text-xs font-semibold text-gray-500">Archive</span>
          )}
        </button>

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-200"
        >
          <FaTrashAlt className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

// 🔹 Modal Component (Popup)
const NotificationModal = ({ notification, onClose }) => {
  if (!notification) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative animate-fadeIn">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition-colors"
          onClick={onClose}
        >
          <FaTimes className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center mb-4 border-b pb-2">
          <FaBell className="text-[var(--highlight)] w-6 h-6 mr-2" />
          <h3 className="text-lg font-bold text-[var(--accent)]">
            Notification Details
          </h3>
        </div>

        {/* Body */}
        <div className="text-[var(--accent)] text-sm space-y-3">
          <p className="leading-relaxed">{notification.text}</p>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Received: {notification.time}</span>
            {notification.isNew && (
              <span className="text-[var(--highlight)] font-medium">New</span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg bg-[var(--secondary)] hover:bg-[var(--optional-accent)] hover:text-[var(--accent)] text-[var(--accent)] font-semibold transition-colors"
          >
            Close
          </button>
          <button className="px-4 py-2 text-sm rounded-lg bg-[var(--highlight)] hover:bg-green-700 text-white font-semibold transition-colors">
            Mark as Read
          </button>
        </div>
      </div>
    </div>
  );
};

// 🔹 Main Notification Component
const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const initialData = NOTIFICATIONS_DATA.map((n) => ({
      ...n,
      isFavorite: false,
      isArchived: false,
    }));
    setNotifications(initialData);
  }, []);

  const handleOpen = (id) => {
    const selected = notifications.find((n) => n.id === id);
    setSelectedNotification(selected);
  };

  const handleClose = () => {
    setSelectedNotification(null);
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleToggleFavorite = (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isFavorite: !n.isFavorite } : n
      )
    );
  };

  const handleToggleArchive = (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isArchived: !n.isArchived } : n
      )
    );
  };

  // 🔹 Filtered lists
  const filtered = notifications.filter((n) => {
    const matchesSearch = n.text.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "archive") return n.isArchived && matchesSearch;
    if (activeTab === "favorite") return n.isFavorite && matchesSearch;
    return !n.isArchived && matchesSearch;
  });

  const newCount = notifications.filter((n) => n.isNew).length;
  const favCount = notifications.filter((n) => n.isFavorite).length;

  return (
    <div className="max-w-4xl mx-auto mt-20 md:mt-4 px-4 font-[Urbanist]">
      <div className="bg-[var(--secondary)] rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
          <h2 className="text-2xl font-bold text-[var(--accent)] flex items-center">
            <FaBell className="w-6 h-6 mr-3 text-[var(--primary)]" />
            List Notification
          </h2>

          {/* Search Bar */}
          <div className="flex items-center border border-gray-300 rounded-full py-2 px-3 bg-white w-full sm:w-64">
            <FaSearch className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search by Name or Product"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent focus:outline-none text-sm flex-1"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 text-sm font-semibold">
          <button
            onClick={() => setActiveTab("all")}
            className={`py-3 px-6 flex items-center transition-all duration-200 ${
              activeTab === "all"
                ? "text-[var(--primary)] border-b-2 border-[var(--primary)]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span className="text-[var(--primary)] bg-orange-100 text-xs font-bold px-2 py-0.5 rounded mr-2 min-w-[20px] text-center">
              {newCount}
            </span>
            All
          </button>

          <button
            onClick={() => setActiveTab("archive")}
            className={`py-3 px-6 border-b-2 flex items-center transition-all duration-200 ${
              activeTab === "archive"
                ? "text-[var(--primary)] border-[var(--primary)]"
                : "text-gray-500 hover:text-gray-700 border-transparent"
            }`}
          >
            Archive
          </button>

          <button
            onClick={() => setActiveTab("favorite")}
            className={`py-3 px-6 border-b-2 ml-auto flex items-center transition-all duration-200 ${
              activeTab === "favorite"
                ? "text-[var(--primary)] border-[var(--primary)]"
                : "text-gray-500 hover:text-gray-700 border-transparent"
            }`}
          >
            <FaStar className="w-4 h-4 mr-2 text-yellow-400" />
            <span className="text-gray-500 bg-gray-100 text-xs font-bold px-2 py-0.5 rounded mr-1 min-w-[20px] text-center">
              {favCount}
            </span>
            Favorite
          </button>
        </div>

        {/* Notification List */}
        <div className="divide-y divide-gray-100 max-h-[70vh] bg-white">
          {filtered.length > 0 ? (
            filtered.map((notification) => (
              <NotificationItem
                key={notification.id}
                {...notification}
                onOpen={handleOpen}
                onDelete={handleDelete}
                onToggleFavorite={handleToggleFavorite}
                onToggleArchive={handleToggleArchive}
              />
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 text-sm">
              No notifications found.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 text-center text-sm text-gray-500 border-t border-gray-100 bg-[var(--secondary)]">
          <button className="text-[var(--highlight)] hover:text-green-700 font-semibold transition-colors">
            Load More Notifications
          </button>
        </div>
      </div>

      {/* Modal */}
      <NotificationModal
        notification={selectedNotification}
        onClose={handleClose}
      />
    </div>
  );
};

export default Notification;