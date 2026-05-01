import React, { useEffect, useState } from "react";
import { Button } from "../../LANDING-PAGE/ui/button";
import axiosClient from "../../../api/axiosClient";
import formatDate from "../../../utils/formatDate";
import { toast } from 'react-toastify';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editValues, setEditValues] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await axiosClient.get("/studioAdmin/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id, updates) => {
    if (!updates || Object.keys(updates).length === 0) return;

    try {
      await axiosClient.put(`/studioAdmin/users/${id}`, updates);

      toast.success("User updated successfully ✅");

      // clear edit state for that user
      setEditValues(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });

      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user ❌");
    }
  };

  const handleEditChange = (id, field, value) => {
    setEditValues(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const deleteUser = async () => {
    try {
      await axiosClient.delete(`/studioAdmin/users/${deleteTarget}`);
      toast.success("User deleted successfully 🗑️");
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user ❌");
    }
  };


  useEffect(() => {
    fetchUsers();
  }, []);

  console.log(users);


  if (loading) return <p>Loading users...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Created On</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Plan</th>
            <th className="p-2 border">Usage Count</th>
            <th className="p-2 border">Monthly Quota</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="border">
              <td className="p-2 border">{u.name}</td>
              <td className="p-2 border">{u.email}</td>
              <td className="p-2 border">{formatDate(u.createdAt || u.updatedAt)}</td>
              <td className="p-2 border">
                <select
                  value={u.role}
                  onChange={(e) => updateUser(u._id, { role: e.target.value })}
                  className="border p-1"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </td>
              <td className="p-2 border">{u.subscriptionPlan?.name || "—"}</td>
              <td className="p-2 border">
                <input
                  type="number"
                  className="border p-1 w-24"
                  value={editValues[u._id]?.usageCount ?? u.usageCount ?? ""}
                  onChange={(e) =>
                    handleEditChange(u._id, "usageCount", Number(e.target.value))
                  }
                />
              </td>

              <td className="p-2 border">
                <input
                  type="number"
                  className="border p-1 w-24"
                  value={editValues[u._id]?.monthlyQuota ?? u.monthlyQuota ?? ""}
                  onChange={(e) =>
                    handleEditChange(u._id, "monthlyQuota", Number(e.target.value))
                  }
                />
              </td>

              <td className="p-2 border">{u.subscriptionStatus}</td>
              <td className="p-2 border">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={!editValues[u._id]}
                    onClick={() => updateUser(u._id, editValues[u._id])}
                  >
                    💾 Save
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => setDeleteTarget(u._id)}
                  >
                    🗑 Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Delete User</h2>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>

              <Button
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
                onClick={deleteUser}
              >
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;
