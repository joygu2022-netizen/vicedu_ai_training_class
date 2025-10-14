"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useApp, appActions, Run } from "../../contexts/AppContext";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Download,
  Eye,
  MessageSquare,
  Clock,
  User,
  ThumbsUp,
  ThumbsDown,
  Edit3,
  ArrowRight,
} from "lucide-react";

// Mock data for demonstration
const mockPendingReviews = [
  {
    run_id: "run_abc123",
    doc_name: "SaaS_MSA_v2.pdf",
    agent_path: "manager_worker",
    score: 92,
    status: "awaiting_final_approval",
    created_at: "2025-10-06T10:23:45Z",
    total_proposals: 5,
    high_risk_resolved: 1,
  },
  {
    run_id: "run_def456",
    doc_name: "NDA_Template.docx",
    agent_path: "planner_executor",
    score: 88,
    status: "awaiting_final_approval",
    created_at: "2025-10-06T09:15:22Z",
    total_proposals: 3,
    high_risk_resolved: 0,
  },
];

const mockRedlineDetails = {
  run_id: "run_abc123",
  doc_id: "doc_001",
  doc_name: "SaaS_MSA_v2.pdf",
  agent_path: "manager_worker",
  playbook_id: "playbook_saas_001",
  score: 92,
  status: "awaiting_final_approval",
  created_at: "2025-10-06T10:23:45Z",
  summary: {
    total_clauses: 8,
    high_risk_clauses: 1,
    medium_risk_clauses: 3,
    low_risk_clauses: 4,
    proposals_generated: 5,
    estimated_risk_reduction: "78%",
  },
  proposals: [
    {
      proposal_id: "prop_1",
      clause_id: "clause_3.2",
      clause_heading: "Limitation of Liability",
      risk_level: "HIGH",
      original_text:
        "Company shall be liable for any and all damages arising from this Agreement, including but not limited to direct, indirect, incidental, consequential, and punitive damages.",
      proposed_text:
        "Company's total liability under this Agreement shall be limited to the amounts paid by Customer in the twelve (12) months preceding the claim. Company shall not be liable for indirect, incidental, consequential, or punitive damages.",
      rationale:
        "Original clause exposes company to unlimited liability. Proposed cap aligns with industry standard (12 months fees) and excludes consequential damages per company policy.",
      policy_refs: ["POL-001: Liability Cap", "POL-003: Consequential Damages"],
      variant: "conservative",
      reviewer_notes:
        "Approved by legal reviewer. Meets compliance requirements.",
      status: "pending_approval",
    },
    {
      proposal_id: "prop_2",
      clause_id: "clause_5.1",
      clause_heading: "Indemnification",
      risk_level: "MEDIUM",
      original_text:
        "Customer shall indemnify and hold harmless Company from any claims arising from Customer's use of the Service.",
      proposed_text:
        "Customer shall indemnify and hold harmless Company from any claims arising from Customer's use of the Service, except to the extent caused by Company's gross negligence or willful misconduct, and excluding claims arising from force majeure events.",
      rationale:
        "Original clause is too broad. Proposed version adds standard carve-outs for Company's fault and force majeure events.",
      policy_refs: ["POL-002: Indemnity Exclusions"],
      variant: "moderate",
      reviewer_notes: "Standard carve-outs applied. Low risk.",
      status: "pending_approval",
    },
    {
      proposal_id: "prop_3",
      clause_id: "clause_7.3",
      clause_heading: "Data Protection",
      risk_level: "MEDIUM",
      original_text:
        "Company will process Customer data in accordance with applicable laws.",
      proposed_text:
        "Company will process Customer data in accordance with applicable laws, including GDPR and CCPA. Company will maintain a Data Processing Agreement (DPA) as set forth in Exhibit A, which incorporates Standard Contractual Clauses (SCCs) for international data transfers.",
      rationale:
        "Original clause lacks specificity on GDPR compliance. Proposed version adds explicit DPA reference and SCC requirement for international transfers.",
      policy_refs: ["POL-005: GDPR Compliance", "POL-006: Data Processing"],
      variant: "conservative",
      reviewer_notes: "Critical for EU customers. Must include DPA.",
      status: "pending_approval",
    },
    {
      proposal_id: "prop_4",
      clause_id: "clause_9.2",
      clause_heading: "Warranties",
      risk_level: "MEDIUM",
      original_text:
        "Company disclaims all warranties, express or implied, including warranties of merchantability and fitness for a particular purpose.",
      proposed_text:
        "Except as expressly stated in this Agreement, Company disclaims all other warranties, express or implied. Company warrants that the Service will perform substantially in accordance with the Documentation for a period of ninety (90) days from delivery.",
      rationale:
        "Complete disclaimer is too broad and may not be enforceable. Proposed version provides a limited warranty while maintaining reasonable protections.",
      policy_refs: ["POL-007: Warranty Standards"],
      variant: "moderate",
      reviewer_notes: "Balanced approach. 90-day warranty is standard.",
      status: "pending_approval",
    },
    {
      proposal_id: "prop_5",
      clause_id: "clause_11.4",
      clause_heading: "Subprocessors",
      risk_level: "LOW",
      original_text: "Company may use third-party service providers.",
      proposed_text:
        "Company may use third-party subprocessors to provide the Service. A current list of subprocessors is available at [company.com/subprocessors]. Company will provide thirty (30) days' notice of any new subprocessors, and Customer may object for reasonable cause.",
      rationale:
        "Original clause lacks transparency. Proposed version adds subprocessor list, notification, and objection rights per GDPR requirements.",
      policy_refs: ["POL-006: Data Processing", "POL-008: Subprocessor List"],
      variant: "conservative",
      reviewer_notes: "GDPR requirement. Low risk addition.",
      status: "pending_approval",
    },
  ],
  memo: {
    executive_summary:
      "The SaaS MSA has been reviewed and 5 key clauses have been identified for redlining. The most critical change is capping liability at 12 months fees (Clause 3.2), which reduces company exposure from unlimited to a defined amount. Additional improvements include GDPR-compliant data processing language, balanced warranty provisions, and subprocessor transparency.",
    risk_assessment:
      "Original contract posed HIGH risk due to unlimited liability exposure. Proposed redlines reduce overall risk by approximately 78%. All changes align with company policy and industry best practices.",
    recommendations: [
      "Approve all 5 proposed changes",
      "Ensure DPA (Exhibit A) is attached before execution",
      "Update subprocessor list at company.com/subprocessors",
      "Review annually for compliance with evolving regulations",
    ],
  },
};

