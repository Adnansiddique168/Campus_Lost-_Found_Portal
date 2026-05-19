"use client";

import { useEffect, useState } from "react";

type User = {
  id: number;
  fullName: string;
  email: string;
  role: string;
  contactNo: string;
  rollNumber?: string;
  department?: string;
  section?: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: number, role: string) => {
    if (!window.confirm(`Are you sure you want to completely erase ${role} ID ${id}?`)) return;
    
    setDeletingId(`${role}-${id}`);
    try {
      const response = await fetch(`/api/users?id=${id}&role=${role}`, {
        method: "DELETE"
      });
      if (response.ok) {
        await fetchUsers();
      } else {
        alert("Failed to delete user. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("Error reaching the server.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setAdding(true);
    const formData = new FormData(form);
    const payload = {
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      role: formData.get("role") as string,
    };

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        form.reset();
        await fetchUsers();
      } else {
        console.error("Failed to add user:", await response.text());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold leading-6 text-gray-900">Platform Users</h1>
          <p className="mt-2 text-sm text-gray-700">
            A secure list of all the users registered on the Campus Lost & Found Portal, including their roles and contact details.
          </p>
        </div>
      </div>

      <div className="mt-12 lg:grid lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-xl bg-white">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 text-center">ID</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Academics</th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="whitespace-nowrap py-8 pl-4 pr-3 text-sm text-center text-gray-500">
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-slate-200 rounded w-1/4 mx-auto"></div>
                        <div className="h-4 bg-slate-200 rounded w-1/3 mx-auto"></div>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="whitespace-nowrap py-8 pl-4 pr-3 text-sm text-center text-gray-500">
                      No users found. Try adding one below.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={`${user.role}-${user.id}`} className="hover:bg-gray-50 transition-colors">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 text-center">{user.role.charAt(0)}-{user.id}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        {user.fullName}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.email}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          {user.role}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {user.role === 'Student' ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{user.rollNumber || 'No Roll No'}</span>
                            <span className="text-xs text-gray-500">{user.department || 'N/A'} - {user.section || 'N/A'}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">N/A</span>
                        )}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => handleDeleteUser(user.id, user.role)}
                          disabled={deletingId === `${user.role}-${user.id}`}
                          className="text-red-600 hover:text-red-900 font-bold transition-colors disabled:opacity-50"
                        >
                          {deletingId === `${user.role}-${user.id}` ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 mt-8 lg:mt-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Add New User</h2>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium leading-6 text-gray-900">Full Name</label>
                <div className="mt-2">
                  <input required placeholder="Alice Wonderland" type="text" name="fullName" id="fullName" className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">Email Address</label>
                <div className="mt-2">
                  <input required placeholder="alice@example.com" type="email" name="email" id="email" className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                </div>
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium leading-6 text-gray-900">Role</label>
                <div className="mt-2">
                  <select required name="role" id="role" className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                    <option>Student</option>
                    <option>Admin</option>
                    <option>Staff</option>
                  </select>
                </div>
              </div>
              <div className="pt-2">
                <button disabled={adding} type="submit" className="w-full flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70 transition-all">
                  {adding ? 'Adding User...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
