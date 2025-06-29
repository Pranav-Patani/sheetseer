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
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search data... (e.g., 'priority level 5', 'tasks with duration > 2')"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      {searchQuery && (
        <button
          onClick={() => setSearchQuery("")}
          className="px-3 py-2 text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
