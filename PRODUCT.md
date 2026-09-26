# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: developers who are tired of large dependency trees.** They already
write and ship services. They arrive sceptical of the claim that less is more,
because "less is more" is what every dependency-shedding language says, and
they have been disappointed before. Their job is to decide whether this is
worth an afternoon, which means the site has to show the mechanism rather than
assert the benefit.

**Secondary: people with servers to spare.** They have memory and CPU headroom,
they are not optimising out of necessity, and the argument that reaches them is
predictability: one static binary, no runtime to install, nothing that changes
underneath a running service.

**Also: enthusiasts who want to try a new language, and people who simply want
to support the mission.** This is a real audience rather than a courtesy. It
sets a bar the site has to meet without lowering it for the first audience: the
bootstrap and the fixed point are genuinely interesting, and a reader who came
for that should find it rather than have to dig for it.

## Product Purpose

Orbit is a statically typed language for APIs and microservices. It compiles to
C through a compiler written in Orbit itself, which reaches a fixed point that
can be verified. The result is that a service ships as one native binary with
no runtime installed beside it.

Success means a reader can tell what Orbit is, what it costs to adopt, and what
it cannot yet do, without being told a single number the project has not
measured.

## Positioning

The mechanism is the self-hosted bootstrap with a committed C trust root: the
compiler compiles itself and reaches a fixed point, and that fixed point is
something a reader can check rather than take on trust. A neighbouring language
cannot claim this by assertion, because the claim is checkable.

The second mechanism is that compiling to C hands the final binary to the
platform's own C compiler. There is no runtime to install, no framework tree to
pull, and no garbage collector to reason about under load.

## Operating Context

- A service is built, run, and shipped as a single file. `python scripts/build_selfhost.py` builds the compiler; the C compiler produces the executable.
- The toolchain is a C compiler, Python 3.10 or newer, and git. There is no package manager install and no prebuilt artefact was available until the first release.
- Reading the documentation is a normal part of evaluating the language, and it is published on this site under `/docs`.
- The repository is authoritative for the code, the tests, and the documents this site does not carry. Where a page here and a file there disagree, the file is right.
- A reader who wants energy or performance figures is reading work-in-progress. The method is written down; the clean end-to-end numbers are not published, and the site says so where a figure would otherwise go.

## Capabilities and Constraints

**Confirmed capabilities**

- Statically typed, with compile-time type checking across bindings, control flow, routes, and models.
- Compiles to C and ships as one native binary.
- The compiler is written in Orbit and reaches a verifiable fixed point from a committed C trust root.
- HTTP runtime (Kynx), SQLite integration, arena allocation, and `system.*` telemetry builtins.
- `orbit build`, `run`, `check`, `fmt`, `doctor`, `init`, and single-host `cluster`.

**Confirmed constraints and stated limits**

- Tables are created on startup and never altered. There is no migration story; adding a field later leaves the existing table alone.
- No multipart uploads. The file helper compiles and saves nothing.
- Telemetry reports a mean in microseconds, not a distribution. There is no p50 or p99.
- The cluster command starts copies on one machine. There is no shared state, proxying, or failover.
- Kynx does not terminate TLS, does not parse multipart bodies, and does not proxy.
- Energy in joules is reported only where the hardware exposes sensors, which today means Linux. Everywhere else the honest proxies are CPU time and resident memory, never converted with a universal factor.

**Distribution, as of the newest release (0.1.0-rc.2)**

- Linux x86-64 and Windows x86-64 ship builds. These are the platforms the site may promise.
- **macOS is wanted and the release is behind it.** A macOS build exists only in 0.1.0-rc.1, under a different asset name, and rc.2 ships none. The site states this gap rather than staying silent about it, and offers no macOS download that would fail.
- **No arm64 build exists in any release.** Recorded as an undecided product question: whether arm64 is a near-term priority is not settled, and the site must not promise a date for it.
- No checksum is published with any release. The site tells the reader to compare the file size it states against what their download reports.
- No package manager install exists: no tap, no `curl | sh`, no cargo or npm package.

