"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NotificationBell from "../components/NotificationBell";
import { sendNotification } from "@/lib/notifications";
import Chatbot from "../components/Chatbot";
import UserChat from "../components/UserChat";
import Tesseract from 'tesseract.js';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [chatUserEmail, setChatUserEmail] = useState<string | null>(null);

  // Initialize from sessionStorage
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role === "Admin") {
          router.push("/admin");
          return;
        }
        setUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse user from session storage");
      }
    } else {
      // Redirect to login if unauthenticated
      router.push("/login");
    }
  }, [router]);

  // Unread Messages Poller
  useEffect(() => {
    if (!user?.email) return;

    const checkUnreadMessages = async () => {
      try {
        const res = await fetch(`/api/chat/unread?userEmail=${encodeURIComponent(user.email)}`);
        if (res.ok) {
          const unreadMsgs = await res.json();
          if (unreadMsgs.length > 0) {
            // Get existing notifications to prevent duplicates
            const existingRaw = localStorage.getItem('portal_notifications') || '[]';
            const existing = JSON.parse(existingRaw);
            
            unreadMsgs.forEach((msg: any) => {
              // Check if we already notified about this exact message ID
              const alreadyNotified = existing.some((n: any) => n.relatedId === msg.id);
              if (!alreadyNotified) {
                sendNotification({
                  roleTarget: 'User',
                  userEmailTarget: user.email,
                  type: 'NewMessage',
                  message: `New message from ${msg.senderEmail}`,
                  relatedId: msg.id
                });
              }
            });
          }
        }
      } catch (err) {
        // silently fail polling
      }
    };

    // Check immediately, then every 5 seconds
    checkUnreadMessages();
    const interval = setInterval(checkUnreadMessages, 5000);
    
    return () => clearInterval(interval);
  }, [user?.email]);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  if (!user) return null; // Avoid flicker before redirect

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview user={user} setChatUserEmail={setChatUserEmail} />;
      case "my-reports":
        return <MyReportsView user={user} />;
      case "report-lost":
        return <ReportItemForm type="Lost" onSuccess={() => setActiveTab("dashboard")} user={user} />;
      case "report-found":
        return <ReportItemForm type="Found" onSuccess={() => setActiveTab("dashboard")} user={user} />;
      case "search":
        return <SearchItemsView user={user} setChatUserEmail={setChatUserEmail} />;
      case "rewards":
        return <RewardsView user={user} />;
      case "cctv":
        return <CctvAccessView user={user} />;
      default:
        return <DashboardOverview user={user} setChatUserEmail={setChatUserEmail} />;
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { id: "my-reports", label: "My Reports", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
    { id: "report-lost", label: "Report Lost Item", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z M8 11h.01M12 11h.01M16 11h.01" },
    { id: "report-found", label: "Report Found Item", icon: "M5 13l4 4L19 7" },
    { id: "search", label: "Search Items", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
    { id: "rewards", label: "Rewards", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id: "cctv", label: "CCTV Access", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
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
              <svg className="h-5 w-5 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-gray-100 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-all hover:bg-red-50 hover:text-red-700"
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

      {chatUserEmail && (
        <UserChat 
           currentUser={user} 
           otherUserEmail={chatUserEmail} 
           onClose={() => setChatUserEmail(null)} 
        />
      )}
      <Chatbot />
    </div>
  );
}

// ------ Subcomponents for Dashboard Rendering ------

function DashboardOverview({ user, setChatUserEmail }: { user: any, setChatUserEmail: (email: string) => void }) {
  const defaultActivity: any[] = [];
  const [allItems, setAllItems] = useState<any[]>(defaultActivity);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [stats, setStats] = useState({ lost: 24, found: 18, matches: 11 });
  const [claimItem, setClaimItem] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState("");

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
      <div className="rounded-2xl bg-[#0A1832] p-6 shadow-lg lg:p-8 flex items-center justify-between relative overflow-hidden text-white">
         <div className="relative z-10">
           <h2 className="text-2xl font-bold">Welcome back, {user?.fullName?.split(' ')[0] || 'User'}! 👋</h2>
           <p className="mt-1 text-gray-300 font-medium">Here's what's happening with campus lost and found today.</p>
         </div>
         {/* Decorative Element */}
         <div className="absolute right-0 top-0 -mr-8 -mt-8 h-40 w-40 rounded-full bg-white opacity-5 blur-2xl"></div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {summaryCards.map((card, idx) => (
          <div key={idx} onClick={() => setActiveFilter(card.title)} className={`group rounded-2xl bg-white p-6 shadow-sm border transition-all hover:shadow-md cursor-pointer ${activeFilter === card.title ? 'border-indigo-500 ring-1 ring-indigo-50' : 'border-gray-100 hover:border-indigo-100'} flex items-center gap-4`}>
            <div className={`flex h-14 w-14 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${card.bg}`}>
              <svg className={`h-7 w-7 ${card.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Grid/Table */}
      <div className="rounded-xl bg-white shadow-md border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-5 flex items-center justify-between bg-gray-50">
          <h3 className="text-lg font-bold text-[#0A1832]">{activeFilter === 'All' ? 'Recent Activity' : activeFilter}</h3>
          <button onClick={() => setActiveFilter('All')} className="text-sm font-bold text-[#113C9E] hover:text-[#0A1832] transition-colors">
            {activeFilter === 'All' ? 'View all' : 'Clear filter'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-bold text-gray-800 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Item Details</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredActivity.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No items found matching the selected filter.
                  </td>
                </tr>
              ) : filteredActivity.map((act) => (
                <tr key={act.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{act.item}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-bold text-white ${
                      act.type === 'Lost' ? 'bg-[#AC5221]' : 'bg-[#1C5F3A]'
                    }`}>
                      {act.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{act.location}</td>
                  <td className="px-6 py-4 text-gray-500">{act.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold text-white shadow-sm ${
                      act.status === 'Searching' ? 'bg-[#AC5221]' :
                      act.status === 'Matched' ? 'bg-[#113C9E]' :
                      'bg-[#1C5F3A]'
                    }`}>
                      {act.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <button onClick={() => setClaimItem(act)} className="text-xs font-bold text-white hover:bg-[#0A1832] bg-[#113C9E] px-3 py-1.5 rounded-md transition-colors shadow-sm">Claim</button>
                    {act.userEmail && act.userEmail !== user.email && (
                      <button onClick={(e) => { e.stopPropagation(); setChatUserEmail(act.userEmail); }} className="text-xs font-bold text-[#113C9E] bg-[#113C9E]/10 hover:bg-[#113C9E]/20 px-3 py-1.5 rounded-md transition-colors shadow-sm flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        Chat
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {claimItem && <ClaimItemModal item={claimItem} user={user} onClose={() => setClaimItem(null)} onSuccess={() => { setClaimItem(null); setSuccessMsg("Claim submitted successfully!"); setTimeout(() => setSuccessMsg(""), 3000); }} />}
      {successMsg && <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg animate-fade-in-up z-50 font-medium flex items-center gap-2"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> {successMsg}</div>}
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
  const [aiTags, setAiTags] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedRollNumber, setExtractedRollNumber] = useState<string | null>(null);

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
        setAiTags(""); // reset AI when image changes
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImageWithAI = async () => {
    if (!imagePreview) return;
    setIsAnalyzing(true);
    setExtractedRollNumber(null);
    try {
      const response = await fetch('/api/ai-vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
           imageBase64: imagePreview,
           descriptionHint: formData.description 
        })
      });
      const data = await response.json();
      if (data.success) {
         let cat = data.prediction.category || formData.category;
         let name = data.prediction.itemName || formData.itemName;
         let tags = data.prediction.tags;
         
         setFormData(prev => ({
           ...prev,
           category: cat,
           itemName: name
         }));
         setAiTags(tags);
         
         if (cat === "ID Card" || formData.description.toLowerCase().includes("id")) {
             setSuccessMsg("ID Card detected! Scanning for Roll Number...");
             try {
                const { data: { text } } = await Tesseract.recognize(imagePreview, 'eng');
                const match = text.match(/[a-z0-9]{2,4}[-\s]?[a-z]{2,4}[-\s]?\d{2,4}/i);
                if (match) {
                    setExtractedRollNumber(match[0].toUpperCase());
                    setSuccessMsg(`AI Extracted Roll No: ${match[0].toUpperCase()}`);
                } else {
                    setSuccessMsg(`AI analyzed image! Added tags: ${tags}`);
                }
             } catch (e) {
                console.error("OCR Error", e);
                setSuccessMsg(`AI analyzed image! Added tags: ${tags}`);
             }
         } else {
             setSuccessMsg(`AI analyzed image! Added tags: ${tags}`);
         }
         setTimeout(() => setSuccessMsg(""), 5000);
      } else {
         setErrors(prev => ({ ...prev, image: "AI Vision could not process this image." }));
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, image: "AI Engine connection failed." }));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.itemName.trim()) newErrors.itemName = "Item Name is required.";
    if (!formData.category) newErrors.category = "Please select a category.";
    if (!formData.description.trim()) newErrors.description = "Description is required.";
    if (!formData.location.trim()) newErrors.location = "Location is required.";
    if (!formData.date) newErrors.date = "Date is required.";
    
    if (type === 'Found' && !imagePreview) {
      newErrors.image = "Please upload an image of the found item for verification.";
    }
    
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
          userEmail: user?.email,
          aiTags: aiTags || null,
          extractedRollNumber: extractedRollNumber
        })
      });
      if (response.ok) {
         const responseData = await response.json();
         // If a student was found with this Roll No, notify them!
         if (responseData.matchedStudentEmail) {
            sendNotification({
              roleTarget: 'User',
              userEmailTarget: responseData.matchedStudentEmail,
              type: 'NewItem',
              message: `🚨 IMPORTANT: Your ID Card (Roll No: ${extractedRollNumber}) has been found at ${formData.location}! Check the Found Items section to claim it.`
            });
            console.log("Notified student:", responseData.matchedStudentEmail);
         }
      } else {
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
      userEmail: user?.email,
      aiTags: aiTags || null
    };
    
    storedItems.unshift(newItem);
    localStorage.setItem('portal_items', JSON.stringify(storedItems));

    // Send notification to admin
    sendNotification({
      roleTarget: 'Admin',
      type: 'NewItem',
      message: `A new ${type.toLowerCase()} item ("${formData.itemName}") was just reported by ${user?.fullName || 'a student'}.`
    });

    setSuccessMsg(`Successfully reported ${type.toLowerCase()} item!`);
    
    setTimeout(() => {
      onSuccess();
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#0A1832] px-8 py-6 text-white text-center">
          <h2 className="text-2xl font-bold">Report {type} Item</h2>
          <p className="mt-2 text-gray-300 opacity-90 text-sm">
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
                <option value="Mobile">Mobile/Phone</option>
                <option value="Electronics">Electronics/Laptops</option>
                <option value="Wallet">Wallet</option>
                <option value="Bag">Bag</option>
                <option value="ID Card">ID Card</option>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Image {type === 'Found' && <span className="text-red-500">*</span>} {type === 'Lost' && <span className="text-gray-400 font-normal">(Optional)</span>}
              </label>
              <div className="flex items-center justify-center w-full">
                {imagePreview ? (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 group">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setErrors((prev) => ({ ...prev, image: "" }));
                        }}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-medium transition-opacity"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <label htmlFor="dropzone-file" className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${errors.image ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50/50 hover:bg-gray-50'}`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className={`w-8 h-8 mb-2 ${errors.image ? 'text-red-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <p className="mb-1 text-sm text-gray-500"><span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={(e) => {
                      handleImageChange(e);
                      setErrors((prev) => ({ ...prev, image: "" }));
                    }} />
                  </label>
                )}
              </div>
            </div>

            {/* AI Vision Action UI */}
            {imagePreview && (
               <div className="sm:col-span-2 bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-inner">
                  <div className="flex-1">
                     <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Smart AI Vision
                     </h4>
                     <p className="text-xs text-indigo-600/80 mt-1">
                        Use Artificial Intelligence to automatically scan visual features, deduce categories, and append predictive hidden tags for superior searching.
                     </p>
                     {aiTags && (
                        <div className="mt-3 flex flex-wrap gap-2">
                           {aiTags.split(',').map(tag => (
                             <span key={tag} className="bg-indigo-600 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md">
                               {tag.trim()}
                             </span>
                           ))}
                        </div>
                     )}
                  </div>
                  <button 
                     type="button" 
                     onClick={analyzeImageWithAI}
                     disabled={isAnalyzing}
                     className="shrink-0 group relative flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md overflow-hidden disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all"
                  >
                     {isAnalyzing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Scanning...
                        </>
                     ) : (
                        <>Scan with AI ✨</>
                     )}
                  </button>
               </div>
            )}
            
          </div>

          <div className="flex items-center gap-4 pt-4 mt-8 border-t border-gray-100 justify-end">
            <button
              type="button"
              onClick={() => {
                setFormData({ itemName: "", category: "", description: "", location: "", date: "" });
                setImagePreview(null);
                setAiTags("");
                setErrors({});
              }}
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#113C9E] px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#0A1832] hover:shadow-lg transition-all"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SearchItemsView({ user, setChatUserEmail }: { user: any, setChatUserEmail: (email: string) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [claimItem, setClaimItem] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState("");

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
                
                {user && (
                  <div className="mt-4 pt-4 border-t border-gray-50 p-5 bg-white rounded-b-2xl flex flex-col sm:flex-row gap-2">
                     <button onClick={(e) => { e.stopPropagation(); setClaimItem(item); }} className="flex-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 py-2.5 rounded-xl text-sm font-semibold transition-colors">Claim Item</button>
                     {item.userEmail && item.userEmail !== user.email && (
                       <button onClick={(e) => { e.stopPropagation(); setChatUserEmail(item.userEmail); }} className="flex-1 bg-gray-50 text-gray-700 hover:bg-gray-100 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                         Message
                       </button>
                     )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {claimItem && (
        <ClaimItemModal
          item={claimItem}
          user={user}
          onClose={() => setClaimItem(null)}
          onSuccess={() => {
            setSuccessMsg(`Your claim for "${claimItem.itemName}" was successfully submitted! Check your Notification Bell shortly!`);
            setClaimItem(null);
            setTimeout(() => setSuccessMsg(""), 5000);
          }}
        />
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

  const handleMarkReturned = async (item: any) => {
    if (!window.confirm("Are you sure this item has been returned to its owner? You will receive 50 Reward Points!")) return;
    
    try {
      // Add points via API
      const res = await fetch('/api/users/add-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, pointsToAdd: 50 })
      });
      
      if (res.ok) {
        const data = await res.json();
        
        // Update local storage user points
        const updatedUser = { ...user, points: data.points };
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
        
        // Update item status
        const stored = JSON.parse(localStorage.getItem('portal_items') || '[]');
        const updatedItems = stored.map((i: any) => i.id === item.id ? { ...i, status: 'Returned' } : i);
        localStorage.setItem('portal_items', JSON.stringify(updatedItems));
        
        // Update local state
        setItems(updatedItems.filter((i: any) => i.userEmail === user.email));
        
        alert(`Success! You have been awarded 50 points. Your new balance is ${data.points} points.`);
        window.location.reload(); // Quick refresh to update parent navbar points
      } else {
        alert("Failed to add points.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred.");
    }
  };

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
                
                <div className="mt-4 flex flex-col gap-3 border-t border-gray-50 pt-3 text-[11px] text-gray-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {item.date}
                    </div>
                  </div>
                  
                  {item.type === 'Found' && item.status !== 'Returned' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleMarkReturned(item); }}
                      className="w-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:text-emerald-800 transition-colors py-2 rounded-lg font-bold flex justify-center items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                      Mark as Returned (Get +50 Pts)
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClaimItemModal({ item, user, onClose, onSuccess }: { item: any, user: any, onClose: () => void, onSuccess: () => void }) {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setError("Please provide a contact number or email.");
      return;
    }
    const claims = JSON.parse(localStorage.getItem("portal_claims") || "[]");
    const existing = claims.find((c: any) => c.itemId === item.id && c.userEmail === user.email);
    if (existing) {
      setError("You have already submitted a claim for this item.");
      return;
    }
    
    claims.push({
      itemId: item.id,
      userEmail: user.email,
      userName: user.fullName,
      phone,
      message,
      date: new Date().toISOString()
    });
    localStorage.setItem("portal_claims", JSON.stringify(claims));
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
          <h3 className="text-lg font-bold">Claim Item</h3>
          <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item to Claim</label>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-900 font-medium flex justify-between">
              <span>{item.itemName}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-200 text-gray-700">{item.category}</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input type="text" value={user.fullName} disabled className="w-full bg-gray-50 border border-gray-200 text-gray-500 text-sm rounded-xl px-4 py-2.5 outline-none cursor-not-allowed" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Information (Phone/Email) *</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g., cell number or alternative email" className="w-full border border-gray-300 text-gray-900 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secret Identifier / Verification Proof *</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} placeholder="Enter lock-screen wallpaper, serial number, password, or hidden contents to prove ownership..." className="w-full border border-gray-300 text-gray-900 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none" required></textarea>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-colors focus:outline-none">Submit Claim</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CctvAccessView({ user }: { user?: any }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    location: '',
    date: '',
    timeRange: '',
    reason: ''
  });
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetchRequests = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`/api/cctv?userEmail=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.location || !formData.date || !formData.timeRange || !formData.reason) {
      setMsg({ type: 'error', text: 'All fields are required.' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/cctv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user?.email,
          ...formData
        })
      });

      if (res.ok) {
        setMsg({ type: 'success', text: 'CCTV request submitted successfully!' });
        setFormData({ location: '', date: '', timeRange: '', reason: '' });
        fetchRequests();
      } else {
        setMsg({ type: 'error', text: 'Failed to submit request.' });
      }
    } catch (error) {
      setMsg({ type: 'error', text: 'Network error occurred.' });
    } finally {
      setLoading(false);
      setTimeout(() => setMsg({ type: '', text: '' }), 5000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">CCTV Access Request</h2>
          <p className="text-sm text-gray-500 mt-1">Request permission to review campus footage for lost items.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Form */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Submit New Request</h3>
          
          {msg.text && (
            <div className={`p-3 mb-4 rounded-xl text-sm font-medium ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Campus Location</label>
              <input type="text" placeholder="e.g., Library 2nd Floor, Main Cafe" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 px-4 text-sm text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 px-4 text-sm text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Time Range</label>
                <input type="text" placeholder="e.g., 2:00 PM - 2:30 PM" value={formData.timeRange} onChange={e => setFormData({...formData, timeRange: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 px-4 text-sm text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Reason for Request</label>
              <textarea rows={3} placeholder="Describe the item you lost and why you need footage..." value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 px-4 text-sm text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none"></textarea>
            </div>

            <button type="submit" disabled={loading} className="w-full rounded-xl bg-[#113C9E] py-3 text-sm font-bold text-white transition-all hover:bg-[#0A1832] disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit CCTV Request'}
            </button>
          </form>
        </div>

        {/* My Requests Tracker */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">My Requests History</h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {requests.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500 text-sm">You haven't made any CCTV requests yet.</p>
              </div>
            ) : (
              requests.map((req, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white transition-colors hover:shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-gray-900">{req.location}</span>
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                      req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                      req.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {req.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{req.date} &bull; {req.timeRange}</p>
                  
                  {req.status === 'Approved' && req.scheduledSlot && (
                    <div className="mt-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                      <p className="text-xs font-semibold text-emerald-800">Viewing Schedule:</p>
                      <p className="text-sm font-medium text-emerald-900 mt-0.5">{req.scheduledSlot}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RewardsView({ user }: { user: any }) {
  const [points, setPoints] = useState(user?.points || 0);
  const [redeemedMsg, setRedeemedMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleRedeem = (rewardName: string, cost: number) => {
    if (points >= cost) {
       const code = Math.random().toString(36).substring(2, 10).toUpperCase();
       setPoints(points - cost);
       setRedeemedMsg(`Successfully redeemed ${rewardName}! Your coupon code is: ${code}`);
       setErrorMsg("");
       setTimeout(() => setRedeemedMsg(""), 10000);
    } else {
       setErrorMsg(`Not enough points. You need ${cost - points} more points.`);
       setTimeout(() => setErrorMsg(""), 5000);
    }
  };

  const rewards = [
    { title: "10% Cafeteria Discount", cost: 100, icon: "🍔", bg: "bg-orange-50 text-orange-600" },
    { title: "20 Pages Free Printing", cost: 150, icon: "🖨️", bg: "bg-blue-50 text-blue-600" },
    { title: "Campus Official Merchandise", cost: 500, icon: "🎁", bg: "bg-purple-50 text-purple-600" }
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="rounded-2xl bg-gradient-to-r from-[#113C9E] to-purple-700 p-8 shadow-lg text-white relative overflow-hidden">
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div>
             <h2 className="text-3xl font-extrabold mb-2">Campus Rewards 🎁</h2>
             <p className="text-indigo-100 font-medium max-w-lg">Earn points by returning lost items and redeem them for exclusive campus benefits!</p>
           </div>
           <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 text-center shadow-inner border border-white/30 shrink-0">
             <p className="text-sm font-semibold uppercase tracking-wider text-indigo-100">Your Balance</p>
             <p className="text-5xl font-extrabold mt-1">{points}</p>
           </div>
         </div>
         <div className="absolute left-0 top-0 -ml-8 -mt-8 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl"></div>
      </div>

      {redeemedMsg && (
        <div className="rounded-xl bg-emerald-50 p-6 border border-emerald-200 text-center shadow-sm">
          <p className="text-lg font-bold text-emerald-800">🎉 Reward Redeemed!</p>
          <p className="text-emerald-700 mt-2 font-medium">{redeemedMsg}</p>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl bg-red-50 p-4 border border-red-200 text-center shadow-sm">
          <p className="font-medium text-red-800">{errorMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {rewards.map((reward, idx) => (
          <div key={idx} className="group rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col text-center">
            <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${reward.bg} text-4xl mb-4 group-hover:scale-110 transition-transform`}>
              {reward.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900">{reward.title}</h3>
            <p className="text-indigo-600 font-bold mt-2 mb-6">{reward.cost} Points</p>
            <button 
              onClick={() => handleRedeem(reward.title, reward.cost)}
              className="mt-auto w-full rounded-xl bg-[#113C9E] px-4 py-3 text-sm font-bold text-white hover:bg-[#0A1832] transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Redeem Reward
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
