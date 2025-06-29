"use client";
import { Settings } from "lucide-react";

export default function BusinessRulesPanel() {
  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Business Rules</h2>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
          <Settings className="h-4 w-4" />
          <span>Configure Rules</span>
        </button>
      </div>
      <div className="text-center text-gray-500 py-8">
        <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p>No business rules configured yet.</p>
        <p className="text-sm">
          Upload your data first, then configure allocation rules.
        </p>
      </div>
    </div>
  );
}
