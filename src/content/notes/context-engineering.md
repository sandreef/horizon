---
title: Context engineering
date: 2026-11-26
area: ai
type: concept
maturity: seedling
milestone: ai-engineering/context-engineering
summary: The context window is a small, precious workspace. Decide deliberately what goes in, what stays out, and what gets summarized or handed off.
tags: [agents, llm, context]
starter: true
cards:
  - q: What is context engineering?
    a: Deliberately curating everything a model sees at each step (instructions, examples, retrieved facts, tool results, history) so it has what it needs and little else.
  - q: Why can adding more context make results worse?
    a: Relevant details get diluted, attention spreads over noise, older instructions get lost in the middle, and cost and latency rise.
  - q: Name three techniques for long-running agents that would overflow their context.
    a: Compaction (summarize old history), structured notes or memory files outside the context, and sub-agents that work in fresh contexts and return short summaries.
  - q: What's "just in time" retrieval?
    a: Keep lightweight references (file paths, queries, links) in context and let the agent load the full content with a tool only when it needs it.
sources:
  - title: Effective context engineering for AI agents (Anthropic)
    url: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
---

> [!note] Starter note
> Read the source article, then rewrite this from your own experience running agents on long tasks.

## From prompts to context

Prompt engineering asks: *how do I phrase the instruction?* Context engineering asks the bigger question: *of
everything I could show the model at this step, what should it actually see?* For a one-shot question these are the
same. For an agent working for hours (see [[the-agent-loop]]), the context is rebuilt at every step and fills with
tool results, so curating it becomes the main lever on quality.

## What goes in

| Ingredient | Make it good by |
| --- | --- |
| **System instructions** | Explaining goals and the *why*, at the right altitude: not brittle if-then rules, not vague slogans |
| **Examples** | A few diverse, canonical ones beat a long list of edge cases |
| **Tools** | Few, distinct, well described; overlapping tools confuse the choice |
| **Retrieved knowledge** | Load just in time from references, not everything up front |
| **History** | Keep decisions and open threads; drop raw tool output once it's used |

## Techniques for long tasks

- **Compaction.** When the context nears its limit, summarize it: keep decisions, unresolved issues and key facts; discard verbose tool output.
- **Structured notes.** The agent writes progress, plans and findings to a file outside the context and rereads it when needed. It survives compaction and restarts.
- **Sub-agents.** Hand a focused sub-task to a fresh agent with a clean context; get back a short summary. The main agent's context stays clean.
- **Tool result hygiene.** Return what the model needs (the relevant lines, a count, an error with a hint), not entire files or logs.

## Signs of bad context

- The agent forgets constraints given early on.
- It re-reads the same files, or redoes work it already did.
- It picks the wrong tool among near-duplicates.
- Quality falls off a cliff late in long sessions.

> [!tip] Apply it to yourself
> The same rules make you better at delegating to coding agents: give the goal, the constraints, the relevant files,
> and what done looks like, and leave out the rest. See [[delegating-to-coding-agents]].
