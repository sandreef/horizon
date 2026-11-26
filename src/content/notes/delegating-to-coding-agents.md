---
title: Delegating to coding agents
date: 2026-11-26
area: ai
type: guide
maturity: seedling
milestone: ai-engineering/delegation
summary: Treat an agent like a fast, capable colleague with no memory of your project. A clear goal, the right context, acceptance criteria, and a real review.
tags: [agents, workflow, code-review]
starter: true
cards:
  - q: What are the five parts of a good task spec for a coding agent?
    a: The goal (and why), constraints, relevant context (files, conventions, past decisions), acceptance criteria (how to verify done), and what not to touch.
  - q: What makes a task a good fit to delegate?
    a: Clear success criteria that can be checked (tests, a reproducible bug, a spec), bounded scope, and low cost if the first attempt is wrong.
  - q: What should you always do yourself, even with a strong agent?
    a: Decide what to build and why, own the architecture and trade-offs, and review the change, including the tests.
sources:
  - title: Claude Code documentation
    url: https://code.claude.com/docs/en/overview
  - title: Building effective agents (Anthropic)
    url: https://www.anthropic.com/engineering/building-effective-agents
---

> [!note] Starter note
> Keep a short log of real delegations (what you asked, what came back, what you'd change) and grow this note from it.

## The mindset

A coding agent is a fast, capable colleague who has never seen your project and forgets everything between sessions.
Most disappointing results trace back to a vague ask or missing context, not to the model. The fix is the same as with
a new teammate: say what you want, why, what good looks like, and where to look.

## A spec template

```markdown
## Goal
Add retry with exponential backoff to the HTTP client, so transient 503s stop failing nightly jobs.

## Context
- Client lives in src/net/http_client.cpp; tests in tests/net/.
- We use std::expected for errors, not exceptions (see docs/errors.md).

## Constraints
- Max 5 attempts, full jitter, total cap 30 s. Only retry idempotent requests.
- Don't change the public API.

## Done when
- New unit tests cover: success after retries, giving up, non-idempotent requests never retried.
- All existing tests pass; builds clean under ASan/UBSan.

## Don't
- Touch the build system or unrelated files.
```

## Sizing tasks

- **Good to delegate:** clear success criteria; a bug with a reproduction; well-specified features; refactors with strong test coverage; boilerplate; first drafts of tests.
- **Do with the agent, step by step:** design exploration, unfamiliar code, anything where you'll learn by watching the reasoning.
- **Keep for yourself:** what to build and why, architecture, trade-offs, and the final review.

> [!tip] Ask for a plan first on anything non-trivial
> Have the agent read the code and propose a plan before editing. Correcting a plan costs a minute; correcting a
> finished change costs an hour.

## Reviewing what comes back

Review like it's a colleague's pull request, with extra suspicion of tests that changed. See
[[reviewing-ai-written-cpp]] for a C++-specific checklist. If the result is wrong, improve the spec or the context and
retry rather than patching by hand. Each fix to the spec makes the next delegation better.

## Parallel agents

Running several agents at once multiplies throughput only if tasks are independent and your review keeps up. Your
attention becomes the bottleneck. Shared notes and clear ownership of files prevent agents from colliding. This is
[[context-engineering]] applied to a team.
