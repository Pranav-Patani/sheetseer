"use client";
import { AlertTriangle, Brain, CheckCircle, Download } from "lucide-react";

interface HeaderProps {
  clientsCount: number;
  workersCount: number;
  tasksCount: number;
  errorCount: number;
  warningCount: number;
}

export default function Header({
  clientsCount,
  workersCount,
  tasksCount,
  errorCount,
  warningCount,
}: HeaderProps) {
  const showValidated =
    errorCount === 0 &&
    warningCount === 0 &&
    (clientsCount > 0 || workersCount > 0 || tasksCount > 0);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sheet Seer</h1>
              <p className="text-sm text-gray-500">
                {`Data was a mess, "was" because now we are here ;)`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {(errorCount > 0 || warningCount > 0) && (
              <div className="flex items-center space-x-2">
                {errorCount > 0 && (
                  <div className="flex items-center space-x-1 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {errorCount} errors
                    </span>
                  </div>
                )}
                {warningCount > 0 && (
                  <div className="flex items-center space-x-1 text-yellow-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {warningCount} warnings
                    </span>
                  </div>
                )}
              </div>
            )}

            {showValidated && (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">All validated</span>
              </div>
            )}

            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
