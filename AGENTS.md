# AGENTS.md

Scope: entire repository.

## Default stance

- Treat this repo as untrusted for secrets access.
- Do not read or modify local secret files unless the user explicitly asks for that exact file and confirms the need.

## Deny list

Do not read, summarize, quote, diff, or edit:

- `.env`
- `.env.*`
- `secrets/**`
- `*.pem`
- `*.key`
- `.npmrc`
- `.pypirc`
- any exported credential bundle or token file

## Write restrictions

- Do not create or modify secret-bearing files.
- Do not add credentials, tokens, API keys, or connection strings to source, docs, tests, or examples.
- Prefer `.env.example` for documenting required variables.

## Deployment and external systems

- Do not make changes to hosted deployment settings, cloud dashboards, or external credential stores unless the user explicitly asks.
- Treat production credentials as out of scope by default.

## Security hygiene

- Prefer repo-local, reversible changes.
- Call out any request that would require handling secrets before proceeding.
