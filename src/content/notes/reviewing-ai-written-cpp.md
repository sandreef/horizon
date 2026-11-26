---
title: Reviewing AI-written C++
date: 2026-11-26
area: programming
type: guide
maturity: seedling
milestone: cpp/static-analysis
summary: A review checklist for C++ that an agent wrote. Look at ownership, lifetimes, UB and error paths before style.
tags: [cpp, code-review, agents]
starter: true
cards:
  - q: What should you check first when reviewing AI-written C++, before style?
    a: Intent (does it solve the right problem?), then ownership and lifetimes, undefined behavior, error paths, and whether tests were weakened.
  - q: Why is a green test suite not proof an agent's change is correct?
    a: The agent may have changed or deleted tests, the tests may not cover the new paths, and passing tests say nothing about lifetimes, races or UB on untested inputs.
  - q: Name two lifetime bugs that compile cleanly and often pass tests.
    a: Returning a `string_view` or reference into a temporary or local, and capturing a local by reference in a lambda that runs later (for example on another thread).
sources:
  - title: C++ Core Guidelines
    url: https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines
  - title: clang-tidy checks
    url: https://clang.llvm.org/extra/clang-tidy/checks/list.html
---

> [!note] Starter note
> This is where the C++ path and the agentic engineering path meet. Grow this checklist every time something slips past you.

Agents write fluent, plausible C++. The bugs that get through review are rarely syntax; they're the things C++ makes
easy to get subtly wrong. Review in this order, because each pass is cheaper than the next one.

## 1. Intent

- Does the change solve the problem that was asked, and only that? Watch for quiet scope creep.
- Is there a simpler design? Agents tend to add layers (factories, interfaces, config) nobody needed.

## 2. Ownership and lifetimes

- For every pointer, reference, `string_view`, `span` and iterator: who owns the target, and does the view outlive it? (See [[raii-and-ownership]].)
- Lambdas capturing `[&]` or `this` that are stored, queued or run on another thread.
- `shared_ptr` used where `unique_ptr` or a plain value would do.
- Iterators or references held across `push_back`, `insert` or `erase`.

## 3. Undefined behavior

- Signed arithmetic that can overflow, especially in size and index calculations.
- Shared mutable state touched from more than one thread without a mutex or atomic.
- Uninitialized members (does every constructor set every field?).
- Run the change under ASan, UBSan and, for concurrent code, TSan. See [[undefined-behavior-and-sanitizers]].

## 4. Error paths

- What happens on the failure branch? Agents often handle the happy path carefully and the error path vaguely.
- Swallowed exceptions, ignored return values (`[[nodiscard]]` helps), and partial updates that leave objects invalid.

## 5. Tests

- Diff the tests too. Were any assertions loosened, tests deleted, or expectations rewritten to match new output?
- Do the tests cover the new branches and the edge cases (empty, one element, full, maximum size)?

## 6. Performance (only if it matters here)

- Unnecessary copies (`auto` instead of `const auto&` in a range loop over strings).
- Allocations in hot loops; `std::endl` flushing in output loops; a `std::map` where `std::vector` plus sort would do.

## Make the machine do the boring part

```yaml
# .clang-tidy
Checks: >
  bugprone-*, performance-*, modernize-*, cppcoreguidelines-*,
  -modernize-use-trailing-return-type
WarningsAsErrors: 'bugprone-*'
```

Then spend your attention on design and lifetimes, which no tool fully checks.

## Open questions

- Which of these can I turn into instructions for the agent up front, so the first draft is better?
