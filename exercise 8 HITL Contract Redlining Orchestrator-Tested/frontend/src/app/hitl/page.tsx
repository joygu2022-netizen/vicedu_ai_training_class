"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useApp, appActions, Run } from "../../contexts/AppContext";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Shield,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  ArrowRight,
} from "lucide-react";

// Mock data for demonstration
const mockPendingRuns = [
  {
    run_id: "run_abc123",
    doc_name: "SaaS_MSA_v2.pdf",
    agent_path: "manager_worker",
    status: "awaiting_risk_approval",
    created_at: "2025-10-06T10:23:45Z",
    high_risk_count: 1,
    medium_risk_count: 3,
    low_risk_count: 4,
  },
  {
    run_id: "run_def456",
    doc_name: "NDA_Template.docx",
    agent_path: "planner_executor",
    status: "awaiting_risk_approval",
    created_at: "2025-10-06T09:15:22Z",
    high_risk_count: 0,
    medium_risk_count: 2,
    low_risk_count: 5,
  },
];

const mockRiskAssessments = {
  run_id: "run_abc123",
  doc_name: "SaaS_MSA_v2.pdf",
  assessments: [
    {
      clause_id: "clause_3.2",
      clause_heading: "Limitation of Liability",
      clause_text:
        "Company shall be liable for any and all damages arising from this Agreement, including but not limited to direct, indirect, incidental, consequential, and punitive damages.",
      risk_level: "HIGH",
      rationale:
        "Unlimited liability exposure. No cap on damages. Includes consequential and punitive damages which significantly increase financial risk.",
      policy_refs: ["POL-001: Liability Cap", "POL-003: Consequential Damages"],
      recommended_action: "REJECT - Require liability cap at 12 months fees and exclude consequential/punitive damages",
      impact_assessment: "Critical: Could expose company to unlimited financial liability",
    },
    {
      clause_id: "clause_5.1",
      clause_heading: "Indemnification",
      clause_text:
        "Customer shall indemnify and hold harmless Company from any claims arising from Customer's use of the Service.",
      risk_level: "MEDIUM",
      rationale:
        "Broad indemnification without standard carve-outs. Missing exceptions for Company's gross negligence or force majeure events.",
      policy_refs: ["POL-002: Indemnity Exclusions"],
      recommended_action: "REQUEST MODIFICATION - Add carve-outs for Company fault and force majeure",
      impact_assessment: "Moderate: Could create disputes in edge cases",
    },
    {
      clause_id: "clause_7.3",
      clause_heading: "Data Protection",
      clause_text:
        "Company will process Customer data in accordance with applicable laws.",
      risk_level: "MEDIUM",
      rationale:
        "Lacks specific GDPR/CCPA compliance language. No mention of DPA or SCCs for international transfers.",
      policy_refs: ["POL-005: GDPR Compliance", "POL-006: Data Processing"],
      recommended_action: "REQUEST MODIFICATION - Add explicit GDPR/CCPA references and DPA requirement",
      impact_assessment: "Moderate: Regulatory compliance risk for EU/CA customers",
    },
    {
      clause_id: "clause_9.2",
      clause_heading: "Warranties",
      clause_text:
        "Company disclaims all warranties, express or implied, including warranties of merchantability and fitness for a particular purpose.",
      risk_level: "MEDIUM",
      rationale:
        "Complete warranty disclaimer may not be enforceable in all jurisdictions. Could create customer trust issues.",
      policy_refs: ["POL-007: Warranty Standards"],
      recommended_action: "REQUEST MODIFICATION - Provide limited 90-day warranty",
      impact_assessment: "Moderate: May impact sales and enforceability",
    },
    {
      clause_id: "clause_4.1",
      clause_heading: "Payment Terms",
      clause_text: "Customer shall pay all fees within thirty (30) days of invoice date.",
      risk_level: "LOW",
      rationale: "Standard Net 30 payment terms. No unusual provisions.",
      policy_refs: ["POL-004: Payment Terms"],
      recommended_action: "APPROVE - Standard terms",
      impact_assessment: "Low: Industry standard payment terms",
    },
    {
      clause_id: "clause_6.2",
      clause_heading: "Intellectual Property",
      clause_text:
        "All intellectual property rights in the Service shall remain with Company.",
      risk_level: "LOW",
      rationale: "Standard IP ownership clause. Protects Company's proprietary rights.",
      policy_refs: ["POL-009: IP Rights"],
      recommended_action: "APPROVE - Protects Company IP",
      impact_assessment: "Low: Standard protective language",
    },
    {
      clause_id: "clause_8.1",
      clause_heading: "Termination",
      clause_text:
        "Either party may terminate this Agreement with ninety (90) days written notice.",
      risk_level: "LOW",
      rationale: "Standard 90-day termination notice. Balanced for both parties.",
      policy_refs: ["POL-010: Termination"],
      recommended_action: "APPROVE - Standard terms",
      impact_assessment: "Low: Reasonable notice period",
    },
    {
      clause_id: "clause_10.3",
      clause_heading: "Dispute Resolution",
      clause_text:
        "Any disputes shall be resolved through binding arbitration in accordance with AAA rules.",
      risk_level: "LOW",
      rationale: "Standard arbitration clause. Cost-effective dispute resolution.",
      policy_refs: ["POL-011: Dispute Resolution"],
      recommended_action: "APPROVE - Standard arbitration",
      impact_assessment: "Low: Reduces litigation costs",
    },
  ],
};

