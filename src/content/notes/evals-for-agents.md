---
title: Evals for LLM apps and agents
date: 2026-11-26
area: ai
type: guide
maturity: seedling
milestone: ai-engineering/evals
summary: An eval is a test suite for behavior. Build it from real failures, check what you can with code, grade the rest with a rubric, and run it on every change.
tags: [agents, evals, testing]
starter: true
cards:
  - q: What are the three kinds of eval checks, from cheapest to most expensive?
    a: Code-based assertions (exact match, schema, tests pass), model-graded checks against a rubric, and human review.
  - q: Why build an eval set from observed failures rather than imagined ones?
    a: Real failures show what actually goes wrong in practice; imagined cases tend to test what's easy, not what matters.
  - q: What is error analysis, and how does it differ from running evals?
    a: Reading real traces and categorizing failures to find the most common failure modes. Evals measure known behaviors; error analysis discovers what to measure.
  - q: What must you check before trusting a model-graded eval?
    a: That the grader agrees with careful human judgment on a sample, and that the rubric is specific (pass/fail criteria, not a vague 1 to 10 score).
sources:
  - title: Your AI product needs evals (Hamel Husain)
    url: https://hamel.dev/blog/posts/evals/
---

> [!note] Starter note
> As a test engineer, this is home territory: evals are test suites for non-deterministic systems. Rewrite it with what transfers from conventional testing and what doesn't.

## Why evals

Without evals, every prompt change, model upgrade or tool tweak is a guess. With them, it's an experiment with a
result. They are the difference between "it seemed better when I tried it" and "it went from 71% to 84% on 60 real
cases, and broke nothing".

## The loop

1. **Look at real traces.** Run the system on realistic inputs and read what it did, step by step.
2. **Categorize failures.** Wrong tool, missed constraint, hallucinated fact, gave up too early… Count them.
3. **Turn failures into cases.** Each case: an input, plus a way to judge the output.
4. **Fix the biggest category**, then re-run everything to confirm and catch regressions.
5. **Repeat.** The eval set grows with every failure you see in the wild.

## Three ways to judge

| Check | Example | Use when |
| --- | --- | --- |
| **Code** | Output parses as JSON; the generated code compiles and its tests pass; the answer contains the right ID | Whenever possible: fast, cheap, deterministic |
| **Model-graded** | "Does the summary mention every action item? Answer PASS or FAIL with a reason." | Judgment calls at scale; validate against humans first |
| **Human** | You read 30 outputs and label them | Building the rubric; calibrating graders; high-stakes |

> [!warning] Grade the grader
> A model grader with a vague rubric produces confident noise. Write binary criteria, check agreement against your own
> labels on a sample, and keep the grader's reasoning in the output so you can audit it.

## For agents specifically

- Judge the **outcome** (is the bug fixed? did the tests pass?) more than the exact path.
- Also check the **process** where it matters: did it ask before deleting? Did it stay in scope?
- Run each case several times. Agents are non-deterministic; a 3/5 pass rate is information.
- Track cost and steps alongside quality.

## Testing instincts that transfer

Regression suites, minimal reproducing cases, test pyramids (many cheap checks, few expensive ones), flaky-test
discipline, and "a bug found is a test added". The new part is that pass/fail is sometimes a judgment, so the rubric
becomes part of the test code.

Related: [[the-agent-loop]], [[delegating-to-coding-agents]].
