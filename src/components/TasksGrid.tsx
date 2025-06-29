"use client";
import { FileText } from "lucide-react";
import type { Task, ValidationError } from "@/utils/dataProcessing";

interface Props {
  tasks: Task[];
  searchQuery: string;
  errors: ValidationError[];
}

export default function TasksGrid({ tasks, searchQuery, errors }: Props) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No tasks data
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
            {["Task ID", "Name", "Category", "Duration", "Required Skills"].map(
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
          {tasks.map((t) => (
            <tr key={t.TaskID}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {t.TaskID}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {t.TaskName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {t.Category}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {t.Duration}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {t.RequiredSkills}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
