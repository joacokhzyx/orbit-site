---
title: Orbit on the web
description: Everything the runtime exposes on the network, and how to call it from a browser.
---

An Orbit service is a native binary that speaks HTTP. This page is about what
it answers, so you can call one from anything: curl, a test, or a browser.

## The endpoints every service gets

You do not write these. They exist as soon as the binary starts, and they cost
nothing:

| Path | What it returns |
| --- | --- |
| `/health` | liveness, with the version and uptime |
| `/ready` | whether the process is accepting traffic |
| `/metrics` | request totals, mean latency in microseconds, active workers |
| `/_ledger` | per-route request counts, mean milliseconds, database share |
| `/_ledger/data` | the same, as data rather than a page |

`/health` is the one to put in a load balancer, and it is the one in the
repository's own examples.

## Calling one from a browser

Orbit is not a browser runtime, so this is a service you call, not code you
bundle. A fetch from a page looks like this:

```js
const response = await fetch("http://127.0.0.1:8080/health");
const body = await response.json();
// { status: "UP", version: "0.1.0-rc.2", uptime_seconds: 12 }
```

Two things follow from Orbit emitting C and not JavaScript:

- **CORS is your front end's job.** Add the headers at the edge, or serve the
  page from the same origin.
- **There is no WebAssembly build.** You cannot run Orbit in a tab today. If you
  need to try a route without a server, the examples in the repository are the
  fastest path, and they are three commands.

## Serving the files it produces

A compiled service is one file. There is no asset directory to copy and no
runtime to install next to it, so deploying is copying a binary and giving it
a port.

```sh
./orbit build examples/blog_api.orb -o blog_api
./blog_api 8080
```

The [deploy tutorial](https://github.com/joacokhzyx/orbit-lang/blob/main/docs/tutorials/deploy-single-binary.md)
covers Windows, Linux, and one-box clustering.

## What a request does not get you

There is no latency distribution, so `p99` is not something you can read off a
running service today. `system.latency_avg_us()` is a mean, and a mean is not
a tail. If you need percentiles, the honest answer is that the instrumentation
for them is not built yet, and it is listed as an open item rather than
improvised from a mean.