export default function RiskGatePage() {
  const { state, dispatch } = useApp();
  const [selectedRun, setSelectedRun] = useState<string>("");
  const [assessments, setAssessments] = useState<any>(null);
  const [approvedClauses, setApprovedClauses] = useState<Set<string>>(new Set());
  const [rejectedClauses, setRejectedClauses] = useState<Set<string>>(new Set());
  const [clauseComments, setClauseComments] = useState<Record<string, string>>({});
  const [approvalComplete, setApprovalComplete] = useState(false);

  // Get pending runs from global state, fallback to mock data for new users
  const pendingRuns = state.runs.filter(run => run.status === 'awaiting_risk_approval');
  const displayRuns = pendingRuns.length > 0 ? pendingRuns : mockPendingRuns;
  
  // Debug logging
  console.log('Risk Gate Debug:', {
    allRuns: state.runs,
    pendingRuns,
    displayRuns,
    isUsingMockData: pendingRuns.length === 0
  });

  const handleLoadRun = (runId: string) => {
    setSelectedRun(runId);
    
    // Check if this is a real run or mock data
    const isRealRun = state.runs.some(run => run.run_id === runId);
    
    if (isRealRun) {
      // For real runs, we would call api.getBlackboard(runId)
      // For now, use mock data but could be replaced with actual API call
      setAssessments(mockRiskAssessments);
    } else {
      // For mock data, use the mock assessments
    setAssessments(mockRiskAssessments);
    }
    
    setApprovedClauses(new Set());
    setRejectedClauses(new Set());
    setClauseComments({});
    setApprovalComplete(false);
  };

  const handleToggleApproval = (clauseId: string, defaultAction: string) => {
    const newApproved = new Set(approvedClauses);
    const newRejected = new Set(rejectedClauses);

    if (approvedClauses.has(clauseId)) {
      newApproved.delete(clauseId);
      newRejected.add(clauseId);
    } else if (rejectedClauses.has(clauseId)) {
      newRejected.delete(clauseId);
    } else {
      // First click - use recommended action
      if (defaultAction.startsWith("APPROVE")) {
        newApproved.add(clauseId);
      } else {
        newRejected.add(clauseId);
      }
    }

    setApprovedClauses(newApproved);
    setRejectedClauses(newRejected);
  };

  const handleApproveClause = (clauseId: string) => {
    console.log('Approving clause:', clauseId);
    const newApproved = new Set<string>(approvedClauses);
    const newRejected = new Set<string>(rejectedClauses);
    
    // Remove from rejected if it was there
    newRejected.delete(clauseId);
    // Add to approved
    newApproved.add(clauseId);
    
    console.log('New approved clauses:', Array.from(newApproved));
    console.log('New rejected clauses:', Array.from(newRejected));
    
    setApprovedClauses(newApproved);
    setRejectedClauses(newRejected);
  };

  const handleRejectClause = (clauseId: string) => {
    console.log('Rejecting clause:', clauseId);
    const newApproved = new Set<string>(approvedClauses);
    const newRejected = new Set<string>(rejectedClauses);
    
    // Remove from approved if it was there
    newApproved.delete(clauseId);
    // Add to rejected
    newRejected.add(clauseId);
    
    console.log('New approved clauses:', Array.from(newApproved));
    console.log('New rejected clauses:', Array.from(newRejected));
    
    setApprovedClauses(newApproved);
    setRejectedClauses(newRejected);
  };

  const handleApproveAll = () => {
    // Only update real runs, not mock data
    const isRealRun = state.runs.some(run => run.run_id === selectedRun);
    
    if (selectedRun && isRealRun) {
      // Calculate score based on approved/rejected clauses
      const totalClauses = assessments.assessments.length;
      const approvedCount = approvedClauses.size;
      const rejectedCount = rejectedClauses.size;
      const score = totalClauses > 0 ? Math.round((approvedCount / totalClauses) * 100) : 0;
      
      dispatch(appActions.updateRun(selectedRun, { 
        status: 'awaiting_final_approval',
        score: score,
        total_proposals: totalClauses,
        high_risk_resolved: approvedClauses.size,
        // Store approval decisions for later use
        approval_decisions: {
          approved_clauses: Array.from(approvedClauses),
          rejected_clauses: Array.from(rejectedClauses),
          comments: clauseComments
        }
      }));
    }
    setApprovalComplete(true);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toUpperCase()) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-300";
      case "MEDIUM":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "LOW":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel.toUpperCase()) {
      case "HIGH":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "MEDIUM":
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case "LOW":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };

  const highRiskCount = assessments?.assessments.filter((a: any) => a.risk_level === "HIGH").length || 0;
  const mediumRiskCount = assessments?.assessments.filter((a: any) => a.risk_level === "MEDIUM").length || 0;
  const lowRiskCount = assessments?.assessments.filter((a: any) => a.risk_level === "LOW").length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Risk Gate (HITL)</h1>
          {pendingRuns.length === 0 && (
            <span className="px-3 py-1 text-sm font-medium bg-orange-100 text-orange-800 rounded-full">
              Mock
            </span>
          )}
        </div>
        <p className="text-gray-600">
          Human-in-the-loop approval for high-risk clauses before proceeding
        </p>
      </div>

      {/* Pending Runs */}
      <div className="card mb-8">
        <div className="flex items-center mb-6">
          <Clock className="w-6 h-6 text-orange-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">
            Pending Risk Approval
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {displayRuns.map((run) => (
            <button
              key={run.run_id}
              onClick={() => handleLoadRun(run.run_id)}
              className={`flex items-center justify-between p-4 border-2 rounded-lg text-left transition-all ${
                selectedRun === run.run_id
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{run.doc_name}</p>
                  <p className="text-xs text-gray-500 font-mono mt-1">{run.run_id}</p>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <p className="text-gray-600 text-xs">Agent</p>
                  <p className="font-medium text-gray-900">
                    {run.agent_path.replace("_", "-")}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-xs">Risk Clauses</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-800 text-xs font-semibold rounded">
                      {run.high_risk_count}H
                    </span>
                    <span className="px-1.5 py-0.5 bg-orange-100 text-orange-800 text-xs font-semibold rounded">
                      {run.medium_risk_count}M
                    </span>
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded">
                      {run.low_risk_count}L
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-xs">Time</p>
                  <p className="text-gray-700" suppressHydrationWarning>
                    {new Date(run.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Risk Assessments */}
      {assessments && !approvalComplete && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total Clauses</p>
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {assessments.assessments.length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Reviewed</p>
            </div>

            <div className="card bg-red-50 border-red-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">High Risk</p>
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-3xl font-bold text-red-700">{highRiskCount}</p>
              <p className="text-sm text-red-600 mt-1">Requires action</p>
            </div>

            <div className="card bg-orange-50 border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Medium Risk</p>
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-orange-700">{mediumRiskCount}</p>
              <p className="text-sm text-orange-600 mt-1">Review needed</p>
            </div>

            <div className="card bg-green-50 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Low Risk</p>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-700">{lowRiskCount}</p>
              <p className="text-sm text-green-600 mt-1">Acceptable</p>
            </div>
          </div>

          {/* Assessments List */}
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Shield className="w-6 h-6 text-primary-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Risk Assessments ({assessments.assessments.length})
                </h2>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const allIds = new Set<string>(
                      assessments.assessments.map((a: any) => a.clause_id)
                    );
                    setApprovedClauses(allIds);
                    setRejectedClauses(new Set<string>());
                  }}
                  className="btn-secondary text-sm flex items-center"
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Approve All
                </button>
                <button
                  onClick={() => {
                    const allIds = new Set<string>(
                      assessments.assessments.map((a: any) => a.clause_id)
                    );
                    setRejectedClauses(allIds);
                    setApprovedClauses(new Set<string>());
                  }}
                  className="btn-secondary text-sm flex items-center"
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  Reject All
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {assessments.assessments.map((assessment: any, index: number) => {
                const isApproved = approvedClauses.has(assessment.clause_id);
                const isRejected = rejectedClauses.has(assessment.clause_id);

                return (
                  <div
                    key={assessment.clause_id}
                    className={`border-2 rounded-lg overflow-hidden transition-all duration-300 ${
                      isApproved
                        ? "border-green-400 bg-green-50 shadow-lg ring-2 ring-green-200 ring-opacity-50"
                        : isRejected
                        ? "border-red-400 bg-red-50 shadow-lg ring-2 ring-red-200 ring-opacity-50"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    {/* Assessment Header */}
                    <div className={`px-4 py-3 flex items-center justify-between transition-colors duration-300 ${
                      isApproved
                        ? "bg-green-100 border-b border-green-200"
                        : isRejected
                        ? "bg-red-100 border-b border-red-200"
                        : "bg-gray-50"
                    }`}>
                      <div className="flex items-center space-x-4 flex-1">
                        <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </span>
                        {getRiskIcon(assessment.risk_level)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold text-gray-900">
                              {assessment.clause_heading}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded border ${getRiskColor(
                                assessment.risk_level
                              )}`}
                            >
                              {assessment.risk_level}
                            </span>
                            <span className="text-xs text-gray-500 font-mono">
                              {assessment.clause_id}
                            </span>
                            {isApproved && (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-600 text-white flex items-center">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                APPROVED
                              </span>
                            )}
                            {isRejected && (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-600 text-white flex items-center">
                                <XCircle className="w-3 h-3 mr-1" />
                                REJECTED
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {assessment.recommended_action}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                      <button
                          onClick={() => handleApproveClause(assessment.clause_id)}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center shadow-sm ${
                          isApproved
                              ? "bg-green-600 text-white hover:bg-green-700 shadow-lg ring-2 ring-green-300 ring-opacity-50 transform scale-105"
                              : "bg-green-50 text-green-700 hover:bg-green-100 border-2 border-green-300 hover:border-green-400 hover:shadow-md"
                          }`}
                        >
                          <CheckCircle className={`w-4 h-4 mr-2 ${isApproved ? 'text-white' : 'text-green-600'}`} />
                          {isApproved ? "✓ Approved" : "Approve"}
                        </button>
                        <button
                          onClick={() => handleRejectClause(assessment.clause_id)}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center shadow-sm ${
                            isRejected
                              ? "bg-red-600 text-white hover:bg-red-700 shadow-lg ring-2 ring-red-300 ring-opacity-50 transform scale-105"
                              : "bg-red-50 text-red-700 hover:bg-red-100 border-2 border-red-300 hover:border-red-400 hover:shadow-md"
                          }`}
                        >
                          <XCircle className={`w-4 h-4 mr-2 ${isRejected ? 'text-white' : 'text-red-600'}`} />
                          {isRejected ? "✗ Rejected" : "Reject"}
                      </button>
                      </div>
                    </div>

                    {/* Assessment Details */}
                    <div className="p-4 space-y-3">
                      {/* Clause Text */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          Clause Text
                        </label>
                        <p className="mt-1 text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">
                          {assessment.clause_text}
                        </p>
                      </div>

                      {/* Risk Rationale */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          Risk Rationale
                        </label>
                        <p className="mt-1 text-sm text-gray-700 bg-yellow-50 p-3 rounded border border-yellow-200">
                          {assessment.rationale}
                        </p>
                      </div>

                      {/* Impact Assessment */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          Impact Assessment
                        </label>
                        <p className="mt-1 text-sm text-gray-700 bg-blue-50 p-3 rounded border border-blue-200">
                          {assessment.impact_assessment}
                        </p>
                      </div>

                      {/* Policy References */}
                      <div className="flex flex-wrap gap-2">
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          Policy References:
                        </label>
                        {assessment.policy_refs.map((ref: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded"
                          >
                            {ref}
                          </span>
                        ))}
                      </div>

                      {/* Comments */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center mb-2">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Your Comments (Optional)
                        </label>
                        <textarea
                          className="input text-sm"
                          rows={2}
                          placeholder="Add any notes or concerns about this risk assessment..."
                          value={clauseComments[assessment.clause_id] || ""}
                          onChange={(e) =>
                            setClauseComments({
                              ...clauseComments,
                              [assessment.clause_id]: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="card bg-green-50 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Approved</p>
                  <p className="text-2xl font-bold text-green-700">{approvedClauses.size}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="card bg-red-50 border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-700">{rejectedClauses.size}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div className="card bg-orange-50 border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600">Pending</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {assessments.assessments.length - approvedClauses.size - rejectedClauses.size}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <div className="card bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Total</p>
                  <p className="text-2xl font-bold text-blue-700">{assessments.assessments.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Approval Section */}
          <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200">
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-primary-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Risk Gate Approval
              </h3>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                <div className="flex items-center mb-2">
                  <p className="font-semibold">Review Summary:</p>
                  <div className="ml-2 flex items-center text-xs text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    Live
                  </div>
                </div>
                <div className="space-y-1">
                  <p>✓ {approvedClauses.size} clauses approved</p>
                  {rejectedClauses.size > 0 && (
                    <p>✗ {rejectedClauses.size} clauses rejected</p>
                  )}
                  <p className="text-gray-600">
                    {assessments.assessments.length -
                      approvedClauses.size -
                      rejectedClauses.size}{" "}
                    pending review
                  </p>
                  {/* Progress indicator */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{approvedClauses.size + rejectedClauses.size} / {assessments.assessments.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${assessments.assessments.length > 0 
                            ? ((approvedClauses.size + rejectedClauses.size) / assessments.assessments.length) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleApproveAll}
                disabled={
                  approvedClauses.size + rejectedClauses.size !==
                  assessments.assessments.length
                }
                className="btn-primary flex items-center text-lg py-3 px-6"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Submit Risk Approval
              </button>
            </div>
          </div>
        </>
      )}

      {/* Approval Complete */}
      {approvalComplete && (
        <div className="card bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
          <div className="flex items-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Risk Gate Approved!
              </h3>
              <p className="text-sm text-gray-600">
                The run can now proceed to the next stage
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Approval Summary:
            </p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {approvedClauses.size}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {rejectedClauses.size}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {assessments.assessments.length}
                </p>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/finalize"
              className="btn-primary flex items-center"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Continue to Final Approval
            </Link>
            <Link href="/reports" className="btn-secondary flex items-center">
              View Reports
            </Link>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!assessments && (
        <div className="card text-center py-12">
          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">No run selected</p>
          <p className="text-sm text-gray-500">
            Select a pending run from the list above to begin risk approval
          </p>
        </div>
      )}
    </div>
  );
}
