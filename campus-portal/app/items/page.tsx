"use client";

import { useEffect, useState } from "react";

type Item = {
  id: number;
  title: string;
  itemType: string;
  status: string;
};

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/items", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setAdding(true);
    const formData = new FormData(form);
    const payload = {
      title: formData.get("title") as string,
      itemType: formData.get("itemType") as string,
    };

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        form.reset();
        await fetchItems();
      } else {
        console.error("Failed to add item:", await response.text());
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
          <h1 className="text-3xl font-bold leading-6 text-[#0A1832]">Reported Items</h1>
          <p className="mt-2 text-sm text-gray-700">
            A comprehensive board showing all items that have been either lost or found across campus recently.
          </p>
        </div>
      </div>

      <div className="mt-12 lg:grid lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-xl bg-white">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-[#0A1832]">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6 text-center">ID</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Title</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Type</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="whitespace-nowrap py-8 pl-4 pr-3 text-sm text-center text-gray-500">
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-slate-200 rounded w-1/4 mx-auto"></div>
                        <div className="h-4 bg-slate-200 rounded w-1/3 mx-auto"></div>
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="whitespace-nowrap py-8 pl-4 pr-3 text-sm text-center text-gray-500">
                      No items report. Time to report one if you lost something!
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 text-center">{item.id}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-slate-700">{item.title}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {item.itemType === 'Lost' ? (
                          <span className="inline-flex items-center rounded-sm bg-[#AC5221] px-2 py-1 text-xs font-bold text-white shadow-sm">Lost</span>
                        ) : (
                          <span className="inline-flex items-center rounded-sm bg-[#1C5F3A] px-2 py-1 text-xs font-bold text-white shadow-sm">Found</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {item.status === 'Pending' ? (
                          <span className="inline-flex items-center rounded-full bg-[#AC5221] px-2 py-1 text-xs font-bold text-white shadow-sm">Pending</span>
                        ) : item.status === 'Matched' ? (
                          <span className="inline-flex items-center rounded-full bg-[#113C9E] px-2 py-1 text-xs font-bold text-white shadow-sm">Matched</span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-[#0A1832] px-2 py-1 text-xs font-bold text-white shadow-sm">{item.status || 'Active'}</span>
                        )}
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
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Report Item</h2>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">Item Title / Description</label>
                <div className="mt-2">
                  <input required placeholder="E.g., Blue Backpack, Student ID" type="text" name="title" id="title" className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                </div>
              </div>
              <div>
                <label htmlFor="itemType" className="block text-sm font-medium leading-6 text-[#0A1832]">Did you lose or find this?</label>
                <div className="mt-2 flex gap-4">
                  <div className="flex items-center">
                    <input id="type-lost" name="itemType" type="radio" value="Lost" defaultChecked className="h-4 w-4 border-gray-300 text-[#113C9E] focus:ring-[#113C9E]" />
                    <label htmlFor="type-lost" className="ml-3 block text-sm font-medium leading-6 text-gray-900">I Lost It</label>
                  </div>
                  <div className="flex items-center">
                    <input id="type-found" name="itemType" type="radio" value="Found" className="h-4 w-4 border-gray-300 text-[#113C9E] focus:ring-[#113C9E]" />
                    <label htmlFor="type-found" className="ml-3 block text-sm font-medium leading-6 text-gray-900">I Found It</label>
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <button disabled={adding} type="submit" className="w-full flex justify-center rounded-md bg-[#113C9E] px-3 py-2 text-sm font-bold text-white shadow-sm hover:focus:ring-[#0F2A4A] disabled:opacity-70 transition-all">
                  {adding ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
