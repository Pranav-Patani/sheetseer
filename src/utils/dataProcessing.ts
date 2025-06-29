import Papa from "papaparse";
import * as XLSX from "xlsx";

// Enhanced interfaces with more specific types
export interface Client {
  ClientID: string;
  ClientName: string;
  PriorityLevel: number;
  RequestedTaskIDs: string;
  GroupTag: string;
  AttributesJSON: string;
}

export interface Worker {
  WorkerID: string;
  WorkerName: string;
  Skills: string;
  AvailableSlots: string; // Stored as string but should be parsed to number[]
  MaxLoadPerPhase: number;
  WorkerGroup: string;
  QualificationLevel: number;
}

export interface Task {
  TaskID: string;
  TaskName: string;
  Category: string;
  Duration: number;
  RequiredSkills: string;
  PreferredPhases: string; // Stored as string but should be parsed to number[]
  MaxConcurrent: number;
}

export interface ValidationError {
  type: string;
  message: string;
  entity: string;
  field?: string;
  severity: "error" | "warning";
  rowIndex?: number;
}

export interface Weights {
  priorityLevel: number;
  taskFulfillment: number;
  fairness: number;
  efficiency: number;
  [key: string]: number; // Allow dynamic weights
}

export interface BusinessRule {
  id: string;
  type:
    | "coRun"
    | "slotRestriction"
    | "loadLimit"
    | "phaseWindow"
    | "patternMatch"
    | "precedenceOverride";
  name: string;
  description?: string;
  parameters: {
    [key: string]: any;
  };
  priority?: number; // For precedenceOverride rules
}

export interface RuleSet {
  rules: BusinessRule[];
  weights: Weights;
}

// Default weights configuration
export const DEFAULT_WEIGHTS: Weights = {
  priorityLevel: 0.4,
  taskFulfillment: 0.3,
  fairness: 0.2,
  efficiency: 0.1,
};

// Common business rule templates
export const BUSINESS_RULE_TEMPLATES: BusinessRule[] = [
  {
    id: "co-run-template",
    type: "coRun",
    name: "Co-run Tasks",
    description: "Tasks that must run together in the same phase",
    parameters: {
      taskIds: [],
    },
  },
  {
    id: "slot-restriction-template",
    type: "slotRestriction",
    name: "Slot Restriction",
    description: "Restrict slots for a specific group",
    parameters: {
      group: "",
      minCommonSlots: 1,
    },
  },
  {
    id: "load-limit-template",
    type: "loadLimit",
    name: "Load Limit",
    description: "Limit maximum slots per phase for a worker group",
    parameters: {
      workerGroup: "",
      maxSlotsPerPhase: 1,
    },
  },
  {
    id: "phase-window-template",
    type: "phaseWindow",
    name: "Phase Window",
    description: "Restrict task to specific phases",
    parameters: {
      taskId: "",
      allowedPhases: [],
    },
  },
  {
    id: "precedence-override-template",
    type: "precedenceOverride",
    name: "Precedence Override",
    description: "Override default priority ordering",
    parameters: {
      ruleIds: [],
      order: "specificToGlobal", // or "globalToSpecific"
    },
  },
];

// CSV/XLSX Parser - unchanged
export async function parseFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (fileExtension === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn("CSV parsing warnings:", results.errors);
          }
          resolve(results.data);
        },
        error: (error) => reject(error),
      });
    } else if (fileExtension === "xlsx" || fileExtension === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error("Unsupported file format"));
    }
  });
}

// Enhanced data validators with additional checks from the PDF

