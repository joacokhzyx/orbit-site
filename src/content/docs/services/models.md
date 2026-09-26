---
title: Models and SQLite
description: How a model becomes a table, what reads and writes do today, and what has no migration story.
---

A model is a type declaration and a table definition at the same time. There
is no schema file, no migration directory, and no ORM. The runtime issues
`CREATE TABLE IF NOT EXISTS` on startup from the fields you declared.

## Declaring a model

```orbit
model Post {
    id: string
    title: string
    body: string
    views: int
    rating: float
    published: bool
}
```

The mapping is fixed and worth memorising:

| Field type | SQLite type |
| --- | --- |
| `string` | `TEXT` |
| `int`, `bool` | `INTEGER` |
| `float` | `REAL` |
| a field named `id` | the primary key |

An `id` field is what makes a row addressable, so a model without one has no
update or delete path.

## Reading

```orbit
route GET "/posts" {
    val posts = Post.all()
    return ok 200 posts
}

route GET "/posts/:id" {
    val id = req.param("id")
    val found = Post.find(id)
    return ok 200 found
}
```

`find` returns whatever the table holds for that id, and nothing is invented
when the row is absent. The response body is the row, not a wrapper object.

## Writing

```orbit
route POST "/posts" {
    val payload = req.body()
    val created = Post.create(payload)
    if created {
        return ok 201 payload
    }
    return ok 400 "{\"stored\":false}"
}
```

`create` returns `false` in two cases, and it does not raise in either:

- the `id` already exists, because it is the primary key
- the payload has no usable fields

`delete` is the same shape: `true` only when a row was actually removed, so a
delete of a row that was never there is a `false` and not a crash.

## The part that is not finished

Tables are created, never migrated. Adding a field to a model after the table
exists does not alter it, which means a new field reads as empty rather than
failing loudly. There is no schema versioning and no transaction-boundary
contract for application code.

The [migrations guide](https://github.com/joacokhzyx/orbit-lang/blob/main/docs/guides/migrations.md)
in the repository describes the manual practice that works today: change the
model, drop the table, let startup recreate it, and accept the data loss on a
development machine. That is honest, and it is not what you would run in
production.

## What this costs

A connection per process, and the four built-in tables plus one per model are
created on every start. Using any auth helper links the database
automatically, so a service with bearer routes needs no separate setup step.
