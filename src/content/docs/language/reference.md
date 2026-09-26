---
title: Language reference
description: The user-visible contract. What the language does today, and where it stops.
---

This is the contract. When the prose here and the behaviour of the compiler
disagree, the discrepancy is a bug, and the fix lands in one of them, not in
this page.

## Types

`int`, `float`, `bool`, `string`, arrays, and unions. Types are checked at
build time, and a mismatch is a compile error rather than a surprise at
runtime.

```orbit
val port: int = 8080
val ratio: float = 0.75
val ready: bool = true
val name: string = "orbit"
```

## Unions and `match`

`union` declares a type that is one of several shapes, and `match` narrows it.
This is the escape hatch for a value whose shape you do not know at compile
time, such as a decoded JSON row.

```orbit
union Payload {
    Text(string),
    Number(int)
}

match payload {
    Text(value) { emit value }
    Number(value) { emit value }
}
```

## Bindings

`val` is immutable, `var` is mutable, and `mut` is the one a function can write
back to. A write to a `val` is a build error.

## Functions

```orbit
fn greet(name: string) -> string {
    return "hello " + name
}
```

There are no generics. Where a function needs to work on several types, it
takes the value and the caller does the narrowing, which is more ceremony and
fewer surprises.

## Imports

```orbit
import "std/string/string.orb"
import "std/hash/hash.orb"
import "std/test/assert.orb"
```

The path is under `std/` or `lib/`, and the name is lowercase. Imports are
deduplicated, so a module imported twice in a tree compiles once.

## Errors and results

`ok` and `err` are the two shapes a result takes. `try` propagates and `catch`
handles:

```orbit
val parsed = try {
    parseIntChecked(raw)
} catch {
    err 400 "{\"error\":\"not a number\"}"
}
```

One binding gap is known and open: assigning a `try` expression directly to a
`val` fails in semantic analysis, and the working form is an intermediate
binding. It is written up as STAB-9 in the repository's engineering contract,
which means it is tracked rather than folklore.

## What is not supported today

- No generics.
- No closures, so a higher-order collection API cannot be written in std. This
  is why the list and map helpers that existed as stubs were deleted rather
  than shipped half-working.
- No native backend. `--backend=native` is research; C is the supported path.
- No WebAssembly target.

## Where the full detail lives

The repository's
[language reference](https://github.com/joacokhzyx/orbit-lang/blob/main/docs/LANGUAGE_REFERENCE.md)
is longer and more precise than this page. This one is the subset you need to
write a service, and the other one is the subset you need to change the
compiler.
