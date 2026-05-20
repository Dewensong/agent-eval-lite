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

## 2026-05-20
- 将 AgentEval Lite App 可见界面切换为中文默认文案：导航、页面标题、按钮、表格、空状态、演示数据和报告解读。
- 保留 JSON 字段名、OpenAI-compatible 等必要技术术语，避免破坏评测契约和模型适配语义。
- 下一步：重新运行质检并刷新 Docker Desktop 容器。

## 2026-05-20
- 引入 React Context + localStorage 持久化层（`lib/store/app-store.tsx`、`lib/store/storage.ts`）。
- 将所有页面从静态 demo 改造为可 CRUD 的真实工具：
  - Prompt Studio：支持多 Prompt 管理、版本保存/切换/删除、试跑。
  - Datasets：新增/删除测试用例、JSON 导入、测试集管理。
  - Assertions：8 种断言类型的创建/删除。
  - Settings：Provider 新增/编辑/删除，保存到 localStorage。
  - Evaluation Run：下拉选择 Prompt/Provider/Dataset/Assertions 组合，运行结果持久化。
  - Dashboard/Result Matrix/Run Detail/Compare Report：从 store 读取真实数据，支持空状态引导。
- 质检通过：lint 0 warnings、typecheck 0 errors、12 tests passed、build 成功。
- 下一步：启动 dev server 手动验证完整评测闭环，考虑补组件测试和错误边界。

## 记录规则
- 每次重要推进追加一条日期记录
- 记录做了什么、产出了什么、下一步是什么
- 不记录无实质价值的临时闲聊
