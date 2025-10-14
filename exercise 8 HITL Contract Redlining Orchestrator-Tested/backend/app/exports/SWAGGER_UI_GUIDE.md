# Swagger UI 使用指南

## 📁 文档上传端点 (`POST /api/documents`)

### 问题说明
在 Swagger UI 中测试 `POST /api/documents` 端点时，如果看到 422 验证错误，这是因为该端点期望接收文件上传，而不是 JSON 数据。

### 正确的使用方法

1. **在 Swagger UI 中找到端点**
   - 访问 `http://localhost:8004/docs`
   - 找到 `POST /api/documents` 端点
   - 点击 "Try it out" 按钮

2. **上传文件**
   - 在 "file" 字段中，点击 "Choose File" 按钮
   - 选择一个文本文件（.txt, .md, .docx 等）
   - 点击 "Execute" 按钮

3. **预期响应**
   ```json
   {
     "doc_id": "doc_abc12345",
     "name": "your_file.txt",
     "size": 1024,
     "message": "Document uploaded successfully"
   }
   ```

### 常见错误

❌ **错误做法**: 在 Swagger UI 中直接输入 JSON 数据
```json
{
  "file": "some content"
}
```

✅ **正确做法**: 使用 "Choose File" 按钮选择实际文件

### 支持的文件类型
- `.txt` - 纯文本文件
- `.md` - Markdown 文件
- `.docx` - Word 文档（会尝试解析文本内容）
- 其他文本格式文件

### 文件大小限制
- 最大文件大小: 10MB
- 如果文件过大，会返回 413 错误

### 测试脚本
如果 Swagger UI 有问题，可以使用提供的测试脚本：
```bash
cd backend/app/exports
python test_document_upload.py
```

## 🔧 其他端点

### 健康检查
- `GET /health` - 检查服务状态

### 文档管理
- `GET /api/documents` - 列出所有已上传的文档
- `POST /api/documents` - 上传新文档

### 运行管理
- `POST /api/run` - 启动文档审查流程
- `GET /api/run/{run_id}` - 获取运行状态

### 导出功能
- `POST /api/export/redline` - 导出红线文档（支持 DOCX, PDF, CSV 格式）

## 🚨 故障排除

### 422 验证错误
- 确保使用文件上传而不是 JSON 数据
- 检查文件大小是否超过 10MB
- 确保文件格式是文本类型

### 404 "Document not found" 错误
**原因**: 使用了不存在的 `doc_id`
**解决方案**:
1. 首先调用 `GET /api/documents` 查看可用的文档ID
2. 使用有效的 `doc_id`，例如: `"doc_001"`
3. 确保请求格式正确（JSON，不是表单数据）

**正确的请求格式**:
```json
{
  "doc_id": "doc_001",
  "agent_path": "sequential",
  "playbook_id": "playbook_001"
}
```

**可用的文档ID**:
- `doc_001` - Sample_NDA.md
- `doc_c31f7f71` - test_document.md
- `doc_301a32b1` - bad_document.txt

### 500 内部服务器错误
- 检查服务器日志
- 确保所有依赖已正确安装
- 重启应用程序

### 连接错误
- 确保应用程序正在运行在 `http://localhost:8004`
- 检查防火墙设置
- 验证端口 8004 未被其他程序占用

### Swagger UI 特定问题
1. **刷新页面**: 按 F5 或 Ctrl+F5 强制刷新
2. **清除缓存**: 清除浏览器缓存和Cookie
3. **检查网络**: 确保没有代理或防火墙阻止请求
4. **使用正确的格式**: 确保选择 "application/json" 而不是 "application/x-www-form-urlencoded"

### 测试脚本
如果 Swagger UI 仍有问题，可以使用测试脚本验证API功能：
```bash
cd backend/app/exports
python complete_workflow_test.py
```
