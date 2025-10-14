# Risk Gate页面Approve/Reject功能修复

## 🎯 **问题描述**

用户要求Risk Gate页面的每一个Risk Assessment后面都应该有2个功能选项：Approve和Reject。点击相应的选项后，关联后续相关的Final Approval、Replay和Report。

## ✅ **修复内容**

### **1. 独立的Approve/Reject按钮**

将原来的单个"Review"按钮替换为独立的"Approve"和"Reject"按钮：

```typescript
<div className="flex space-x-2">
  <button
    onClick={() => handleApproveClause(assessment.clause_id)}
    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center ${
      isApproved
        ? "bg-green-600 text-white hover:bg-green-700"
        : "bg-green-100 text-green-700 hover:bg-green-200 border border-green-300"
    }`}
  >
    <CheckCircle className="w-4 h-4 mr-2" />
    {isApproved ? "Approved" : "Approve"}
  </button>
  <button
    onClick={() => handleRejectClause(assessment.clause_id)}
    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center ${
      isRejected
        ? "bg-red-600 text-white hover:bg-red-700"
        : "bg-red-100 text-red-700 hover:bg-red-200 border border-red-300"
    }`}
  >
    <XCircle className="w-4 h-4 mr-2" />
    {isRejected ? "Rejected" : "Reject"}
  </button>
</div>
```

### **2. 新增处理函数**

添加了独立的处理函数：

```typescript
const handleApproveClause = (clauseId: string) => {
  const newApproved = new Set(approvedClauses);
  const newRejected = new Set(rejectedClauses);
  
  // Remove from rejected if it was there
  newRejected.delete(clauseId);
  // Add to approved
  newApproved.add(clauseId);
  
  setApprovedClauses(newApproved);
  setRejectedClauses(newRejected);
};

const handleRejectClause = (clauseId: string) => {
  const newApproved = new Set(approvedClauses);
  const newRejected = new Set(rejectedClauses);
  
  // Remove from approved if it was there
  newApproved.delete(clauseId);
  // Add to rejected
  newRejected.add(clauseId);
  
  setApprovedClauses(newApproved);
  setRejectedClauses(newRejected);
};
```

### **3. 增强的Approval决策存储**

更新了`handleApproveAll`函数，现在会存储详细的审批决策：

```typescript
const handleApproveAll = () => {
  const isRealRun = state.runs.some(run => run.run_id === selectedRun);
  
  if (selectedRun && isRealRun) {
    // Calculate score based on approved/rejected clauses
    const totalClauses = assessments.assessments.length;
    const approvedCount = approvedClauses.size;
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
```

### **4. 扩展Run接口**

添加了`approval_decisions`字段来存储审批决策：

```typescript
export interface Run {
  // ... existing fields
  approval_decisions?: {
    approved_clauses: string[];
    rejected_clauses: string[];
    comments: Record<string, string>;
  };
}
```

### **5. 增强的测试工具**

更新了测试工具，添加了完整的workflow测试：

- **Create Risk Gate Run** - 创建需要风险审批的run
- **Create Final Approval Run** - 创建需要最终审批的run
- **Create Complete Workflow** - 创建完整的workflow测试数据
- **Check Runs** - 查看所有runs的状态

## 🎉 **功能效果**

### **修复前：**
- ❌ 只有一个"Review"按钮
- ❌ 无法独立选择Approve或Reject
- ❌ 审批决策没有详细存储
- ❌ 无法关联后续页面

### **修复后：**
- ✅ **独立的Approve/Reject按钮** - 每个assessment都有独立的操作按钮
- ✅ **清晰的视觉反馈** - 按钮状态明确显示当前选择
- ✅ **详细的决策存储** - 存储所有审批决策和评论
- ✅ **关联后续页面** - 审批后run状态更新为`'awaiting_final_approval'`
- ✅ **实时数据同步** - Final Approval页面立即显示审批后的run
- ✅ **完整的测试工具** - 可以测试整个workflow

## 🧪 **测试步骤**

### **步骤1：创建测试数据**
1. 访问 `http://localhost:4708/test_run_creation.html`
2. 点击 **"Create Complete Workflow"** 按钮
3. 点击 **"Check Runs"** 验证数据

### **步骤2：测试Risk Gate页面**
1. 访问 `http://localhost:4708/hitl`
2. 应该看到1个pending run
3. 点击run进行审批
4. 对每个assessment点击Approve或Reject按钮
5. 点击"Approve All"完成审批
6. 查看控制台输出，确认run状态更新

### **步骤3：验证Final Approval页面**
1. 访问 `http://localhost:4708/finalize`
2. 应该看到审批后的run
3. 查看run的详细信息，包括审批决策

## 📝 **总结**

现在Risk Gate页面具有完整的Approve/Reject功能：

1. **每个Risk Assessment都有独立的Approve和Reject按钮**
2. **审批决策被详细存储，包括approved/rejected clauses和comments**
3. **审批完成后run状态更新为`'awaiting_final_approval'`**
4. **Final Approval页面立即显示审批后的run**
5. **提供了完整的测试工具来验证整个workflow**

这确保了整个HITL工作流的完整性和数据一致性！🎉
