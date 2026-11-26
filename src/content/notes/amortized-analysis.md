---
title: Amortized analysis and the growing array
date: 2026-11-26
area: science-tech
type: concept
maturity: seedling
milestone: foundations/complexity
summary: Why std::vector::push_back is O(1) on average even though some calls copy everything. The doubling trick, proved with a simple counting argument.
tags: [math, algorithms, cpp]
starter: true
cards:
  - q: What does "amortized O(1)" mean?
    a: Averaged over any sequence of n operations, the total cost is O(n), so the average per operation is constant, even though individual operations may be expensive.
  - q: Why does doubling capacity make push_back amortized O(1)?
    a: Copies happen at sizes 1, 2, 4, …, n, which sum to less than 2n. So n pushes cost at most about 3n element operations in total.
  - q: Why does growing capacity by a constant (say +10) make push_back O(n) amortized?
    a: A copy happens every 10 pushes and copies the whole array, so total copying is about n²/20, which is O(n²) for n pushes.
  - q: What does `reserve` do, and when should you use it?
    a: It allocates capacity up front without changing size. Use it when you know (roughly) how many elements will be added, to avoid repeated reallocations and invalidated iterators.
sources:
  - title: Algorithms (Jeff Erickson), amortized analysis chapter
    url: https://jeffe.cs.illinois.edu/teaching/algorithms/
  - title: "cppreference: std::vector::push_back"
    url: https://en.cppreference.com/w/cpp/container/vector/push_back
---

> [!note] Starter note
> Bridges the math path and the C++ path. The practice: prove it, then benchmark `push_back` with and without `reserve`.

## The puzzle

`std::vector` stores elements contiguously. When it's full, `push_back` must allocate a bigger block and move every
element over: an O(n) operation. Yet the standard requires `push_back` to be amortized constant time. How?

## The doubling argument

Grow by a constant factor, say ×2. Starting from capacity 1, pushing $n$ elements triggers reallocations at sizes
$1, 2, 4, 8, \dots$, up to $n$. The total number of element moves is:

$$
1 + 2 + 4 + \dots + \frac{n}{2} + n < 2n
$$

Add the $n$ writes of the new elements themselves and the total work is under $3n$. Spread over $n$ operations,
that's **at most 3 per push: O(1) amortized**.

## Why a constant increment fails

Grow by +10 instead. A copy happens every 10 pushes, and the $k$-th copy moves $10k$ elements:

$$
10 + 20 + 30 + \dots + n \approx \frac{n^2}{20}
$$

That's $O(n^2)$ total, or $O(n)$ per push. The growth must be *geometric*.

## The trade-off in the factor

- Factor 2 wastes up to half the capacity but reallocates rarely.
- Some implementations use 1.5, which wastes less memory and lets freed blocks be reused more easily.
- Either way, amortized cost stays O(1); only the constant changes.

## Practical consequences

- Call `reserve(n)` when you know the final size: one allocation instead of about $\log_2 n$.
- Reallocation **invalidates** every pointer, reference and iterator into the vector. A classic bug: holding `&v[0]` across a `push_back`.
- Amortized is not worst case: a latency-critical loop can still see one slow push. Reserve up front if that matters.

See also [[move-semantics]]: reallocation moves elements only if the move constructor is `noexcept`.
