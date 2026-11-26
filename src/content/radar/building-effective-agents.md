---
title: Simple, composable agent patterns
date: 2026-11-26
kind: practice
ring: adopt
summary: Start with the simplest thing (one call, then a workflow), and reach for autonomous agents only when the task needs it.
link: https://www.anthropic.com/engineering/building-effective-agents
tags: [agents, architecture]
starter: true
---
The core advice holds up: prompt chaining, routing, parallelization, orchestrator and workers, evaluator and optimizer,
then full agents. Most production wins come from workflows with clear steps, not from maximum autonomy. A good lens for
system design interviews about AI features too.
