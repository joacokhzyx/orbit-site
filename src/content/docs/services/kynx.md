---
title: Kynx, the HTTP layer
description: Rate limiting, identity admission, and why the Bloom filter is never authority.
---

Kynx is the runtime's HTTP layer. It is not a framework you configure, and it
does not appear in your source: a service is routes, and Kynx is what sits
under them.

## What it does

**Rate limiting.** Every client gets a budget per window. Exceeding it returns
`429` and closes the connection. A saturation test on one IP gets banned early
and stays banned for the window, which is why a naive benchmark against a
single address measures the limiter instead of the service.

**Identity admission.** Requests from a client that has not been seen are
admitted through a slower path, so an unseen address is not a free pass and a
known one is not paying full price every time.

**A Bloom filter for the negative cache.** This is the part worth being precise
about, because it is the part that gets misunderstood: the filter caches
*negatives*, and a filter that caches negatives is allowed to say "maybe". It is
never treated as authority. A positive from the filter is always confirmed
against the real table before it means anything.

## What it does not do

Kynx does not terminate TLS, does not parse multipart bodies, and does not
proxy. Those are the three things people expect from an HTTP layer and none of
them are in 0.1.0. A file upload saves nothing; see
[known limitations](/docs/reference/limitations).

## The protections that were fixed

These were real problems, found and fixed, and they are listed because a
security document that only lists what works is not a security document:

- slowloris timeouts, so a slow client cannot hold a worker open
- exec is opt-in, not on by default
- the seed credential was removed
- chunked encoding returns `501` rather than being silently mis-parsed
- strict single-placeholder queries, so a parameter that looks like SQL is
  rejected instead of interpolated
- an SQL identifier whitelist, so a table or column name from a request never
  reaches the statement

## The cost

The hit path is roughly 0.11 to 0.13 microseconds for the whole gate: parse,
hash, Bloom lookup, clock read, lock, and scan. It is not the expensive part of
a request. The per-request access log, at 4 to 5 microseconds, costs more than
everything Kynx does.

That number is a micro-benchmark, not an end-to-end one, and the
[methodology](https://github.com/joacokhzyx/orbit-lang/blob/main/docs/PERF.md)
page says so, including the attempt to make the repeat-hit path faster that was
tried and dropped.
