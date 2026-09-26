---
title: Documentation
description: Start with the question you are trying to answer.
---

Orbit compiles to C, so what you write is what a C compiler sees. There is no
runtime to install and no framework tree to pull in. That is the whole pitch,
and everything below is the detail behind it.

## Start here

**New to Orbit.** Get to a running service in one page: build the compiler,
start a server, and read a real response.
[Getting started →](/docs/start/getting-started)

**Want to see the language.** Functions, bindings, models, routes, and
telemetry. Every snippet runnable, every output verified.
[Language tour →](/docs/start/tour)

## The contract, and the limits

Orbit publishes what it can't do, next to the pages that use each feature,
because finding that out at midnight is a bad way to learn a language.

- **No multipart uploads.** The file helper compiles and saves nothing.
- **No database migrations.** Tables are created on startup, never altered.
- **No p50 or p99.** The runtime reports a mean, not a distribution.
- **One host per cluster.** No shared state, no proxying, no failover.

The full list, with workarounds, is in
[known limitations](/docs/reference/limitations).

## If a number matters to you

The honest state is that the end-to-end performance figures sit inside the
run-to-run noise of a shared machine, so the home page publishes none. The
method is written down, and it forbids the two shortcuts that make benchmark
documents worthless: converting CPU time into joules with a universal factor,
and reporting only the runs that worked.
