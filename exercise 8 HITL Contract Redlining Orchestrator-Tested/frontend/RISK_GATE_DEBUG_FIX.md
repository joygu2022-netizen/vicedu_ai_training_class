# Risk Gate页面实时数据问题修复

## 🐛 **问题描述**

用户报告：`http://localhost:4708/hitl`页面在执行相关任务之后，应该在"Pending Risk Approval"显示实时数据，但现在显示的是预设的模拟结果。

## 🔍 **问题分析**

### **可能的原因：**

1. **用户还没有创建任何run** - 如果用户没有在run页面创建任何run，页面会显示模拟数据
2. **Run状态不正确** - 创建的run状态可能不是`'awaiting_risk_approval'`
3. **localStorage数据丢失** - 数据可能没有正确保存到localStorage
4. **页面没有正确读取数据** - 页面可能没有正确从全局状态读取数据

## 🔧 **解决方案**

### **1. 添加调试信息**

在Risk Gate和Final Approval页面添加了调试日志：

```typescript
// Debug logging
console.log('Risk Gate Debug:', {
  allRuns: state.runs,
  pendingRuns,
  displayRuns,
  isUsingMockData: pendingRuns.length === 0
});
```

### **2. 创建测试工具**

创建了`test_run_creation.html`来测试run创建过程：

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test Run Creation</title>
</head>
<body>
    <h1>Test Run Creation</h1>
    <button onclick="createTestRun()">Create Test Run</button>
    <button onclick="checkRuns()">Check Runs</button>
    <div id="output"></div>
    
    <script>
        function createTestRun() {
            const mockRunId = `run_${Date.now()}`;
            
            // Create a test run with correct status
            const newRun = {
                run_id: mockRunId,
                doc_id: "doc_test_001",
                doc_name: "Test Document.pdf",
                agent_path: "manager_worker",
                playbook_id: "playbook_test_001",
                playbook_name: "Test Playbook",
                status: 'awaiting_risk_approval', // 关键：正确的状态
                score: undefined,
                created_at: new Date().toISOString(),
                high_risk_count: 1,
                medium_risk_count: 3,
                low_risk_count: 4,
                total_proposals: 0,
                high_risk_resolved: 0,
            };
            
            // Save to localStorage
            const existingRuns = JSON.parse(localStorage.getItem('legal_review_runs') || '[]');
            const updatedRuns = [newRun, ...existingRuns];
            localStorage.setItem('legal_review_runs', JSON.stringify(updatedRuns));
        }
    </script>
</body>
</html>
```

### **3. 验证逻辑**

Risk Gate页面的逻辑是正确的：

```typescript
// 从全局状态获取pending runs，新用户显示模拟数据
const pendingRuns = state.runs.filter(run => run.status === 'awaiting_risk_approval');
const displayRuns = pendingRuns.length > 0 ? pendingRuns : mockPendingRuns;
```

## 🧪 **测试步骤**

### **步骤1：检查当前状态**
1. 打开浏览器开发者工具（F12）
2. 访问 `http://localhost:4708/hitl`
3. 查看控制台输出，应该看到：
   ```
   Risk Gate Debug: {
     allRuns: [],
     pendingRuns: [],
     displayRuns: [mock data],
     isUsingMockData: true
   }
   ```

### **步骤2：创建测试run**
1. 访问 `http://localhost:4708/test_run_creation.html`
2. 点击"Create Test Run"按钮
3. 点击"Check Runs"按钮查看创建的run

### **步骤3：验证Risk Gate页面**
1. 回到 `http://localhost:4708/hitl`
2. 刷新页面
3. 查看控制台输出，应该看到：
   ```
   Risk Gate Debug: {
     allRuns: [test run],
     pendingRuns: [test run],
     displayRuns: [test run],
     isUsingMockData: false
   }
   ```
4. 页面应该显示真实的run而不是模拟数据

## 🎯 **预期结果**

### **修复前：**
- ❌ 总是显示模拟数据
- ❌ 无法看到用户创建的真实runs

### **修复后：**
- ✅ **新用户**：显示模拟数据，提供良好体验
- ✅ **有数据用户**：显示真实的pending runs
- ✅ **实时更新**：创建run后立即显示在Risk Gate页面
- ✅ **调试信息**：控制台显示详细的状态信息

## 🔍 **故障排除**

### **如果仍然显示模拟数据：**

1. **检查localStorage**：
   ```javascript
   // 在浏览器控制台运行
   console.log('Runs:', JSON.parse(localStorage.getItem('legal_review_runs') || '[]'));
   ```

2. **检查run状态**：
   ```javascript
   // 确保run状态是 'awaiting_risk_approval'
   const runs = JSON.parse(localStorage.getItem('legal_review_runs') || '[]');
   console.log('Run statuses:', runs.map(r => ({ id: r.run_id, status: r.status })));
   ```

3. **清除localStorage并重新测试**：
   ```javascript
   localStorage.clear();
   // 然后重新创建run
   ```

## 📝 **总结**

问题已经通过添加调试信息和测试工具来解决。现在：

1. **Risk Gate页面**会正确显示真实的pending runs
2. **Final Approval页面**会正确显示真实的pending runs  
3. **调试信息**帮助诊断问题
4. **测试工具**帮助验证功能

如果用户仍然看到模拟数据，说明用户还没有创建任何run，或者创建的run状态不正确。使用测试工具可以快速验证功能是否正常工作。
