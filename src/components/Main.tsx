"use client";

import { useState } from "react";
import {
  parseFile,
  validateClients,
  validateWorkers,
  validateTasks,
  validateCrossReferences,
} from "../utils/dataProcessing";
import type {
  Client,
  Worker,
  Task,
  ValidationError,
} from "../utils/dataProcessing";
import { Users, Briefcase, FileText } from "lucide-react";
import UploadSidebar from "./UploadSidebar";
import DataTabs from "./DataTabs";
import ClientsGrid from "./ClientsGrid";
import WorkersGrid from "./WorkersGrid";
import TasksGrid from "./TasksGrid";
import ValidationSummary from "./ValidationSummary";
import BusinessRulesPanel from "./BusinessRulesPanel";

import { Download, Search } from "lucide-react";

export default function Main() {
  const [clients, setClients] = useState<Client[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [currentTab, setCurrentTab] = useState<"clients" | "workers" | "tasks">(
    "clients"
  );
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    { id: "clients", label: "Clients", icon: Users, count: clients.length },
    { id: "workers", label: "Workers", icon: Briefcase, count: workers.length },
    { id: "tasks", label: "Tasks", icon: FileText, count: tasks.length },
  ];

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "clients" | "workers" | "tasks"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const rawData = await parseFile(file);
      let newErrors: ValidationError[] = [];

      if (type === "clients") {
        const { clients: parsed, errors } = validateClients(rawData);
        setClients(parsed);
        newErrors = errors;
      } else if (type === "workers") {
        const { workers: parsed, errors } = validateWorkers(rawData);
        setWorkers(parsed);
        newErrors = errors;
      } else if (type === "tasks") {
        const { tasks: parsed, errors } = validateTasks(rawData);
        setTasks(parsed);
        newErrors = errors;
      }

      setValidationErrors((prev) => [
        ...prev.filter((e) => e.entity !== type),
        ...newErrors,
      ]);

      const crossRefErrors = validateCrossReferences(
        type === "clients" ? validateClients(rawData).clients : clients,
        type === "workers" ? validateWorkers(rawData).workers : workers,
        type === "tasks" ? validateTasks(rawData).tasks : tasks
      );

      setValidationErrors((prev) => [
        ...prev.filter(
          (e) => e.type !== "unknown_reference" && e.type !== "skill_coverage"
        ),
        ...crossRefErrors,
      ]);
    } catch (err) {
      console.error(err);
      setValidationErrors((prev) => [
        ...prev,
        {
          type: "file_error",
          message: `Error processing ${file.name}: ${err}`,
          entity: type,
          severity: "error",
        },
      ]);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const { errors, warnings } = (() => {
    const errors = validationErrors.filter(
      (e) => e.severity === "error"
    ).length;
    const warnings = validationErrors.filter(
      (e) => e.severity === "warning"
    ).length;
    return { errors, warnings };
  })();

  const hasData = clients.length > 0 || workers.length > 0 || tasks.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sheet Seer</h1>
              <p className="text-sm text-gray-500">
                Data was a mess, "was" because now we are here ;)
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <ValidationSummary
                errors={errors}
                warnings={warnings}
                hasData={hasData}
              />

              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <UploadSidebar
              tabs={tabs}
              isUploading={isUploading}
              handleFileUpload={handleFileUpload}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            <DataTabs
              tabs={tabs}
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
            />

            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Search Bar */}
              <div className="mb-4 flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search data..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="px-3 py-2 text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Grid Render */}
              {currentTab === "clients" && (
                <ClientsGrid
                  clients={clients}
                  searchQuery={searchQuery}
                  errors={validationErrors.filter((e) => e.entity === "client")}
                />
              )}
              {currentTab === "workers" && (
                <WorkersGrid
                  workers={workers}
                  searchQuery={searchQuery}
                  errors={validationErrors.filter((e) => e.entity === "worker")}
                />
              )}
              {currentTab === "tasks" && (
                <TasksGrid
                  tasks={tasks}
                  searchQuery={searchQuery}
                  errors={validationErrors.filter((e) => e.entity === "task")}
                />
              )}
            </div>

            {/* Errors Panel */}
            {validationErrors.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Validation Issues
                </h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {validationErrors.map((error, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded border-l-4 ${
                        error.severity === "error"
                          ? "bg-red-50 border-red-400 text-red-700"
                          : "bg-yellow-50 border-yellow-400 text-yellow-700"
                      }`}
                    >
                      <p className="font-medium">
                        {error.entity.charAt(0).toUpperCase() +
                          error.entity.slice(1)}{" "}
                        {error.field && `- ${error.field}`}
                      </p>
                      <p className="text-sm">{error.message}</p>
                      {error.rowIndex !== undefined && (
                        <p className="text-xs opacity-75">
                          Row {error.rowIndex + 1}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Business Rules */}
            <BusinessRulesPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
