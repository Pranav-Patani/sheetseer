import Papa from "papaparse";
import * as XLSX from "xlsx";

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
  AvailableSlots: string;
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
  PreferredPhases: string;
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

// CSV/XLSX Parser
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

// Data Type Validators
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

    // AvailableSlots validation
    worker.AvailableSlots = row.AvailableSlots
      ? String(row.AvailableSlots).trim()
      : "";
    if (worker.AvailableSlots) {
      try {
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
        errors.push({
          type: "invalid_format",
          message: "AvailableSlots must be valid JSON array",
          entity: "worker",
          field: "AvailableSlots",
          severity: "error",
          rowIndex: index,
        });
      }
    }

    // MaxLoadPerPhase validation
    const maxLoad = parseInt(row.MaxLoadPerPhase);
    if (isNaN(maxLoad) || maxLoad < 1) {
      errors.push({
        type: "out_of_range",
        message: "MaxLoadPerPhase must be a positive number",
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
    const duration = parseInt(row.Duration);
    if (isNaN(duration) || duration < 1) {
      errors.push({
        type: "out_of_range",
        message: "Duration must be >= 1",
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

    // PreferredPhases
    task.PreferredPhases = row.PreferredPhases
      ? String(row.PreferredPhases).trim()
      : "";

    // MaxConcurrent validation
    const maxConcurrent = parseInt(row.MaxConcurrent);
    if (isNaN(maxConcurrent) || maxConcurrent < 1) {
      errors.push({
        type: "out_of_range",
        message: "MaxConcurrent must be >= 1",
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

// Cross-reference validations
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
            severity: "warning",
          });
        }
      });
    }
  });

  return errors;
}
