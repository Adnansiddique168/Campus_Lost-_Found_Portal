"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NotificationBell from "../components/NotificationBell";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("admin-dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== "Admin") {
          router.push("/dashboard");
          return;
        }
        setUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse user from session storage");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  if (!user) return null; // Avoid flicker before redirect

  const renderContent = () => {
    switch (activeTab) {
      case "admin-dashboard":
        return <DashboardOverview user={user} />;
      case "manage-users":
        return (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center h-[50vh]">
            <h3 className="text-xl font-bold text-gray-900">Manage Users</h3>
            <p className="mt-2 text-gray-500 mb-6">Administrators can view and manage the system's users here.</p>
            <Link href="/users" className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors">
              Go to Full User Management Module
            </Link>
          </div>
        );
      case "search":
        return <SearchItemsView />;
      case "cctv":
        return <CctvAdminView />;
      default:
        return <DashboardOverview user={user} />;
    }
  };

  const navItems = [
    { id: "admin-dashboard", label: "Admin Console", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { id: "manage-users", label: "Manage Users", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { id: "search", label: "Global Search", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
    { id: "cctv", label: "CCTV Operations", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-[#0A1832] shadow-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-center border-b border-white/10 px-6">
          <h2 className="text-xl font-extrabold text-white tracking-wide">
             Campus Portal
          </h2>
        </div>
        
        <nav className="mt-6 flex flex-col space-y-1 px-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                activeTab === item.id
                  ? "bg-[#113C9E] text-white shadow-inner"
                  : "text-gray-400 hover:bg-[#152D54] hover:text-white"
              }`}
            >
              <svg className={`h-5 w-5 ${activeTab === item.id ? 'opacity-100' : 'opacity-70'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-gray-100 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-200 transition-all hover:bg-red-500/20 hover:text-white"
          >
            <svg className="h-5 w-5 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-16 items-center justify-between bg-white px-6 shadow-sm z-10 lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-800 hidden sm:block capitalize">
              {navItems.find(i => i.id === activeTab)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell user={user} />
            <div className="flex items-center gap-3 border-l border-gray-100 pl-4">
              <div className="hidden text-right text-sm sm:block">
                <p className="font-medium text-gray-700">{user?.fullName || 'Student'}</p>
                <p className="text-xs text-[#113C9E] font-semibold uppercase">{user?.role || 'User'}</p>
              </div>
              <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-[#113C9E]/20 shadow-sm flex items-center justify-center bg-[#113C9E]/10">
                 <span className="text-[#113C9E] font-bold">{user?.fullName?.charAt(0) || 'U'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Rendering */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-6 lg:p-8 custom-scrollbar">
          <div className="mx-auto max-w-6xl animate-fade-in-up">
            {renderContent()}
          </div>
        </main>
      </div>

    </div>
  );
}

// ------ Subcomponents for Dashboard Rendering ------

function DashboardOverview({ user }: { user: any }) {
  const defaultActivity: any[] = [];

  const [allItems, setAllItems] = useState<any[]>(defaultActivity);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [stats, setStats] = useState({ lost: 24, found: 18, matches: 11 });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteItem = async (id: string, type: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this item?")) return;
    
    setDeletingId(id);
    try {
      if (!isNaN(parseInt(id))) {
        await fetch(`/api/items?id=${id}&itemType=${type}`, { method: 'DELETE' });
      }
      
      const updated = allItems.filter(i => i.id !== id);
      setAllItems(updated);
      
      const stored = JSON.parse(localStorage.getItem('portal_items') || '[]');
      const newStored = stored.filter((i: any) => String(i.id) !== String(id));
      localStorage.setItem('portal_items', JSON.stringify(newStored));

      setStats({
         lost: updated.filter(i => i.type === 'Lost').length,
         found: updated.filter(i => i.type === 'Found').length,
         matches: updated.filter(i => i.status === 'Matched').length
      });
    } catch(e) {
      console.error(e);
      alert("Failed to delete item");
    } finally {
      setDeletingId(null);
    }
  };

  const updateItemStatus = (itemId: string, newStatus: string) => {
    const updated = allItems.map(i => i.id === itemId ? { ...i, status: newStatus } : i);
    setAllItems(updated);
    
    // Also update stats
    const lostCount = updated.filter(i => i.type === 'Lost').length;
    const foundCount = updated.filter(i => i.type === 'Found').length;
    const matchesCount = updated.filter(i => i.status === 'Matched').length;
    setStats({ lost: lostCount, found: foundCount, matches: matchesCount });

    // Update LocalStorage to persist
    const stored = JSON.parse(localStorage.getItem('portal_items') || '[]');
    const newStored = stored.map((i: any) => i.id === itemId ? { ...i, status: newStatus } : i);
    localStorage.setItem('portal_items', JSON.stringify(newStored));
  };

  useEffect(() => {
    const stored = localStorage.getItem('portal_items');
    let loadedItems = [...defaultActivity];
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Map stored data to table format
        const formatted = parsed.map((item: any) => ({
          id: item.id,
          item: item.itemName,
          type: item.type,
          location: item.location,
          date: item.date,
          status: item.status
        }));
        loadedItems = [...formatted, ...defaultActivity];
      } catch (e) {
        console.error("Failed to load items");
      }
    }
    setAllItems(loadedItems);

    // Compute stats dynamically
    const lostCount = loadedItems.filter(i => i.type === 'Lost').length;
    const foundCount = loadedItems.filter(i => i.type === 'Found').length;
    const matchesCount = loadedItems.filter(i => i.status === 'Matched').length;
    setStats({ lost: lostCount, found: foundCount, matches: matchesCount });
  }, []);

  const summaryCards = [
    { title: "Reported Lost", value: stats.lost.toString(), icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-white", bg: "bg-[#AC5221]" },
    { title: "Found Items", value: stats.found.toString(), icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-white", bg: "bg-[#1C5F3A]" },
    { title: "Successful Matches", value: stats.matches.toString(), icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1", color: "text-white", bg: "bg-[#113C9E]" },
  ];

  const filteredActivity = activeFilter === 'Reported Lost' ? allItems.filter(i => i.type === 'Lost') :
                           activeFilter === 'Found Items' ? allItems.filter(i => i.type === 'Found') :
                           activeFilter === 'Successful Matches' ? allItems.filter(i => i.status === 'Matched') :
                           allItems.slice(0, 10);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-[#0A1832] p-8 shadow-lg text-white relative overflow-hidden">
         <div className="relative z-10">
           <h2 className="text-3xl font-extrabold mb-2">Welcome back, {user?.fullName?.split(' ')[0] || 'User'}! 👋</h2>
           <p className="text-gray-300 font-medium">Manage and review campus lost & found activity efficiently.</p>
         </div>
         <div className="absolute right-0 top-0 -mr-8 -mt-8 h-64 w-64 rounded-full bg-white opacity-5 blur-3xl"></div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {summaryCards.map((card, idx) => (
          <div key={idx} onClick={() => setActiveFilter(card.title)} className={`group rounded-xl p-6 shadow-md border border-black/10 transition-transform hover:-translate-y-1 cursor-pointer ${card.bg} flex justify-between`}>
            <div className="flex flex-col text-white">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2 opacity-90">{card.title}</p>
              <h3 className="text-4xl font-extrabold drop-shadow-sm">{card.value}</h3>
            </div>
            <div className={`mt-auto mb-1 flex h-14 w-14 items-center justify-center opacity-80 border-2 border-white/20 rounded-xl p-2 transition-transform group-hover:scale-110`}>
              <svg className={`h-full w-full ${card.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={card.icon} />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Grid/Table */}
      <div className="rounded-xl bg-white shadow-md border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-8 py-5 flex items-center justify-between bg-gray-50">
          <h3 className="text-lg font-bold text-[#0A1832]">{activeFilter === 'All' ? 'Recent Activity' : activeFilter}</h3>
          <button onClick={() => setActiveFilter('All')} className="text-sm font-bold text-[#113C9E] hover:text-white bg-[#113C9E]/10 hover:bg-[#113C9E] px-4 py-2 rounded-lg transition-colors">
            {activeFilter === 'All' ? 'View all' : 'Clear filter'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-8 py-5 font-bold tracking-wider">Item Details</th>
                <th className="px-8 py-5 font-bold tracking-wider">Type</th>
                <th className="px-8 py-5 font-bold tracking-wider">Location</th>
                <th className="px-8 py-5 font-bold tracking-wider">Date</th>
                <th className="px-8 py-5 font-bold tracking-wider">Status</th>
                <th className="px-8 py-5 font-bold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredActivity.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-10 text-center text-gray-500 font-medium bg-gray-50/30">
                    No items found matching the selected filter.
                  </td>
                </tr>
              ) : filteredActivity.map((act) => (
                <tr key={act.id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="px-8 py-5 font-bold text-gray-900 group-hover:text-[#113C9E] transition-colors">{act.item}</td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-1.5 rounded-sm px-3 py-1 text-xs font-bold text-white ${
                      act.type === 'Lost' ? 'bg-[#AC5221]' : 'bg-[#1C5F3A]'
                    }`}>
                      {act.type}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-gray-600 font-medium">{act.location}</td>
                  <td className="px-8 py-5 text-gray-600 font-medium">{act.date}</td>
                  <td className="px-8 py-5">
                    <select
                      value={act.status}
                      onChange={(e) => updateItemStatus(act.id, e.target.value)}
                      className={`inline-flex rounded-sm px-3 py-1.5 text-xs font-bold cursor-pointer text-white outline-none appearance-none pr-8 border shadow-sm transition-shadow hover:shadow-md ${
                        act.status === 'Searching' || act.status === 'Pending' ? 'bg-[#C16223] border-[#C16223]' :
                        act.status === 'Matched' || act.status === 'Claimed' ? 'bg-[#113C9E] border-[#113C9E]' :
                        'bg-[#1C5F3A] border-[#1C5F3A]'
                      }`}
                    >
                      <option value="Searching">Searching</option>
                      <option value="Claimable">Claimable</option>
                      <option value="Pending">Pending</option>
                      <option value="Matched">Matched</option>
                      <option value="Claimed">Claimed</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => handleDeleteItem(act.id, act.type)}
                      disabled={deletingId === act.id}
                      className="text-white bg-[#AC5221] hover:bg-orange-800 px-4 py-2 rounded-sm font-bold text-xs transition-colors disabled:opacity-50 inline-flex items-center gap-1 shadow-sm"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      {deletingId === act.id ? '...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PlaceholderView({ title, subtitle }: { title: string, subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center h-[60vh] opacity-90 transition-opacity hover:opacity-100">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 mb-4">
        <svg className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-500 max-w-sm">{subtitle}</p>
      <button className="mt-6 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:focus-visible:outline-indigo-600 hover:bg-indigo-500 transition-colors">
        Get Started
      </button>
    </div>
  );
}

function ReportItemForm({ type, onSuccess, user }: { type: 'Lost' | 'Found', onSuccess: () => void, user: any }) {
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    description: "",
    location: "",
    date: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // Clear error when typing
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.itemName.trim()) newErrors.itemName = "Item Name is required.";
    if (!formData.category) newErrors.category = "Please select a category.";
    if (!formData.description.trim()) newErrors.description = "Description is required.";
    if (!formData.location.trim()) newErrors.location = "Location is required.";
    if (!formData.date) newErrors.date = "Date is required.";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Save to database
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.itemName,
          itemType: type,
          status: type === 'Lost' ? 'Searching' : 'Claimable',
          description: formData.description,
          category: formData.category,
          location: formData.location,
          date: formData.date,
          image: imagePreview || null,
          userEmail: user?.email
        })
      });
      if (!response.ok) {
        console.error("Failed to save item to database");
      }
    } catch (error) {
      console.error("Error saving to database:", error);
    }

    // Save to LocalStorage
    const storedItems = JSON.parse(localStorage.getItem('portal_items') || '[]');
    const newItem = {
      id: Date.now().toString(),
      type,
      ...formData,
      image: imagePreview || null,
      status: type === 'Lost' ? 'Searching' : 'Claimable',
      userEmail: user?.email
    };
    
    storedItems.unshift(newItem);
    localStorage.setItem('portal_items', JSON.stringify(storedItems));

    setSuccessMsg(`Successfully reported ${type.toLowerCase()} item!`);
    
    setTimeout(() => {
      onSuccess();
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-white text-center">
          <h2 className="text-2xl font-bold">Report {type} Item</h2>
          <p className="mt-2 text-indigo-100 opacity-90 text-sm">
            {type === 'Lost' ? 'Let us help you find what you lost. Provide as much detail as possible.' : 'Thank you for helping! Provide details about the item you found.'}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
          {successMsg && (
            <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200 text-center animate-fade-in-up">
              <p className="font-medium text-emerald-800">{successMsg}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700">Item Name</label>
              <input
                type="text"
                name="itemName"
                value={formData.itemName}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-shadow outline-none shadow-sm"
                placeholder="e.g. MacBook Pro Charger"
              />
              {errors.itemName && <p className="mt-1 text-sm text-red-500">{errors.itemName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-shadow outline-none shadow-sm"
              >
                <option value="">Select Category</option>
                <option value="Mobile">Mobile</option>
                <option value="Wallet">Wallet</option>
                <option value="Bag">Bag</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Date {type}</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-shadow outline-none shadow-sm"
              />
              {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700">{type === 'Lost' ? 'Last Seen Location' : 'Found Location'}</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-shadow outline-none shadow-sm"
                placeholder="e.g. Library 2nd Floor, Room 204"
              />
              {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700">Description</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-shadow outline-none shadow-sm resize-none"
                placeholder="Any distinguishing features, colors, or marks..."
              ></textarea>
              {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Image</label>
              <div className="flex items-center justify-center w-full">
                {imagePreview ? (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 group">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                        type="button"
                        onClick={() => setImagePreview(null)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-medium transition-opacity"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <p className="mb-1 text-sm text-gray-500"><span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 mt-8 border-t border-gray-100 justify-end">
            <button
              type="button"
              onClick={() => {
                setFormData({ itemName: "", category: "", description: "", location: "", date: "" });
                setImagePreview(null);
                setErrors({});
              }}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none"
            >
              Reset
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-all active:scale-95"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SearchItemsView() {
  const [items, setItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const updateItemStatus = (itemId: string, newStatus: string) => {
    const updated = items.map(i => i.id === itemId ? { ...i, status: newStatus } : i);
    setItems(updated);
    
    // Update LocalStorage to persist
    const stored = JSON.parse(localStorage.getItem('portal_items') || '[]');
    const newStored = stored.map((i: any) => i.id === itemId ? { ...i, status: newStatus } : i);
    localStorage.setItem('portal_items', JSON.stringify(newStored));
  };

  useEffect(() => {
    const stored = localStorage.getItem('portal_items');
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load items");
      }
    }
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType ? item.type === filterType : true;
    const matchesCategory = filterCategory ? item.category === filterCategory : true;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-11 pr-4 text-sm text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              placeholder="Search by item name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:w-auto">
            <select
              className="rounded-xl border border-gray-200 bg-gray-50/50 py-3 px-4 text-sm text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Lost">Lost</option>
              <option value="Found">Found</option>
            </select>
            
            <select
              className="rounded-xl border border-gray-200 bg-gray-50/50 py-3 px-4 text-sm text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Mobile">Mobile</option>
              <option value="Wallet">Wallet</option>
              <option value="Bag">Bag</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Layout for Items */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center h-[50vh] opacity-90">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 mb-4 shadow-inner">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">No items found</h3>
          <p className="mt-2 text-gray-500 max-w-sm">We couldn't find anything matching your current filters. Try relaxing your search criteria.</p>
          <button 
            onClick={() => { setSearchQuery(""); setFilterCategory(""); setFilterType(""); }}
            className="mt-6 rounded-xl bg-indigo-50 text-indigo-700 px-6 py-2.5 text-sm font-semibold hover:bg-indigo-100 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
          {filteredItems.map(item => (
            <div key={item.id} className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 hover:border-indigo-100 cursor-pointer">
              {/* Card Image Area */}
              <div className="h-48 w-full bg-gray-50 relative overflow-hidden flex-shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.itemName} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-tr from-gray-50 to-gray-100 relative">
                    <svg className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {/* Visual Badge */}
                <span className={`absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-sm backdrop-blur-md ${
                  item.type === 'Lost' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                }`}>
                  {item.type}
                </span>
                <span className="absolute top-4 right-4 inline-flex rounded-full bg-white/95 backdrop-blur-sm px-3 py-1 text-xs font-bold text-gray-700 shadow-sm border border-gray-100/50">
                  {item.category}
                </span>
                
                <div className="absolute bottom-4 right-4 z-10">
                  <select 
                    value={item.status}
                    onChange={(e) => updateItemStatus(item.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className={`text-xs font-bold rounded-full px-3 py-1.5 shadow-sm border outline-none cursor-pointer pr-6 bg-white/95 backdrop-blur-sm ${
                      item.status === 'Searching' ? 'text-amber-700 border-amber-200' :
                      item.status === 'Claimable' ? 'text-emerald-700 border-emerald-200' :
                      item.status === 'Pending' ? 'text-purple-700 border-purple-200' :
                      item.status === 'Claimed' ? 'text-indigo-700 border-indigo-200' :
                      item.status === 'Resolved' ? 'text-gray-700 border-gray-200' :
                      'text-blue-700 border-blue-200'
                    }`}
                  >
                    <option value="Searching">Searching</option>
                    <option value="Claimable">Claimable</option>
                    <option value="Pending">Pending</option>
                    <option value="Matched">Matched</option>
                    <option value="Claimed">Claimed</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>
              
              {/* Card Body */}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex-1">
                  <h3 className="line-clamp-1 text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {item.itemName}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                
                {/* Details Footer */}
                <div className="mt-5 flex items-center justify-between border-t border-gray-50 pt-4 text-xs text-gray-500 bg-white">
                  <div className="flex items-center gap-1.5">
                    <svg className="h-4 w-4 shrink-0 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="line-clamp-1 truncate max-w-[120px] font-medium">{item.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {item.date}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MyReportsView({ user }: { user: any }) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('portal_items');
    if (stored && user?.email) {
      try {
        const parsed = JSON.parse(stored);
        setItems(parsed.filter((i: any) => i.userEmail === user.email));
      } catch (e) {
        console.error("Failed to load items");
      }
    }
  }, [user?.email]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">My Reports</h2>
          <p className="text-sm text-gray-500 mt-1">Manage and track the items you have reported.</p>
        </div>
        <div className="rounded-lg bg-indigo-50 px-4 py-2 text-indigo-700 font-semibold shadow-inner">
          {items.length} {items.length === 1 ? 'Report' : 'Reports'}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center h-[50vh] opacity-90">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 mb-4 shadow-inner">
            <svg className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">No reports yet</h3>
          <p className="mt-2 text-gray-500 max-w-sm">You haven't reported any lost or found items under this account yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
          {items.map(item => (
            <div key={item.id} className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 hover:border-indigo-100 cursor-pointer">
              <div className="h-40 w-full bg-gray-50 relative overflow-hidden flex-shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.itemName} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-tr from-gray-50 to-gray-100 relative">
                    <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm backdrop-blur-md ${
                  item.type === 'Lost' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                }`}>
                  {item.type}
                </span>
              </div>
              
              <div className="flex flex-1 flex-col p-4">
                <div className="flex-1">
                  <h3 className="line-clamp-1 text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {item.itemName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="inline-block rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      {item.category}
                    </span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      item.status === 'Searching' ? 'bg-amber-100 text-amber-800' :
                      item.status === 'Matched' ? 'bg-blue-100 text-blue-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3 text-[11px] text-gray-500">
                  <div className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {item.date}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CctvAdminView() {
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [scheduleSlot, setScheduleSlot] = useState("");

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/cctv');
      if (res.ok) {
        setRequests(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id: number, status: string, scheduledSlot?: string) => {
    try {
      const res = await fetch('/api/cctv', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, scheduledSlot })
      });
      if (res.ok) {
        setSelectedReq(null);
        setScheduleSlot("");
        fetchRequests();
      }
    } catch (err) {
      console.error('Failed to update request');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">CCTV Access Control Panel</h2>
        <p className="text-sm text-gray-500 mt-1">Review student requests to check security footage across the campus.</p>
      </div>

      <div className="rounded-2xl bg-white shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Location / Target Date</th>
                <th className="px-6 py-4">Current Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id} className="border-b bg-white hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {req.userEmail}
                    <div className="text-xs text-gray-400 font-normal mt-1 leading-tight max-w-xs">{req.reason}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold block">{req.location}</span>
                    <span className="text-xs">{req.date} &bull; {req.timeRange}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                      req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                      req.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {req.status.replace('_', ' ')}
                    </span>
                    {req.status === 'Approved' && (
                      <div className="text-[10px] text-emerald-600 mt-1">{req.scheduledSlot}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {req.status === 'Pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => setSelectedReq(req)} className="bg-[#113C9E] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#0A1832]">Approve</button>
                        <button onClick={() => updateStatus(req.id, 'Rejected')} className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No CCTV requests found in the system.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="bg-[#113C9E] p-4 text-white">
               <h3 className="text-lg font-bold">Schedule CCTV Viewing</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">You are approving access for {selectedReq.userEmail}. Provide a viewing appointment so they know when and where to visit the Security Control Room.</p>
              
              <label className="block text-sm font-semibold text-gray-700 mb-1">Appointment Schedule</label>
              <input type="text" placeholder="e.g., Tommorow 3:00 PM at Control Room A" value={scheduleSlot} onChange={e => setScheduleSlot(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 mb-6" />

              <div className="flex gap-3">
                <button onClick={() => setSelectedReq(null)} className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200">Cancel</button>
                <button onClick={() => updateStatus(selectedReq.id, 'Approved', scheduleSlot)} disabled={!scheduleSlot} className="flex-1 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50">Confirm Approval</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
