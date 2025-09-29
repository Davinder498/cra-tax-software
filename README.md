# CRA Tax Starter (T1 NETFILE skeleton, with EPS & Replit config)

This repository is a **starter scaffold** for building a CRA-certified personal tax (T1) app.  
It **does not** include CRA-confidential material. Instead, it provides:
- A pure **calculation engine** stub with 2025 placeholder tax tables
- An **EPS-style validation** layer (basic rules only; extend with CRA Error Prevention Specs)
- A **NETFILE payload** builder with **placeholders** (replace keys when you receive official specs)
- A minimal **Express backend** exposing `/compute` and `/netfile/prepare`
- A **QA harness** CLI that runs a sample case end-to-end
- **Replit config files** so you can run it in the cloud easily

> Replace placeholder tax figures, add schedules and credits, and wire in CRA-provided schemas once you’ve joined the CRA developer program.

## Monorepo structure
```
packages/
  calc-engine/      # pure math (no I/O)
  validation/       # diagnostics & rule checks (EPS-style)
  payload-netfile/  # payload builder (placeholder keys)
  backend/          # Express API for compute/prepare
  qa-harness/       # CLI runner for local dev
.replit             # replit run command
replit.nix          # replit environment (Node 20 + pnpm)
```

## Getting started (Replit)
1. Create a Repl → Import from ZIP → upload this zip.
2. Open **Shell** and run:
   ```
   pnpm install
   pnpm build
   pnpm qa
   pnpm dev:backend
   ```
3. Open the webview URL and visit `/health` → you should see `{ "ok": true }`.

## Next steps
- Encode real **federal/provincial tables** for your target year.
- Add **schedules** (tuition, spouse, dependents, CAI) and slip mappers (T4, T5, RRSP).
- Expand **EPS rules** per CRA’s Error Prevention Specifications (after NDA).
- Replace payload builder with official **record/XML** structures and **T619**-style transmittal.
- Add **persistence**, **encryption at rest**, and **audit logging**.
- Prepare **CRA test cases** in `qa-harness` once you receive them.

## Security notes
- Never store raw SIN in logs.
- Encrypt PII fields at rest; decrypt just-in-time for transmission.
- Keep CRA credentials and keys in a secrets manager.
