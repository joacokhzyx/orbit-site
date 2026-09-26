---
title: Commands
description: Every command, what it does, and where its output goes.
---

The whole toolchain is one binary after the build. These are its commands.

## Building

```sh
orbit build examples/health_service.orb -o health_service
```

Compiles a source file to C, then invokes your platform's C compiler. The
executable is the only artifact.

```sh
orbit run examples/health_service.orb
```

Builds to a temporary path and starts it, which is the loop you want while
changing a route.

## Checking

```sh
orbit check examples/health_service.orb
```

Type-checks without producing a binary. It runs the same passes `build` does,
so it is the cheap command to put in an editor hook.

```sh
orbit fmt examples/health_service.orb
orbit fmt --check compiler
```

`fmt` is token-based, not regular-expression based, so it does not reformat
inside a string. `--check` prints the files that would change and exits
non-zero, which is what the CI gate uses.

```sh
orbit doctor
```

Read-only project checks, `D001` through `D008`, each with a code you can grep
for. It can apply the whitespace fixes with a flag, and it changes nothing
otherwise.

## Serving

```sh
./health_service 8080
```

The port is the argument. A service prints its startup line to stdout, errors to
stderr, and flushes both, so a redirected log file stays live.

## Measuring

`/_ledger` and `/_ledger/data` are running endpoints, not commands. They give
per-route request counts, mean milliseconds, and database share, and they exist
in every service without code from you.

## Versions

```sh
orbit --version
```

Prints `orbit 0.1.0`. Services report `0.1.0-rc.2` in `/health`, which is not a
mistake: the binary version and the response version are tracked separately
until the pre-release cycle closes. The rule for what counts as breaking is in
[versioning](https://github.com/joacokhzyx/orbit-lang/blob/main/docs/VERSIONING.md).

## Output conventions

Errors go to stderr and ordinary output to stdout, so a pipeline does not
capture a diagnostic. Every command supports `--quiet` and `--verbose`, and
`--help` works per command rather than only globally.