export function validateClients(data: any[]): {
  clients: Client[];
  errors: ValidationError[];
} {
  const clients: Client[] = [];
  const errors: ValidationError[] = [];

  data.forEach((row, index) => {
    const client: Partial<Client> = {};

    // Required fields validation
    if (!row.ClientID) {
      errors.push({
        type: "missing_required",
        message: "ClientID is required",
        entity: "client",
        field: "ClientID",
        severity: "error",
        rowIndex: index,
      });
    } else {
      client.ClientID = String(row.ClientID).trim();
    }

    if (!row.ClientName) {
      errors.push({
        type: "missing_required",
        message: "ClientName is required",
        entity: "client",
        field: "ClientName",
        severity: "error",
        rowIndex: index,
      });
    } else {
      client.ClientName = String(row.ClientName).trim();
    }

    // Priority Level validation (1-5)
    const priority = parseInt(row.PriorityLevel);
    if (isNaN(priority) || priority < 1 || priority > 5) {
      errors.push({
        type: "out_of_range",
        message: "PriorityLevel must be between 1 and 5",
        entity: "client",
        field: "PriorityLevel",
        severity: "error",
        rowIndex: index,
      });
    } else {
      client.PriorityLevel = priority;
    }

    // RequestedTaskIDs
    client.RequestedTaskIDs = row.RequestedTaskIDs
      ? String(row.RequestedTaskIDs).trim()
      : "";

    // GroupTag
    client.GroupTag = row.GroupTag ? String(row.GroupTag).trim() : "";

    // AttributesJSON validation
    if (row.AttributesJSON) {
      try {
        JSON.parse(row.AttributesJSON);
        client.AttributesJSON = row.AttributesJSON;
      } catch {
        errors.push({
          type: "invalid_json",
          message: "AttributesJSON contains invalid JSON",
          entity: "client",
          field: "AttributesJSON",
          severity: "error",
          rowIndex: index,
        });
        client.AttributesJSON = row.AttributesJSON; // Keep original for user to fix
      }
    } else {
      client.AttributesJSON = "";
    }

    // Only add client if we have required fields
    if (client.ClientID && client.ClientName && client.PriorityLevel) {
      clients.push(client as Client);
    }
  });

  // Check for duplicate ClientIDs
  const clientIds = clients.map((c) => c.ClientID);
  const duplicateIds = clientIds.filter(
    (id, index) => clientIds.indexOf(id) !== index
  );
  duplicateIds.forEach((id) => {
    errors.push({
      type: "duplicate_id",
      message: `Duplicate ClientID: ${id}`,
      entity: "client",
      field: "ClientID",
      severity: "error",
    });
  });

  return { clients, errors };
}

