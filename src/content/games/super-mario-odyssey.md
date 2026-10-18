---
title: Super Mario Odyssey
alternateTitles:
  - "スーパーマリオ オデッセイ"
  - "Super Mario Odyssey"
summary: >-
  Nintendo's 2017 3D sandbox platformer, in which Mario and the hat-spirit Cappy travel
  between self-contained kingdoms to stop Bowser's wedding.
cover: ./images/placeholder-cover.webp
screenshots:
  - src: ./images/placeholder-shot-1.webp
    alt: Mario capturing an enemy in the Sand Kingdom
  - src: ./images/placeholder-shot-2.webp
    alt: The Metro Kingdom skyline at night

genres: ["Platformer", "Action-adventure"]
developer: Nintendo EPD
publisher: nintendo
series: Super Mario
releaseDate: 2017-10-27

titleId: "0100000000010000"
buildId: "6A09B0E14AA9D4E1"
version: "1.3.0"
fileSize: "5.7 GB"
fileType: XCI
trimmed: false
requiredFirmware: "3.0.1"
region: World
contentType: Base game
includedUpdate: "1.3.0"
dlcCount: 0
checksums:
  sha256: "0000000000000000000000000000000000000000000000000000000000000000"
  crc32: "00000000"

languages:
  audio: ["English", "Japanese"]
  subtitles: ["English", "Japanese", "French", "German", "Spanish", "Italian", "Dutch", "Russian", "Chinese", "Korean"]

players:
  offline: 1
  localCoop: 2
  online: 0
  nsoRequired: false
playModes: ["TV", "Tabletop", "Handheld"]
features: ["HD Rumble", "Motion controls", "amiibo support", "Pro Controller"]
ageRatings:
  esrb: "E10+"
  pegi: "7"
  cero: "A"

emulatorCompat:
  - emulator: ryujinx
    platform: Windows
    device: "Ryzen 7 7800X3D / RTX 4070"
    fps: "60"
    status: Perfect
    notes: "Stable at 60 fps after shader cache warms up."
    source: reported
    sourceUrl: https://github.com/Ryujinx/Ryujinx-Games-List/issues
    testedOn: 2026-10-10
  - emulator: sudachi
    platform: Steam Deck
    device: "Steam Deck OLED"
    fps: "45–60"
    status: Playable
    notes: "Dips in Metro Kingdom crowds; stable elsewhere."
    source: reported
    sourceUrl: https://github.com/Ryujinx/Ryujinx-Games-List/issues
    testedOn: 2026-10-11
  - emulator: citron
    platform: Android
    device: "Snapdragon 8 Gen 3, 12 GB RAM"
    fps: "30–45"
    status: Ingame
    notes: "Occasional texture flicker in water sections."
    source: reported
    sourceUrl: https://github.com/Ryujinx/Ryujinx-Games-List/issues
    testedOn: 2026-10-12

deviceTiers:
  - tier: "High end"
    device: "RTX 3060 or better, Ryzen 5 5600+"
    result: "Locked 60 fps at 1080p or above"
  - tier: "Handheld PC"
    device: "Steam Deck / ROG Ally"
    result: "45–60 fps at native resolution"
  - tier: "Android flagship"
    device: "Snapdragon 8 Gen 2 or newer"
    result: "30–45 fps, playable with dips"

knownIssues:
  - "First-run shader compilation causes stutter until the cache is built."
  - "Motion-control captures require a mapped gyro or an alternative button binding."

versionHistory:
  - version: "1.3.0"
    date: 2018-02-21
    notes: "Added Luigi's Balloon World, two new outfits and Snapshot Mode filters."
    fileSize: "5.7 GB"
  - version: "1.2.0"
    date: 2017-12-01
    notes: "Stability fixes and minor balance adjustments."
  - version: "1.0.0"
    date: 2017-10-27
    notes: "Launch release."

faq:
  - question: What is the Title ID for Super Mario Odyssey?
    answer: >-
      The Title ID is 0100000000010000. Title IDs are 16-character hexadecimal identifiers that
      the Switch uses to distinguish every application, update and DLC package.
  - question: What firmware version does Super Mario Odyssey require?
    answer: >-
      Firmware 3.0.1 or later. Later updates to the game do not raise that requirement.
  - question: Does Super Mario Odyssey support two players?
    answer: >-
      Yes. A second player can take control of Cappy locally, sharing a single screen. There is
      no online multiplayer.
  - question: Where can I buy Super Mario Odyssey legally?
    answer: >-
      It is sold on the Nintendo eShop and at retail on cartridge. NSWPEDIA links to the
      official store listing on every game page.

relatedGames: []
eshopUrl: https://www.nintendo.com/us/store/products/super-mario-odyssey-switch/
wikidataId: Q28400301
rating:
  metacritic: 97

author: nswpedia-team
publishedAt: 2026-10-18
updatedAt: 2026-10-18
draft: false
---

> **Editorial note:** this is the reference implementation for the game content type. Every
> technical value above is illustrative and must be verified against primary sources before
> this page goes live.

Super Mario Odyssey is the Switch's flagship 3D platformer and, seven years on, still the
clearest demonstration of what the hardware was designed to do. It abandoned the linear,
course-clear structure of the Galaxy games in favour of large sandbox kingdoms, each with its
own visual language, traversal rules and dense scattering of Power Moons.

## Why this game matters for emulation testing

Odyssey is one of the most useful titles in a compatibility suite, because it exercises nearly
every subsystem an emulator has to get right. The capture mechanic constantly swaps the player
character's physics and animation state. The Metro Kingdom pushes draw distance and crowd
density harder than almost anything else in the first-party catalogue. Snapshot Mode applies
post-processing filters that expose shader compilation problems immediately. An emulator build
that holds a stable frame rate through New Donk City is usually in good shape generally.

## Reading the compatibility table

The table above records results per emulator, per platform and per device, with the date each
test was run. That specificity matters more than a single global rating, because Switch
emulator forks diverge quickly — a build that is flawless on desktop may struggle on the same
renderer under Android. A result from two years ago tells you about a build that no longer
exists, which is why every row carries its test date in plain sight.

## Versions and file details

The technical block covers the Title ID, Build ID, firmware floor, file type and size. Title
IDs are stable across a game's lifetime, while Build IDs change with each update, which makes
the pair useful for identifying exactly which revision of a game a given file corresponds to.
The version history table tracks what each update actually changed.

## Where to buy it

Super Mario Odyssey remains on sale digitally on the Nintendo eShop and physically on
cartridge. The link in the details table points to the official store listing.
