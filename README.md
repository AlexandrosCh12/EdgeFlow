# EdgeFlow

**A trading psychology and discipline tracker for traders who want to master their emotions, not just their charts.**

**Built with Expo** · **React Native** · **TypeScript** · **Offline-first**

---

## What is EdgeFlow?

Most traders do not lose because their strategy is wrong—they lose because emotions take over at the worst moments. **EdgeFlow** helps traders pause before emotional trades, log their emotional state, reflect after trades, and track a **discipline score** over time so behavior stays visible. The app works **fully offline**: no account is required, and no data leaves your device. It is built for day traders, retail traders, and anyone learning to control trading psychology—not just to read charts, but to stay accountable to a plan.

---

## Key Features

- **Pre-Trade Check** — Log emotion, plan compliance, confidence level, and trade reason before entering a trade.
- **Post-Trade Reflection** — Review result, discipline type, lesson learned, and emotional state after each trade.
- **Discipline Score** — A behavioral score (1–100) derived from consistency, not profit. Rewards following the plan and penalizes impulsive decisions.
- **7-Day Trend Chart** — Animated line chart showing discipline score trend over the past week.
- **Streak Tracker** — Tracks consecutive days of disciplined activity with an animated ring display.
- **Daily Quote** — A deterministic motivational quote that changes daily, selected from a curated list.
- **Journal / History** — Full trade log with filters, summary stats, and entry detail view.
- **Settings** — Haptics toggle, reminders toggle, data export, and full data reset.
- **Onboarding** — Smooth four-slide onboarding flow on first launch only.

---

## Built With

| Technology | Purpose |
|------------|---------|
| Expo SDK 54 (Managed Workflow) | App framework and build system |
| React Native | Cross-platform mobile UI |
| TypeScript | Type safety throughout |
| Expo Router | File-based navigation |
| AsyncStorage | Offline-first local data persistence |
| React Native Reanimated | Smooth animations (score ring, transitions) |
| React Native SVG | Discipline chart and streak ring rendering |
| React Native Community Slider | Confidence level input |

---

## Project Structure

```
EdgeFlow/
├── app/                    # Screens and navigation (Expo Router)
│   ├── _layout.tsx         # Root layout, onboarding redirect logic
│   ├── index.tsx           # Home dashboard
│   ├── onboarding.tsx      # First-launch onboarding flow
│   ├── pretrade.tsx        # Pre-Trade Check screen
│   ├── reflection.tsx      # Post-Trade Reflection screen
│   ├── history.tsx         # Journal and history screen
│   ├── settings.tsx        # App settings
│   └── entry/[id].tsx      # Individual trade entry detail
├── components/             # Reusable UI components
│   ├── ScoreRing.tsx       # Animated discipline score ring
│   ├── DisciplineChart.tsx # 7-day SVG line chart
│   ├── StreakRing.tsx      # Streak arc display
│   ├── ActionRow.tsx       # Home screen action rows
│   ├── EmotionGrid.tsx     # Emotion pill selector grid
│   ├── PlanToggle.tsx      # Plan compliance toggle rows
│   └── EntryCard.tsx       # Journal entry card
├── src/
│   ├── logic/              # Business logic (pure functions)
│   │   ├── scoreLogic.ts   # Discipline score calculation
│   │   ├── streakLogic.ts  # Streak computation
│   │   ├── quoteLogic.ts   # Daily quote selection
│   │   └── trendLogic.ts   # 7-day trend series
│   ├── storage/            # AsyncStorage layer
│   │   └── storage.ts      # All read/write/reset functions
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts        # TradeEntry, AppSettings, enums
│   └── utils/              # Shared utilities
│       ├── validate.ts     # Input validation helpers
│       └── dateUtils.ts    # Date formatting helpers
```

---

## Scoring System

The discipline score is designed to reflect **behavior**, not P&L.

- The **base score starts at 50**.
- **Following the plan** adds points.
- **Completing a reflection** adds points.
- Choosing a **disciplined trade type** adds points.
- Choosing an **impulsive trade type** removes points.
- Emotional states such as **FOMO** or **Revenge** slightly reduce the score.
- The score is **clamped between 1 and 100**.

**Status labels** (by score band):

| Range | Label |
|-------|--------|
| 85–100 | Locked In |
| 70–84 | Focused |
| 50–69 | Neutral |
| 30–49 | Distracted |
| 1–29 | Uncontrolled |

The score is based **entirely on behavior**—not on whether a trade was profitable or not.

---

## Run Locally

**Prerequisites:** [Node.js](https://nodejs.org/) installed, and either the **Expo Go** app on a physical device or an Android emulator.

```bash
git clone <your-repository-url>
cd EdgeFlow
npm install --legacy-peer-deps
npx expo start
```

Then scan the QR code with **Expo Go** (iOS) or the **Camera** app (Android) to open the project on your device.

---

## Design Philosophy

The UI follows a **dark, premium** aesthetic inspired by Bloomberg-style terminals: information-dense but calm. The palette centers on **black (`#0A0A0A`)** with **gold (`#F5A623`)** accents for emphasis and hierarchy. There is **no bottom tab bar**—primary actions live on the home dashboard so the experience stays focused. Animations on score and streak updates are intentional: they make disciplined behavior feel **tangible and rewarding**, not punitive.

---

## Motivation

I built this project to demonstrate **end-to-end mobile development**: state management, local persistence, separated business logic, custom animations, and UX that supports a real habit loop. The problem it targets is real—**emotional trading is consistently cited as the top reason retail traders lose money**. Every feature maps to a behavioral insight rather than being added for complexity’s sake.

---

## License & credits

**Built by Chiotis Alexandros**

Licensed under the MIT License.

*EdgeFlow is a portfolio project: it showcases engineering and product thinking; it is not financial advice.*
