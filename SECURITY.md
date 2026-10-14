# Security policy

## Prototype status

Harbor is a synthetic-data demonstration, not a production security boundary. The persona selector is not authentication or authorization. Contingent-work data lives in browser `localStorage`, and simulated payment buttons do not send money.

Do not enter real worker PII, banking information, tax documents, credentials, or privileged business data. Before production use, implement and assess authentication, authorization, tenant isolation, encryption, retention/deletion, audit trails, input validation, and idempotent accounting/payment transitions.

## Credentials

The static demo requires no secrets. Optional server/integration helpers refer to environment variables; references and obviously fictional test fixtures are not live credentials. Actual credentials belong in local/deployment secret storage and must never be committed or included in client bundles.

Repository ignore rules cover environment files, private key files, credential stores, development logs, and build outputs. Ignore rules do not remove a secret already committed: inspect history and rotate any exposed credential.

## Reporting a vulnerability

Please do not disclose exploit details, credentials, or personal data in public issues. If GitHub private vulnerability reporting is available on this repository, use it. Otherwise contact the repository owner privately through their GitHub profile or request a private reporting channel without publishing sensitive details.
