"use client";

import { useState, useEffect } from "react";
import { useApp } from "../../contexts/AppContext";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Users,
  FileText,
  Activity,
  Zap,
  RefreshCw,
} from "lucide-react";

// Mock data for demonstration
const mockData = {
  summary: {
    totalRuns: 147,
    totalDocuments: 89,
    avgScore: 87.3,
    totalCost: 342.56,
    successRate: 94.2,
    avgLatency: 2847,
  },
  performance: {
    p50_latency_ms: 2340,
    p95_latency_ms: 4820,
    p99_latency_ms: 6150,
    avg_latency_ms: 2847,
    min_latency_ms: 1240,
    max_latency_ms: 8930,
  },
  quality: {
    reviewer_pass_rate: 0.942,
    policy_match_precision: 0.891,
    high_risk_mitigation_rate: 0.876,
    avg_clauses_per_doc: 23.4,
    avg_rework_loops: 1.3,
  },
  cost: {
    total_usd: 342.56,
    avg_per_document: 3.85,
    avg_per_run: 2.33,
    by_agent_path: {
      manager_worker: 128.45,
      planner_executor: 142.78,
      reviewer_referee: 71.33,
    },
    trend_7d: -12.3, // percentage change
  },
  recentRuns: [
    {
      run_id: "run_abc123",
      doc_name: "SaaS_MSA_v2.pdf",
      agent_path: "manager_worker",
      score: 92,
      latency_ms: 2340,
      cost_usd: 3.45,
      status: "completed",
      timestamp: "2025-10-06T10:23:45Z",
    },
    {
      run_id: "run_def456",
      doc_name: "NDA_Template.docx",
      agent_path: "planner_executor",
      score: 88,
      latency_ms: 3120,
      cost_usd: 4.12,
      status: "completed",
      timestamp: "2025-10-06T09:15:22Z",
    },
    {
      run_id: "run_ghi789",
      doc_name: "DPA_GDPR.pdf",
      agent_path: "reviewer_referee",
      score: 85,
      latency_ms: 4820,
      cost_usd: 5.67,
      status: "completed",
      timestamp: "2025-10-06T08:42:11Z",
    },
    {
      run_id: "run_jkl012",
      doc_name: "Service_Agreement.pdf",
      agent_path: "manager_worker",
      score: 90,
      latency_ms: 2890,
      cost_usd: 3.89,
      status: "completed",
      timestamp: "2025-10-06T07:33:56Z",
    },
    {
      run_id: "run_mno345",
      doc_name: "Partnership_Contract.docx",
      agent_path: "planner_executor",
      score: 78,
      latency_ms: 5230,
      cost_usd: 6.23,
      status: "failed",
      timestamp: "2025-10-06T06:18:34Z",
    },
  ],
  agentPathStats: [
    {
      name: "Manager–Worker",
      runs: 56,
      avg_score: 89.2,
      avg_latency: 2456,
      success_rate: 96.4,
      cost: 128.45,
    },
    {
      name: "Planner–Executor",
      runs: 62,
      avg_score: 86.7,
      avg_latency: 3124,
      success_rate: 93.5,
      cost: 142.78,
    },
    {
      name: "Reviewer/Referee",
      runs: 29,
      avg_score: 85.1,
      avg_latency: 3890,
      success_rate: 91.2,
      cost: 71.33,
    },
  ],
};

