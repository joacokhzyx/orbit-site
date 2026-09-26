---
title: Frequently asked
description: The questions that come up, answered without hedging.
---

## Is Orbit faster than Rust or Go?

I don't claim that, and I would not publish a number that says so. Plenty of
languages optimise for peak benchmark power, and that often needs more memory
and energy to stay fast. Orbit tries a different trade. Whether it is a better
one is something measurements have to answer, not a marketing page.

## Does it run on my machine?

If you have a C compiler and Python 3.10 or newer, yes. Windows x86-64 and
Linux are the supported paths. The
[platform support](https://github.com/joacokhzyx/orbit-lang/blob/main/docs/SUPPORT.md)
page lists what is verified where, and marks the rest untested rather than
assuming.

## Why C instead of WebAssembly?

Because a service is a thing you deploy, and a service that ships as one file
with no runtime beside it is the property worth having. The cost is that there
is no browser target, so you cannot run Orbit in a tab. That is a real
limitation, and it is in
[known limitations](/docs/reference/limitations).

## Is the compiler really written in Orbit?

Yes. `compiler/*.orb` is the compiler, and it compiles itself to a fixed point
that the build verifies. A committed C file is the trust root, so verification
needs a C compiler and Python and nothing else.

## Do I need Zig?

No. The Zig seed tree was removed. The bootstrap reads committed C.

## How big is the standard library?

Small, and it got smaller on purpose. Seven unimportable stubs were deleted
rather than shipped: duplicates of builtins, hardcoded fakes, and one file that
did not parse as written. What remains is 13 modules with tests, each of them
importable and each of them documented.

## Can I write closures or generics?

Not today. There are no closures, which is why a higher-order collection API
cannot exist in the standard library, and there are no generics. Both are open
items, and both are listed rather than worked around silently.

## Does it have migrations?

No. Tables are created on startup and never altered. The
[migrations guide](https://github.com/joacokhzyx/orbit-lang/blob/main/docs/guides/migrations.md)
in the repository describes the manual practice that works on a development
machine, and is explicit that it is not a production story.

## Is the energy number real?

There isn't one published yet, and that is a decision rather than an omission.
The figures I have come from a machine shared with other people's work, and the
end-to-end difference sits inside the run-to-run noise. The method is written
down, including the rule that CPU time is never converted to joules with a
universal factor.

## Why is the docs site not a mirror of the repository?

Because two copies of a document is one copy too many. These pages are the
content; the repository holds the same facts next to the code and the tests, and
where they disagree the code is right. Each page links to the file it came from.

## How do I report a bug?

Open an issue. Include the output of `orbit --version`, your platform, and the
command you ran. If a build step surprises you, the answer should be in the
repository, and if it isn't, that is a bug in the documentation.
