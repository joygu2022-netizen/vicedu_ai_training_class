"use client";

import { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "../../../lib/api";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Users,
  TrendingUp,
  Activity,
  Award,
} from "lucide-react";

interface HistoryStep {
  step: string;
  agent: string;
  status: string;
  timestamp?: string;
}

interface Assessment {
  clause_id: string;
  risk_level: string;
  rationale: string;
  policy_refs: string[];
}

interface Proposal {
  clause_id: string;
  variant: string;
  edited_text: string;
}

interface RunData {
  run_id: string;
  doc_id?: string;
  doc_name?: string;
  agent_path?: string;
  playbook_id?: string;
  playbook_name?: string;
  score?: number;
  history: HistoryStep[];
  assessments: Assessment[];
  proposals: Proposal[];
  status?: string;
}

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "success":
    case "completed":
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case "failed":
    case "error":
      return <XCircle className="w-5 h-5 text-red-600" />;
    case "pending":
    case "running":
      return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
    default:
      return <Activity className="w-5 h-5 text-gray-600" />;
  }
};

const getRiskColor = (riskLevel: string) => {
  switch (riskLevel.toLowerCase()) {
    case "high":
      return "bg-red-100 text-red-800 border-red-300";
    case "medium":
    case "med":
      return "bg-orange-100 text-orange-800 border-orange-300";
    case "low":
      return "bg-green-100 text-green-800 border-green-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

export default function RunDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: runId } = use(params);
  const searchParams = useSearchParams();
  const [run, setRun] = useState<RunData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setLoading(true);
      
      // Get user selections from URL parameters
      const docId = searchParams.get('doc_id') || 'doc_001';
      const docName = searchParams.get('doc_name') || 'Unknown Document';
      const agentPath = searchParams.get('agent_path') || 'manager_worker';
      const playbookIds = searchParams.get('playbook_ids') || '';
      const playbookNames = searchParams.get('playbook_names') || 'None';
      
      // Mock data - in real implementation, this would call api.getRun(runId)
      const mockRunData = {
        run_id: runId,
        doc_id: docId,
        doc_name: docName,
        agent_path: agentPath,
        playbook_id: playbookIds,
        playbook_name: playbookNames,
        score: 92,
        status: "completed",
        history: [
          {
            step: "Document Upload",
            agent: "System",
            status: "success",
            timestamp: new Date().toISOString(),
          },
          {
            step: "Clause Parsing",
            agent: "Parser Agent",
            status: "success",
            timestamp: new Date().toISOString(),
          },
          {
            step: "Risk Assessment",
            agent: "Risk Analyzer",
            status: "success",
            timestamp: new Date().toISOString(),
          },
          {
            step: "Redline Generation",
            agent: "Redline Agent",
            status: "success",
            timestamp: new Date().toISOString(),
          },
        ],
        assessments: [
          {
            clause_id: "clause_3.2",
            risk_level: "HIGH",
            rationale: "Unlimited liability exposure",
            policy_refs: ["POL-001", "POL-003"],
          },
          {
            clause_id: "clause_5.1",
            risk_level: "MEDIUM",
            rationale: "Broad indemnification",
            policy_refs: ["POL-002"],
          },
        ],
        proposals: [
          {
            clause_id: "clause_3.2",
            variant: "conservative",
            edited_text: "Company's total liability shall be limited to 12 months fees.",
          },
        ],
      };
      setRun(mockRunData);
      setError(null);
    } catch (err) {
      setError("Failed to load run details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // Removed polling since we're using mock data
  }, [runId]);

  if (loading && !run) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <Clock className="w-12 h-12 text-primary-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading run details...</p>
        </div>
      </div>
    );
  }

  if (error && !run) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card bg-red-50 border-2 border-red-200">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!run) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Run Details</h1>
          <span className="px-3 py-1 text-sm font-medium bg-orange-100 text-orange-800 rounded-full">
            Mock
          </span>
        </div>
        <p className="text-gray-600 font-mono text-sm">{runId}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Document</p>
              <p className="text-lg font-semibold text-gray-900 truncate">
                {run.doc_name || run.doc_id || "N/A"}
              </p>
              {run.doc_id && (
                <p className="text-xs text-gray-500 font-mono">{run.doc_id}</p>
              )}
            </div>
            <FileText className="w-8 h-8 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Agent Path</p>
              <p className="text-lg font-semibold text-gray-900">
                {run.agent_path || "N/A"}
              </p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Playbooks</p>
              <div className="text-lg font-semibold text-gray-900">
                {run.playbook_name && run.playbook_name !== "None" ? (
                  <div className="flex flex-wrap gap-1">
                    {run.playbook_name.split(', ').map((name, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500">None</span>
                )}
              </div>
              {run.playbook_id && run.playbook_id !== "" && (
                <p className="text-xs text-gray-500 font-mono mt-1">
                  {run.playbook_id.split(',').length} selected
                </p>
              )}
            </div>
            <FileText className="w-8 h-8 text-indigo-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Score</p>
              <p className="text-lg font-semibold text-gray-900">
                {run.score !== undefined ? `${run.score}/100` : "N/A"}
              </p>
            </div>
            <Award className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {run.status || "Unknown"}
              </p>
            </div>
            <Activity className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card mb-8">
        <div className="flex items-center mb-6">
          <TrendingUp className="w-6 h-6 text-primary-600 mr-3" />
          <h2 className="text-2xl font-semibold text-gray-900">
            Agent Timeline
          </h2>
        </div>

        {run.history && run.history.length > 0 ? (
          <div className="space-y-4">
            {run.history.map((step, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(step.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {step.step}
                    </h3>
                    {step.timestamp && (
                      <span className="text-xs text-gray-500">
                        {new Date(step.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {step.agent}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        step.status === "success"
                          ? "bg-green-100 text-green-800"
                          : step.status === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {step.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No timeline data available
          </div>
        )}
      </div>

      {/* Assessments */}
      <div className="card mb-8">
        <div className="flex items-center mb-6">
          <AlertTriangle className="w-6 h-6 text-orange-600 mr-3" />
          <h2 className="text-2xl font-semibold text-gray-900">
            Risk Assessments
          </h2>
        </div>

        {run.assessments && run.assessments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Clause ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Risk Level
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Rationale
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Policy Refs
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {run.assessments.map((assessment, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">
                      {assessment.clause_id}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getRiskColor(
                          assessment.risk_level
                        )}`}
                      >
                        {assessment.risk_level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {assessment.rationale}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {assessment.policy_refs && assessment.policy_refs.length > 0
                        ? assessment.policy_refs.join(", ")
                        : "None"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No assessments available
          </div>
        )}
      </div>

      {/* Proposals */}
      <div className="card">
        <div className="flex items-center mb-6">
          <FileText className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-semibold text-gray-900">
            Redline Proposals
          </h2>
        </div>

        {run.proposals && run.proposals.length > 0 ? (
          <div className="space-y-4">
            {run.proposals.map((proposal, index) => (
              <div
                key={index}
                className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">
                    Clause: {proposal.clause_id}
                  </h3>
                  <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">
                    {proposal.variant}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {proposal.edited_text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No proposals available
          </div>
        )}
      </div>
    </div>
  );
}
