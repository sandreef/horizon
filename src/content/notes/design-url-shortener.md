---
title: "Design study: a URL shortener"
date: 2026-11-26
area: system-design
type: design
maturity: seedling
milestone: system-design/drill-url-shortener
summary: The classic warm-up drill worked through with the method. A read-heavy key-value lookup where ID generation and caching are the interesting parts.
tags: [system-design, drill, caching]
starter: true
cards:
  - q: Why is a URL shortener a read-heavy system, and what does that imply?
    a: Links are created once and followed many times (often 100:1 or more). Optimize the redirect path with caching and a CDN; writes can be slower.
  - q: How many distinct 7-character base62 codes are there?
    a: 62^7, about 3.5 trillion.
  - q: Name two ways to generate short codes and a drawback of each.
    a: A counter encoded in base62 (needs coordination, and codes are guessable), or a hash of the URL truncated (collisions must be handled), or random codes (collision check on insert).
  - q: 301 or 302 for the redirect, and why does it matter?
    a: 301 (permanent) lets browsers cache the redirect, which cuts load but hides clicks from analytics. 302 (temporary) keeps every click visible to the service.
sources:
  - title: The System Design Primer
    url: https://github.com/donnemartin/system-design-primer
---

> [!note] Starter note
> Do the drill yourself in 45 minutes first, *then* read this and compare. Record what you missed in [[system-design-method]].

## 1. Clarify

- **Core operations:** create a short link for a long URL; redirect a short link to the long URL.
- **Extras (in scope):** custom aliases, expiry. **Out of scope:** user accounts, detailed analytics dashboards.
- **Non-functional:** redirects must be fast (under 50 ms at p99) and highly available; links must never point to the wrong URL.

## 2. Estimate

- 100 million new links/month ≈ 40 writes/s. Read/write ratio 100:1, so ≈ 4,000 redirects/s average, ~20,000/s peak.
- Each record ≈ 500 bytes. 100M × 12 months × 5 years × 500 B ≈ **3 TB** over five years. Fits comfortably in a sharded key-value store.
- Codes: 6 billion links over five years. 62^7 ≈ 3.5 × 10^12, so **7 base62 characters** is plenty.

## 3. Sketch

```text
client ──► CDN / edge ──► load balancer ──► redirect service ──► cache (hot codes)
                                                    │                    │ miss
                                                    └──────────────► key-value store
client ──► API ──► create service ──► ID generator ──► key-value store
```

**API:** `POST /links {url, alias?, expires_at?} → {code}` and `GET /{code} → 302 Location: url`.
**Data model:** `code → {url, created_at, expires_at}`. A key-value store fits: every read is a lookup by key.

## 4. Deep dives

**ID generation.** Options:

1. *Counter + base62.* Short and collision-free, but a single counter is a bottleneck. Fix it by handing each server a block of IDs (for example 1,000 at a time) from a coordinator. Codes become guessable; add a bijective shuffle if that matters.
2. *Random 7 characters.* No coordination; on insert, use a conditional write ("only if absent") and retry on a collision, which is rare while the space is mostly empty.
3. *Hash of the URL.* Deduplicates identical URLs, but truncated hashes collide and custom aliases don't fit the scheme.

I'd pick **random codes with a conditional insert**: simplest to operate, no single point of coordination.

**Caching the redirect path.** Link popularity is extremely skewed, so a modest cache of hot codes absorbs most reads.
Cache-aside with a TTL; links rarely change, so staleness is a small risk. See [[caching-patterns]].

**301 vs 302.** 302 keeps every click hitting the service (needed for click counts and for expiry to work); 301 lets
browsers cache. Choose 302 unless analytics truly don't matter.

## 5. Stress test

- **Cache node dies:** misses go to the store; size the store for cache-miss load at peak.
- **Hot link (goes viral):** the CDN and a per-server local cache absorb it.
- **Abuse:** rate-limit creation per client; scan URLs against a malware list asynchronously.
- **Expiry:** check `expires_at` on read; clean up with a background job, not on the hot path.

## What I'd ask next

How would this change if every link needed per-click analytics in real time? (A queue between the redirect service
and an analytics pipeline, so the redirect never waits on analytics.)
