---
title: Scaled dot-product attention
date: 2026-11-26
area: ai
type: concept
maturity: budding
milestone: ai-engineering/transformers
summary: Each token asks a question (query), every token advertises what it has (key), and the answer is a weighted average of what they carry (values).
tags: [transformers, llm, math]
starter: true
cards:
  - q: Write the formula for scaled dot-product attention.
    a: "Attention(Q, K, V) = softmax(QKᵀ / √d_k) V"
  - q: Why divide by √d_k?
    a: Dot products of random d_k-dimensional vectors have variance proportional to d_k. Without scaling, large scores push softmax into near one-hot outputs with tiny gradients.
  - q: Why is attention cost quadratic in sequence length?
    a: Every token's query is compared with every token's key, giving an n × n score matrix.
  - q: What does the causal mask do in a decoder-only model?
    a: It sets scores for future positions to −∞ before the softmax, so each token can only attend to itself and earlier tokens.
  - q: What is multi-head attention?
    a: Several attention operations in parallel, each with its own learned projections of Q, K and V, so different heads can track different relationships. Their outputs are concatenated and projected.
sources:
  - title: Attention Is All You Need (Vaswani et al., 2017)
    url: https://arxiv.org/abs/1706.03762
  - title: The Illustrated Transformer
    url: https://jalammar.github.io/illustrated-transformer/
  - title: "3Blue1Brown: attention in transformers"
    url: https://www.3blue1brown.com/topics/neural-networks
---

> [!note] Starter note
> The first step of the agentic engineering path. Write the attention step yourself in code before rewriting this note.

## The formula

$$
\operatorname{Attention}(Q, K, V) = \operatorname{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right) V
$$

For a sequence of $n$ tokens, each represented by a vector, the model computes three projections with learned weight
matrices:

- **Query** $q_i = x_i W_Q$: what token $i$ is looking for.
- **Key** $k_j = x_j W_K$: what token $j$ offers to be matched on.
- **Value** $v_j = x_j W_V$: the information token $j$ passes along if it's attended to.

## Step by step

1. **Score** every pair: $s_{ij} = q_i \cdot k_j$. High when the query and key point the same way.
2. **Scale** by $1/\sqrt{d_k}$, to keep scores in a range where softmax has useful gradients.
3. **Mask** (in decoder models): set $s_{ij} = -\infty$ for $j > i$, so a token can't see the future.
4. **Normalize** each row with softmax, giving weights $\alpha_{ij}$ that sum to 1.
5. **Mix**: the output for token $i$ is $\sum_j \alpha_{ij} v_j$, a weighted average of values.

In the sentence *"The cat sat on the mat because it was warm"*, a head tracking references might give "it" high
weight on "mat", so the output vector for "it" carries information about the mat.

## Why divide by $\sqrt{d_k}$?

If the components of $q$ and $k$ are independent with mean 0 and variance 1, their dot product has variance $d_k$.
With $d_k = 128$, typical scores would be around $\pm 11$, and softmax of such values is nearly one-hot: the gradient
almost vanishes. Dividing by $\sqrt{d_k}$ brings the variance back to 1.

## In code (NumPy)

```python
import numpy as np

def attention(Q, K, V, causal=True):
    d_k = Q.shape[-1]
    scores = Q @ K.T / np.sqrt(d_k)                  # (n, n)
    if causal:
        n = scores.shape[0]
        scores = np.where(np.tril(np.ones((n, n))) == 1, scores, -np.inf)
    weights = np.exp(scores - scores.max(axis=-1, keepdims=True))
    weights /= weights.sum(axis=-1, keepdims=True)   # softmax per row
    return weights @ V                               # (n, d_v)
```

## Consequences worth knowing

- **Quadratic cost.** The $n \times n$ score matrix is why long contexts are expensive, and why so much research goes into efficient attention.
- **The KV cache.** When generating token by token, keys and values for earlier tokens don't change, so they're cached. That's why generating output is memory-bound, and why prompt caching can make repeated prefixes cheap.
- **No built-in order.** Attention is permutation-invariant; position information has to be added (for example with rotary position embeddings).

## Open questions

- What do different heads actually learn? (Look up induction heads.)
- How does the math connect to the linear algebra path: dot products as similarity, softmax as a probability distribution? See [[cross-entropy-and-llm-loss]].
