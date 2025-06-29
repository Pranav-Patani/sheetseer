"use client";
import { Briefcase } from "lucide-react";
import type { Worker, ValidationError } from "@/utils/dataProcessing";

interface Props {
  workers: Worker[];
  searchQuery: string;
  errors: ValidationError[];
}

export default function WorkersGrid({ workers, searchQuery, errors }: Props) {
  if (workers.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No workers data
        </h3>
        <p className="text-gray-500">
          Upload a CSV or XLSX file to get started
        </p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {["Worker ID", "Name", "Skills", "Available Slots", "Max Load"].map(
              (h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {workers.map((w) => (
            <tr key={w.WorkerID}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {w.WorkerID}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {w.WorkerName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {w.Skills}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {w.AvailableSlots}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {w.MaxLoadPerPhase}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
