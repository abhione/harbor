# Contributing to Harbor

Harbor welcomes improvements to the contingent-work prototype. Start with the [README](README.md) for setup, the architecture map, and current limitations.

## Workflow

1. Fork the repository and create a focused branch.
2. Install the pinned dependencies with `pnpm install --frozen-lockfile`.
3. Run `pnpm dev:static` and work with fictional data only.
4. Keep domain types in `client/src/types.ts` and shared transitions in `client/src/data/store.ts` rather than introducing independent per-page ledgers.
5. Check `pnpm check`, `pnpm test`, and `pnpm build:static` before opening a pull request.
6. Describe the change, personas affected, verification performed, and remaining limitations. Update README examples if behavior changes.

Current tests mostly cover retained server/platform helpers. New domain tests should cover offer/onboarding/time/invoice/payment consistency, repeated actions, valid transitions, and ledger behavior across personas.

## Design and demo expectations

- Preserve the top-bar persona switcher and reset mechanism.
- Keep all personas connected to the same underlying records.
- Distinguish simulated AI, payments, signatures, and compliance actions from real integrations.
- Treat classification and hiring decisions as human-reviewed decisions.
- Ensure manager approvals are scoped to their engagements and supplier views to their suppliers before moving toward production.
- Keep the worker experience usable on small screens.

## Secrets and privacy

Never commit `.env` files, tokens, credentials, private keys, real worker data, network/session logs, or database dumps. Use deployment-local environment variables for optional integrations. Never place a private key in a `VITE_*` variable; those values can be bundled into browser code.

Before pushing, inspect `git diff --cached`, confirm secret files are ignored, and run a secret scanner such as Gitleaks against your changes and history. Do not publish secrets in issues or pull requests.

Contributions are provided under the repository's MIT license.
