# Flashcard Coach — AZ-900 Edition

**Your smarter AZ-900 revision companion.**

An unofficial, offline-first web application that helps beginners preparing for the Microsoft Azure Fundamentals (AZ-900) certification remember cloud concepts through active recall, adaptive spaced repetition, and visible learning progress.

---

## The Problem

Learners preparing for AZ-900 often recognize Azure terminology when reading but struggle to:
- Recall definitions during assessments
- Distinguish between similar services
- Remember concepts under exam pressure
- Track which topics need more attention

Flashcard Coach answers three questions for every learner:
1. **What should I revise now?** (spaced repetition scheduling)
2. **Which concepts am I struggling to remember?** (weak-area detection)
3. **Is my recall improving over time?** (progress analytics)

## Why I Built This

<!-- PLACEHOLDER: Add your own AZ-900 experience here -->
_This section is intentionally left as a placeholder for the project author's personal motivation and AZ-900 preparation experience._

## Target Audience

- Students preparing for AZ-900
- Aspiring cloud professionals
- Career switchers entering cloud computing
- Beginner developers learning Azure
- Learners in African learning communities (including #1MillionDevs learners)

## Features & Differentiators

### Core Features
- **45+ original flashcards** across all 3 AZ-900 domains
- **Interactive study session** with card flip animation and keyboard controls
- **Spaced repetition scheduling** with 4 rating levels (Again/Hard/Good/Easy)
- **Dashboard** with real-time metrics derived from your actual review data
- **Weak-area detection** that identifies topics needing attention
- **Progress analytics** with streak tracking, recall accuracy, and weekly activity
- **Deck browser** with search, filtering, and domain/topic organization
- **Settings** with exam-date-aware scheduling and daily review targets
- **Demo Mode** for showcasing populated dashboards
- **Fully offline** — no backend, no API keys, no network requests

### Product Differentiators
1. **Confusable-pair cards** — Cards that train learners to distinguish similar Azure services (e.g., Azure Policy vs RBAC, VPN Gateway vs ExpressRoute, Azure Monitor vs Service Health)
2. **Leech handling** — Cards missed 3+ times get special treatment with a "Rethink this card" panel showing mnemonics, explanations, and related cards
3. **Exam-date-aware scheduling** — Optional exam date caps all due dates to ensure focused pre-exam review

### African Contextual Learning
Examples use familiar scenarios: Kenyan e-commerce businesses, Nairobi ride-hailing services, Lagos retailers, Kigali tech companies, Johannesburg hospitals, and more — making cloud concepts relatable without stereotyping.

## Screenshots

<!-- PLACEHOLDER: Add actual screenshots when available -->
_Screenshots will be added here once the application is running._

- Dashboard
- Study Session (card flip)
- Deck Browser
- Weak Areas
- Progress Analytics
- Settings

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast builds
- **Tailwind CSS 4** for styling
- **React Router 6** for navigation
- **Lucide React** for icons
- **localStorage** for persistence (no backend)

## How to Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck
```

## How localStorage Persistence Works

All data is stored in the browser's localStorage under the key `flashcard-coach-v1`. The data structure includes:
- Seeded flashcard content (only written on first launch)
- Review states per card (interval, streak, lapses, due date)
- Complete review history (timestamps, ratings, topics)
- User preferences (daily target, exam date, demo mode)

A separate namespace (`flashcard-coach-demo-v1`) is used for Demo Mode data, ensuring it never mixes with real progress.

**Important:** Progress is saved only in the current browser/device. It is not synchronized across devices and will be lost if browser data is cleared.

## Review Scheduling Heuristic

This is a lightweight educational scheduling algorithm — not a clinically validated model.

### Rules:
- **Again**: Reset interval to 0, increment lapses, re-queue after 3+ cards, due in 10 minutes
- **Hard**: Interval = clamp(round(prev × 0.5), 1, 7) days
- **Good**: Success streak increases; interval follows ladder [1, 3, 7, 14] then grows by ×1.8
- **Easy**: Success streak increases; interval follows ladder [4, 10, 21] then grows by ×2.5

Maximum interval is capped at 90 days (or lower if an exam date is set).

### Leech Detection:
Cards with 3+ lapses are flagged as "leeches" and shown with additional context.

### Weak-Area Scoring:
Over the most recent 20 reviews per topic: Again = 1, Hard = 0.5, Good/Easy = 0. Topics with ≥5 events and average score ≥0.3 are flagged as weak.

## AZ-900 Domain Coverage

| Domain | Weight | Cards | Topics |
|--------|--------|-------|--------|
| A: Cloud Concepts | 25–30% | 12 | Cloud computing, deployment models, service types, shared responsibility, pricing, benefits |
| B: Architecture & Services | 35–40% | 18 | Geography, resource management, compute, networking, storage, identity & security |
| C: Management & Governance | 30–35% | 15 | Cost management, governance, management tools, monitoring |

## Official Reference

[AZ-900 Study Guide — Microsoft Learn](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-900)

## Disclaimer

**Flashcard Coach is an independent learning project. It is unofficial and is not affiliated with or endorsed by Microsoft.**

- No Microsoft logos or product logos are used
- Card content is original educational material, not exam questions
- Content should be reviewed against the current AZ-900 study guide for accuracy
- This app does not claim to predict exam pass probability
- Recall accuracy is a self-reported indicator based on learner ratings

## Current Limitations

- No cross-device sync (local storage only)
- No AI-powered explanations (planned for future)
- Single certification (AZ-900 only; structure supports adding more)
- No dark theme (light theme only in v1)
- No mobile app (responsive web only)

## Impact & Scalability

### Certification-Agnostic Structure
The app uses a data-driven certification config. Adding another certification (e.g., AZ-104, SC-900) requires only adding a new config and card data — no UI changes needed.

### Future Roadmap
- Additional Microsoft certifications (AZ-104, DP-900, SC-900)
- Optional cloud sync via user-owned storage
- AI Study Buddy for personalized explanations
- Local-language support for African learners
- Collaborative deck sharing
- Export/import progress

## Testing & Build

```bash
# Production build
npm run build

# Type checking
npm run typecheck
```

The production build outputs optimized static files to `dist/`.

---

Built for the AZ-900 learning community. Happy studying! 🎓
