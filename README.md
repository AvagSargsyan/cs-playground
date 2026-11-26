# CS Playground

**Interactive computer science lessons for students aged 15–18.** I built this demo for my application to the Computer Science Teacher role at UWC Dilijan.

> This is a personal demo project. It is **not** an official UWC Dilijan website.

Students learn three foundational ideas (**sorting algorithms**, **binary search** and **recursion**) through the same three stages:

1. **Learn**: short explanations, real-world examples and illustrated walkthroughs.
2. **Explore**: an interactive playground where students run the algorithm step by step, change the input and watch the code and statistics update.
3. **Practice**: exercises in several formats with instant feedback, explanations and retries.

## Tech

- React 19 + TypeScript + Vite
- Redux Toolkit for progress and preferences, saved to `localStorage` (no accounts, no backend)
- Motion for animation, dnd-kit for accessible drag-and-drop
- Vitest + Testing Library (unit tests), Playwright (smoke tests on desktop and mobile)
- Deployed as a static site on Vercel

Every algorithm is a pure function that returns a full **trace** of its steps. The visualizers and exercises only move through that trace, so stepping back, scrubbing and "predict the next step" exercises always match the real algorithm.

## Running locally

Requires Node 24 and pnpm 10.

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm test         # unit tests
pnpm build && pnpm test:e2e   # smoke tests against the production build
```

## Author

Avag Sargsyan · [LinkedIn](https://www.linkedin.com/in/avag-sargsyan/)
