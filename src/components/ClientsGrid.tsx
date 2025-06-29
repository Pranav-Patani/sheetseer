"use client";

import { Users, AlertCircle, AlertTriangle } from "lucide-react";
import { useAppContext } from "@/components/context/AppContext";
import type { Client, ValidationError } from "@/utils/dataProcessing";

interface Props {
  clients: Client[];
  searchQuery: string;
  errors: ValidationError[];
}

export default function ClientsGrid({ clients, searchQuery, errors }: Props) {
  const { dispatch } = useAppContext();

  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No clients data
        </h3>
        <p className="text-gray-500">
          Upload a CSV or XLSX file to get started
        </p>
      </div>
    );
  }

  // Organize errors by row and field
  const errorMap = new Map<number, Map<keyof Client, ValidationError>>();
  errors.forEach((e) => {
    if (e.rowIndex !== undefined && e.field) {
      if (!errorMap.has(e.rowIndex)) errorMap.set(e.rowIndex, new Map());
      errorMap.get(e.rowIndex)!.set(e.field as keyof Client, e);
    }
  });

  const filtered = clients.filter((client) =>
    Object.values(client).some((val) =>
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleBlur = (
    clientID: string,
    field: keyof Client,
    value: string | number
  ) => {
    dispatch({
      type: "UPDATE_CLIENT",
      payload: {
        id: clientID,
        client: { [field]: typeof value === "string" ? value.trim() : value },
      },
    });
  };

  return (
    <div className="border rounded h-96 overflow-y-auto overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr>
            {["Client ID", "Name", "Priority", "Tasks", "Group"].map(
              (heading) => (
                <th
                  key={heading}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide"
                >
                  {heading}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 text-gray-900">
          {filtered.map((client, rowIndex) => {
            const rowErrors = errorMap.get(rowIndex) ?? new Map();

            const getCellStyle = (field: keyof Client) => {
              const err = rowErrors.get(field);
              if (!err) return "";
              return err.severity === "error"
                ? "bg-red-100 border-l-2 border-red-400"
                : "bg-yellow-100 border-l-2 border-yellow-400";
            };

            const renderInput = (
              field: keyof Client,
              value: string | number
            ) => {
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
                        client.ClientID,
                        field,
                        field === "PriorityLevel"
                          ? Number(e.target.value)
                          : e.target.value
                      )
                    }
                    className="w-full px-2 py-1 border rounded border-gray-300 text-gray-900"
                    type={field === "PriorityLevel" ? "number" : "text"}
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
              <tr key={client.ClientID}>
                <td className="px-4 py-2">
                  {renderInput("ClientID", client.ClientID)}
                </td>
                <td className="px-4 py-2">
                  {renderInput("ClientName", client.ClientName)}
                </td>
                <td className="px-4 py-2">
                  {renderInput("PriorityLevel", client.PriorityLevel)}
                </td>
                <td className="px-4 py-2">
                  {renderInput("RequestedTaskIDs", client.RequestedTaskIDs)}
                </td>
                <td className="px-4 py-2">
                  {renderInput("GroupTag", client.GroupTag)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