export default function ReportsPage() {
  const { state } = useApp();
  const [timeRange, setTimeRange] = useState("7d");
  const [refreshing, setRefreshing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if user has any real data
  const hasRealData = state.runs.length > 0;
  const isNewUser = !hasRealData;

  // Initialize component
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Auto-refresh data every 30 seconds for real users
  useEffect(() => {
    if (!isNewUser) {
      const interval = setInterval(() => {
        console.log('Auto-refreshing reports data...');
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isNewUser]);

  // Calculate real-time statistics from actual data
  const calculateRealTimeStats = () => {
    if (isNewUser) {
      return mockData;
    }

    const runs = state.runs;
    const completedRuns = runs.filter(run => run.status === 'completed');
    const documents = state.documents;

    // Calculate summary statistics
    const totalRuns = runs.length;
    const totalDocuments = documents.length;
    const avgScore = completedRuns.length > 0 
      ? completedRuns.reduce((sum, run) => sum + (run.score || 0), 0) / completedRuns.length 
      : 0;
    const successRate = totalRuns > 0 ? (completedRuns.length / totalRuns) * 100 : 0;

    // Mock cost calculation (in real app, this would come from actual cost data)
    const totalCost = completedRuns.length * 3.85; // $3.85 per completed run
    const avgCostPerDocument = totalDocuments > 0 ? totalCost / totalDocuments : 0;

    // Calculate performance metrics (mock latency data)
    const avgLatency = 2847; // Mock average latency
    const p50Latency = Math.round(avgLatency * 0.8);
    const p95Latency = Math.round(avgLatency * 1.7);
    const p99Latency = Math.round(avgLatency * 2.2);

    // Calculate quality metrics (mock data based on real runs)
    const reviewerPassRate = Math.min(0.95, 0.8 + (avgScore / 100) * 0.15);
    const policyMatchPrecision = Math.min(0.95, 0.75 + (avgScore / 100) * 0.2);
    const highRiskMitigationRate = Math.min(0.95, 0.7 + (avgScore / 100) * 0.25);

    // Calculate agent path statistics
    const agentPathStats = [
      {
        name: "Manager–Worker",
        runs: runs.filter(run => run.agent_path === 'manager_worker').length,
        avg_score: runs.filter(run => run.agent_path === 'manager_worker' && run.status === 'completed')
          .reduce((sum, run) => sum + (run.score || 0), 0) / 
          Math.max(1, runs.filter(run => run.agent_path === 'manager_worker' && run.status === 'completed').length),
        avg_latency: Math.round(avgLatency * 0.9),
        success_rate: runs.filter(run => run.agent_path === 'manager_worker').length > 0 
          ? (runs.filter(run => run.agent_path === 'manager_worker' && run.status === 'completed').length / 
             runs.filter(run => run.agent_path === 'manager_worker').length) * 100 
          : 0,
        cost: runs.filter(run => run.agent_path === 'manager_worker' && run.status === 'completed').length * 2.5,
      },
      {
        name: "Planner–Executor",
        runs: runs.filter(run => run.agent_path === 'planner_executor').length,
        avg_score: runs.filter(run => run.agent_path === 'planner_executor' && run.status === 'completed')
          .reduce((sum, run) => sum + (run.score || 0), 0) / 
          Math.max(1, runs.filter(run => run.agent_path === 'planner_executor' && run.status === 'completed').length),
        avg_latency: Math.round(avgLatency * 1.1),
        success_rate: runs.filter(run => run.agent_path === 'planner_executor').length > 0 
          ? (runs.filter(run => run.agent_path === 'planner_executor' && run.status === 'completed').length / 
             runs.filter(run => run.agent_path === 'planner_executor').length) * 100 
          : 0,
        cost: runs.filter(run => run.agent_path === 'planner_executor' && run.status === 'completed').length * 3.2,
      },
      {
        name: "Reviewer/Referee",
        runs: runs.filter(run => run.agent_path === 'reviewer_referee').length,
        avg_score: runs.filter(run => run.agent_path === 'reviewer_referee' && run.status === 'completed')
          .reduce((sum, run) => sum + (run.score || 0), 0) / 
          Math.max(1, runs.filter(run => run.agent_path === 'reviewer_referee' && run.status === 'completed').length),
        avg_latency: Math.round(avgLatency * 1.3),
        success_rate: runs.filter(run => run.agent_path === 'reviewer_referee').length > 0 
          ? (runs.filter(run => run.agent_path === 'reviewer_referee' && run.status === 'completed').length / 
             runs.filter(run => run.agent_path === 'reviewer_referee').length) * 100 
          : 0,
        cost: runs.filter(run => run.agent_path === 'reviewer_referee' && run.status === 'completed').length * 2.8,
      },
    ].filter(stat => stat.runs > 0);

    // Recent runs (last 5 completed runs)
    const recentRuns = completedRuns
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 5)
      .map(run => ({
        run_id: run.run_id,
        doc_name: run.doc_name,
        agent_path: run.agent_path || 'unknown',
        score: run.score || 0,
        latency_ms: Math.round(avgLatency * (0.8 + Math.random() * 0.4)), // Mock latency
        cost_usd: 2.5 + Math.random() * 2, // Mock cost
        status: run.status,
        timestamp: run.created_at || new Date().toISOString(),
      }));

    return {
      summary: {
        totalRuns,
        totalDocuments,
        avgScore: Math.round(avgScore * 10) / 10,
        totalCost: Math.round(totalCost * 100) / 100,
        successRate: Math.round(successRate * 10) / 10,
        avgLatency: avgLatency,
      },
      performance: {
        p50_latency_ms: p50Latency,
        p95_latency_ms: p95Latency,
        p99_latency_ms: p99Latency,
        avg_latency_ms: avgLatency,
        min_latency_ms: Math.round(avgLatency * 0.5),
        max_latency_ms: Math.round(avgLatency * 3),
      },
      quality: {
        reviewer_pass_rate: reviewerPassRate,
        policy_match_precision: policyMatchPrecision,
        high_risk_mitigation_rate: highRiskMitigationRate,
        avg_clauses_per_doc: 23.4, // Mock data
        avg_rework_loops: 1.3, // Mock data
      },
      cost: {
        total_usd: Math.round(totalCost * 100) / 100,
        avg_per_document: Math.round(avgCostPerDocument * 100) / 100,
        avg_per_run: Math.round((totalCost / Math.max(1, totalRuns)) * 100) / 100,
        by_agent_path: {
          manager_worker: agentPathStats.find(s => s.name === "Manager–Worker")?.cost || 0,
          planner_executor: agentPathStats.find(s => s.name === "Planner–Executor")?.cost || 0,
          reviewer_referee: agentPathStats.find(s => s.name === "Reviewer/Referee")?.cost || 0,
        },
        trend_7d: -12.3, // Mock trend data
      },
      recentRuns,
      agentPathStats,
    };
  };

  const realTimeData = calculateRealTimeStats();
  const displayData = isNewUser ? mockData : realTimeData;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // In real implementation, this would call api.getReports()
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to refresh reports:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatLatency = (ms: number) => {
    return `${ms.toLocaleString()}ms`;
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Reports & Analytics
            </h1>
            {isNewUser ? (
              <div className="flex items-center text-sm text-orange-600">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                Demo Mode
              </div>
            ) : (
              <div className="flex items-center text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Live Data
              </div>
            )}
          </div>
          <p className="text-gray-600">
            Performance metrics, quality indicators, and cost analysis
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex space-x-2">
            {["24h", "7d", "30d", "90d"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range
                    ? "bg-primary-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          {!isNewUser && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh reports data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Real-time Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className={`card ${isNewUser ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isNewUser ? 'text-orange-600' : 'text-blue-600'}`}>
                {isNewUser ? 'Demo Runs' : 'Total Runs'}
              </p>
              <p className={`text-2xl font-bold ${isNewUser ? 'text-orange-700' : 'text-blue-700'}`}>
                {displayData.summary.totalRuns}
              </p>
              {isNewUser && (
                <p className="text-xs text-orange-600 mt-1">Mock data</p>
              )}
            </div>
            <Activity className={`w-8 h-8 ${isNewUser ? 'text-orange-600' : 'text-blue-600'}`} />
          </div>
        </div>
        <div className={`card ${isNewUser ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isNewUser ? 'text-orange-600' : 'text-green-600'}`}>
                {isNewUser ? 'Demo Success' : 'Success Rate'}
              </p>
              <p className={`text-2xl font-bold ${isNewUser ? 'text-orange-700' : 'text-green-700'}`}>
                {displayData.summary.successRate}%
              </p>
              {isNewUser && (
                <p className="text-xs text-orange-600 mt-1">Mock data</p>
              )}
            </div>
            <CheckCircle className={`w-8 h-8 ${isNewUser ? 'text-orange-600' : 'text-green-600'}`} />
          </div>
        </div>
        <div className={`card ${isNewUser ? 'bg-orange-50 border-orange-200' : 'bg-purple-50 border-purple-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isNewUser ? 'text-orange-600' : 'text-purple-600'}`}>
                {isNewUser ? 'Demo Score' : 'Avg Score'}
              </p>
              <p className={`text-2xl font-bold ${isNewUser ? 'text-orange-700' : 'text-purple-700'}`}>
                {displayData.summary.avgScore}/100
              </p>
              {isNewUser && (
                <p className="text-xs text-orange-600 mt-1">Mock data</p>
              )}
            </div>
            <BarChart3 className={`w-8 h-8 ${isNewUser ? 'text-orange-600' : 'text-purple-600'}`} />
          </div>
        </div>
        <div className={`card ${isNewUser ? 'bg-orange-50 border-orange-200' : 'bg-indigo-50 border-indigo-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isNewUser ? 'text-orange-600' : 'text-indigo-600'}`}>
                {isNewUser ? 'Demo Docs' : 'Documents'}
              </p>
              <p className={`text-2xl font-bold ${isNewUser ? 'text-orange-700' : 'text-indigo-700'}`}>
                {displayData.summary.totalDocuments}
              </p>
              {isNewUser && (
                <p className="text-xs text-orange-600 mt-1">Mock data</p>
              )}
            </div>
            <FileText className={`w-8 h-8 ${isNewUser ? 'text-orange-600' : 'text-indigo-600'}`} />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Runs</p>
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {displayData.summary.totalRuns}
          </p>
          <p className="text-sm text-green-600 mt-1 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            +12.5% from last period
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Success Rate</p>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {displayData.summary.successRate}%
          </p>
          <p className="text-sm text-green-600 mt-1 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            +2.3% from last period
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Avg Score</p>
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {displayData.summary.avgScore}/100
          </p>
          <p className="text-sm text-green-600 mt-1 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            +4.2 from last period
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Avg Latency (P50)</p>
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatLatency(displayData.performance.p50_latency_ms)}
          </p>
          <p className="text-sm text-green-600 mt-1 flex items-center">
            <TrendingDown className="w-4 h-4 mr-1" />
            -8.4% faster
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Cost</p>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(displayData.cost.total_usd)}
          </p>
          <p className="text-sm text-green-600 mt-1 flex items-center">
            <TrendingDown className="w-4 h-4 mr-1" />
            {Math.abs(displayData.cost.trend_7d)}% lower
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Documents Processed</p>
            <FileText className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {displayData.summary.totalDocuments}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Avg {formatCurrency(displayData.cost.avg_per_document)}/doc
          </p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center mb-6">
            <Zap className="w-6 h-6 text-yellow-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">
              Latency Distribution
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">P50 (Median)</span>
                <span className="font-semibold text-gray-900">
                  {formatLatency(displayData.performance.p50_latency_ms)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: "45%" }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">P95</span>
                <span className="font-semibold text-gray-900">
                  {formatLatency(displayData.performance.p95_latency_ms)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: "75%" }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">P99</span>
                <span className="font-semibold text-gray-900">
                  {formatLatency(displayData.performance.p99_latency_ms)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: "95%" }}
                ></div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Min</p>
                  <p className="font-semibold text-gray-900">
                    {formatLatency(displayData.performance.min_latency_ms)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Max</p>
                  <p className="font-semibold text-gray-900">
                    {formatLatency(displayData.performance.max_latency_ms)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center mb-6">
            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">
              Quality Metrics
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Reviewer Pass Rate</span>
                <span className="font-semibold text-gray-900">
                  {formatPercent(displayData.quality.reviewer_pass_rate)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${displayData.quality.reviewer_pass_rate * 100}%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Policy Match Precision</span>
                <span className="font-semibold text-gray-900">
                  {formatPercent(displayData.quality.policy_match_precision)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${displayData.quality.policy_match_precision * 100}%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">High Risk Mitigation</span>
                <span className="font-semibold text-gray-900">
                  {formatPercent(displayData.quality.high_risk_mitigation_rate)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{
                    width: `${
                      displayData.quality.high_risk_mitigation_rate * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Avg Clauses/Doc</p>
                  <p className="font-semibold text-gray-900">
                    {displayData.quality.avg_clauses_per_doc}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Avg Rework Loops</p>
                  <p className="font-semibold text-gray-900">
                    {displayData.quality.avg_rework_loops}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Path Comparison */}
      <div className="card mb-8">
        <div className="flex items-center mb-6">
          <Users className="w-6 h-6 text-primary-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">
            Agent Path Performance
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Agent Path
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Runs
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Avg Score
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Avg Latency
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Success Rate
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Total Cost
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayData.agentPathStats.map((stat, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {stat.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {stat.runs}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {stat.avg_score}/100
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatLatency(stat.avg_latency)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        stat.success_rate >= 95
                          ? "bg-green-100 text-green-800"
                          : stat.success_rate >= 90
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {stat.success_rate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {formatCurrency(stat.cost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Runs */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Activity className="w-6 h-6 text-primary-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Recent Runs</h2>
            <div className="ml-3 flex items-center text-xs text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
              Live
            </div>
            {isNewUser && (
              <div className="ml-3 flex items-center text-xs text-orange-600">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-1"></div>
                Demo
              </div>
            )}
          </div>
          <div className="text-sm text-gray-600">
            {displayData.recentRuns.length} {isNewUser ? 'demo runs' : 'recent runs'}
          </div>
        </div>
        <div className="space-y-3">
          {displayData.recentRuns.map((run) => (
            <div
              key={run.run_id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    run.status === "completed" ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900 truncate">
                      {run.doc_name}
                    </p>
                    {isNewUser && (
                      <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                        Demo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-mono">
                    {run.run_id}
                  </p>
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
                  <p className="text-gray-600 text-xs">Score</p>
                  <p className="font-semibold text-gray-900">{run.score}/100</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-xs">Latency</p>
                  <p className="font-medium text-gray-900">
                    {formatLatency(run.latency_ms)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-xs">Cost</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(run.cost_usd)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-xs">Time</p>
                  <p className="text-gray-700">
                    {new Date(run.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SLO Summary */}
      <div className="mt-8 card bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-6 h-6 text-primary-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">SLO Status</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Latency SLO (P95)</p>
            <p className="text-2xl font-bold text-green-600">✓ Met</p>
            <p className="text-xs text-gray-500 mt-1">
              Target: &lt;5000ms | Actual: 4820ms
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Quality SLO</p>
            <p className="text-2xl font-bold text-green-600">✓ Met</p>
            <p className="text-xs text-gray-500 mt-1">
              Target: &gt;90% | Actual: 94.2%
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Cost SLO</p>
            <p className="text-2xl font-bold text-green-600">✓ Met</p>
            <p className="text-xs text-gray-500 mt-1">
              Target: &lt;$5/doc | Actual: $3.85/doc
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
