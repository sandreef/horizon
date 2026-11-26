---
title: A modern C++ project setup
date: 2026-11-26
area: programming
type: guide
maturity: budding
milestone: cpp/toolchain
summary: A minimal CMake layout with strict warnings, tests, and sanitizer builds, so every practice project starts right.
tags: [cpp, tooling, cmake, testing]
starter: true
cards:
  - q: What is the difference between a compile error and a link error?
    a: A compile error is in one translation unit (syntax, types). A link error happens when combining object files, usually a declared function or variable with no definition, or one defined twice.
  - q: Which warning flags are a good default for GCC and Clang?
    a: "`-Wall -Wextra -Wpedantic`, plus `-Werror` in CI so warnings can't accumulate."
  - q: In CMake, what does `target_link_libraries(app PRIVATE core)` mean?
    a: The `app` target links against the `core` library, and `core`'s usage requirements (include paths, flags) apply to `app` without being passed on to anything that links `app`.
sources:
  - title: CMake tutorial
    url: https://cmake.org/cmake/help/latest/guide/tutorial/index.html
  - title: GoogleTest quickstart with CMake
    url: https://google.github.io/googletest/quickstart-cmake.html
---

> [!note] Starter note
> The first step of the C++ path. Use this as the template for every practice project, then adjust it as you learn.

## Layout

```text
practice/
├── CMakeLists.txt
├── src/
│   ├── ring_buffer.hpp      # the library
│   └── main.cpp             # a small app that uses it
└── tests/
    └── ring_buffer_test.cpp
```

Keep the library separate from `main` from day one. It's what makes the code testable.

## CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.24)
project(practice LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)   # for clangd and clang-tidy

add_library(core INTERFACE)              # header-only for now
target_include_directories(core INTERFACE src)
target_compile_options(core INTERFACE -Wall -Wextra -Wpedantic)

add_executable(app src/main.cpp)
target_link_libraries(app PRIVATE core)

# Tests with GoogleTest, fetched at configure time
include(FetchContent)
FetchContent_Declare(googletest
  URL https://github.com/google/googletest/archive/refs/tags/v1.15.2.zip)
FetchContent_MakeAvailable(googletest)

enable_testing()
add_executable(tests tests/ring_buffer_test.cpp)
target_link_libraries(tests PRIVATE core GTest::gtest_main)
include(GoogleTest)
gtest_discover_tests(tests)
```

## Three builds you'll use

```sh
cmake -B build -DCMAKE_BUILD_TYPE=Debug && cmake --build build && ctest --test-dir build
cmake -B build-rel -DCMAKE_BUILD_TYPE=Release            # for benchmarks
cmake -B build-asan -DCMAKE_BUILD_TYPE=Debug \
  -DCMAKE_CXX_FLAGS="-fsanitize=address,undefined -fno-omit-frame-pointer"
```

See [[undefined-behavior-and-sanitizers]] for why the third one matters.

## A first test

```cpp
#include <gtest/gtest.h>
#include "ring_buffer.hpp"

TEST(RingBuffer, OverwritesOldestWhenFull) {
    RingBuffer<int, 3> rb;
    for (int i = 1; i <= 4; ++i) rb.push(i);
    EXPECT_EQ(rb.size(), 3u);
    EXPECT_EQ(rb.front(), 2);   // 1 was overwritten
}
```

> [!tip] Write the test name as a sentence
> `OverwritesOldestWhenFull` tells you what broke without reading the body. Good names make failures self-explaining.

## Tools worth installing early

- **clangd** in your editor (reads `compile_commands.json`) for accurate completion and inline errors.
- **clang-format** with a `.clang-format` file, so formatting is never a review topic.
- **clang-tidy** for static checks; see [[reviewing-ai-written-cpp]].
- **Compiler Explorer** (godbolt.org) to see what your code compiles to.
