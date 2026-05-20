# GitHub Release Checklist

## Before Push

- [ ] No real API key in committed files.
- [ ] `pnpm lint` passes.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm test` passes.
- [ ] `pnpm build` passes.
- [ ] README quickstart works.
- [ ] Supabase migration is present.
- [ ] Sample dataset is present.
- [ ] Mock provider demo works without secrets.

## If Remote Exists

```bash
git checkout -b feat/agenteval-lite-mvp
git add .
git commit -m "feat: implement AgentEval Lite MVP"
git push origin feat/agenteval-lite-mvp
```

## If Remote Does Not Exist

```bash
git remote add origin git@github.com:dewensong/agent-eval-lite.git
git branch -M main
git push -u origin main
```
