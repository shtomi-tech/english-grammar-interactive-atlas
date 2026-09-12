# Research Method

Phase 3B records external interaction research without turning the atlas into a copy of another product.

## What is recorded

The canonical records live in `src/data/research/references.js`. Each Research Reference contains:

- the primary source URL and, for repositories, the repository URL;
- the research status and the date it was checked;
- observed interaction patterns;
- the learning value and implications for this atlas;
- the license status and a narrow reuse policy.

Interaction entries keep their original source metadata. When an external reference informs an entry, its ID is added to `researchRefs`. The detail page renders both records so original provenance and external research remain distinct.

## Evidence boundary

Research status means that the cited primary source was checked. It does not mean that the source's code, text, exercises, audio, images, or visual assets may be copied. The atlas records patterns and design implications in original wording. A source with an unconfirmed license is marked `unknown`; no license is inferred from the absence of a license file.

The current source types are:

- `repository`: a source code repository with a verified repository URL;
- `site`: an official product or learning site used for behavior or learning-flow research.

## Mapping rules

Map a reference to an Interaction only when the observed pattern informs a concrete field such as the user action, changing element, feedback, learning goal, or future reuse boundary. Reuse of the same reference across several related interactions is allowed. Do not add a new catalog item merely to increase the mapping count.

`npm run check` validates reference IDs, required URLs, license metadata, observation lists, dates, and unknown `researchRefs`.

## Review cadence

`verifiedAt` is the date on which the primary source was checked. Re-check a reference before using it to justify a code or content change, especially when its license or public behavior may have changed.
