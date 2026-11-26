---
title: Bayes' rule and base rates
date: 2026-11-26
area: science-tech
type: concept
maturity: budding
milestone: foundations/probability
summary: How to update a belief with evidence, and why a 99% accurate test can still be wrong most of the time.
tags: [math, probability]
starter: true
cards:
  - q: State Bayes' rule.
    a: "P(A | B) = P(B | A) · P(A) / P(B)"
  - q: What is the base rate fallacy?
    a: Ignoring the prior probability P(A) and judging only by how well the evidence fits, P(B | A). Rare events stay unlikely even after fairly strong evidence.
  - q: A condition affects 1 in 1,000 people. A test catches 99% of cases and has a 1% false positive rate. If you test positive, roughly what is the chance you have it?
    a: About 9%. Per 100,000 people, 99 true positives vs about 999 false positives.
  - q: Where does Bayesian reasoning show up in engineering?
    a: Alert triage (most alerts on rare failures are false alarms), spam filters, A/B test interpretation, and debugging ("which cause best explains these symptoms, given how common each is?").
sources:
  - title: Seeing Theory, chapter on Bayesian inference
    url: https://seeing-theory.brown.edu/
---

> [!note] Starter note
> The practice for this step: simulate the example below in code and check it matches the formula.

## The rule

$$
P(H \mid E) = \frac{P(E \mid H)\, P(H)}{P(E)}
$$

- $P(H)$ is the **prior**: how likely the hypothesis was before the evidence.
- $P(E \mid H)$ is the **likelihood**: how expected the evidence is if the hypothesis is true.
- $P(H \mid E)$ is the **posterior**: the updated belief.
- $P(E)$ normalizes: the total probability of seeing the evidence at all, $P(E \mid H)P(H) + P(E \mid \neg H)P(\neg H)$.

## The example that makes it click

A condition affects **1 in 1,000** people. A test detects it **99%** of the time and gives a false positive **1%** of
the time. You test positive. What's the chance you have it?

Count instead of computing. Out of 100,000 people:

| | Have it (100) | Don't (99,900) |
| --- | --- | --- |
| Test positive | 99 | 999 |
| Test negative | 1 | 98,901 |

Of the 1,098 positives, only 99 are real: **about 9%**. The test is good; the condition is just rare, and 1% of a
large healthy population outnumbers 99% of a tiny sick one.

## Why engineers should care

> [!example] Alerting
> A monitor fires on a rare failure mode with a 2% false alarm rate, checked every minute. Real failures happen once a
> month. Nearly every page will be a false alarm, and people will learn to ignore it. Fix the base rate problem by
> requiring sustained signals, combining evidence, or alerting on symptoms users feel.

- **Debugging:** a plausible explanation that fits the symptoms is less likely than a boring common cause that also fits.
- **A/B tests:** with many experiments, most "significant" wins at p < 0.05 can be false positives if true effects are rare.
- **Machine learning:** classifiers on imbalanced data have exactly this precision problem.

## In code

```python
import random
N = 1_000_000
sick = [random.random() < 0.001 for _ in range(N)]
positive = [(random.random() < 0.99) if s else (random.random() < 0.01) for s in sick]
tp = sum(1 for s, p in zip(sick, positive) if s and p)
print(tp / sum(positive))   # ≈ 0.09
```
