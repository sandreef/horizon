---
title: A repeatable system design method
date: 2026-11-26
area: system-design
type: guide
maturity: budding
milestone: system-design/design-method
summary: Requirements, estimates, a sketch, deep dives, then stress tests. The same five moves work for an interview, a design review, or a real project.
tags: [system-design, method, design-docs]
starter: true
cards:
  - q: What are the five phases of the design method?
    a: 1) Clarify requirements and scope, 2) estimate the load, 3) sketch the high-level design, 4) deep-dive the hardest parts, 5) stress-test for failures, scale and trade-offs.
  - q: What are non-functional requirements? Give four examples.
    a: Qualities rather than features. Examples are latency, availability, durability, consistency, throughput, cost, security and compliance.
  - q: Why write down what's out of scope?
    a: It keeps the design focused, prevents surprise expectations later, and makes trade-offs explicit for reviewers.
sources:
  - title: The System Design Primer
    url: https://github.com/donnemartin/system-design-primer
  - title: Designing Data-Intensive Applications
    url: https://dataintensive.net/
---

> [!note] Starter note
> The method every drill on the system design path uses. Refine it after each drill: what question did you forget to ask?

## 1. Clarify (about 15% of the time)

Most bad designs are good answers to the wrong question. Before drawing anything:

- **Users and use cases.** Who uses it, for what? List the 3 to 5 core operations.
- **Non-functional requirements.** How fast? How available? How consistent? How durable? How much will it cost?
- **Scale.** How many users, how many requests, how much data, growing how fast?
- **Out of scope.** Say explicitly what you are *not* designing.

> [!tip] Five questions that unlock most designs
> What's the read/write ratio? What's the latency budget? What happens if data is lost? What happens if data is stale?
> What's the biggest the system must ever get?

## 2. Estimate (10%)

Turn the requirements into numbers: requests per second at peak, storage per year, bandwidth. Round aggressively;
the goal is the order of magnitude, which decides whether you need one machine or a thousand. See
[[latency-numbers-and-estimation]].

## 3. Sketch (25%)

Draw the simplest design that meets the requirements: clients, an API, services, data stores, and the request path
for each core operation. Define the API and the data model here. Resist adding components "for scale" until a number
says you need them.

## 4. Deep-dive (35%)

Pick the two or three hardest parts and design them properly: the data model and partitioning, the hot path, the
consistency story. This is where [[caching-patterns]], queues, replication and [[consistency-models]] show up.

## 5. Stress-test (15%)

Attack your own design:

- **Failure:** what happens when each component dies? When the network partitions?
- **Scale:** what breaks first at 10× load? Where are the hot spots?
- **Evolution:** how do you deploy changes, migrate data, add a feature?
- **Trade-offs:** name what you gave up, and why it was worth it.

## Writing it up

The same structure becomes a design doc: context, goals, non-goals, the proposal, alternatives considered, and open
questions. Writing the alternatives down is what turns a design into a decision others can review.

## Practice log

| Date | Drill | What I missed |
| --- | --- | --- |
| | [[design-url-shortener]] | |