export default function FinalizePage() {
  const { state, dispatch } = useApp();
  const [selectedRun, setSelectedRun] = useState<string>("");
  const [redlineDetails, setRedlineDetails] = useState<any>(null);
  const [approvalNotes, setApprovalNotes] = useState<string>("");
  const [approvedProposals, setApprovedProposals] = useState<Set<string>>(
    new Set()
  );
  const [rejectedProposals, setRejectedProposals] = useState<Set<string>>(
    new Set()
  );
  const [proposalComments, setProposalComments] = useState<
    Record<string, string>
  >({});
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Local storage keys
  const STORAGE_KEYS = {
    FINAL_APPROVAL_STATE: 'final_approval_state',
    REDLINE_DETAILS: 'redline_details',
    APPROVAL_DECISIONS: 'approval_decisions',
  };

  // Helper functions for localStorage
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

  // Get pending runs from global state, fallback to mock data for new users
  const pendingRuns = state.runs.filter(run => run.status === 'awaiting_final_approval');
  const displayRuns = pendingRuns.length > 0 ? pendingRuns : mockPendingReviews;
  
  // Initialize from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      // Load saved final approval state
      const savedState = loadFromStorage(STORAGE_KEYS.FINAL_APPROVAL_STATE, null);
      if (savedState) {
        setSelectedRun(savedState.selectedRun || '');
        setApprovedProposals(new Set(savedState.approvedProposals || []));
        setRejectedProposals(new Set(savedState.rejectedProposals || []));
        setProposalComments(savedState.proposalComments || {});
        setApprovalNotes(savedState.approvalNotes || '');
        setShowExportOptions(savedState.showExportOptions || false);
        setExportComplete(savedState.exportComplete || false);
      }

      // Load saved redline details
      const savedRedlineDetails = loadFromStorage(STORAGE_KEYS.REDLINE_DETAILS, null);
      if (savedRedlineDetails) {
        setRedlineDetails(savedRedlineDetails);
      }

      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      const stateToSave = {
        selectedRun,
        approvedProposals: Array.from(approvedProposals),
        rejectedProposals: Array.from(rejectedProposals),
        proposalComments,
        approvalNotes,
        showExportOptions,
        exportComplete,
      };
      saveToStorage(STORAGE_KEYS.FINAL_APPROVAL_STATE, stateToSave);
    }
  }, [selectedRun, approvedProposals, rejectedProposals, proposalComments, approvalNotes, showExportOptions, exportComplete, isInitialized]);

  // Save redline details when they change
  useEffect(() => {
    if (isInitialized && redlineDetails) {
      saveToStorage(STORAGE_KEYS.REDLINE_DETAILS, redlineDetails);
    }
  }, [redlineDetails, isInitialized]);
  
  // Debug logging
  console.log('Final Approval Debug:', {
    allRuns: state.runs,
    pendingRuns,
    displayRuns,
    isUsingMockData: pendingRuns.length === 0,
    isInitialized,
    selectedRun,
    hasRedlineDetails: !!redlineDetails
  });

  const handleLoadRedline = (runId: string) => {
    setSelectedRun(runId);
    
    // Check if this is a real run or mock data
    const isRealRun = state.runs.some(run => run.run_id === runId);
    
    if (isRealRun) {
      // For real runs, we would call api.getBlackboard(runId)
      // For now, use mock data but could be replaced with actual API call
      setRedlineDetails(mockRedlineDetails);
    } else {
      // For mock data, use the mock redline details
      setRedlineDetails(mockRedlineDetails);
    }
    
    // Only auto-approve if no previous state exists
    const hasPreviousState = approvedProposals.size > 0 || rejectedProposals.size > 0;
    if (!hasPreviousState) {
      const allProposalIds = new Set(
        mockRedlineDetails.proposals.map((p: any) => p.proposal_id)
      );
      setApprovedProposals(allProposalIds);
      setRejectedProposals(new Set());
    }
    
    setProposalComments({});
    setShowExportOptions(false);
    setExportComplete(false);
  };

  const handleToggleApproval = (proposalId: string) => {
    const newApproved = new Set(approvedProposals);
    const newRejected = new Set(rejectedProposals);

    if (approvedProposals.has(proposalId)) {
      newApproved.delete(proposalId);
      newRejected.add(proposalId);
    } else {
      newRejected.delete(proposalId);
      newApproved.add(proposalId);
    }

    setApprovedProposals(newApproved);
    setRejectedProposals(newRejected);
  };

  const handleApproveAll = () => {
    // Only update real runs, not mock data
    const isRealRun = state.runs.some(run => run.run_id === selectedRun);
    
    if (selectedRun && isRealRun) {
      dispatch(appActions.updateRun(selectedRun, { 
        status: 'completed',
        score: 92
      }));
    }
    setShowExportOptions(true);
  };

  const handleClearSavedState = () => {
    // Clear all saved state
    localStorage.removeItem(STORAGE_KEYS.FINAL_APPROVAL_STATE);
    localStorage.removeItem(STORAGE_KEYS.REDLINE_DETAILS);
    localStorage.removeItem(STORAGE_KEYS.APPROVAL_DECISIONS);
    
    // Reset all state
    setSelectedRun('');
    setRedlineDetails(null);
    setApprovedProposals(new Set());
    setRejectedProposals(new Set());
    setProposalComments({});
    setApprovalNotes('');
    setShowExportOptions(false);
    setExportComplete(false);
  };

  const handleExport = (format: string) => {
    // In real implementation, this would call: api.exportRedline(runId, format)
    setExportComplete(true);
  };

  const handleDownload = (filename: string, format: string) => {
    // Create mock file content based on format
    let content = '';
    let mimeType = '';

    switch (format) {
      case 'docx':
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        // For demo purposes, create a simple text representation
        content = `REDLINED DOCUMENT
================

Document: ${redlineDetails?.doc_name || 'Unknown Document'}
Run ID: ${redlineDetails?.run_id || 'Unknown'}
Agent Path: ${redlineDetails?.agent_path || 'Unknown'}
Generated: ${new Date().toISOString()}

REDLINE PROPOSALS
================

${redlineDetails?.proposals?.map((proposal: any, index: number) => `
${index + 1}. ${proposal.clause_heading}
   Clause ID: ${proposal.clause_id}
   Risk Level: ${proposal.risk_level}
   Status: ${approvedProposals.has(proposal.proposal_id) ? 'APPROVED' : rejectedProposals.has(proposal.proposal_id) ? 'REJECTED' : 'PENDING'}
   
   Original Text:
   ${proposal.original_text}
   
   Proposed Text:
   ${proposal.proposed_text}
   
   Rationale:
   ${proposal.rationale}
`).join('\n') || 'No proposals available'}

APPROVAL SUMMARY
===============
Total Proposals: ${redlineDetails?.proposals?.length || 0}
Approved: ${approvedProposals.size}
Rejected: ${rejectedProposals.size}
Pending: ${(redlineDetails?.proposals?.length || 0) - approvedProposals.size - rejectedProposals.size}

This is a mock DOCX file. In production, this would be a properly formatted Word document with redlining markup.
`;
        break;
      case 'pdf':
        mimeType = 'application/pdf';
        content = `SUMMARY MEMO
============

Document Review Summary
Run ID: ${redlineDetails?.run_id || 'Unknown'}
Document: ${redlineDetails?.doc_name || 'Unknown Document'}
Review Date: ${new Date().toLocaleDateString()}
Agent Path: ${redlineDetails?.agent_path || 'Unknown'}

EXECUTIVE SUMMARY
================
${redlineDetails?.memo?.executive_summary || 'This document has been reviewed for compliance with company policies and legal requirements.'}

RISK ASSESSMENT
===============
${redlineDetails?.memo?.risk_assessment || 'The document contains several clauses that require attention due to potential legal or business risks.'}

RECOMMENDATIONS
==============
${redlineDetails?.memo?.recommendations?.map((rec: string, idx: number) => `${idx + 1}. ${rec}`).join('\n') || '1. Review all high-risk clauses\n2. Update liability limitations\n3. Add data retention clauses'}

APPROVAL STATUS
==============
Total Clauses Reviewed: ${redlineDetails?.proposals?.length || 0}
High Risk Items: ${redlineDetails?.proposals?.filter((p: any) => p.risk_level === 'HIGH').length || 0}
Medium Risk Items: ${redlineDetails?.proposals?.filter((p: any) => p.risk_level === 'MEDIUM').length || 0}
Low Risk Items: ${redlineDetails?.proposals?.filter((p: any) => p.risk_level === 'LOW').length || 0}

This is a mock PDF file. In production, this would be a properly formatted PDF document.
`;
        break;
      case 'csv':
        mimeType = 'text/csv';
        const csvHeaders = 'Clause ID,Clause Heading,Risk Level,Status,Original Text,Proposed Text,Rationale,Approval Notes';
        const csvRows = redlineDetails?.proposals?.map((proposal: any) => {
          const status = approvedProposals.has(proposal.proposal_id) ? 'APPROVED' : 
                        rejectedProposals.has(proposal.proposal_id) ? 'REJECTED' : 'PENDING';
          const notes = proposalComments[proposal.proposal_id] || '';
          return [
            proposal.clause_id,
            `"${proposal.clause_heading}"`,
            proposal.risk_level,
            status,
            `"${proposal.original_text?.replace(/"/g, '""') || ''}"`,
            `"${proposal.proposed_text?.replace(/"/g, '""') || ''}"`,
            `"${proposal.rationale?.replace(/"/g, '""') || ''}"`,
            `"${notes.replace(/"/g, '""')}"`
          ].join(',');
        }) || [];
        content = [csvHeaders, ...csvRows].join('\n');
        break;
      default:
        mimeType = 'text/plain';
        content = 'Mock file content';
    }

    // Create blob and download
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                Final Approval Gate
              </h1>
              {pendingRuns.length === 0 && (
                <span className="px-3 py-1 text-sm font-medium bg-orange-100 text-orange-800 rounded-full">
                  Mock
                </span>
              )}
            </div>
            <p className="text-gray-600">
              Review and approve redlined contract proposals before export
            </p>
          </div>
          {selectedRun && redlineDetails && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Work in Progress
              </div>
              <button
                onClick={handleClearSavedState}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
                title="Clear saved state and start fresh"
              >
                Clear Saved State
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card bg-orange-50 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600">Pending Approval</p>
              <p className="text-2xl font-bold text-orange-700">{displayRuns.length}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Total Runs</p>
              <p className="text-2xl font-bold text-blue-700">{state.runs.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Approved</p>
              <p className="text-2xl font-bold text-green-700">{approvedProposals.size}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Rejected</p>
              <p className="text-2xl font-bold text-red-700">{rejectedProposals.size}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Pending Reviews */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Clock className="w-6 h-6 text-orange-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">
              Pending Final Approval
            </h2>
            <div className="ml-3 flex items-center text-xs text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
              Live
            </div>
          </div>
          {selectedRun && (
            <div className="text-sm text-gray-600">
              Selected: {selectedRun}
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3">
          {displayRuns.map((review) => (
            <button
              key={review.run_id}
              onClick={() => handleLoadRedline(review.run_id)}
              className={`flex items-center justify-between p-4 border-2 rounded-lg text-left transition-all ${
                selectedRun === review.run_id
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{review.doc_name}</p>
                  <p className="text-xs text-gray-500 font-mono mt-1">
                    {review.run_id}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <p className="text-gray-600 text-xs">Agent</p>
                  <p className="font-medium text-gray-900">
                    {review.agent_path.replace("_", "-")}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-xs">Score</p>
                  <p className="font-semibold text-gray-900">
                    {review.score}/100
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-xs">Proposals</p>
                  <p className="font-medium text-gray-900">
                    {review.total_proposals}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-xs">Time</p>
                  <p className="text-gray-700" suppressHydrationWarning>
                    {new Date(review.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Redline Details */}
      {redlineDetails && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total Clauses</p>
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {redlineDetails.summary.total_clauses}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {redlineDetails.summary.proposals_generated} proposals
              </p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Risk Reduction</p>
                <AlertTriangle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-600">
                {redlineDetails.summary.estimated_risk_reduction}
              </p>
              <p className="text-sm text-gray-600 mt-1">After redlines</p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Approval Status</p>
                <CheckCircle className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {approvedProposals.size}/{redlineDetails.proposals.length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Approved</p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Score</p>
                <ThumbsUp className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {redlineDetails.score}/100
              </p>
              <p className="text-sm text-gray-600 mt-1">Quality rating</p>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="card mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Executive Summary
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Overview</h4>
                <p className="text-sm text-gray-700">
                  {redlineDetails.memo.executive_summary}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Risk Assessment
                </h4>
                <p className="text-sm text-gray-700">
                  {redlineDetails.memo.risk_assessment}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Recommendations
                </h4>
                <ul className="space-y-1">
                  {redlineDetails.memo.recommendations.map(
                    (rec: string, idx: number) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>{rec}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Proposals */}
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Edit3 className="w-6 h-6 text-primary-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Redline Proposals ({redlineDetails.proposals.length})
                </h2>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const allIds = new Set(
                      redlineDetails.proposals.map((p: any) => p.proposal_id)
                    );
                    setApprovedProposals(allIds);
                    setRejectedProposals(new Set());
                  }}
                  className="btn-secondary text-sm flex items-center"
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Approve All
                </button>
                <button
                  onClick={() => {
                    const allIds = new Set(
                      redlineDetails.proposals.map((p: any) => p.proposal_id)
                    );
                    setRejectedProposals(allIds);
                    setApprovedProposals(new Set());
                  }}
                  className="btn-secondary text-sm flex items-center"
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  Reject All
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {redlineDetails.proposals.map((proposal: any, index: number) => {
                const isApproved = approvedProposals.has(proposal.proposal_id);
                const isRejected = rejectedProposals.has(proposal.proposal_id);

                return (
                  <div
                    key={proposal.proposal_id}
                    className={`border-2 rounded-lg overflow-hidden transition-all ${
                      isApproved
                        ? "border-green-300 bg-green-50"
                        : isRejected
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200"
                    }`}
                  >
                    {/* Proposal Header */}
                    <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold text-gray-900">
                              {proposal.clause_heading}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded border ${getRiskColor(
                                proposal.risk_level
                              )}`}
                            >
                              {proposal.risk_level}
                            </span>
                            <span className="text-xs text-gray-500 font-mono">
                              {proposal.clause_id}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Variant: {proposal.variant} • Reviewer:{" "}
                            {proposal.reviewer_notes}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleToggleApproval(proposal.proposal_id)
                        }
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                          isApproved
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : isRejected
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {isApproved ? (
                          <span className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approved
                          </span>
                        ) : isRejected ? (
                          <span className="flex items-center">
                            <XCircle className="w-4 h-4 mr-2" />
                            Rejected
                          </span>
                        ) : (
                          "Review"
                        )}
                      </button>
                    </div>

                    {/* Proposal Details */}
                    <div className="p-4 space-y-4">
                      {/* Original Text */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center">
                          <XCircle className="w-3 h-3 mr-1 text-red-600" />
                          Original Text
                        </label>
                        <div className="mt-1 text-sm text-gray-700 bg-red-50 p-3 rounded border border-red-200">
                          {proposal.original_text}
                        </div>
                      </div>

                      {/* Proposed Text */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                          Proposed Text
                        </label>
                        <div className="mt-1 text-sm text-gray-700 bg-green-50 p-3 rounded border border-green-200">
                          {proposal.proposed_text}
                        </div>
                      </div>

                      {/* Rationale */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          Rationale
                        </label>
                        <p className="mt-1 text-sm text-gray-700 bg-blue-50 p-3 rounded border border-blue-200">
                          {proposal.rationale}
                        </p>
                      </div>

                      {/* Policy References */}
                      <div className="flex flex-wrap gap-2">
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          Policy References:
                        </label>
                        {proposal.policy_refs.map((ref: string, idx: number) => (
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
                          placeholder="Add any notes or concerns about this proposal..."
                          value={proposalComments[proposal.proposal_id] || ""}
                          onChange={(e) =>
                            setProposalComments({
                              ...proposalComments,
                              [proposal.proposal_id]: e.target.value,
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

          {/* Final Approval Section */}
          {!showExportOptions && (
            <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200">
              <div className="flex items-center mb-4">
                <User className="w-6 h-6 text-primary-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Final Approval Notes
                </h3>
              </div>
              <textarea
                className="input mb-4"
                rows={4}
                placeholder="Add any final notes, instructions, or concerns before approving..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
              />
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  <p className="font-semibold mb-1">Review Summary:</p>
                  <p>
                    ✓ {approvedProposals.size} proposals approved
                    {rejectedProposals.size > 0 &&
                      ` • ✗ ${rejectedProposals.size} rejected`}
                  </p>
                </div>
                <button
                  onClick={handleApproveAll}
                  disabled={approvedProposals.size === 0}
                  className="btn-primary flex items-center text-lg py-3 px-6"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Approve & Export
                </button>
              </div>
            </div>
          )}

          {/* Export Options */}
          {showExportOptions && !exportComplete && (
            <div className="card bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
              <div className="flex items-center mb-4">
                <Download className="w-6 h-6 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Export Redlined Document
                </h3>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Select format to export the approved redlined contract and
                summary memo:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => handleExport("docx")}
                  className="card hover:shadow-lg transition-shadow text-center p-6"
                >
                  <FileText className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <p className="font-semibold text-gray-900">Microsoft Word</p>
                  <p className="text-xs text-gray-600 mt-1">.DOCX format</p>
                </button>
                <button
                  onClick={() => handleExport("pdf")}
                  className="card hover:shadow-lg transition-shadow text-center p-6"
                >
                  <FileText className="w-12 h-12 text-red-600 mx-auto mb-3" />
                  <p className="font-semibold text-gray-900">PDF</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Portable Document Format
                  </p>
                </button>
                <button
                  onClick={() => handleExport("md")}
                  className="card hover:shadow-lg transition-shadow text-center p-6"
                >
                  <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="font-semibold text-gray-900">Markdown</p>
                  <p className="text-xs text-gray-600 mt-1">.MD format</p>
                </button>
              </div>
            </div>
          )}

          {/* Export Complete */}
          {exportComplete && (
            <div className="card bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
              <div className="flex items-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Export Complete!
                  </h3>
                  <p className="text-sm text-gray-600">
                    Your redlined document is ready for download
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Generated Files:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center justify-between">
                      <span className="flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-blue-600" />
                        SaaS_MSA_v2_REDLINED.docx
                      </span>
                      <button 
                        onClick={() => handleDownload('SaaS_MSA_v2_REDLINED.docx', 'docx')}
                        className="text-primary-600 hover:text-primary-700 font-medium flex items-center transition-colors"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </button>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-blue-600" />
                        Summary_Memo.pdf
                      </span>
                      <button 
                        onClick={() => handleDownload('Summary_Memo.pdf', 'pdf')}
                        className="text-primary-600 hover:text-primary-700 font-medium flex items-center transition-colors"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </button>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-blue-600" />
                        Decision_Card.csv
                      </span>
                      <button 
                        onClick={() => handleDownload('Decision_Card.csv', 'csv')}
                        className="text-primary-600 hover:text-primary-700 font-medium flex items-center transition-colors"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </button>
                    </li>
                  </ul>
                </div>
                <div className="flex space-x-3">
                  <Link
                    href={`/run/${redlineDetails.run_id}`}
                    className="btn-primary flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Run Details
                  </Link>
                  <Link href="/reports" className="btn-secondary flex items-center">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Go to Reports
                  </Link>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!redlineDetails && (
        <div className="card text-center py-12">
          <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">No review selected</p>
          <p className="text-sm text-gray-500">
            Select a pending review from the list above to begin final approval
          </p>
        </div>
      )}
    </div>
  );
}
