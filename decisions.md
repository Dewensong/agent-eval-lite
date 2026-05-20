# 关键决策

## 记录规则
当项目出现重要取舍时，在这里记录：
- 决策是什么
- 为什么这么选
- 放弃了什么方案
- 后续如果反悔，应该看什么信号

## 决策列表

### 2026-05-20：V0.1 锁定为轻量 Prompt / Agent Eval Workbench
- 决策：第一版只做 Prompt / Provider / Dataset / Assertion / Eval Run / Result Matrix / Run Detail / Compare Report 闭环。
- 原因：控制复杂度，避免变成大而全 LLMOps 平台。
- 放弃：多 Agent 编排、RAG、MCP、完整 Observability SDK、团队权限、插件市场、LLM-as-judge。
- 反悔信号：V0.1 闭环稳定后，用户明确需要更强实验管理或外部工具接入。

### 2026-05-20：数据层采用 Supabase schema + 本地演示数据
- 决策：Supabase PostgreSQL 是正式持久化目标；V0.1 同时保留 mock provider 和 sample dataset 便于无密钥演示。
- 原因：兼顾真实架构、可测试性和截图展示门槛。
- 放弃：纯本地 JSON 存储作为主架构；严格依赖 Supabase 才能启动。
- 反悔信号：开始实现真实多人协作、云端部署或生产级数据隔离。
