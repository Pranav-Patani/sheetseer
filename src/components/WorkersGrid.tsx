"use client";

import { Briefcase, AlertCircle, AlertTriangle } from "lucide-react";
import { useAppContext } from "@/components/context/AppContext";
import type { Worker, ValidationError } from "@/utils/dataProcessing";

interface Props {
  workers: Worker[];
  searchQuery: string;
  errors: ValidationError[];
}

export default function WorkersGrid({ workers, searchQuery, errors }: Props) {
  const { dispatch } = useAppContext();

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

  // Organize errors by row and field
  const errorMap = new Map<number, Map<keyof Worker, ValidationError>>();
  errors.forEach((e) => {
    if (e.rowIndex !== undefined && e.field) {
      if (!errorMap.has(e.rowIndex)) errorMap.set(e.rowIndex, new Map());
      errorMap.get(e.rowIndex)!.set(e.field as keyof Worker, e);
    }
  });

  const filtered = workers.filter((worker) =>
    Object.values(worker).some((val) =>
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleBlur = (
    workerID: string,
    field: keyof Worker,
    value: string | number
  ) => {
    dispatch({
      type: "UPDATE_WORKER",
      payload: {
        id: workerID,
        worker: { [field]: typeof value === "string" ? value.trim() : value },
      },
    });
  };

  const getCellStyle = (rowIndex: number, field: keyof Worker) => {
    const err = errorMap.get(rowIndex)?.get(field);
    if (!err) return "";
    return err.severity === "error"
      ? "bg-red-100 border-l-2 border-red-400"
      : "bg-yellow-100 border-l-2 border-yellow-400";
  };

  const renderInput = (
    rowIndex: number,
    workerID: string,
    field: keyof Worker,
    value: string | number
  ) => {
    const err = errorMap.get(rowIndex)?.get(field);
    return (
      <div
        className={`relative ${getCellStyle(rowIndex, field)}`}
        title={err?.message || ""}
      >
        <input
          defaultValue={value}
          onBlur={(e) =>
            handleBlur(
              workerID,
              field,
              field === "MaxLoadPerPhase" || field === "QualificationLevel"
                ? Number(e.target.value)
                : e.target.value
            )
          }
          type={
            field === "MaxLoadPerPhase" || field === "QualificationLevel"
              ? "number"
              : "text"
          }
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
    <div className="border rounded h-96 overflow-y-auto overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-900">
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr>
            {[
              "Worker ID",
              "Name",
              "Skills",
              "Available Slots",
              "Max Load",
              "Group",
              "Qualification",
            ].map((label) => (
              <th
                key={label}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filtered.map((worker, rowIndex) => (
            <tr key={worker.WorkerID}>
              <td className="px-4 py-2">
                {renderInput(
                  rowIndex,
                  worker.WorkerID,
                  "WorkerID",
                  worker.WorkerID
                )}
              </td>
              <td className="px-4 py-2">
                {renderInput(
                  rowIndex,
                  worker.WorkerID,
                  "WorkerName",
                  worker.WorkerName
                )}
              </td>
              <td className="px-4 py-2">
                {renderInput(
                  rowIndex,
                  worker.WorkerID,
                  "Skills",
                  worker.Skills
                )}
              </td>
              <td className="px-4 py-2">
                {renderInput(
                  rowIndex,
                  worker.WorkerID,
                  "AvailableSlots",
                  worker.AvailableSlots
                )}
              </td>
              <td className="px-4 py-2">
                {renderInput(
                  rowIndex,
                  worker.WorkerID,
                  "MaxLoadPerPhase",
                  worker.MaxLoadPerPhase
                )}
              </td>
              <td className="px-4 py-2">
                {renderInput(
                  rowIndex,
                  worker.WorkerID,
                  "WorkerGroup",
                  worker.WorkerGroup
                )}
              </td>
              <td className="px-4 py-2">
                {renderInput(
                  rowIndex,
                  worker.WorkerID,
                  "QualificationLevel",
                  worker.QualificationLevel
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
