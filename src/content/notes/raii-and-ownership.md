---
title: RAII and ownership
date: 2026-11-26
area: programming
type: concept
maturity: budding
milestone: cpp/ownership
summary: Tie every resource to an object's lifetime, give it exactly one owner, and most leaks and cleanup bugs disappear.
tags: [cpp, ownership, raii]
starter: true
cards:
  - q: What does RAII stand for, and what is the core idea?
    a: Resource Acquisition Is Initialization. A resource is acquired in a constructor and released in the destructor, so its lifetime is tied to an object's scope.
  - q: Why does RAII make code exception-safe without `try`/`catch`?
    a: When an exception unwinds the stack, destructors of fully constructed local objects run automatically, so resources are released on every exit path.
  - q: What is the rule of zero?
    a: Classes should not declare destructors, copy or move operations themselves. Hold resources in members that already manage them (`std::vector`, `std::unique_ptr`, …) and let the compiler generate the rest.
  - q: When do you need the rule of five?
    a: When a class directly manages a resource. If you write any of destructor, copy constructor, copy assignment, move constructor or move assignment, you almost certainly need to think about all five.
sources:
  - title: "cppreference: RAII"
    url: https://en.cppreference.com/w/cpp/language/raii
  - title: "C++ Core Guidelines: R (resource management)"
    url: https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines
---

> [!note] Starter note
> A starting point for the [[move-semantics]] and ownership steps of the C++ path. Rewrite it in your own words once the ideas click.

## The idea in one sentence

**Every resource is owned by exactly one object, and the object's destructor releases it.** Memory, file handles,
sockets, locks, GPU buffers, database transactions: anything that must be "given back" is a resource.

C++ destructors run *deterministically*: at the closing brace of a scope, when a containing object is destroyed, or
during stack unwinding after an exception. That one language guarantee is what makes RAII work.

```cpp
void write_report(const std::string& path) {
    std::ofstream out(path);          // acquire: the file opens
    std::lock_guard lock(report_mutex); // acquire: the mutex locks
    out << build_report();            // may throw
}                                     // release: unlock, then close. Always, in reverse order.
```

No `close()`, no `unlock()`, and no `catch` block, yet nothing leaks if `build_report()` throws.

## Ownership is a design decision

The question to ask about every pointer or handle is: **who owns this?** In modern C++ the type should answer it.

| You have | It means |
| --- | --- |
| `T` (a value or member) | This object owns the `T` outright |
| `std::unique_ptr<T>` | Sole owner of a heap object; movable, not copyable |
| `std::shared_ptr<T>` | One of several owners; the last one out deletes it |
| `T&`, `T*`, `std::span<T>`, `std::string_view` | **Not** an owner: a view that must not outlive the owner |

Raw pointers aren't evil; *owning* raw pointers are. A `T*` that means "I'm looking at this, someone else owns it" is
fine, as long as the lifetime is obviously shorter.

## Rule of zero, rule of five

Most classes should manage nothing directly. Compose them from members that already manage their resources, and the
compiler-generated copy, move and destructor do the right thing:

```cpp
class Document {
    std::string title_;
    std::vector<Page> pages_;
    std::unique_ptr<Renderer> renderer_;  // makes Document move-only, which is honest
};  // no destructor, no copy or move operations written: the rule of zero
```

Only a class whose *job* is to manage one resource should write the special members, and then it should consider all
five (destructor, copy constructor, copy assignment, move constructor, move assignment).

> [!tip] Wrapping a C API
> `std::unique_ptr` takes a custom deleter, which often removes the need to write a class at all:
> `std::unique_ptr<FILE, decltype(&std::fclose)> f(std::fopen(path, "r"), &std::fclose);`

## Common mistakes

- Calling `new` directly. Prefer `std::make_unique` and `std::make_shared`.
- Using `shared_ptr` "to be safe". It hides the real ownership, costs an atomic reference count, and invites cycles.
- Returning a `string_view` or reference into a local or temporary: the classic dangling view.
- A destructor that throws. Destructors are `noexcept` by default; throwing from one during unwinding terminates the program.

## Open questions

- How does ownership map onto a thread pool, where tasks outlive the function that submitted them?
- When is `shared_ptr` genuinely the right model? (Caches and graph-like structures are candidates.)
