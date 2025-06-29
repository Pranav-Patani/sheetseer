"use client";

import { Search, X } from "lucide-react";

type Props = {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
};

export default function SearchBar({ searchQuery, setSearchQuery }: Props) {
  return (
    <div className="mb-4 flex items-center space-x-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700 h-4 w-4" />
        <input
          type="text"
          placeholder="Search data... (e.g., 'priority level 5', 'tasks with duration > 2')"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
        />
      </div>
      {searchQuery && (
        <button
          onClick={() => setSearchQuery("")}
          className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          title="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
