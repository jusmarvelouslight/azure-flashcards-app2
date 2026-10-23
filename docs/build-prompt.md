# Build Prompt — Flashcard Coach: AZ-900 Edition (v2)

This document preserves the original build specification used to guide the development of Flashcard Coach.

## Purpose

This prompt was designed for a time-constrained, AI-assisted vibe coding hackathon. It serves as:
1. A comprehensive product specification
2. A prompt engineering reference document
3. A quality checklist for acceptance testing

## Key Design Decisions

### Why a single comprehensive prompt?
- Ensures consistency across all features
- Reduces ambiguity for AI-assisted development
- Provides clear acceptance criteria
- Documents non-negotiables upfront

### Why offline-first?
- No backend complexity
- Works in low-connectivity environments
- No API keys or paid dependencies
- Privacy-first (data stays on device)

### Why localStorage over IndexedDB?
- Simpler API
- Sufficient for the data volume (~45 cards)
- Easier to debug and migrate
- Wide browser support

### Why a custom scheduling algorithm?
- No external dependencies
- Deterministic and explainable
- Easy to understand and modify
- Appropriate for an educational tool

## Prompt Engineering Approach

The prompt uses several techniques:
1. **Non-negotiables section** — Establishes hard constraints first
2. **Numbered sections** — Clear organization for reference
3. **Acceptance tests** — Verifiable completion criteria
4. **Priority ordering** — Guides implementation when time-constrained
5. **Contextual examples** — African learning community focus
6. **Explicit disclaimers** — Legal and ethical boundaries

## Iteration Notes

- Phase 1-2: Core structure and study session (highest priority)
- Phase 3: Persistence and scheduling
- Phase 4: Analytics, settings, demo mode
- Phase 5: Build verification and fixes
- Phase 6: Documentation and final checks

## What Was Implemented

✅ All 6 navigation views (Dashboard, Decks, Study Session, Weak Areas, Progress, Settings)
✅ 45 original flashcards across 3 AZ-900 domains
✅ Interactive card flip study session with keyboard controls
✅ 4-level rating system (Again/Hard/Good/Easy)
✅ Spaced repetition scheduling with exam-date awareness
✅ Weak-area detection with topic scoring
✅ Leech handling (cards missed 3+ times)
✅ Confusable-pair cards (6+ compare cards)
✅ Progress analytics with streak tracking
✅ Demo Mode with isolated data namespace
✅ localStorage persistence with versioning
✅ Reset progress with confirmation
✅ Responsive design (mobile, tablet, desktop)
✅ Accessibility (keyboard controls, focus states, semantic HTML)
✅ Unofficial disclaimer in footer and settings
✅ African contextual examples in flashcards

## What Could Be Improved

- Dark theme support
- Cross-device sync
- AI-powered explanations
- Additional certifications
- Unit tests for scheduling algorithm
- More confusable pairs
- Export/import functionality
