---
title: Auth and roles
description: Bearer tokens, role lookup, and the two status codes an API returns when it says no.
---

Orbit's auth is a session lookup, not a token format. You insert the rows; the
runtime resolves them.

## Reading the token

```orbit
val token = req.bearer_token()
```

This never crashes on a missing header. It returns whatever the header held, so
an absent token is an empty value you can test rather than an exception you
have to guard.

## Checking a role

```orbit
route DELETE "/notes/:id" {
    val id = req.param("id")
    if !req.has_role("admin") {
        err 403 "{\"error\":\"admin role required\"}"
    }
    val gone = Note.delete(id)
    if gone {
        return ok 200 "{\"deleted\":\"" + id + "\"}"
    }
    return ok 404 "{\"deleted\":false}"
}
```

`has_role` resolves through the `sessions` table joined to `users.role_name`,
and it honours `expires_at`. A `0` in `expires_at` means never.

The two rejections are distinct on purpose, because a client can act on the
difference:

| Status | Meaning |
| --- | --- |
| `401` | no token, or the token does not resolve to a session |
| `403` | the session resolves, and the role is not enough |

## Where the rows come from

Tokens are rows you insert. Using any auth helper links the database
automatically, so there is no separate connection step to forget.

The harness the repository tests against is `tests/auth/auth_harness.c`, and
it is the honest reference for the table shape: a `users` row, a `sessions`
row with the token and the expiry, and a role name on the user.

## What is verified, and where

This was checked live against `examples/sqlite_notes.orb`: `401` without a
token, `403` for a non-admin delete, `200` for an admin delete. The example is
in the repository and runs as written.

One limit is worth stating here rather than in a footnote: there is no rate
limiting on the auth path itself. If you need it, the HTTP layer's admission
gate is a separate concern, described in
[Kynx](/docs/services/kynx).