export function validateWorkers(data: any[]): {
  workers: Worker[];
  errors: ValidationError[];
} {
  const workers: Worker[] = [];
  const errors: ValidationError[] = [];

  data.forEach((row, index) => {
    const worker: Partial<Worker> = {};

    // Required fields validation
    if (!row.WorkerID) {
      errors.push({
        type: "missing_required",
        message: "WorkerID is required",
        entity: "worker",
        field: "WorkerID",
        severity: "error",
        rowIndex: index,
      });
    } else {
      worker.WorkerID = String(row.WorkerID).trim();
    }

    if (!row.WorkerName) {
      errors.push({
        type: "missing_required",
        message: "WorkerName is required",
        entity: "worker",
        field: "WorkerName",
        severity: "error",
        rowIndex: index,
      });
    } else {
      worker.WorkerName = String(row.WorkerName).trim();
    }

    // Skills
    worker.Skills = row.Skills ? String(row.Skills).trim() : "";

    // AvailableSlots validation - enhanced to handle both array and range formats
    worker.AvailableSlots = row.AvailableSlots
      ? String(row.AvailableSlots).trim()
      : "";
    if (worker.AvailableSlots) {
      try {
        // Try to parse as JSON array first
        const slots = JSON.parse(worker.AvailableSlots);
        if (
          !Array.isArray(slots) ||
          !slots.every((s) => typeof s === "number")
        ) {
          errors.push({
            type: "invalid_format",
            message: "AvailableSlots must be an array of numbers",
            entity: "worker",
            field: "AvailableSlots",
            severity: "error",
            rowIndex: index,
          });
        }
      } catch {
        // If not JSON, check for range format (e.g., "1-3")
        const rangeMatch = worker.AvailableSlots.match(/^(\d+)\s*-\s*(\d+)$/);
        if (rangeMatch) {
          const start = parseInt(rangeMatch[1]);
          const end = parseInt(rangeMatch[2]);
          if (!isNaN(start) && !isNaN(end) && start <= end) {
            const slots = [];
            for (let i = start; i <= end; i++) {
              slots.push(i);
            }
            worker.AvailableSlots = JSON.stringify(slots);
          } else {
            errors.push({
              type: "invalid_format",
              message: "AvailableSlots range must be valid (e.g., '1-3')",
              entity: "worker",
              field: "AvailableSlots",
              severity: "error",
              rowIndex: index,
            });
          }
        } else {
          errors.push({
            type: "invalid_format",
            message:
              "AvailableSlots must be valid JSON array or range (e.g., '1-3')",
            entity: "worker",
            field: "AvailableSlots",
            severity: "error",
            rowIndex: index,
          });
        }
      }
    }

    // MaxLoadPerPhase validation
    const maxLoad = parseInt(row.MaxLoadPerPhase);
    if (isNaN(maxLoad)) {
      errors.push({
        type: "invalid_format",
        message: "MaxLoadPerPhase must be a number",
        entity: "worker",
        field: "MaxLoadPerPhase",
        severity: "error",
        rowIndex: index,
      });
    } else if (maxLoad < 1) {
      errors.push({
        type: "out_of_range",
        message: "MaxLoadPerPhase must be at least 1",
        entity: "worker",
        field: "MaxLoadPerPhase",
        severity: "error",
        rowIndex: index,
      });
    } else {
      worker.MaxLoadPerPhase = maxLoad;
    }

    // WorkerGroup
    worker.WorkerGroup = row.WorkerGroup ? String(row.WorkerGroup).trim() : "";

    // QualificationLevel
    const qualLevel = parseInt(row.QualificationLevel);
    if (isNaN(qualLevel)) {
      errors.push({
        type: "invalid_format",
        message: "QualificationLevel must be a number",
        entity: "worker",
        field: "QualificationLevel",
        severity: "error",
        rowIndex: index,
      });
    } else {
      worker.QualificationLevel = qualLevel;
    }

    // Only add worker if we have required fields
    if (worker.WorkerID && worker.WorkerName && worker.MaxLoadPerPhase) {
      workers.push(worker as Worker);
    }
  });

  // Check for duplicate WorkerIDs
  const workerIds = workers.map((w) => w.WorkerID);
  const duplicateIds = workerIds.filter(
    (id, index) => workerIds.indexOf(id) !== index
  );
  duplicateIds.forEach((id) => {
    errors.push({
      type: "duplicate_id",
      message: `Duplicate WorkerID: ${id}`,
      entity: "worker",
      field: "WorkerID",
      severity: "error",
    });
  });

  return { workers, errors };
}

