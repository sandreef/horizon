---
title: The agent loop
date: 2026-11-26
area: ai
type: concept
maturity: budding
milestone: ai-engineering/agent-loop
summary: An agent is a model in a loop. It reads context, chooses a tool call or an answer, sees the result, and repeats until done or out of budget.
tags: [agents, llm, tools]
starter: true
cards:
  - q: Describe the agent loop in one sentence.
    a: Send the model the conversation and tool definitions; if it asks for a tool, run it and append the result; repeat until it answers without a tool call or a budget runs out.
  - q: Who actually executes a tool call, the model or your code?
    a: Your code. The model only proposes a call (name and arguments); the application validates and runs it, then returns the result.
  - q: When is a fixed workflow better than an autonomous agent?
    a: When the steps are known in advance. Workflows are cheaper, faster, more predictable and easier to test. Use an agent when the path depends on what is discovered along the way.
  - q: Name three things every production agent loop needs besides the model call.
    a: A step or cost budget, error handling that reports tool errors back to the model, and logging or tracing of every step. Also permission checks or human approval for risky actions.
sources:
  - title: Building effective agents (Anthropic)
    url: https://www.anthropic.com/engineering/building-effective-agents
  - title: "ReAct: synergizing reasoning and acting in language models"
    url: https://arxiv.org/abs/2210.03629
  - title: LLM powered autonomous agents (Lilian Weng)
    url: https://lilianweng.github.io/posts/2023-06-23-agent/
---

> [!note] Starter note
> The practice for this step: build this loop yourself, with no framework, in under 200 lines. Then rewrite this note from what you learned.

## The whole idea

```python
def run_agent(task, tools, model, max_steps=20):
    messages = [{"role": "user", "content": task}]
    for step in range(max_steps):
        reply = model.respond(messages, tools=tools.definitions())
        messages.append(reply.as_message())
        if not reply.tool_calls:
            return reply.text                        # the model chose to answer: done
        for call in reply.tool_calls:
            try:
                result = tools.run(call.name, call.arguments)   # your code executes
            except Exception as e:
                result = f"Error: {e}. Check the arguments and try again."
            messages.append(tool_result(call.id, result))
    return "Stopped: step budget reached."
```

That's it. Everything else in agent engineering is about making each part of this loop better.

## The parts, and what makes them good

**The model** decides what to do next. Better models plan better, but the context you give them matters as much.

**The tools** are the agent's hands. Good tools have clear names, precise descriptions, few required parameters, and
error messages written *for the model*: "File not found: `src/mian.cpp`. Did you mean `src/main.cpp`?" teaches it to
recover; a stack trace doesn't.

**The context** is everything in `messages`. It fills up fast with tool results, which is why long-running agents
need [[context-engineering]]: summarizing, taking notes, and handing sub-tasks to sub-agents with fresh context.

**The stopping rule** is a step budget, a cost budget, a clear "done" condition, and checkpoints where a human
approves before anything irreversible happens.

## Workflows vs agents

| | Workflow | Agent |
| --- | --- | --- |
| Who decides the steps | You, in code | The model, at runtime |
| Predictability | High | Lower |
| Cost and latency | Lower | Higher |
| Best when | The steps are known | The path depends on what's found |

Common workflow shapes: **prompt chaining** (step A's output feeds step B), **routing** (classify, then send to a
specialist), **parallelization** (split work, or vote), and **orchestrator-workers** (one model plans and delegates).
Start with the simplest one that works, and only add autonomy when it clearly pays.

## Where agents fail

- **Looping:** repeating the same failing action. Detect repeats; vary the error message; cap steps.
- **Drift:** forgetting the original goal deep into a long task. Restate the goal; keep a plan or progress file.
- **Overreach:** doing more than asked. Narrow tools, clear scope, approval gates.
- **Injection:** following instructions found in a web page or file. Treat tool results as data, never as commands.

Measure all of this with [[evals-for-agents]].
