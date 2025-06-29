"use client";
import { Users } from "lucide-react";
import type { Client, ValidationError } from "@/utils/dataProcessing";

interface Props {
  clients: Client[];
  searchQuery: string;
  errors: ValidationError[];
}

export default function ClientsGrid({ clients, searchQuery, errors }: Props) {
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
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {["Client ID", "Name", "Priority", "Tasks", "Group"].map(
              (heading) => (
                <th
                  key={heading}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {heading}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {clients.map((client) => (
            <tr key={client.ClientID}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {client.ClientID}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {client.ClientName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {client.PriorityLevel}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {client.RequestedTaskIDs}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {client.GroupTag}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