**Explicitly undecided**

- Whether arm64 becomes a commitment.
- Whether 0.1.0 stable is the next milestone and what it must contain before it is cut.
- Whether the macOS gap is closed in the next release or in a release after it.

## Brand Commitments

- **Name: Orbit. Organisation: Orbit Software Foundation.** Not "Orbit Foundation"; the full legal name appears in the licence and the package metadata.
- **Voice: calm, precise, no hype.** This is binding on all future work, including visual work.
- **Honesty is a brand asset, not a disclaimer.** Every number carries its machine, its method, and its limits. Where a figure does not exist, the page says why instead of omitting the claim quietly.
- **Stating limits is a feature.** The site says what the project cannot do next to the documentation that uses the feature, rather than behind it.
- The wordmark, the logo mark in `public/logo.svg`, and the existing copy are preserved. Editing the mark means editing that file and running `pnpm icons`.
- **The visual world is not a commitment.** The palette, the type scale, and the layout language are open to replacement. Only the voice and the honesty bind the redesign.

## Evidence on Hand

Real, on the site today:

- Eleven documentation pages under `/docs`, authored here, with the Orbit grammar on every fence.
- A curated changelog whose dates are read from the repository's releases at build time rather than written by hand.
- A `known limitations` page with eight limits, four of them carrying a worked-around recipe.
- A benchmark methodology and an energy measurement document, both in the repository, both explicitly forbidding CPU-time-to-joules conversion.
- A dated project status page and a roadmap, in the repository.
- An IEA figure (415 TWh in 2024, roughly 1.5% of global electricity) used once as context for why energy per request matters, attributed inline, and explicitly marked as context rather than as an Orbit measurement.

**Absences future work must not fabricate**

- No end-to-end performance or energy figure for Orbit. The site publishes none today and says why.
- No customer, user count, testimonial, adoption number, or funding claim.
- No benchmark comparison against another language. The method forbids converting CPU time into joules with a universal factor, so cross-language energy claims are not available.
- No macOS or arm64 download exists for the current release.
- No package manager install exists.

## Product Principles

1. **Show the mechanism, do not assert the benefit.** A reader should be able to check the fixed point, read the method, or read the limitation instead of taking a claim on trust.
2. **Never publish a number the project has not measured.** Including in the negative case: a future date, a benchmark, or a platform.
3. **Name what is missing.** A gap stated plainly builds more trust than a silence a reader has to interpret.
4. **One binary, no runtime.** The shape of the artefact is the product's core promise and every page should be consistent with it.
5. **The reader decides on evidence.** The site exists to let someone choose or refuse Orbit honestly, so both outcomes are a success.

## Accessibility & Inclusion

WCAG 2.2 AA is the bar, and it is verified rather than asserted. `pnpm test:a11y`
runs axe over every built page in both themes at 320, 768, and 1440 pixels, and
fails the build on any violation.

Enforced in the repository, not left to review:

- Every text pair clears 4.5:1 and every meaningful boundary clears 3:1, in both themes, checked by `pnpm check:contrast` against a gate that carries its own self-test.
- Every syntax colour clears 4.5:1 against the surface code is actually painted on, checked by `pnpm check:code-contrast`.
- Interactive targets are at least 44 by 44 CSS pixels, with one measured exception: the copy button inside a code block header is 36 by its height, which clears the WCAG 2.2 AA minimum of 24 by 24 comfortably but does not reach 44. It is recorded here rather than rounded up in the copy.
- The theme toggle reports the state it puts the page in, and a reader who arrives in dark mode is not told the button switches to dark.
- State is never signalled by colour alone; callouts carry a visible label and a shape as well as a tint.

No product-specific accessibility requirement was established beyond this. The
site ships no analytics, no cookies, and no third-party embeds, so there is no
tracking consent surface to design.
