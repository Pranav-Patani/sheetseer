"use client";
import { Upload, Brain } from "lucide-react";
import type { TabID, TabType } from "./types";

interface UploadSidebarProps {
  tabs: TabType[];
  isUploading: boolean;
  handleFileUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: TabID
  ) => void;
}

export default function UploadSidebar({
  tabs,
  isUploading,
  handleFileUpload,
}: UploadSidebarProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Upload</h2>

      <div className="space-y-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <div key={tab.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-700">{tab.label}</span>
                </div>
                <span className="text-sm text-gray-500">{tab.count}</span>
              </div>

              <label className="block">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => handleFileUpload(e, tab.id)}
                  className="hidden"
                  disabled={isUploading}
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {isUploading
                      ? "Processing..."
                      : `Upload ${tab.label} CSV/XLSX`}
                  </p>
                </div>
              </label>
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center space-x-2">
          <Brain className="h-4 w-4 text-blue-600" />
          <span>AI Features</span>
        </h3>

        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
            Smart Data Validation
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
            Natural Language Search
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
            Rule Recommendations
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
            Auto Error Correction
          </button>
        </div>
      </div>
    </div>
  );
}
