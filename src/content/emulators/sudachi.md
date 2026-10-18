---
title: Sudachi
summary: >-
  Community-maintained Nintendo Switch emulator fork, continuing development from a prior
  open-source release with ongoing fixes for rendering, audio and performance.
logo: ./images/placeholder-logo.webp
platforms: ["Windows", "Linux", "Android"]
license: GPL-3.0
status: Fork
requirements:
  cpu: "Quad-core x86-64 with AVX2, or ARMv8 for Android"
  gpu: "Vulkan 1.1 capable"
  ram: "8 GB minimum"
pros:
  - "Actively maintained by the community"
  - "Runs on Android as well as desktop"
cons:
  - "Release cadence and stability vary between builds"
  - "Requires user-supplied firmware and keys"
faq:
  - question: Does Sudachi include games or firmware?
    answer: >-
      No. It is an emulator only. Firmware and keys must come from hardware the user owns.
author: nswpedia-team
publishedAt: 2026-10-18
updatedAt: 2026-10-18
draft: false
---

> **Editorial note:** reference implementation. Verify status, licence and requirements
> against the project's own repository before publishing.

Sudachi is a community fork of a previously released open-source Switch emulator. Forks of
this kind inherit the original codebase and licence, then diverge as different maintainers
prioritise different problems — one may chase shader compilation stutter while another focuses
on Android performance or audio accuracy.

## Why forks matter for compatibility

Because forks diverge, "does this game run?" stops being a question about Switch emulation in
general and becomes a question about a specific build on specific hardware. A title that is
flawless on one fork's desktop build can stutter badly on another's Android build running the
same renderer. That is the reason NSWPEDIA records compatibility per emulator, per platform
and per device rather than publishing a single global rating per game.

## What this page covers

This profile covers what Sudachi is, which platforms it targets, its hardware floor and its
maintenance status. Per-game results live on the individual game pages, each stamped with the
device and the date it was tested, so readers can weigh how current any given result is before
relying on it.

## Hardware expectations

Switch emulation is demanding in a way that is easy to underestimate. The console's own
hardware is modest, but reproducing its graphics API, audio pipeline and CPU behaviour on a
completely different architecture costs far more than the original silicon ever did. On
desktop, the practical floor is a modern quad-core processor with AVX2 support and a GPU with
working Vulkan drivers. On Android, the picture is governed less by raw chip performance than
by driver quality — two phones with comparable benchmark scores can behave very differently
depending on whose GPU driver they ship.

Shader compilation is the other factor that shapes the experience. The first run through any
given area compiles shaders on demand, which produces stutter that disappears on subsequent
visits once the cache is populated. A frame rate figure recorded on a cold cache and one
recorded on a warm cache describe two different things, which is why our testing procedure
specifies which of the two we measured.

## Firmware and keys

Sudachi ships as an emulator only. Running commercial software on it requires system firmware
and encryption keys taken from a console the user owns. NSWPEDIA does not supply either, and
our guides stop at the point where those files are needed rather than pointing readers to
sources for them. What we do document is the technical requirement itself, so readers
understand why an emulator that installs cleanly may still refuse to launch anything.
