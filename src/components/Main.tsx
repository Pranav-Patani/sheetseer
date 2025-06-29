"use client";

import { useCallback } from "react";
import {
  parseFile,
  validateClients,
  validateWorkers,
  validateTasks,
  validateCrossReferences,
} from "@/utils/dataProcessing";
import { Users, Briefcase, FileText, Download, Search } from "lucide-react";
import UploadSidebar from "./UploadSidebar";
import DataTabs from "./DataTabs";
import ClientsGrid from "./ClientsGrid";
import WorkersGrid from "./WorkersGrid";
import TasksGrid from "./TasksGrid";
import ValidationSummary from "./ValidationSummary";
import BusinessRulesPanel from "./BusinessRulesPanel";
import { useAppContext } from "@/components/context/AppContext";
import type { TabType } from "./types";
import type { ValidationError } from "@/utils/dataProcessing";

export default function Main() {
  const { state, dispatch } = useAppContext();

  const handleFileUpload = useCallback(
    async (
      event: React.ChangeEvent<HTMLInputElement>,
      type: "clients" | "workers" | "tasks"
    ) => {
      const file = event.target.files?.[0];
      if (!file) return;

      dispatch({ type: "SET_UPLOADING", payload: true });

      try {
        const rawData = await parseFile(file);
        let newErrors: ValidationError[] = [];

        if (type === "clients") {
          const { clients, errors } = validateClients(rawData);
          dispatch({ type: "SET_CLIENTS", payload: clients });
          newErrors = errors;
        } else if (type === "workers") {
          const { workers, errors } = validateWorkers(rawData);
          dispatch({ type: "SET_WORKERS", payload: workers });
          newErrors = errors;
        } else if (type === "tasks") {
          const { tasks, errors } = validateTasks(rawData);
          dispatch({ type: "SET_TASKS", payload: tasks });
          newErrors = errors;
        }

        dispatch({ type: "CLEAR_VALIDATION_ERRORS", payload: type });
        dispatch({ type: "ADD_VALIDATION_ERRORS", payload: newErrors });

        const crossErrors = validateCrossReferences(
          state.clients,
          state.workers,
          state.tasks
        );
        dispatch({
          type: "ADD_VALIDATION_ERRORS",
          payload: crossErrors,
        });
      } catch (err) {
        dispatch({
          type: "ADD_VALIDATION_ERRORS",
          payload: [
            {
              type: "file_error",
              message: `Error processing ${file.name}: ${err}`,
              entity: type,
              severity: "error",
            },
          ],
        });
      } finally {
        dispatch({ type: "SET_UPLOADING", payload: false });
        event.target.value = "";
      }
    },
    [dispatch, state.clients, state.workers, state.tasks]
  );

  const tabs: TabType[] = [
    {
      id: "clients" as const,
      label: "Clients",
      icon: Users,
      count: state.clients.length,
    },
    {
      id: "workers" as const,
      label: "Workers",
      icon: Briefcase,
      count: state.workers.length,
    },
    {
      id: "tasks" as const,
      label: "Tasks",
      icon: FileText,
      count: state.tasks.length,
    },
  ];

  const errors = state.validationErrors.filter(
    (e) => e.severity === "error"
  ).length;
  const warnings = state.validationErrors.filter(
    (e) => e.severity === "warning"
  ).length;
  const hasData =
    state.clients.length > 0 ||
    state.workers.length > 0 ||
    state.tasks.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sheet Seer</h1>
              <p className="text-sm text-gray-500">
                {`Data was a mess, "was" because now we are here ;)`}
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
          <div className="lg:col-span-1">
            <UploadSidebar
              tabs={tabs}
              isUploading={state.isUploading}
              handleFileUpload={handleFileUpload}
            />
          </div>

          <div className="lg:col-span-3 space-y-8">
            <DataTabs
              tabs={tabs}
              currentTab={state.currentTab}
              setCurrentTab={(tab) =>
                dispatch({ type: "SET_CURRENT_TAB", payload: tab })
              }
            />

            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="mb-4 flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search data..."
                    value={state.searchQuery}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_SEARCH_QUERY",
                        payload: e.target.value,
                      })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {state.searchQuery && (
                  <button
                    onClick={() =>
                      dispatch({ type: "SET_SEARCH_QUERY", payload: "" })
                    }
                    className="px-3 py-2 text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                )}
              </div>

              {state.currentTab === "clients" && (
                <ClientsGrid
                  clients={state.clients}
                  searchQuery={state.searchQuery}
                  errors={state.validationErrors.filter(
                    (e) => e.entity === "client"
                  )}
                />
              )}
              {state.currentTab === "workers" && (
                <WorkersGrid
                  workers={state.workers}
                  searchQuery={state.searchQuery}
                  errors={state.validationErrors.filter(
                    (e) => e.entity === "worker"
                  )}
                />
              )}
              {state.currentTab === "tasks" && (
                <TasksGrid
                  tasks={state.tasks}
                  searchQuery={state.searchQuery}
                  errors={state.validationErrors.filter(
                    (e) => e.entity === "task"
                  )}
                />
              )}
            </div>

            {state.validationErrors.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Validation Issues
                </h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {state.validationErrors.map((error, i) => (
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

            <BusinessRulesPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
