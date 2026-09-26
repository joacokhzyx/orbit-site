---
title: Language tour
description: Functions, bindings, control flow, routes, and models, with the output each one produces.
---

Every snippet on this page is a trimmed copy of a file in the repository, and
every output under it was captured from a real run. If a snippet and the
repository ever disagree, the repository is right.

## Bindings

`val` is immutable and `var` is not. A `mut` binding is the only kind a
function can write back to.

```orbit
val total = 3
var count = 0
count = count + 1
```

The compiler rejects a write to a `val` at build time, not at runtime.

## Control flow

`if`, `for`, `while`, and `loop` are there. `match` works on unions, which is
how you narrow a value you don't know the shape of yet.

```orbit
if payload == "" {
    err 400 "post a JSON body with id and title"
}

for post in posts {
    if post.published {
        emit post
    }
}
```

## A route

A service is a list of routes. Each one takes a request, does something small,
and returns a status and a body.

```orbit
route GET "/notes/:id" {
    val id = req.param("id")
    return ok 200 "{\"note\":\"" + id + "\"}"
}
```

A segment like `:id` or `{id}` captures one non-empty segment and binds through
`req.param("id")`. Two limits are worth knowing now: captured values are not
percent-decoded, and at most 8 captures bind per request.

Static routes win over parameter routes, so both of these can exist without
colliding:

```orbit
route GET "/posts/search" {
    return ok 200 "{\"static\":true}"
}

route GET "/posts/:id" {
    val id = req.param("id")
    return ok 200 "{\"post\":\"" + id + "\"}"
}
```

## A model is a table

Declare the fields and the runtime creates the table on startup:
`string` becomes `TEXT`, `int` and `bool` become `INTEGER`, `float` becomes
`REAL`, and an `id` field becomes the primary key.

```orbit
model Post {
    id: string
    title: string
    body: string
    views: int
    rating: float
    published: bool
}

route GET "/posts" {
    val posts = Post.all()
    return ok 200 posts
}

route POST "/posts" {
    val payload = req.body()
    if payload == "" || payload == "{}" {
        err 400 "post a JSON body with id and title"
    }
    val created = Post.create(payload)
    if created {
        return ok 201 payload
    }
    return ok 400 "{\"stored\":false}"
}
```

`Model.create()` returns `false` when the id already exists or the payload has
no usable fields, rather than raising. `Model.delete()` returns `true` only
when a row was actually removed.

## Telemetry

`system.*` reads live counters, not constants. There is no p50 or p99 yet,
which is stated plainly in [known limitations](/docs/reference/limitations).

```orbit
route GET "/metrics" {
    val total = system.http_requests_total()
    val latency = system.latency_avg_us()
    val workers = system.active_workers()
    return ok 200 "{\"metrics\":{\"http_requests_total\":" + total + ",\"latency_avg_us\":" + latency + ",\"active_workers\":" + workers + "}}"
}
```

`/_ledger` adds per-route request counts, mean milliseconds, and database share,
with no code from you. What isn't measured isn't exposed.

## Imports

Modules import by their path under `std/`, and the name is lowercase:

```orbit
import "std/string/string.orb"
import "std/hash/hash.orb"
import "std/test/assert.orb"
```

There is a test helper that lives in the standard library, which is unusual and
deliberate: the language has no test framework of its own, so the assertions a
suite needs are a module anyone can import.
