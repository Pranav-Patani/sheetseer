"use client";
import type { TabID, TabType } from "./types";

interface DataTabsProps {
  tabs: TabType[];
  currentTab: TabID;
  setCurrentTab: (tab: TabID) => void;
}

export default function DataTabs({
  tabs,
  currentTab,
  setCurrentTab,
}: DataTabsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <nav className="flex space-x-8 px-6 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === currentTab;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                isActive
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
