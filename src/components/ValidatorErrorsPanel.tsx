"use client";

import { AlertTriangle } from "lucide-react";
import { ValidationError } from "../utils/dataProcessing";

type Props = {
  validationErrors: ValidationError[];
};

export default function ValidationErrorsPanel({ validationErrors }: Props) {
  if (validationErrors.length === 0) return null;

  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <span>Validation Issues ({validationErrors.length})</span>
        </h2>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {validationErrors.map((error, index) => (
          <div
            key={index}
            className={`p-3 rounded border-l-4 ${
              error.severity === "error"
                ? "bg-red-50 border-red-400 text-red-700"
                : "bg-yellow-50 border-yellow-400 text-yellow-700"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">
                  {capitalize(error.entity)}
                  {error.field ? ` - ${error.field}` : ""}
                </p>
                <p className="text-sm">{error.message}</p>
                {error.rowIndex !== undefined && (
                  <p className="text-xs opacity-75">Row {error.rowIndex + 1}</p>
                )}
              </div>
              <span
                className={`px-2 py-1 text-xs rounded ${
                  error.severity === "error"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {error.severity}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
