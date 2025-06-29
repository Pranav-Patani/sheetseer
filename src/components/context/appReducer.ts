import {
  Client,
  Worker,
  Task,
  ValidationError,
  BusinessRule,
  Weights,
} from "@/utils/dataProcessing";

export interface AppState {
  clients: Client[];
  workers: Worker[];
  tasks: Task[];
  validationErrors: ValidationError[];
  businessRules: BusinessRule[];
  weights: Weights;
  currentTab: "clients" | "workers" | "tasks";
  isUploading: boolean;
  searchQuery: string;
  aiSuggestions: string[];
}

export type AppAction =
  | { type: "SET_CLIENTS"; payload: Client[] }
  | { type: "SET_WORKERS"; payload: Worker[] }
  | { type: "SET_TASKS"; payload: Task[] }
  | { type: "SET_VALIDATION_ERRORS"; payload: ValidationError[] }
  | { type: "ADD_VALIDATION_ERRORS"; payload: ValidationError[] }
  | { type: "CLEAR_VALIDATION_ERRORS"; payload: string }
  | { type: "SET_BUSINESS_RULES"; payload: BusinessRule[] }
  | { type: "ADD_BUSINESS_RULE"; payload: BusinessRule }
  | {
      type: "UPDATE_BUSINESS_RULE";
      payload: { id: string; rule: Partial<BusinessRule> };
    }
  | { type: "DELETE_BUSINESS_RULE"; payload: string }
  | { type: "SET_WEIGHTS"; payload: Weights }
  | { type: "SET_CURRENT_TAB"; payload: "clients" | "workers" | "tasks" }
  | { type: "SET_UPLOADING"; payload: boolean }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_AI_SUGGESTIONS"; payload: string[] }
  | { type: "UPDATE_CLIENT"; payload: { id: string; client: Partial<Client> } }
  | { type: "UPDATE_WORKER"; payload: { id: string; worker: Partial<Worker> } }
  | { type: "UPDATE_TASK"; payload: { id: string; task: Partial<Task> } };

export const initialState: AppState = {
  clients: [],
  workers: [],
  tasks: [],
  validationErrors: [],
  businessRules: [],
  weights: {
    priorityLevel: 0.4,
    taskFulfillment: 0.3,
    fairness: 0.2,
    efficiency: 0.1,
  },
  currentTab: "clients",
  isUploading: false,
  searchQuery: "",
  aiSuggestions: [],
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_CLIENTS":
      return { ...state, clients: action.payload };
    case "SET_WORKERS":
      return { ...state, workers: action.payload };
    case "SET_TASKS":
      return { ...state, tasks: action.payload };
    case "SET_VALIDATION_ERRORS":
      return { ...state, validationErrors: action.payload };
    case "ADD_VALIDATION_ERRORS":
      return {
        ...state,
        validationErrors: [...state.validationErrors, ...action.payload],
      };
    case "CLEAR_VALIDATION_ERRORS":
      return {
        ...state,
        validationErrors: state.validationErrors.filter(
          (e) => e.entity !== action.payload
        ),
      };
    case "SET_BUSINESS_RULES":
      return { ...state, businessRules: action.payload };
    case "ADD_BUSINESS_RULE":
      return {
        ...state,
        businessRules: [...state.businessRules, action.payload],
      };
    case "UPDATE_BUSINESS_RULE":
      return {
        ...state,
        businessRules: state.businessRules.map((rule) =>
          rule.id === action.payload.id
            ? { ...rule, ...action.payload.rule }
            : rule
        ),
      };
    case "DELETE_BUSINESS_RULE":
      return {
        ...state,
        businessRules: state.businessRules.filter(
          (rule) => rule.id !== action.payload
        ),
      };
    case "SET_WEIGHTS":
      return { ...state, weights: action.payload };
    case "SET_CURRENT_TAB":
      return { ...state, currentTab: action.payload };
    case "SET_UPLOADING":
      return { ...state, isUploading: action.payload };
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };
    case "SET_AI_SUGGESTIONS":
      return { ...state, aiSuggestions: action.payload };
    case "UPDATE_CLIENT":
      return {
        ...state,
        clients: state.clients.map((client) =>
          client.ClientID === action.payload.id
            ? { ...client, ...action.payload.client }
            : client
        ),
      };
    case "UPDATE_WORKER":
      return {
        ...state,
        workers: state.workers.map((worker) =>
          worker.WorkerID === action.payload.id
            ? { ...worker, ...action.payload.worker }
            : worker
        ),
      };
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.TaskID === action.payload.id
            ? { ...task, ...action.payload.task }
            : task
        ),
      };
    default:
      return state;
  }
}
