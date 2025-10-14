"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import { Play, FileText, BookOpen, Users, CheckCircle, AlertCircle } from "lucide-react";
import { useApp, appActions, Document, Playbook } from "../../contexts/AppContext";

const agentPaths = [
  {
    value: "manager_worker",
    label: "Manager–Worker",
    description: "Task decomposition with parallel workers for clause parsing and risk tagging",
    icon: Users,
    color: "bg-blue-500",
  },
  {
    value: "planner_executor",
    label: "Planner–Executor",
    description: "Multi-step sequential plan with replayable state and checkpoints",
    icon: CheckCircle,
    color: "bg-green-500",
  },
  {
    value: "reviewer_referee",
    label: "Reviewer/Referee",
    description: "Checklist-driven review with referee arbitration for contested clauses",
    icon: AlertCircle,
    color: "bg-orange-500",
  },
];

export default function RunPage() {
  const router = useRouter();
  const { state, dispatch } = useApp();
  const [docId, setDocId] = useState<string>("");
  const [agentPath, setAgentPath] = useState<string>("manager_worker");
  const [playbookIds, setPlaybookIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use documents and playbooks from global state
  const docs = state.documents;
  const playbooks = state.playbooks;

  // Handle playbook selection (multiple)
  const handlePlaybookToggle = (playbookId: string) => {
    setPlaybookIds(prev => {
      if (prev.includes(playbookId)) {
        return prev.filter(id => id !== playbookId);
      } else {
        return [...prev, playbookId];
      }
    });
  };

  // Handle select all/deselect all playbooks
  const handleSelectAllPlaybooks = () => {
    if (playbookIds.length === playbooks.length) {
      // If all are selected, deselect all
      setPlaybookIds([]);
    } else {
      // If not all are selected, select all
      setPlaybookIds(playbooks.map(p => p.playbook_id));
    }
  };

  // Initialize with default documents if localStorage is empty
  useEffect(() => {
    // Only add default documents if no data exists in localStorage
    if (docs.length === 0) {
      const defaultDocs = [
        { doc_id: "doc_001", name: "SaaS_MSA_v2.pdf", uploaded_at: "2025-10-06T10:00:00Z", size: 245678 },
        { doc_id: "doc_002", name: "NDA_Template.docx", uploaded_at: "2025-10-06T09:30:00Z", size: 123456 },
        { doc_id: "doc_003", name: "DPA_GDPR.pdf", uploaded_at: "2025-10-06T08:45:00Z", size: 345678 },
      ];
      dispatch(appActions.setDocuments(defaultDocs));
    }
  }, [dispatch, docs.length]);

  const handleStartRun = async () => {
    if (!docId) {
      setError("Please select a document");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Mock response - in real implementation, this would call api.run()
      const mockRunId = `run_${Date.now()}`;
      
      // Get selected document and playbook names
      const selectedDoc = docs.find(d => d.doc_id === docId);
      const selectedPlaybooks = playbooks.filter(p => playbookIds.includes(p.playbook_id));
      const playbookNames = selectedPlaybooks.map(p => p.name).join(', ') || 'None';
      
      // Create new run and add to global state
      const newRun = {
        run_id: mockRunId,
        doc_id: docId,
        doc_name: selectedDoc?.name || 'Unknown Document',
        agent_path: agentPath,
        playbook_id: playbookIds.join(','), // Store multiple IDs as comma-separated string
        playbook_name: playbookNames,
        status: 'running' as const,
        score: undefined,
        created_at: new Date().toISOString(),
        high_risk_count: 0,
        medium_risk_count: 0,
        low_risk_count: 0,
        total_proposals: 0,
        high_risk_resolved: 0,
      };
      
      // Add run to global state
      dispatch(appActions.addRun(newRun));
      
      // Create URL with user selections as parameters
      const params = new URLSearchParams({
        doc_id: docId,
        doc_name: selectedDoc?.name || 'Unknown Document',
        agent_path: agentPath,
        playbook_ids: playbookIds.join(','),
        playbook_names: playbookNames
      });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update run status to awaiting risk approval
      dispatch(appActions.updateRun(mockRunId, { 
        status: 'awaiting_risk_approval',
        high_risk_count: 1,
        medium_risk_count: 3,
        low_risk_count: 4
      }));
      
      // Navigate to the run detail page with parameters
      router.push(`/run/${mockRunId}?${params.toString()}`);
    } catch (err) {
      setError("Failed to start run");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedPath = agentPaths.find((p) => p.value === agentPath);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Start Review</h1>
        <p className="text-gray-600">
          Configure and initiate a multi-agent document review workflow
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Document Selection */}
        <div className="card">
          <div className="flex items-center mb-4">
            <FileText className="w-6 h-6 text-primary-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">
              Select Document
            </h2>
          </div>
          {docs.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-2">No documents available</p>
              <p className="text-sm text-gray-500">
                Please upload a document first
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {docs.map((doc) => (
                <label
                  key={doc.doc_id}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    docId === doc.doc_id
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="document"
                    value={doc.doc_id}
                    checked={docId === doc.doc_id}
                    onChange={(e) => setDocId(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{doc.name}</p>
                    <p className="text-xs text-gray-500 font-mono mt-1">
                      {doc.doc_id}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Agent Path Selection */}
        <div className="card">
          <div className="flex items-center mb-4">
            <Users className="w-6 h-6 text-primary-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">
              Select Agent Path
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {agentPaths.map((path) => {
              const Icon = path.icon;
              return (
                <label
                  key={path.value}
                  className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    agentPath === path.value
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="agentPath"
                    value={path.value}
                    checked={agentPath === path.value}
                    onChange={(e) => setAgentPath(e.target.value)}
                    className="mt-1 mr-3"
                  />
                  <div className={`${path.color} p-2 rounded-lg mr-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{path.label}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {path.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Playbook Selection */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <BookOpen className="w-6 h-6 text-primary-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Select Playbooks (Optional)
              </h2>
            </div>
            <div className="flex items-center space-x-3">
              {playbookIds.length > 0 && (
                <div className="text-sm text-gray-600">
                  {playbookIds.length} selected
                </div>
              )}
              {playbooks.length > 0 && (
                <button
                  onClick={handleSelectAllPlaybooks}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  {playbookIds.length === playbooks.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>
          </div>
          {playbooks.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-2">No playbooks available</p>
              <p className="text-sm text-gray-500">
                You can proceed without playbooks or create some first
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-gray-600 mb-3">
                Select one or more playbooks to apply to this review. You can also proceed without any playbooks.
              </div>
              <div className="grid grid-cols-1 gap-3">
                {playbooks.map((playbook) => (
                  <label
                    key={playbook.playbook_id}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      playbookIds.includes(playbook.playbook_id)
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={playbookIds.includes(playbook.playbook_id)}
                      onChange={() => handlePlaybookToggle(playbook.playbook_id)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">{playbook.name}</p>
                        {playbook.isDefault && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            Default
                          </span>
                        )}
                        {playbook.uploaded && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Uploaded
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-mono">
                        {playbook.playbook_id}
                      </p>
                      {playbook.source_file && (
                        <p className="text-xs text-gray-400 mt-1">
                          from {playbook.source_file}
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Summary and Start Button */}
        <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Review Configuration
            </h3>
            <div className="flex items-center text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Live Preview
            </div>
          </div>
          <div className="space-y-3 text-sm mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2 text-primary-600" />
                <strong className="mr-2 text-gray-700">Document:</strong>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  docId 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {docId && docs.length > 0
                    ? (docs.find((d) => d.doc_id === docId)?.name || "Unknown")
                    : "Not selected"}
                </span>
              </div>
              {docId && (
                <span className="text-xs text-gray-500 font-mono">
                  {docId}
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-primary-600" />
                <strong className="mr-2 text-gray-700">Agent Path:</strong>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {selectedPath?.label || "Manager–Worker"}
                </span>
              </div>
              <span className="text-xs text-gray-500 font-mono">
                {agentPath}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 mr-2 text-primary-600" />
                <strong className="mr-2 text-gray-700">Playbooks:</strong>
                <div className="flex flex-wrap gap-1">
                  {playbookIds.length > 0 ? (
                    playbookIds.map((id, index) => {
                      const playbook = playbooks.find(p => p.playbook_id === id);
                      return (
                        <span
                          key={id}
                          className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                        >
                          {playbook?.name || "Unknown"}
                        </span>
                      );
                    })
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      None
                    </span>
                  )}
                </div>
              </div>
              {playbookIds.length > 0 && (
                <span className="text-xs text-gray-500 font-mono">
                  {playbookIds.length} selected
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleStartRun}
            disabled={loading || !docId}
            className="btn-primary w-full flex items-center justify-center text-lg py-3"
          >
            <Play className="w-5 h-5 mr-2" />
            {loading ? "Starting Review..." : "Start Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
