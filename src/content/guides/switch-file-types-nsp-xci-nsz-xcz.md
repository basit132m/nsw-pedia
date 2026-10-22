---
title: 'Nintendo Switch File Types Explained: NSP, XCI, NSZ and XCZ'
summary: What each Nintendo Switch file container actually is, how NSP and XCI differ, what the compressed NSZ and XCZ variants change, and how to read a Title ID.
cover: ./images/Nintendo Switch File Types Explained NSP, XCI, NSZ and XCZ.webp
difficulty: Beginner
timeRequired: 6 min read
tags:
  - file formats
  - title id
  - reference
faq:
  - question: What is the difference between NSP and XCI?
    answer: An NSP is the container format used for digital eShop content, while an XCI is a dump of a physical game cartridge. XCI files include cartridge-specific data that NSP files do not, so the two are not interchangeable even for the same game.
  - question: What are NSZ and XCZ files?
    answer: They are compressed versions of NSP and XCI respectively, using zstandard compression. They store the same content in less space but must be decompressed before use.
  - question: What is a Title ID?
    answer: A 16-character hexadecimal identifier that the Switch uses to distinguish every application. The base game, its updates and each DLC pack have related but distinct IDs.
seo: null
author: nswpedia-team
publishedAt: 2026-10-18
updatedAt: 2026-10-18
draft: false
---

If you have spent any time reading about Switch software you will have run into four
extensions — NSP, XCI, NSZ and XCZ — usually with no explanation of what separates them. They
are not interchangeable, and the differences matter.

## NSP — the digital container

NSP stands for Nintendo Submission Package. It is the container format the eShop uses to
distribute digital content: base games, updates and DLC all ship as NSP files. An NSP is a
PFS0 archive holding the content files plus a ticket and certificate that control decryption.

Because it is the digital distribution format, an NSP contains only what the eShop would send
you. It has no cartridge metadata, because no cartridge was involved.

## XCI — the cartridge image

XCI stands for NX Card Image. It is a dump of a physical game card, including the cartridge
header, the partition layout and the secure area. An XCI is therefore structurally different
from an NSP of the same game, and larger, because it preserves the cartridge's own structure.

A practical consequence: tools that work with one format often will not accept the other
without conversion, and "trimmed" XCI files have had the unused padding at the end of the
cartridge image removed to save space.

## NSZ and XCZ — the compressed variants

NSZ and XCZ are compressed forms of NSP and XCI, using zstandard. The compression is applied
to the content archives inside the container rather than to the container as a whole, which
keeps the structure readable. Savings vary widely by game — titles with large amounts of
uncompressed audio or texture data shrink considerably, while already-compressed content
barely moves.

These are community formats rather than official Nintendo ones, and they need decompressing
before anything can read them normally.

## Reading a Title ID

Every Switch application carries a 16-character hexadecimal Title ID. Super Mario Odyssey's is
`0100000000010000`. The structure is predictable: base games end in `000`, their update
packages end in `800`, and DLC uses a related range above the base ID.

That predictability is what makes Title IDs useful as identifiers. A game's name varies by
region and by how a listing was written; its Title ID does not. Every ROM page on NSWPEDIA
lists the Title ID alongside the Build ID, which unlike the Title ID does change with each
update, making the pair a precise way to identify exactly which revision you are looking at.

## A note on where files come from

NSWPEDIA documents these formats as reference material. We do not host or link to copyrighted
ROM files — our downloads section is limited to homebrew and public-domain software whose
licences permit redistribution.
