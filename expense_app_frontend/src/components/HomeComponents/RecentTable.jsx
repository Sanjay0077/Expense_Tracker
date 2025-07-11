import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import {
  fetchExpenses,
  fetchOrderItemsByDate,
  deleteOrdersByDate,
} from "../../api_service/api";
import dayjs from "dayjs";
import { Tooltip } from "react-tooltip";
import AddItemTable from "./AddItemTable";

const RecentTable = () => {
  const [recentData, setRecentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingData, setEditingData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const fetchRecent = async () => {
    setLoading(true);
    try {
      const data = await fetchExpenses();
      setRecentData(data.slice(0, 10));
    } catch (error) {
      console.error("Error fetching recent data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  const handleEdit = async (item) => {
    const today = dayjs().format("YYYY-MM-DD");

    if (item.is_refunded) {
      alert("Refunded orders cannot be edited.");
      return;
    }

    if (item.date !== today || item.user !== currentUser?.username) {
      alert("Only today's orders created by you can be edited.");
      return;
    }

    try {
      const orderItems = await fetchOrderItemsByDate(item.date, item.user);
      setEditingData({
        date: item.date,
        user: item.user,
        orderItems,
        orderId: item.order_id,
      });
      setIsEditing(true);
    } catch (error) {
      console.error("Error fetching order items:", error);
    }
  };

  const handleDelete = async (item) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete all orders for ${item.user} on ${item.date}?`
    );
    if (!confirmDelete) return;

    try {
      await deleteOrdersByDate(item.date, item.user);
      alert("Orders deleted successfully.");
      fetchRecent();
    } catch (error) {
      console.error("Error deleting orders:", error);
      alert("Failed to delete orders.");
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingData(null);
  };

  const handleUpdateSuccess = () => {
    setIsEditing(false);
    setEditingData(null);
    fetchRecent();
  };

  const today = dayjs().format("YYYY-MM-DD");

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full">
      {/* Recent Entries Table */}
      <div className="bg-white rounded-xl p-4 md:p-6 flex-1 overflow-x-auto shadow">
        <h2 className="text-lg md:text-xl font-bold text-[#124451] mb-4">
          Recently Added
        </h2>

        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-left border-b border-gray-200 bg-gray-50">
              <th className="p-2 md:p-3">Date</th>
              <th className="p-2 md:p-3">User</th>
              <th className="p-2 md:p-3 text-center">Count</th>
              <th className="p-2 md:p-3 text-center">Amount</th>
              <th className="p-2 md:p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : recentData.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-4">
                  No recent entries found
                </td>
              </tr>
            ) : (
              recentData.map((data, index) => {
                const isToday = data.date === today;
                const isRefunded = data.is_refunded;
                const isCurrentUser = data.user === currentUser?.username;

                const canEdit = isToday && isCurrentUser && !isRefunded;
                const canDelete = isToday;

                const safeKey =
                  data.order_id ??
                  data.id ??
                  `${data.user || "unknown"}-${data.date || "nodate"}-${index}`;

                const editTooltipId = `edit-tooltip-${safeKey}`;
                const deleteTooltipId = `delete-tooltip-${safeKey}`;

                return (
                  <tr
                    key={safeKey}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="p-2 md:p-3">
                      {dayjs(data.date).format("MMM D, YYYY")}
                    </td>
                    <td className="p-2 md:p-3">
                      {data.user?.name || data.user?.username || "Unknown"}
                    </td>

                    <td className="p-2 md:p-3 text-center">
                      {data.total_count || 1}
                    </td>
                    <td className="p-2 md:p-3 text-center">
                      ₹{(data.total_amount ?? data.amount ?? 0).toFixed(2)}
                    </td>

                    <td className="p-2 md:p-3 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleEdit(data)}
                          disabled={!canEdit}
                          data-tooltip-id={editTooltipId}
                          data-tooltip-content={
                            !canEdit
                              ? isRefunded
                                ? "Refunded entries cannot be edited"
                                : !isToday
                                ? "Only today's entries can be edited"
                                : "You can only edit your own entries"
                              : ""
                          }
                          className={`transition ${
                            canEdit
                              ? "hover:scale-110"
                              : "cursor-not-allowed opacity-40"
                          }`}
                        >
                          <FaEdit
                            size={16}
                            color={canEdit ? "#16A63D" : "gray"}
                          />
                          <Tooltip id={editTooltipId} />
                        </button>

                        <button
                          onClick={() => handleDelete(data)}
                          disabled={!canDelete}
                          data-tooltip-id={deleteTooltipId}
                          data-tooltip-content={
                            canDelete
                              ? ""
                              : "Only today's entries can be deleted"
                          }
                          className={`transition ${
                            canDelete
                              ? "hover:scale-110"
                              : "cursor-not-allowed opacity-40"
                          }`}
                        >
                          <FaTrash
                            size={16}
                            color={canDelete ? "red" : "gray"}
                          />
                          <Tooltip id={deleteTooltipId} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit/Add Section */}
      <div className="bg-white rounded-xl p-4 md:p-6 flex-1 shadow">
        {isEditing ? (
          <AddItemTable
            editMode={true}
            editingData={editingData}
            onCancel={handleCancelEdit}
            onUpdateSuccess={handleUpdateSuccess}
          />
        ) : (
          <AddItemTable onUpdateSuccess={fetchRecent} />
        )}
      </div>
    </div>
  );
};

export default RecentTable;
