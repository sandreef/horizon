---
title: Evals as the test suite for AI features
date: 2026-11-26
kind: practice
ring: adopt
summary: A fixed set of tasks with graders, run on every change. Without it, prompt and model changes are guesswork.
link: https://hamel.dev/blog/posts/evals/
tags: [agents, testing]
starter: true
---
Start with a few dozen real examples, look at the failures by hand, then automate the graders you trust. The same
discipline as unit tests, applied to non-deterministic systems. See [[evals-for-agents]].
