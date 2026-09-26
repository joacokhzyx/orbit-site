---
title: Getting started
description: Build the compiler, run a service, and see the response.
---

Orbit is a statically typed language for APIs and microservices. This page takes
you from an empty directory to a running service that answers a request.

## What you need

Three things, and nothing else:

- A C compiler. gcc, clang, or MSVC.
- Python 3.10 or newer.
- git.

No Zig. The bootstrap reads a committed C file, so there is no extra toolchain to
install and no package to fetch before you can build.

## Build the compiler

```sh
git clone https://github.com/joacokhzyx/orbit-lang.git
cd orbit-lang
python scripts/build_selfhost.py --out orbit
```

The build compiles the compiler, then compiles the compiler it just built, and
stops when the two agree. That agreement is the fixed point, and the script
tells you when it reaches it.

On Windows the same commands produce `.\orbit.exe`.

## Run a service

```sh
./orbit build examples/health_service.orb -o health_service
./health_service 8080
```

Then ask it something:

```sh
curl http://127.0.0.1:8080/health
```

```json
{"status":"UP","version":"0.1.0-rc.2","uptime_seconds":0}
```

Every value in that response comes from a live runtime counter. The route has no
hardcoded numbers to go stale.

## The other two endpoints

The same file serves readiness and metrics, and both are worth knowing because
they cost nothing to run:

```sh
curl http://127.0.0.1:8080/ready
curl http://127.0.0.1:8080/metrics
curl http://127.0.0.1:8080/_ledger
```

## If it fails

**The build diverges and doesn't converge.** Check that your C compiler matches
the one the fixed point was produced with, then run
`python scripts/verify_seed.py --cc "gcc"`. It compares the committed C file with
the published contract and names the stage that differs.

**Port already in use.** Start on a different one: `./health_service 9090`. On
Windows a second server on a busy port does not fail loudly, so check with
`netstat -ano | findstr 8080` and stop the older process.

**Nothing prints on start.** Server output is flushed, but if you redirect to a
file, read the file. Errors go to stderr, not stdout.

## Where to go next

- The [language tour](/docs/start/tour) walks through the syntax with runnable
  snippets and their verified output.
- [Language reference](/docs/language/reference) is the contract: bindings,
  control flow, routes, models, and the limits that apply today.
