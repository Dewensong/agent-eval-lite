# 项目背景

## 项目目标
实现 AgentEval Lite：一个轻量级、可视化、中文友好、适合开源维护和简历展示的 Prompt / Agent 评测工作台。

## 适用场景
- AI 产品经理：把 Prompt 迭代从“凭感觉”变成可评测、可对比的流程。
- AI 应用开发者：用轻量工具管理测试集、断言、批量评测和结果矩阵。
- 开源展示：体现对 promptfoo、Langfuse、Phoenix、Opik 等成熟项目机制的理解与场景适配。

## 当前约束
- 时间：先完成 V0.1 MVP，不扩展到大而全平台。
- 资源：本地演示必须能在无真实 API Key 的情况下通过 mock provider 跑通。
- 技术：Next.js App Router、TypeScript、Tailwind、Zod、Supabase SQL schema、Vitest。
- 协作：保留项目协作文档，重要推进更新 `progress.md` / `decisions.md`。

## 验收标准
- 可本地运行和截图。
- Prompt / Provider / Dataset / Assertion / Eval Run / Result Matrix / Run Detail / Compare Report 闭环可展示。
- `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build` 有新鲜验证结果。
- README 包含开源项目定位、快速开始、数据库配置、Roadmap 和简历展示建议。

## 重要背景
AgentEval Lite 不是重新造 Dify / Langfuse / promptfoo，而是借鉴成熟项目中已经验证过的 Prompt 评测、Trace、Dataset、Experiment、Assertion 等机制，做一个更轻量的评测工作台。
