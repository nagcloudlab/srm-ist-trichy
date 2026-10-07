# Neural Networks course presentation system

This project is the reusable master for Lessons 1–14. Lesson content is intentionally separate from presentation behavior.

## Architecture

- `app/presentation-shell.tsx` owns navigation, keyboard and touch controls, fullscreen, teaching mode, presenter notes, reveal state, direct links, saved position, and the course map.
- `app/course-data.ts` is the single course roadmap. Change a lesson from `planned` to `available` only when its deck is ready, and add its `href`.
- `app/page.tsx` contains only Lesson 1 metadata, presenter guidance, and audience-facing slide content.
- `app/generated-lesson-deck.tsx` is the reusable visual renderer for Lessons 5–14. It turns concepts into statements, numbered processes, comparison tables, and teaching callouts without projected code blocks.
- `app/interactive-labs.tsx` contains reusable live calculators, responsive SVG graphs, and finite teaching animations. Add them only where changing an input makes the concept materially easier to understand.
- `scripts/generate-lesson-data.mjs` converts the source lesson Markdown into `app/generated-lessons.json`. Re-run it after editing any Lesson 5–14 source file, then review the generated slides before building.
- `app/globals.css` is the shared visual language and layout library.

Future lessons should reuse `PresentationShell`; do not duplicate navigation or course-map logic.

## Required lesson contract

Every lesson supplies:

1. `slides`: ordered metadata with `kicker`, takeaway-style `title`, unique `kind`, and optional `reveal`.
2. `sections`: meaningful navigation groups with the starting slide index.
3. `notes`: one entry per slide kind containing `time`, `say`, and `ask`.
4. Audience-facing slide markup rendered inside `PresentationShell`.

Use `reveal: true` only for a slide with content that visibly changes in place. Answers should appear beside or replace their questions, never in a detached answer key.

## Recommended teaching rhythm

1. Orient with a lesson promise.
2. Create curiosity with a prediction or problem.
3. Explain the intuition visually.
4. Introduce notation only after intuition.
5. Work one example from start to finish.
6. Let learners calculate, predict, classify, or diagnose.
7. Reveal feedback where the learner acted.
8. Recap three to five essential ideas.
9. End with the unresolved question that creates the next lesson.

## Visual rules

- Keep this cream, ink, cobalt, coral, mint, and yellow theme across the full course; identify modules with small labels and accents rather than redesigning the deck.
- One conclusion per slide; write titles as takeaways.
- Preserve the semantic colors: input blue, weight violet, bias coral, correct output mint, emphasis yellow.
- Keep body copy projection-readable; avoid text below 14 px.
- Charts must use the responsive SVG chart component, numeric axes, clipped plotting areas, and labels aligned in a consistent right-side column. Series lines and labels are grouped and named so animation can be added later without restructuring the chart.
- Use different adjacent compositions to avoid a repetitive deck.
- Do not repeat one composition for more than three consecutive slides; alternate explanation, process, comparison, example, and practice layouts.
- Prefer diagrams, equations, and worked examples over paragraph-heavy slides.
- Prefer a live lab when a parameter controls a visible curve, boundary, update path, activation, or competing system. Keep each lab to one dominant visual and only the controls needed for that concept.
- Keep runnable code in lesson notes or notebooks. On projected slides, translate code into algorithm tables, process flows, calculation traces, and input→operation→output comparisons.

## Interaction rules

- Arrow keys, Page Up/Down, Space, and swipe navigate.
- `R` reveals only on slides marked `reveal: true`.
- `N` opens presenter guidance, `T` toggles teaching mode, `M` opens the course map, and `F` toggles fullscreen.
- Direct links use `#lesson-NN/slide-N`, and the last position is saved per lesson.
- Escape closes overlays before any other action.

## Definition of done for each lesson

- Learning outcome is explicit and testable.
- Every slide has a presenter timing, “say” cue, and learner question.
- Calculations and code examples have been checked independently.
- Reveal interactions show feedback in context.
- Desktop and narrow-screen layouts remain readable.
- Keyboard, touch, direct-link, resume, notes, teaching, and fullscreen controls work.
- `npm run lint` and `npm run build` pass before publication.
