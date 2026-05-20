# 推进记录

## 2026-05-19
- 创建项目骨架
- 初始化 AI 协作文件与目录结构

## 2026-05-20
- 基于 `AgentEval_Lite_Implementation_Brief.md` 明确 V0.1 范围：轻量 Prompt / Agent Eval Workbench。
- 创建 `feat/agenteval-lite-mvp` 分支。
- 初始化 Next.js App Router、TypeScript、Tailwind、Vitest、ESLint、Prettier 工程。
- 实现共享类型、Zod schema、mock provider、OpenAI-compatible adapter、Prompt 渲染、JSON 解析、断言引擎、聚合指标和 eval runner。
- 实现 Dashboard、Prompt Studio、Dataset、Assertions、Evaluation Run、Result Matrix、Run Detail、Compare Report、Settings 页面。
- 增加 Supabase migration、sample dataset、README、License、架构/评测/数据模型/GitHub checklist 文档。
- 下一步：执行 lint/typecheck/test/build，修复质检问题后提交。

## 2026-05-20
- 增加 Docker Desktop 运行配置：`Dockerfile`、`docker-compose.yml`、`.dockerignore`。
- 将 Next.js 配置为 standalone 生产输出，便于容器内运行。
- 下一步：构建镜像并在 Docker Desktop 中验证 `http://localhost:3000`。

## 记录规则
- 每次重要推进追加一条日期记录
- 记录做了什么、产出了什么、下一步是什么
- 不记录无实质价值的临时闲聊
