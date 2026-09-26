---
title: Known limitations
description: The honest list. What happens today, how to work around it, and what would change it.
---

Nothing here is a roadmap promise with a date. This is what was measured on this
build, on a Windows x86-64 host with gcc, in September 2026. Linux paths are
marked untested where they could not be run.

## Multipart uploads are not implemented

`req.file()` compiles and maps to a stub that returns a placeholder path and
saves nothing. Called with one argument it also triggers a C arity warning, so
you will hear about it.

**Work around it.** Upload raw bodies. The file server tutorial does exactly
that and says so in the text, so you are not reading a working example and
discovering the gap later.

**What would change it.** A multipart parser in the runtime and a real write
path, neither of which exists.

## Custom tables are created, not migrated

On startup the runtime creates the four built-in tables plus one per model in
your program, with `CREATE TABLE IF NOT EXISTS`.

**Work around it.** For a development machine, change the model, drop the
table, and let startup recreate it. The
[migrations guide](https://github.com/joacokhzyx/orbit-lang/blob/main/docs/guides/migrations.md)
describes the practice that works.

**What would change it.** Schema versioning, an upgrade path, and a
transaction-boundary contract for application code.

## No p50 or p99

`system.*` exposes uptime, pid, worker count, total requests, and mean latency
in microseconds. There is no latency distribution and no success and error
split. `/_ledger` adds per-route request counts, mean milliseconds, and
database share.

**Work around it.** A mean is not a tail. If you need percentiles for a
service-level objective, you have to measure them outside the process, and the
number you get will include your client.

## Cluster is single-host only

`orbit cluster` starts N copies of one service on this machine. There is no
shared state, no proxying, no failover, and no multi-host story.

**What is verified.** `up`, `status`, and `down` are covered by the deploy
tutorial. `drain` and the rolling restart follow the platform rule below.

## Graceful shutdown is POSIX only

Drain in-flight requests, then exit, runs on POSIX through `SIGTERM`. On
Windows the stop is `TerminateProcess`: immediate, with in-flight requests lost.
`drain` and the graceful phase of `restart` and `down` are best-effort there.

## Two servers on one port do not fail loudly on Windows

Starting two servers on the same port on Windows did not fail in testing. Both
processes kept running and the port answered.

**Work around it.** Check before you start:
`netstat -ano | findstr 8080`. Untested on Linux, where a bind error is the
normal behaviour.

## No joules on Windows

Energy is reported in joules only where sensors exist, which today means Linux
through RAPL. On other systems the honest proxies are CPU time and resident
memory, and they are never converted to joules with a universal factor.

## The native backend is experimental

`--backend=native` produces x86-64 machine code and is research in progress.
The C backend is the supported path until native matches it on behaviour and on
the bootstrap checks.
