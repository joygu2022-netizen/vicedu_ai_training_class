"use client";

import React, { createContext, useContext, useReducer, useState, useEffect, ReactNode } from 'react';

// Types
export interface Document {
  doc_id: string;
  name: string;
  uploaded_at?: string;
  size?: number;
}

export interface Playbook {
  playbook_id: string;
  name: string;
  rules: any;
  created_at?: string;
  isDefault?: boolean;
}

export interface Run {
  run_id: string;
  doc_id: string;
  doc_name: string;
  agent_path: string;
  playbook_id?: string;
  playbook_name?: string;
  status: 'running' | 'awaiting_risk_approval' | 'awaiting_final_approval' | 'completed' | 'failed';
  score?: number;
  created_at: string;
  high_risk_count?: number;
  medium_risk_count?: number;
  low_risk_count?: number;
  total_proposals?: number;
  high_risk_resolved?: number;
  approval_decisions?: {
    approved_clauses: string[];
    rejected_clauses: string[];
    comments: Record<string, string>;
  };
}

// State interface
interface AppState {
  documents: Document[];
  playbooks: Playbook[];
  runs: Run[];
  isLoading: boolean;
  error: string | null;
}

// Action types
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DOCUMENTS'; payload: Document[] }
  | { type: 'ADD_DOCUMENT'; payload: Document }
  | { type: 'REMOVE_DOCUMENT'; payload: string }
  | { type: 'SET_PLAYBOOKS'; payload: Playbook[] }
  | { type: 'ADD_PLAYBOOK'; payload: Playbook }
  | { type: 'REMOVE_PLAYBOOK'; payload: string }
  | { type: 'SET_RUNS'; payload: Run[] }
  | { type: 'ADD_RUN'; payload: Run }
  | { type: 'UPDATE_RUN'; payload: { run_id: string; updates: Partial<Run> } }
  | { type: 'REMOVE_RUN'; payload: string }
  | { type: 'REFRESH_DATA' };

// Helper functions for localStorage
const STORAGE_KEYS = {
  DOCUMENTS: 'legal_review_documents',
  PLAYBOOKS: 'legal_review_playbooks',
  RUNS: 'legal_review_runs',
};

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Initial state - start with empty arrays to avoid hydration mismatch
const initialState: AppState = {
  documents: [],
  playbooks: [],
  runs: [],
  isLoading: false,
  error: null,
};

