---
title: Consistency models, without the myths
date: 2026-11-26
area: system-design
type: concept
maturity: seedling
milestone: system-design/consistency
summary: What linearizable, causal and eventual consistency actually promise, why CAP is narrower than it sounds, and how to choose per operation.
tags: [system-design, distributed-systems, consistency]
starter: true
cards:
  - q: What does linearizability guarantee?
    a: Every operation appears to take effect atomically at a single point between its start and end, consistent with real time. Once a write completes, every later read sees it (or something newer).
  - q: What does eventual consistency guarantee?
    a: Only that if writes stop, all replicas eventually converge to the same value. Reads in the meantime can be stale or out of order.
  - q: What does CAP actually say?
    a: During a network partition, a system must choose between consistency (linearizability) and availability (every request to a non-failed node gets a response). It says nothing about the system when there's no partition.
  - q: What does PACELC add to CAP?
    a: Else, when there is no partition, there's still a trade-off between latency and consistency.
  - q: What is read-your-writes consistency?
    a: A user always sees their own earlier writes, even if other users may see stale data.
sources:
  - title: "Jepsen: consistency models"
    url: https://jepsen.io/consistency
  - title: Designing Data-Intensive Applications, chapter 9
    url: https://dataintensive.net/
---

> [!note] Starter note
> Part of the distributed systems stage. Explore the Jepsen map, then rewrite this with your own examples.

## The question every replicated system answers

With copies of data on several machines, a read might hit a replica that hasn't seen the latest write. A
*consistency model* is the contract that says which results a read is allowed to return.

## From strongest to weakest (simplified)

| Model | Promise | Cost |
| --- | --- | --- |
| **Linearizable** | Behaves like a single copy; reads see the latest completed write | Coordination on every op; latency; unavailable during partitions |
| **Sequential** | All nodes see operations in the same order, though not necessarily real-time order | Still needs agreement on order |
| **Causal** | If A could have caused B, everyone sees A before B | Track dependencies; available during partitions |
| **Read-your-writes, monotonic reads** | Per-session guarantees: you see your own writes; time never goes backwards for you | Sticky sessions or version tracking |
| **Eventual** | Replicas converge if writes stop | Cheap and fast; the application handles anomalies |

## CAP, read carefully

CAP says: **when the network partitions**, you choose between consistency (linearizability) and availability. It's a
statement about a failure mode, not a label for a whole database. Most of the time there's no partition, and then the
real trade-off is the one PACELC names: **latency vs consistency**. Waiting for a majority of replicas on every write
costs round trips; see [[latency-numbers-and-estimation]].

## Choose per operation

Real systems mix models:

> [!example] A shopping site
> - **Inventory decrement at checkout:** linearizable (or a transaction). Overselling is expensive.
> - **Shopping cart:** read-your-writes is enough; merge on conflict.
> - **Product reviews and like counts:** eventual. Nobody is harmed by a count that's a few seconds old.

The skill is asking, for each operation: *what's the worst thing that happens if this read is stale?* Then pay for
exactly as much consistency as that answer requires.

## Related

- Consensus (Raft) is how systems implement linearizable operations on top of unreliable replicas.
- Caches are a consistency decision too: see [[caching-patterns]].
