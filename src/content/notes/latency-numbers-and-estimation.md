---
title: Latency numbers and back-of-the-envelope estimates
date: 2026-11-26
area: system-design
type: concept
maturity: budding
milestone: system-design/numbers
summary: The latency ladder from L1 cache to a cross-ocean round trip, and a quick way to turn "10 million users" into requests per second and terabytes.
tags: [system-design, performance, estimation]
starter: true
cards:
  - q: Roughly how long does a main memory reference take?
    a: About 100 nanoseconds.
  - q: Roughly how long is a round trip within one data center, and across an ocean?
    a: About 0.5 ms within a data center, and about 150 ms for a transatlantic or transpacific round trip.
  - q: About how many seconds are in a day, for estimation?
    a: 86,400, so round to 100,000 (10^5).
  - q: 1 million requests per day is roughly how many requests per second?
    a: About 12 per second on average (10^6 / 10^5 ≈ 10). Peak is often 2 to 10 times the average.
  - q: Reading 1 MB sequentially from memory vs from an SSD vs over a 1 Gbps network, in rough order?
    a: Memory is tens of microseconds, SSD is hundreds of microseconds to about a millisecond, and a 1 Gbps network is about 10 ms.
sources:
  - title: Latency numbers every programmer should know
    url: https://gist.github.com/jboner/2841832
---

> [!note] Starter note
> The first step of the system design path. The numbers are orders of magnitude, and hardware keeps moving, so treat them as a ladder, not a spec.

## The latency ladder

| Operation | Rough time | Relative to a memory read |
| --- | --- | --- |
| L1 cache reference | 1 ns | |
| Branch mispredict | 3 to 5 ns | |
| L2 cache reference | 4 ns | |
| Mutex lock/unlock (uncontended) | 20 ns | |
| **Main memory reference** | **100 ns** | 1× |
| Compress 1 KB with a fast compressor | 2 µs | 20× |
| Read 1 MB sequentially from memory | 10 to 50 µs | |
| SSD random read | 20 to 100 µs | ~500× |
| **Round trip within a data center** | **500 µs** | 5,000× |
| Read 1 MB sequentially from SSD | 0.2 to 1 ms | |
| Disk seek (spinning) | 2 to 10 ms | |
| Send 1 MB over 1 Gbps | 10 ms | |
| **Round trip across an ocean** | **~150 ms** | 1,500,000× |

What to remember: **memory is ~100 ns, a data center round trip is ~0.5 ms, crossing an ocean is ~150 ms.** Each
step is several orders of magnitude, which is why caching, batching and keeping data close matter so much.

## Handy constants

- A day is ~10^5 seconds (86,400). A month is ~2.5 × 10^6. A year is ~3 × 10^7.
- 1 million requests/day ≈ 12 requests/second on average. 1 billion/day ≈ 12,000/second.
- Peak traffic is usually 2 to 10× the average.
- Powers of two: 2^10 ≈ 10^3 (KB), 2^20 ≈ 10^6 (MB), 2^30 ≈ 10^9 (GB), 2^40 ≈ 10^12 (TB).

## A worked estimate

*A photo-sharing service with 10 million daily active users, each viewing 50 photos and uploading 1 photo a day.*

- **Reads:** 10^7 × 50 = 5 × 10^8 views/day ÷ 10^5 s ≈ **5,000 views/s**, peak maybe 20,000/s.
- **Writes:** 10^7 uploads/day ÷ 10^5 ≈ **100 uploads/s**. Read/write ratio about 50:1, so caching and CDNs matter most.
- **Storage:** 10^7 photos/day × 2 MB = 20 TB/day, so about **7 PB/year** before replication. Object storage, not a database.
- **Bandwidth out:** 5,000/s × 2 MB = 10 GB/s average. A CDN is not optional.

Four lines of arithmetic, and the shape of the architecture is already decided. That's the point of estimating.

See [[system-design-method]] for where this fits.
