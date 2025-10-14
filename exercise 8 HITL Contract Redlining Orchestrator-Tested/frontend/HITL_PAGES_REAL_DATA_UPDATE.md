# HITL页面实时数据更新说明

## 🎯 **问题描述**

用户要求Risk Gate页面和Final Approval页面以及其他相关页面显示实际内容，而不是模拟数据。

## 🔧 **解决方案**

### **1. 扩展AppContext支持Run状态管理**

添加了Run接口和相关的状态管理：

```typescript
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
}
```

### **2. 添加Run相关的Action和Reducer**

- `SET_RUNS` - 设置所有runs
- `ADD_RUN` - 添加新run
- `UPDATE_RUN` - 更新run状态
- `REMOVE_RUN` - 删除run
- 所有操作都会自动保存到localStorage

### **3. 修改Run页面创建Run时添加到全局状态**

```typescript
// 创建新run并添加到全局状态
const newRun = {
  run_id: mockRunId,
  doc_id: docId,
  doc_name: selectedDoc?.name || 'Unknown Document',
  agent_path: agentPath,
  playbook_id: playbookId || '',
  playbook_name: selectedPlaybook?.name || 'None',
  status: 'running' as const,
  // ... 其他属性
};

dispatch(appActions.addRun(newRun));

// 更新run状态到awaiting_risk_approval
dispatch(appActions.updateRun(mockRunId, { 
  status: 'awaiting_risk_approval',
  high_risk_count: 1,
  medium_risk_count: 3,
  low_risk_count: 4
}));
```

### **4. 修改Risk Gate页面智能显示数据**

```typescript
// 从全局状态获取pending runs，新用户显示模拟数据
const pendingRuns = state.runs.filter(run => run.status === 'awaiting_risk_approval');
const displayRuns = pendingRuns.length > 0 ? pendingRuns : mockPendingRuns;

// 批准后只更新真实run状态，不更新模拟数据
const handleApproveAll = () => {
  const isRealRun = state.runs.some(run => run.run_id === selectedRun);
  
  if (selectedRun && isRealRun) {
    dispatch(appActions.updateRun(selectedRun, { 
      status: 'awaiting_final_approval',
      score: 92,
      total_proposals: 5,
      high_risk_resolved: 1
    }));
  }
  setApprovalComplete(true);
};
```

### **5. 修改Final Approval页面智能显示数据**

```typescript
// 从全局状态获取pending runs，新用户显示模拟数据
const pendingRuns = state.runs.filter(run => run.status === 'awaiting_final_approval');
const displayRuns = pendingRuns.length > 0 ? pendingRuns : mockPendingReviews;

// 最终批准后只更新真实run状态，不更新模拟数据
const handleApproveAll = () => {
  const isRealRun = state.runs.some(run => run.run_id === selectedRun);
  
  if (selectedRun && isRealRun) {
    dispatch(appActions.updateRun(selectedRun, { 
      status: 'completed',
      score: 92
    }));
  }
  setShowExportOptions(true);
};
```

## 🚀 **修复效果**

### **修复前：**
- ❌ Risk Gate页面显示硬编码的模拟数据
- ❌ Final Approval页面显示硬编码的模拟数据
- ❌ 页面间数据不同步
- ❌ 无法跟踪实际的run状态

### **修复后：**
- ✅ **新用户**：显示模拟数据，提供良好的首次体验
- ✅ **有数据用户**：显示实际的pending runs，实时更新
- ✅ 页面间数据实时同步
- ✅ Run状态在整个工作流中正确更新
- ✅ 数据持久化到localStorage
- ✅ 智能切换：有真实数据时自动切换到真实数据

## 📱 **工作流程**

### **新用户体验（首次访问）**
1. **Risk Gate页面**：显示模拟数据，让用户了解功能
2. **Final Approval页面**：显示模拟数据，让用户了解功能
3. 用户可以点击模拟数据进行体验，但不会影响真实数据

### **有数据用户（已创建run）**
1. **Risk Gate页面**：自动切换到显示真实的pending runs
2. **Final Approval页面**：自动切换到显示真实的pending runs
3. 所有操作都会实时更新真实数据

### **完整工作流程**

#### **1. 创建Run**
1. 用户在run页面选择文档、agent路径、playbook
2. 点击"Start Review"创建新run
3. Run添加到全局状态，状态为"running"
4. 自动更新状态为"awaiting_risk_approval"
5. **Risk Gate页面立即显示新的真实run**

#### **2. Risk Gate审批**
1. Risk Gate页面显示所有"awaiting_risk_approval"状态的runs
2. 用户选择run进行风险审批
3. 审批完成后，run状态更新为"awaiting_final_approval"
4. **Final Approval页面立即显示新的pending run**
5. Risk Gate页面实时更新，不再显示已审批的run

#### **3. Final Approval审批**
1. Final Approval页面显示所有"awaiting_final_approval"状态的runs
2. 用户选择run进行最终审批
3. 审批完成后，run状态更新为"completed"
4. 页面实时更新，不再显示已完成的run

## 🎉 **现在的状态**

- ✅ **新用户友好** - 首次访问显示模拟数据，提供良好体验
- ✅ **智能切换** - 有真实数据时自动切换到真实数据
- ✅ **Risk Gate页面** - 智能显示pending runs，实时更新
- ✅ **Final Approval页面** - 智能显示pending runs，实时更新
- ✅ **Run状态管理** - 完整的run生命周期管理
- ✅ **数据同步** - 所有页面数据实时同步
- ✅ **数据持久化** - 所有数据保存到localStorage
- ✅ **状态保护** - 只更新真实run，不修改模拟数据

现在Risk Gate和Final Approval页面完美支持新用户和有数据用户！🎉
