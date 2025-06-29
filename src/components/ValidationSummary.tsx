"use client";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface Props {
  errors: number;
  warnings: number;
  hasData: boolean;
}

export default function ValidationSummary({
  errors,
  warnings,
  hasData,
}: Props) {
  return (
    <>
      {(errors > 0 || warnings > 0) && (
        <div className="flex items-center space-x-2">
          {errors > 0 && (
            <div className="flex items-center space-x-1 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">{errors} errors</span>
            </div>
          )}
          {warnings > 0 && (
            <div className="flex items-center space-x-1 text-yellow-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">{warnings} warnings</span>
            </div>
          )}
        </div>
      )}
      {errors === 0 && warnings === 0 && hasData && (
        <div className="flex items-center space-x-1 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">All validated</span>
        </div>
      )}
    </>
  );
}
