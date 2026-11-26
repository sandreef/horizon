---
title: Entropy, cross-entropy and the LLM loss
date: 2026-11-26
area: science-tech
type: concept
maturity: seedling
milestone: foundations/entropy
summary: Entropy measures average surprise. Language models are trained to minimize cross-entropy, which is exactly "be less surprised by the next real token."
tags: [math, information-theory, llm]
starter: true
cards:
  - q: What is the entropy of a distribution p?
    a: "H(p) = −Σ p(x) log p(x): the average surprise, or the average number of bits needed to encode outcomes drawn from p with an optimal code."
  - q: What loss do language models minimize during pretraining?
    a: Cross-entropy between the true next token and the model's predicted distribution, which is the negative log probability the model assigned to the actual next token, averaged over tokens.
  - q: How are cross-entropy and KL divergence related?
    a: "H(p, q) = H(p) + KL(p ‖ q). Since H(p) is fixed by the data, minimizing cross-entropy minimizes the KL divergence from the true distribution."
  - q: What is perplexity?
    a: The exponential of the average cross-entropy (in nats). Intuitively, the number of equally likely choices the model is "confused between" at each step.
sources:
  - title: Visual information theory (Chris Olah)
    url: https://colah.github.io/posts/2015-09-Visual-Information/
  - title: Mathematics for Machine Learning
    url: https://mml-book.github.io/
---

> [!note] Starter note
> Connects the math path to [[scaled-dot-product-attention]] and the agentic engineering path. Rewrite after computing a cross-entropy by hand.

## Surprise and entropy

An event with probability $p$ carries $-\log_2 p$ bits of surprise. A fair coin flip: 1 bit. An event with
probability 1/1024: 10 bits. **Entropy** is the expected surprise:

$$
H(p) = -\sum_x p(x) \log p(x)
$$

A fair coin has 1 bit of entropy; a coin that always lands heads has 0. Entropy is also the best achievable average
code length: you can't compress data from $p$ below $H(p)$ bits per symbol on average.

## Cross-entropy

If the world follows $p$ but you predict with $q$, your average surprise is the **cross-entropy**:

$$
H(p, q) = -\sum_x p(x) \log q(x) = H(p) + D_{\mathrm{KL}}(p \,\|\, q)
$$

The KL divergence $D_{\mathrm{KL}} \ge 0$ is the extra cost of using the wrong distribution. It's zero only when
$q = p$.

## Why this is the LLM loss

At each position, the true "distribution" is just the actual next token (probability 1). So cross-entropy collapses to:

$$
\mathcal{L} = -\log q(\text{actual next token} \mid \text{context})
$$

averaged over every token in the training data. Training pushes the model to put high probability on what really comes
next. Minimizing it is the same as minimizing the KL divergence between the model and the data distribution.

> [!example] One step
> Context: "The capital of France is". The model gives *Paris* probability 0.6. The loss for this token is
> $-\ln 0.6 \approx 0.51$ nats. At 0.99 it would be 0.01; at 0.01 it would be 4.6. Confident mistakes are punished hard.

## Perplexity

$\text{perplexity} = e^{\mathcal{L}}$ (with natural logs). A perplexity of 10 means the model is, on average, as
uncertain as choosing uniformly among 10 tokens. Lower is better.

## Where else it shows up

- Classification losses in all of machine learning.
- KL penalties in reinforcement learning from feedback, which keep a fine-tuned model close to its starting point.
- Compression: a better language model is literally a better compressor.