export function validateTasks(data: any[]): {
  tasks: Task[];
  errors: ValidationError[];
} {
  const tasks: Task[] = [];
  const errors: ValidationError[] = [];

  data.forEach((row, index) => {
    const task: Partial<Task> = {};

    // Required fields validation
    if (!row.TaskID) {
      errors.push({
        type: "missing_required",
        message: "TaskID is required",
        entity: "task",
        field: "TaskID",
        severity: "error",
        rowIndex: index,
      });
    } else {
      task.TaskID = String(row.TaskID).trim();
    }

    if (!row.TaskName) {
      errors.push({
        type: "missing_required",
        message: "TaskName is required",
        entity: "task",
        field: "TaskName",
        severity: "error",
        rowIndex: index,
      });
    } else {
      task.TaskName = String(row.TaskName).trim();
    }

    // Category
    task.Category = row.Category ? String(row.Category).trim() : "";

    // Duration validation (>= 1)
    const duration = parseFloat(row.Duration);
    if (isNaN(duration)) {
      errors.push({
        type: "invalid_format",
        message: "Duration must be a number",
        entity: "task",
        field: "Duration",
        severity: "error",
        rowIndex: index,
      });
    } else if (duration < 1) {
      errors.push({
        type: "out_of_range",
        message: "Duration must be at least 1",
        entity: "task",
        field: "Duration",
        severity: "error",
        rowIndex: index,
      });
    } else {
      task.Duration = duration;
    }

    // RequiredSkills
    task.RequiredSkills = row.RequiredSkills
      ? String(row.RequiredSkills).trim()
      : "";

    // PreferredPhases - enhanced to handle both array and range formats
    task.PreferredPhases = row.PreferredPhases
      ? String(row.PreferredPhases).trim()
      : "";
    if (task.PreferredPhases) {
      try {
        // Try to parse as JSON array first
        const phases = JSON.parse(task.PreferredPhases);
        if (
          !Array.isArray(phases) ||
          !phases.every((p) => typeof p === "number")
        ) {
          errors.push({
            type: "invalid_format",
            message: "PreferredPhases must be an array of numbers",
            entity: "task",
            field: "PreferredPhases",
            severity: "error",
            rowIndex: index,
          });
        }
      } catch {
        // If not JSON, check for range format (e.g., "1-3")
        const rangeMatch = task.PreferredPhases.match(/^(\d+)\s*-\s*(\d+)$/);
        if (rangeMatch) {
          const start = parseInt(rangeMatch[1]);
          const end = parseInt(rangeMatch[2]);
          if (!isNaN(start) && !isNaN(end) && start <= end) {
            const phases = [];
            for (let i = start; i <= end; i++) {
              phases.push(i);
            }
            task.PreferredPhases = JSON.stringify(phases);
          } else {
            errors.push({
              type: "invalid_format",
              message: "PreferredPhases range must be valid (e.g., '1-3')",
              entity: "task",
              field: "PreferredPhases",
              severity: "error",
              rowIndex: index,
            });
          }
        } else {
          errors.push({
            type: "invalid_format",
            message:
              "PreferredPhases must be valid JSON array or range (e.g., '1-3')",
            entity: "task",
            field: "PreferredPhases",
            severity: "error",
            rowIndex: index,
          });
        }
      }
    }

    // MaxConcurrent validation
    const maxConcurrent = parseInt(row.MaxConcurrent);
    if (isNaN(maxConcurrent)) {
      errors.push({
        type: "invalid_format",
        message: "MaxConcurrent must be a number",
        entity: "task",
        field: "MaxConcurrent",
        severity: "error",
        rowIndex: index,
      });
    } else if (maxConcurrent < 1) {
      errors.push({
        type: "out_of_range",
        message: "MaxConcurrent must be at least 1",
        entity: "task",
        field: "MaxConcurrent",
        severity: "error",
        rowIndex: index,
      });
    } else {
      task.MaxConcurrent = maxConcurrent;
    }

    // Only add task if we have required fields
    if (task.TaskID && task.TaskName && task.Duration) {
      tasks.push(task as Task);
    }
  });

  // Check for duplicate TaskIDs
  const taskIds = tasks.map((t) => t.TaskID);
  const duplicateIds = taskIds.filter(
    (id, index) => taskIds.indexOf(id) !== index
  );
  duplicateIds.forEach((id) => {
    errors.push({
      type: "duplicate_id",
      message: `Duplicate TaskID: ${id}`,
      entity: "task",
      field: "TaskID",
      severity: "error",
    });
  });

  return { tasks, errors };
}

