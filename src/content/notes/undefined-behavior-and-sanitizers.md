---
title: Undefined behavior and sanitizers
date: 2026-11-26
area: programming
type: guide
maturity: budding
milestone: cpp/undefined-behavior
summary: UB means the program has no meaning at all, and the optimizer is allowed to assume it never happens. Sanitizers turn silent UB into loud reports.
tags: [cpp, testing, correctness]
starter: true
cards:
  - q: Why can code with undefined behavior work in a debug build and break in a release build?
    a: The optimizer assumes UB never happens and transforms code based on that assumption (removing checks, reordering). Debug builds do fewer such transformations, so the bug stays hidden.
  - q: Which sanitizer finds use-after-free and out-of-bounds accesses?
    a: AddressSanitizer (`-fsanitize=address`).
  - q: Which sanitizer finds data races?
    a: ThreadSanitizer (`-fsanitize=thread`). It can't be combined with AddressSanitizer in the same build.
  - q: Name four common sources of undefined behavior.
    a: Out-of-bounds access, signed integer overflow, use-after-free or dangling references, data races, reading uninitialized variables, null pointer dereference.
sources:
  - title: "cppreference: undefined behavior"
    url: https://en.cppreference.com/w/cpp/language/ub
  - title: Clang AddressSanitizer
    url: https://clang.llvm.org/docs/AddressSanitizer.html
  - title: Clang UndefinedBehaviorSanitizer
    url: https://clang.llvm.org/docs/UndefinedBehaviorSanitizer.html
  - title: Clang ThreadSanitizer
    url: https://clang.llvm.org/docs/ThreadSanitizer.html
---

> [!note] Starter note
> Pairs with [[modern-cpp-toolchain]]. Do the practice: one tiny program per UB category, each caught by a sanitizer.

## What "undefined" really means

The standard places *no requirements* on a program that executes undefined behavior. Not "it crashes", not "you get
garbage": the whole execution is meaningless, including code that ran *before* the UB. In practice, the danger comes
from the optimizer, which may assume UB never happens and simplify code accordingly.

```cpp
bool will_overflow(int x) {
    return x + 1 < x;   // signed overflow is UB, so the compiler may fold this to `false`
}
```

At `-O2`, both GCC and Clang typically compile that function to `return false;`. The check you wrote is gone.

## The usual suspects

| Category | Example | Caught by |
| --- | --- | --- |
| Out of bounds | `v[v.size()]`, overrunning a C array | ASan |
| Lifetime | use-after-free, dangling reference or `string_view` | ASan |
| Signed overflow | `INT_MAX + 1` | UBSan |
| Bad shifts and casts | shifting by ≥ width, misaligned pointers | UBSan |
| Data races | two threads, one writing, no synchronization | TSan |
| Uninitialized reads | using a local before assigning it | MSan (Clang), compiler warnings |

## Sanitizers in daily work

Build a sanitizer configuration alongside debug and release, and run the test suite under it in CI.

```sh
# Address + undefined behavior (fast enough to use all the time)
cmake -B build-asan -DCMAKE_BUILD_TYPE=Debug \
  -DCMAKE_CXX_FLAGS="-fsanitize=address,undefined -fno-omit-frame-pointer -fno-sanitize-recover=all"

# Threads (a separate build: TSan can't be combined with ASan)
cmake -B build-tsan -DCMAKE_CXX_FLAGS="-fsanitize=thread -g"
```

`-fno-sanitize-recover=all` makes UBSan stop at the first error instead of printing and continuing, which is what you
want in tests.

> [!tip] Read the report from the top
> An ASan report names the bad access, then where the memory was allocated, then where it was freed. The three stack
> traces together usually point straight at the ownership bug.

## Beyond sanitizers

- Sanitizers only see the paths your tests execute. Pair them with fuzzing (libFuzzer) to explore inputs you didn't think of.
- Compiler warnings (`-Wall -Wextra`) and clang-tidy catch some UB statically.
- Prefer APIs that can't go wrong: `.at()` in tests, `std::span` over pointer and length, `std::optional` over sentinel values.

## Open questions

- How do I get sanitizers working for a large codebase where third-party libraries aren't instrumented?
