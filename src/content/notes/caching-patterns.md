---
title: Caching patterns
date: 2026-11-26
area: system-design
type: concept
maturity: seedling
milestone: system-design/caching
summary: "Cache-aside, read-through, write-through and write-back; eviction; and the three classic failure modes: stale data, stampedes and hot keys."
tags: [system-design, caching, performance]
starter: true
cards:
  - q: How does cache-aside (lazy loading) work?
    a: The application checks the cache; on a miss it reads the database, then writes the value into the cache. Writes go to the database and invalidate or update the cache.
  - q: What is a cache stampede, and two ways to prevent it?
    a: Many requests miss the same key at once (often when it expires) and all hit the database. Prevent it with request coalescing (one loader, others wait), early probabilistic refresh, or a lock per key.
  - q: Write-through vs write-back?
    a: Write-through writes the cache and the database synchronously (slower writes, consistent). Write-back writes the cache first and flushes later (fast writes, risk of loss).
  - q: Why add random jitter to TTLs?
    a: So keys written together don't all expire together and cause a synchronized wave of misses.
sources:
  - title: "Amazon Builders' Library: caching challenges and strategies"
    url: https://aws.amazon.com/builders-library/caching-challenges-and-strategies/
---

> [!note] Starter note
> Part of the building blocks stage. Rewrite it after you add a cache to a real service and measure the hit rate.

## Why cache

A cache trades **freshness and memory** for **latency and load**. A database read across the network might take a
millisecond or more; an in-memory cache hit, a fraction of that. More importantly, every hit is a read the database
didn't have to serve. See [[latency-numbers-and-estimation]] for the ladder.

## The four patterns

| Pattern | Reads | Writes | Good for |
| --- | --- | --- | --- |
| **Cache-aside** | App checks cache, loads DB on miss | App writes DB, invalidates cache | The default; simple and resilient |
| **Read-through** | Cache loads from DB itself on miss | (as cache-aside) | Keeping loading logic in one place |
| **Write-through** | From cache | Cache and DB synchronously | Read-heavy data that must stay fresh |
| **Write-back** | From cache | Cache now, DB later | Write-heavy, loss-tolerant data (counters) |

## Eviction and hit rate

- **LRU** (least recently used) is the usual default; **LFU** helps when popularity is stable; **TTL** bounds staleness.
- The effective latency is `hit_rate × cache_latency + (1 − hit_rate) × db_latency`. Going from 90% to 99% hits cuts database load by 10×.

## What goes wrong

> [!warning] Invalidation is the hard part
> Deleting the cache entry *after* updating the database can still race with a concurrent reader that loaded the old
> value. Short TTLs bound the damage; versioned keys avoid it.

- **Stale reads.** Decide per use case how stale is acceptable. A profile picture can be minutes old; a bank balance can't.
- **Stampedes.** A popular key expires and a thousand requests hit the database at once. Coalesce requests (one loader, the rest wait), or refresh early before expiry.
- **Hot keys.** One key gets a large share of all traffic and overloads a single cache node. Replicate hot keys, or add a small local cache in each app server.
- **Cold starts.** After a deploy or restart, an empty cache sends full load to the database. Warm it, or ramp traffic gradually.
- **Synchronized expiry.** Add random jitter to TTLs.

## In C++

An LRU cache is a hash map from key to a node in a doubly linked list (most recent at the front). Both lookup and
update are O(1). It's also a great practice project; see the capstone on the [C++ path](/horizon/paths/cpp/#capstone).
