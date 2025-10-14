#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// 获取端口参数，默认为4708
const port = process.argv[2] || '4708';

console.log(`🚀 Starting frontend on port ${port}...`);

// 启动Next.js开发服务器
const child = spawn('npx', ['next', 'dev', '--turbopack', '-p', port], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname)
});

child.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`\n🛑 Server stopped with code ${code}`);
  process.exit(code);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  child.kill('SIGTERM');
});
