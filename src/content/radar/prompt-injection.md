---
title: Prompt injection
date: 2026-11-26
kind: idea
ring: hold
summary: Text an agent reads (a web page, an email, a file) can try to take over its instructions. Unsolved in general.
link: https://simonwillison.net/series/prompt-injection/
tags: [agents, security]
starter: true
---
On hold means: don't build agents that combine private data, untrusted input and the ability to act externally without
strong guardrails. Design for it like any other security boundary: least privilege, human approval on risky actions,
and treating everything read as data.