// Enhanced cross-reference validations with additional checks from the PDF
export function validateCrossReferences(
  clients: Client[],
  workers: Worker[],
  tasks: Task[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  const taskIds = new Set(tasks.map((t) => t.TaskID));
  const workerSkills = new Set(
    workers.flatMap((w) => w.Skills.split(",").map((s) => s.trim()))
  );
  const workerGroups = new Set(workers.map((w) => w.WorkerGroup));
  const clientGroups = new Set(clients.map((c) => c.GroupTag));

  // Validate RequestedTaskIDs exist
  clients.forEach((client) => {
    if (client.RequestedTaskIDs) {
      const requestedIds = client.RequestedTaskIDs.split(",").map((id) =>
        id.trim()
      );
      requestedIds.forEach((taskId) => {
        if (!taskIds.has(taskId)) {
          errors.push({
            type: "unknown_reference",
            message: `Client ${client.ClientID} requests unknown task: ${taskId}`,
            entity: "client",
            field: "RequestedTaskIDs",
            severity: "error",
          });
        }
      });
    }
  });

  // Validate task skills are covered by workers
  tasks.forEach((task) => {
    if (task.RequiredSkills) {
      const requiredSkills = task.RequiredSkills.split(",").map((s) =>
        s.trim()
      );
      requiredSkills.forEach((skill) => {
        if (!workerSkills.has(skill)) {
          errors.push({
            type: "skill_coverage",
            message: `Task ${task.TaskID} requires skill "${skill}" but no worker has it`,
            entity: "task",
            field: "RequiredSkills",
            severity: "error",
          });
        }
      });
    }
  });

  // Check worker availability vs task requirements
  tasks.forEach((task) => {
    try {
      const preferredPhases = task.PreferredPhases
        ? JSON.parse(task.PreferredPhases)
        : [];
      if (preferredPhases.length > 0) {
        // Find workers with required skills
        const qualifiedWorkers = workers.filter((worker) => {
          const workerSkillSet = new Set(
            worker.Skills.split(",").map((s) => s.trim())
          );
          const taskSkills = task.RequiredSkills.split(",").map((s) =>
            s.trim()
          );
          return taskSkills.every((skill) => workerSkillSet.has(skill));
        });

        // Check if any worker is available in preferred phases
        const hasAvailableWorkers = qualifiedWorkers.some((worker) => {
          const workerSlots = worker.AvailableSlots
            ? JSON.parse(worker.AvailableSlots)
            : [];
          return preferredPhases.some((phase: number) =>
            workerSlots.includes(phase)
          );
        });

        if (!hasAvailableWorkers) {
          errors.push({
            type: "phase_availability",
            message: `Task ${task.TaskID} has preferred phases but no qualified workers available in those phases`,
            entity: "task",
            field: "PreferredPhases",
            severity: "warning",
          });
        }
      }
    } catch (e) {
      // JSON parse error will be caught by individual validators
    }
  });

  // Check worker group references in client groups
  clients.forEach((client) => {
    if (client.GroupTag && !workerGroups.has(client.GroupTag)) {
      errors.push({
        type: "group_reference",
        message: `Client ${client.ClientID} has GroupTag '${client.GroupTag}' but no workers belong to this group`,
        entity: "client",
        field: "GroupTag",
        severity: "warning",
      });
    }
  });

  return errors;
}

// New function to validate business rules against the data
export function validateBusinessRules(
  rules: BusinessRule[],
  clients: Client[],
  workers: Worker[],
  tasks: Task[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  const taskIds = new Set(tasks.map((t) => t.TaskID));
  const workerGroups = new Set(workers.map((w) => w.WorkerGroup));

  rules.forEach((rule) => {
    switch (rule.type) {
      case "coRun":
        // Validate all task IDs exist
        const coRunTaskIds = rule.parameters.taskIds || [];
        coRunTaskIds.forEach((taskId: string) => {
          if (!taskIds.has(taskId)) {
            errors.push({
              type: "invalid_rule",
              message: `Co-run rule references unknown task ID: ${taskId}`,
              entity: "rule",
              field: "parameters.taskIds",
              severity: "error",
            });
          }
        });
        break;

      case "slotRestriction":
        // Validate group exists
        const group = rule.parameters.group;
        if (group && !workerGroups.has(group)) {
          errors.push({
            type: "invalid_rule",
            message: `Slot restriction rule references unknown worker group: ${group}`,
            entity: "rule",
            field: "parameters.group",
            severity: "error",
          });
        }
        break;

      case "loadLimit":
        // Validate worker group exists
        const workerGroup = rule.parameters.workerGroup;
        if (workerGroup && !workerGroups.has(workerGroup)) {
          errors.push({
            type: "invalid_rule",
            message: `Load limit rule references unknown worker group: ${workerGroup}`,
            entity: "rule",
            field: "parameters.workerGroup",
            severity: "error",
          });
        }
        break;

      case "phaseWindow":
        // Validate task ID exists
        const taskId = rule.parameters.taskId;
        if (taskId && !taskIds.has(taskId)) {
          errors.push({
            type: "invalid_rule",
            message: `Phase window rule references unknown task ID: ${taskId}`,
            entity: "rule",
            field: "parameters.taskId",
            severity: "error",
          });
        }
        break;

      case "precedenceOverride":
        // Validate rule IDs exist
        const ruleIds = rule.parameters.ruleIds || [];
        const existingRuleIds = new Set(rules.map((r) => r.id));
        ruleIds.forEach((id: string) => {
          if (!existingRuleIds.has(id)) {
            errors.push({
              type: "invalid_rule",
              message: `Precedence override rule references unknown rule ID: ${id}`,
              entity: "rule",
              field: "parameters.ruleIds",
              severity: "error",
            });
          }
        });
        break;
    }
  });

  return errors;
}

// New function to check worker overload
export function checkWorkerOverload(workers: Worker[]): ValidationError[] {
  const errors: ValidationError[] = [];

  workers.forEach((worker) => {
    try {
      const availableSlots = worker.AvailableSlots
        ? JSON.parse(worker.AvailableSlots)
        : [];
      if (availableSlots.length < worker.MaxLoadPerPhase) {
        errors.push({
          type: "worker_overload",
          message: `Worker ${worker.WorkerID} has more MaxLoadPerPhase (${worker.MaxLoadPerPhase}) than AvailableSlots (${availableSlots.length})`,
          entity: "worker",
          field: "MaxLoadPerPhase",
          severity: "warning",
        });
      }
    } catch (e) {
      // JSON parse error will be caught by individual validators
    }
  });

  return errors;
}

// New function to check phase-slot saturation
export function checkPhaseSlotSaturation(
  tasks: Task[],
  workers: Worker[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  const phaseSlotUsage: Record<number, number> = {};

  // Calculate total worker slots per phase
  const phaseWorkerSlots: Record<number, number> = {};
  workers.forEach((worker) => {
    try {
      const availableSlots = worker.AvailableSlots
        ? JSON.parse(worker.AvailableSlots)
        : [];
      availableSlots.forEach((slot: number) => {
        phaseWorkerSlots[slot] =
          (phaseWorkerSlots[slot] || 0) + worker.MaxLoadPerPhase;
      });
    } catch (e) {
      // JSON parse error will be caught by individual validators
    }
  });

  // Calculate task duration per phase
  tasks.forEach((task) => {
    try {
      const preferredPhases = task.PreferredPhases
        ? JSON.parse(task.PreferredPhases)
        : [];
      if (preferredPhases.length === 0) {
        // If no preferred phases, assume task can run in any phase
        Object.keys(phaseWorkerSlots).forEach((phase) => {
          phaseSlotUsage[parseInt(phase)] =
            (phaseSlotUsage[parseInt(phase)] || 0) + task.Duration;
        });
      } else {
        preferredPhases.forEach((phase: number) => {
          phaseSlotUsage[phase] = (phaseSlotUsage[phase] || 0) + task.Duration;
        });
      }
    } catch (e) {
      // JSON parse error will be caught by individual validators
    }
  });

  // Check for saturation
  Object.entries(phaseSlotUsage).forEach(([phase, duration]) => {
    const phaseNum = parseInt(phase);
    const availableSlots = phaseWorkerSlots[phaseNum] || 0;
    if (duration > availableSlots) {
      errors.push({
        type: "phase_saturation",
        message: `Phase ${phaseNum} is oversubscribed (${duration} duration units needed but only ${availableSlots} slots available)`,
        entity: "system",
        severity: "warning",
      });
    }
  });

  return errors;
}

// New function to check max-concurrency feasibility
export function checkMaxConcurrency(
  tasks: Task[],
  workers: Worker[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  tasks.forEach((task) => {
    // Find workers with required skills
    const qualifiedWorkers = workers.filter((worker) => {
      const workerSkillSet = new Set(
        worker.Skills.split(",").map((s) => s.trim())
      );
      const taskSkills = task.RequiredSkills.split(",").map((s) => s.trim());
      return taskSkills.every((skill) => workerSkillSet.has(skill));
    });

    if (qualifiedWorkers.length < task.MaxConcurrent) {
      errors.push({
        type: "max_concurrency",
        message: `Task ${task.TaskID} has MaxConcurrent=${task.MaxConcurrent} but only ${qualifiedWorkers.length} qualified workers available`,
        entity: "task",
        field: "MaxConcurrent",
        severity: "warning",
      });
    }
  });

  return errors;
}

// New function to generate default rules based on data patterns
export function generateDefaultRules(
  clients: Client[],
  workers: Worker[],
  tasks: Task[]
): BusinessRule[] {
  const rules: BusinessRule[] = [];
  const now = Date.now();

  // Example rule: Co-run tasks that are often requested together
  const clientTaskPairs: Record<string, string[]> = {};
  clients.forEach((client) => {
    if (client.RequestedTaskIDs) {
      const taskIds = client.RequestedTaskIDs.split(",").map((id) => id.trim());
      for (let i = 0; i < taskIds.length; i++) {
        for (let j = i + 1; j < taskIds.length; j++) {
          const key = [taskIds[i], taskIds[j]].sort().join(",");
          clientTaskPairs[key] = clientTaskPairs[key] || [];
          clientTaskPairs[key].push(client.ClientID);
        }
      }
    }
  });

  // Find task pairs requested by at least 3 clients
  Object.entries(clientTaskPairs).forEach(([taskPair, clientIds]) => {
    if (clientIds.length >= 3) {
      const taskIds = taskPair.split(",");
      rules.push({
        id: `co-run-${now}-${rules.length}`,
        type: "coRun",
        name: `Co-run ${taskIds.join(" and ")}`,
        description: `Automatically generated because ${clientIds.length} clients request these tasks together`,
        parameters: {
          taskIds,
        },
      });
    }
  });

  // Example rule: Load limits for worker groups
  const workerGroupCounts: Record<string, number> = {};
  workers.forEach((worker) => {
    workerGroupCounts[worker.WorkerGroup] =
      (workerGroupCounts[worker.WorkerGroup] || 0) + 1;
  });

  Object.entries(workerGroupCounts).forEach(([group, count]) => {
    if (count > 5) {
      // Only for large groups
      rules.push({
        id: `load-limit-${now}-${rules.length}`,
        type: "loadLimit",
        name: `Load limit for ${group}`,
        description: `Automatically generated because ${group} has ${count} workers`,
        parameters: {
          workerGroup: group,
          maxSlotsPerPhase: Math.floor(count / 2), // Example heuristic
        },
      });
    }
  });

  return rules;
}

// New function to normalize weights (ensure they sum to 1)
export function normalizeWeights(weights: Weights): Weights {
  const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  if (total === 0) return DEFAULT_WEIGHTS; // Fallback to defaults if all zeros

  const normalized: Weights = { ...weights };
  for (const key in normalized) {
    normalized[key] = normalized[key] / total;
  }
  return normalized;
}

// New function to export all data and rules
export function exportAllData(
  clients: Client[],
  workers: Worker[],
  tasks: Task[],
  rules: BusinessRule[],
  weights: Weights
): { clients: string; workers: string; tasks: string; rules: string } {
  return {
    clients: Papa.unparse(clients),
    workers: Papa.unparse(workers),
    tasks: Papa.unparse(tasks),
    rules: JSON.stringify(
      {
        rules,
        weights: normalizeWeights(weights),
      },
      null,
      2
    ),
  };
}

// Helper function to parse phase strings (supports both "[1,2,3]" and "1-3" formats)
export function parsePhaseString(phaseStr: string): number[] {
  if (!phaseStr) return [];

  try {
    // Try to parse as JSON array first
    const parsed = JSON.parse(phaseStr);
    if (Array.isArray(parsed)) {
      return parsed.filter((p) => typeof p === "number");
    }
  } catch (e) {
    // If not JSON, try to parse as range
    const rangeMatch = phaseStr.match(/^(\d+)\s*-\s*(\d+)$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1]);
      const end = parseInt(rangeMatch[2]);
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        const phases = [];
        for (let i = start; i <= end; i++) {
          phases.push(i);
        }
        return phases;
      }
    }

    // If single number
    const singleNum = parseInt(phaseStr);
    if (!isNaN(singleNum)) {
      return [singleNum];
    }
  }

  return [];
}
