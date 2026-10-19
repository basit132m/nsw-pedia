---
title: Ryujinx
summary: >-
  Open-source Nintendo Switch emulator written in C#, known for high accuracy and strong
  first-party game compatibility. Development ceased in October 2024; community forks continue.
logo: ./images/placeholder-logo.webp
platforms: ["Windows", "Linux", "macOS"]
latestVersion: "1.1.1403"
license: MIT
status: Discontinued
requirements:
  cpu: "Quad-core x86-64 with AVX2"
  gpu: "Vulkan 1.2 or OpenGL 4.5 capable"
  ram: "8 GB minimum, 16 GB recommended"
pros:
  - "High accuracy, particularly on first-party titles"
  - "Clean Vulkan backend with solid Linux support"
  - "Open source under MIT"
cons:
  - "No longer officially developed"
  - "Requires user-supplied firmware and keys"
  - "Heavier CPU requirements than some alternatives"
faq:
  - question: Is Ryujinx still being developed?
    answer: >-
      No. Official development stopped in October 2024. The published builds still run, and
      several community forks have continued from the final open-source release.
  - question: Does Ryujinx provide firmware or ROM files?
    answer: >-
      No. Ryujinx ships as an emulator only. Firmware and keys must be supplied by the user
      from hardware they own, and the project has never distributed ROM files.
author: nswpedia-team
publishedAt: 2026-10-18
updatedAt: 2026-10-18
draft: false
---

> **Editorial note:** this entry is the reference implementation for the emulator content
> type. Verify every version number, requirement and status claim against primary sources
> before publishing.

Ryujinx was one of the two emulators that defined Switch emulation on desktop. Written in C#
rather than C++, it traded some raw throughput for accuracy, and in practice that trade paid
off on first-party Nintendo titles that stressed edge cases in the graphics and audio stacks.

## What the emulator does and does not include

Ryujinx is an emulator only. It contains no Nintendo code, no system firmware, and no ROMs.
Running commercial software on it requires firmware and encryption keys dumped from a console
the user owns, which is why every guide on NSWPEDIA covering emulator setup stops at the point
where those files are needed and explains the legal position rather than supplying them.

## Where it stands now

Official development ended in October 2024. The final builds remain functional and the source
remains available under its original licence, which is what allowed community forks to pick up
development. For readers choosing an emulator today, the practical question is whether a
maintained fork has surpassed the final official build on the specific game they care about —
which is exactly what the per-ROM compatibility matrices on this site are for.

## How we evaluate it

Each emulator profile on NSWPEDIA records the platforms it runs on, its licence, its hardware
floor and its maintenance status. Compatibility claims never live on this page; they live on
individual ROM pages, tied to a specific device and test date, so a reader can see whether a
result is six days or six years old.
