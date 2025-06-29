"use client";

import { FileText, AlertCircle, AlertTriangle } from "lucide-react";
import { useAppContext } from "@/components/context/AppContext";
import type { Task, ValidationError } from "@/utils/dataProcessing";

interface Props {
  tasks: Task[];
  searchQuery: string;
  errors: ValidationError[];
}

export default function TasksGrid({ tasks, searchQuery, errors }: Props) {
  const { dispatch } = useAppContext();

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

  // Organize errors by row and field
  const errorMap = new Map<number, Map<keyof Task, ValidationError>>();
  errors.forEach((e) => {
    if (e.rowIndex !== undefined && e.field) {
      if (!errorMap.has(e.rowIndex)) errorMap.set(e.rowIndex, new Map());
      errorMap.get(e.rowIndex)!.set(e.field as keyof Task, e);
    }
  });

  const filtered = tasks.filter((task) =>
    Object.values(task).some((val) =>
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleBlur = (
    taskID: string,
    field: keyof Task,
    value: string | number
  ) => {
    dispatch({
      type: "UPDATE_TASK",
      payload: {
        id: taskID,
        task: { [field]: typeof value === "string" ? value.trim() : value },
      },
    });
  };

  return (
    <div className="border rounded h-96 overflow-y-auto overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-900">
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr>
            {["Task ID", "Name", "Category", "Duration", "Required Skills"].map(
              (label) => (
                <th
                  key={label}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide"
                >
                  {label}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filtered.map((task, rowIndex) => {
            const rowErrors = errorMap.get(rowIndex) ?? new Map();

            const getCellStyle = (field: keyof Task) => {
              const err = rowErrors.get(field);
              if (!err) return "";
              return err.severity === "error"
                ? "bg-red-100 border-l-2 border-red-400"
                : "bg-yellow-100 border-l-2 border-yellow-400";
            };

            const renderInput = (field: keyof Task, value: string | number) => {
              const err = rowErrors.get(field);
              return (
                <div
                  className={`relative ${getCellStyle(field)}`}
                  title={err?.message || ""}
                >
                  <input
                    defaultValue={value}
                    onBlur={(e) =>
                      handleBlur(
                        task.TaskID,
                        field,
                        field === "Duration"
                          ? Number(e.target.value)
                          : e.target.value
                      )
                    }
                    type={field === "Duration" ? "number" : "text"}
                    className="w-full px-2 py-1 border rounded border-gray-300 focus:ring-2 focus:ring-blue-400 text-gray-900"
                  />
                  {err?.severity === "error" && (
                    <AlertCircle className="absolute top-1 right-1 h-4 w-4 text-red-500" />
                  )}
                  {err?.severity === "warning" && (
                    <AlertTriangle className="absolute top-1 right-1 h-4 w-4 text-yellow-500" />
                  )}
                </div>
              );
            };

            return (
              <tr key={task.TaskID}>
                <td className="px-4 py-2">
                  {renderInput("TaskID", task.TaskID)}
                </td>
                <td className="px-4 py-2">
                  {renderInput("TaskName", task.TaskName)}
                </td>
                <td className="px-4 py-2">
                  {renderInput("Category", task.Category)}
                </td>
                <td className="px-4 py-2">
                  {renderInput("Duration", task.Duration)}
                </td>
                <td className="px-4 py-2">
                  {renderInput("RequiredSkills", task.RequiredSkills)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
