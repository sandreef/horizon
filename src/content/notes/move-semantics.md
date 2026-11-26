---
title: Move semantics and value categories
date: 2026-11-26
area: programming
type: concept
maturity: seedling
milestone: cpp/move-semantics
summary: Moving transfers a resource instead of copying it. std::move doesn't move anything; it only says "you may steal from this."
tags: [cpp, performance, ownership]
starter: true
cards:
  - q: What does `std::move` actually do?
    a: Nothing at runtime. It is a cast to an rvalue reference (an xvalue), which lets overload resolution pick a move constructor or move assignment instead of a copy.
  - q: What state is a moved-from standard library object in?
    a: Valid but unspecified. You may destroy it or assign a new value to it, but you shouldn't rely on its contents.
  - q: Why should move constructors be `noexcept`?
    a: Containers like `std::vector` only move elements during reallocation if the move can't throw; otherwise they copy to keep the strong exception guarantee.
  - q: In `template<class T> void f(T&& x)`, what kind of reference is `x`?
    a: A forwarding (universal) reference. It binds to both lvalues and rvalues; use `std::forward<T>(x)` to pass it on with its original category.
sources:
  - title: "cppreference: value categories"
    url: https://en.cppreference.com/w/cpp/language/value_category
  - title: "cppreference: move constructors"
    url: https://en.cppreference.com/w/cpp/language/move_constructor
---

> [!note] Starter note
> Builds on [[raii-and-ownership]]. Rewrite it after doing the practice: add moves to a buffer class and count copies.

## Why moves exist

Copying a `std::vector` with a million elements allocates and copies a million elements. But if the source is about
to disappear anyway (a temporary, or a local being returned), we could just *steal its pointer*. That transfer is a
move: a few pointer assignments instead of an allocation and a copy.

```cpp
std::vector<std::string> load_lines();          // returns by value
std::vector<std::string> lines = load_lines();  // no copy: moved, or elided entirely
```

## Value categories, just enough

Every expression has a category. The useful mental model:

- **lvalue**: has a name or identity you can refer to again (`x`, `v[0]`, `*p`). Moving from it would surprise someone.
- **prvalue**: a pure temporary (`42`, `make_widget()`, `a + b`). Nobody can see it afterwards, so it's safe to steal from.
- **xvalue**: an lvalue you've *declared* expendable, usually with `std::move(x)`.

Rvalue references (`T&&`) bind to prvalues and xvalues, and that's how overloads tell "copy me" from "you can steal from me".

## Writing move operations

```cpp
class Buffer {
    std::size_t size_ = 0;
    std::byte* data_ = nullptr;
public:
    Buffer(Buffer&& other) noexcept
        : size_(std::exchange(other.size_, 0)),
          data_(std::exchange(other.data_, nullptr)) {}

    Buffer& operator=(Buffer&& other) noexcept {
        if (this != &other) {
            delete[] data_;
            size_ = std::exchange(other.size_, 0);
            data_ = std::exchange(other.data_, nullptr);
        }
        return *this;
    }
    ~Buffer() { delete[] data_; }
    // copy operations omitted for brevity
};
```

`std::exchange` reads nicely here: take the value and leave the source empty in one step. Better still, follow the
rule of zero: if `data_` were a `std::unique_ptr<std::byte[]>`, none of this code would be needed.

## Traps

> [!warning] Don't `return std::move(local);`
> Returning a local by value already moves it, or elides the copy entirely. Wrapping it in `std::move` can *prevent*
> copy elision.

- `const` objects can't be moved from: `std::move` on a `const T` gives `const T&&`, which binds to the copy constructor.
- Use-after-move is a real bug class. Static analyzers (`bugprone-use-after-move` in clang-tidy) catch many cases.
- Forgetting `noexcept` silently turns vector growth back into copies.

## Open questions

- Measure it: how much faster is `push_back` of a moved string vs a copied one, for short strings that fit the small-string buffer?
