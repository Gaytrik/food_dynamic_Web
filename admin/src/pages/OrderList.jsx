import React from "react";
import Sidebar from "../components/Sidebar";

const OrderList = () => {
  return (
    <div className="flex h-screen overflow-hidden ">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center bg-[var(--bg-light)]">
        <h1 className="text-3xl font-bold text-[var(--primary)]">Order List</h1>
      </div>
    </div>
  );
};

export default OrderList;
