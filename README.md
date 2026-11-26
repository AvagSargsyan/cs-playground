# CS Playground

**Interactive computer science lessons for students aged 15–18.** Built for demo purposes for UWC Dilijan.

**Live demo:** https://cs-playground-demo.vercel.app

> This is a demo project. It is **not** an official UWC Dilijan website.

## What it teaches

Three foundational ideas, each taught in the same three stages:

| Lesson            | Learn                                                                                        | Explore                                                                           | Practice                                                                                                 |
| ----------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Sorting**       | Why sorting matters, "sorting around the world", Bubble, Selection, Insertion and Merge Sort | Animated bars, presets, custom values, race two algorithms, work comparison chart | Predict the next step, sort it yourself, identify the algorithm, choose an algorithm, count comparisons  |
| **Binary Search** | Linear vs binary, an illustrated walkthrough, a guess-my-number game, O(log n) by intuition  | Left / right / middle markers, custom sorted input, linear vs binary side by side | Find the midpoint, choose the direction, complete the search, find the mistake, complexity challenge     |
| **Recursion**     | Nesting dolls, base and recursive cases, what happens with no base case, the call stack      | Animated call stack for countdown and factorial                                   | Predict the next call, find the base case, arrange the call stack, predict the result, fix the recursion |

- **Learn:** short explanations, real-world examples, illustrations, and "check yourself" questions.
- **Explore:** run the algorithm step by step (play, pause, step back, speed). Pseudocode and Python are highlighted line by line, and the counters update live.
- **Practice:** varied exercise formats (select, drag and arrange, match, numeric, step-by-step execution) with an explanation for every answer, retries with fresh problems, and solutions.

There are also notes for teachers for each lesson: objectives, misconceptions, a 60-minute plan, discussion questions and differentiation. Progress is saved in the browser. No accounts are needed.

## How it's built

- React 19 + TypeScript + Vite, deployed as a static site on Vercel
- Redux Toolkit for progress and preferences, saved to `localStorage` with a versioned schema
- Motion for animation and dnd-kit for keyboard-accessible drag-and-drop
- Vitest + Testing Library for unit tests; Playwright for smoke tests and axe-core accessibility checks (WCAG 2.1 AA) on desktop and mobile
- GitHub Actions CI: typecheck, lint (oxlint), format (Prettier), tests, build, browser tests

**Key idea:** every algorithm is a pure function that returns a full **trace** of its steps (state snapshot, highlighted code line, explanation, counters). Visualisations and exercises only move through that trace. As a result, stepping backwards, scrubbing and "predict the next step" exercises always match the real algorithm.

```
src/
  algorithms/   pure trace generators + tests (sorting, search, recursion)
  engine/       step types, player hook, keyboard controls
  store/        Redux slices, selectors, localStorage persistence
  components/   UI, visualizer panels, exercise system
  modules/      the three lessons (Learn / Explore / Practice)
  pages/        home, teacher notes, about
```

## Running locally

Requires Node 24 and pnpm 10.

```bash
pnpm install
pnpm dev                       # http://localhost:5173
pnpm test                      # unit tests
pnpm build && pnpm test:e2e    # browser and accessibility tests against the production build
```

## Author

Avag Sargsyan · [LinkedIn](https://www.linkedin.com/in/avag-sargsyan/)