// Reducer with localStorage persistence
function appReducer(state: AppState, action: AppAction): AppState {
  let newState: AppState;
  
  switch (action.type) {
    case 'SET_LOADING':
      newState = { ...state, isLoading: action.payload };
      break;
    
    case 'SET_ERROR':
      newState = { ...state, error: action.payload };
      break;
    
    case 'SET_DOCUMENTS':
      newState = { ...state, documents: action.payload };
      saveToStorage(STORAGE_KEYS.DOCUMENTS, newState.documents);
      break;
    
    case 'ADD_DOCUMENT':
      newState = { 
        ...state, 
        documents: [action.payload, ...state.documents] 
      };
      saveToStorage(STORAGE_KEYS.DOCUMENTS, newState.documents);
      break;
    
    case 'REMOVE_DOCUMENT':
      newState = { 
        ...state, 
        documents: state.documents.filter(doc => doc.doc_id !== action.payload) 
      };
      saveToStorage(STORAGE_KEYS.DOCUMENTS, newState.documents);
      break;
    
    case 'SET_PLAYBOOKS':
      newState = { ...state, playbooks: action.payload };
      saveToStorage(STORAGE_KEYS.PLAYBOOKS, newState.playbooks);
      break;
    
    case 'ADD_PLAYBOOK':
      newState = { 
        ...state, 
        playbooks: [action.payload, ...state.playbooks] 
      };
      saveToStorage(STORAGE_KEYS.PLAYBOOKS, newState.playbooks);
      break;
    
    case 'REMOVE_PLAYBOOK':
      newState = { 
        ...state, 
        playbooks: state.playbooks.filter(pb => pb.playbook_id !== action.payload) 
      };
      saveToStorage(STORAGE_KEYS.PLAYBOOKS, newState.playbooks);
      break;
    
    case 'SET_RUNS':
      newState = { ...state, runs: action.payload };
      saveToStorage(STORAGE_KEYS.RUNS, newState.runs);
      break;
    
    case 'ADD_RUN':
      newState = { 
        ...state, 
        runs: [action.payload, ...state.runs] 
      };
      saveToStorage(STORAGE_KEYS.RUNS, newState.runs);
      break;
    
    case 'UPDATE_RUN':
      newState = { 
        ...state, 
        runs: state.runs.map(run => 
          run.run_id === action.payload.run_id 
            ? { ...run, ...action.payload.updates }
            : run
        )
      };
      saveToStorage(STORAGE_KEYS.RUNS, newState.runs);
      break;
    
    case 'REMOVE_RUN':
      newState = { 
        ...state, 
        runs: state.runs.filter(run => run.run_id !== action.payload) 
      };
      saveToStorage(STORAGE_KEYS.RUNS, newState.runs);
      break;
    
    case 'REFRESH_DATA':
      newState = { ...state, isLoading: true, error: null };
      break;
    
    default:
      newState = state;
  }
  
  return newState;
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data from localStorage on client side only
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      const storedDocs = loadFromStorage(STORAGE_KEYS.DOCUMENTS, []);
      const storedPlaybooks = loadFromStorage(STORAGE_KEYS.PLAYBOOKS, []);
      const storedRuns = loadFromStorage(STORAGE_KEYS.RUNS, []);
      
      // Always load documents (empty array if no stored data)
      dispatch(appActions.setDocuments(storedDocs));
      
      // Load playbooks and add defaults if empty
      dispatch(appActions.setPlaybooks(storedPlaybooks));
      
      // Load runs
      dispatch(appActions.setRuns(storedRuns));
      
      // If no playbooks exist, add default ones
      if (storedPlaybooks.length === 0) {
        const defaultPlaybooks = [
          {
            playbook_id: "playbook_001",
            name: "Standard NDA Policy",
            rules: {
              liability_cap: "12 months fees",
              data_retention: "90 days post-termination",
              indemnity_exclusions: ["force majeure", "third-party claims"]
            },
            created_at: "2025-10-06T10:00:00Z",
            isDefault: true
          },
          {
            playbook_id: "playbook_default_001",
            name: "Standard SaaS MSA Policy",
            rules: { 
              liability_cap: "12 months fees",
              data_retention: "90 days post-termination",
              indemnity_exclusions: ["force majeure", "third-party claims"],
              required_clauses: ["subprocessors", "audit rights", "SCC references"]
            },
            created_at: "2025-10-06T10:00:00Z",
            isDefault: true
          },
          {
            playbook_id: "playbook_default_002", 
            name: "GDPR DPA Policy",
            rules: { 
              data_retention: "90 days post-termination",
              liability_cap: "6 months fees",
              indemnity_exclusions: ["consequential damages"],
              required_clauses: ["data processing", "breach notification", "DPO contact"]
            },
            created_at: "2025-10-06T09:30:00Z",
            isDefault: true
          },
        ];
        dispatch(appActions.setPlaybooks(defaultPlaybooks));
      }
      
      setIsInitialized(true);
    }
  }, [isInitialized]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Action creators
export const appActions = {
  setLoading: (loading: boolean): AppAction => ({
    type: 'SET_LOADING',
    payload: loading,
  }),
  
  setError: (error: string | null): AppAction => ({
    type: 'SET_ERROR',
    payload: error,
  }),
  
  setDocuments: (documents: Document[]): AppAction => ({
    type: 'SET_DOCUMENTS',
    payload: documents,
  }),
  
  addDocument: (document: Document): AppAction => ({
    type: 'ADD_DOCUMENT',
    payload: document,
  }),
  
  removeDocument: (docId: string): AppAction => ({
    type: 'REMOVE_DOCUMENT',
    payload: docId,
  }),
  
  setPlaybooks: (playbooks: Playbook[]): AppAction => ({
    type: 'SET_PLAYBOOKS',
    payload: playbooks,
  }),
  
  addPlaybook: (playbook: Playbook): AppAction => ({
    type: 'ADD_PLAYBOOK',
    payload: playbook,
  }),
  
  removePlaybook: (playbookId: string): AppAction => ({
    type: 'REMOVE_PLAYBOOK',
    payload: playbookId,
  }),
  
  setRuns: (runs: Run[]): AppAction => ({
    type: 'SET_RUNS',
    payload: runs,
  }),
  
  addRun: (run: Run): AppAction => ({
    type: 'ADD_RUN',
    payload: run,
  }),
  
  updateRun: (run_id: string, updates: Partial<Run>): AppAction => ({
    type: 'UPDATE_RUN',
    payload: { run_id, updates },
  }),
  
  removeRun: (runId: string): AppAction => ({
    type: 'REMOVE_RUN',
    payload: runId,
  }),
  
  refreshData: (): AppAction => ({
    type: 'REFRESH_DATA',
  }),
};
