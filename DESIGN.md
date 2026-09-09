# Design Brief

## Direction

Math Meadow — a warm, bright, child-friendly virtual math classroom that feels like a cozy playground of numbers, rounded and reassuring, now with a gentle credential login and a join-classroom flow.

## Tone

Playful Pop light theme: generous rounded corners, soft pastel accents, friendly crayon-blue primary with sunshine-yellow highlights — clean and bright, never childish or cluttered.

## Differentiation

Every lobby row is anchored by a stylized, dated math-symbol graphic, and live reactions/stickers float as bubbly animated icons — turning numbers into the visual identity; the login and join flows reuse the same pastel, rounded language so auth feels like part of the classroom, not a separate app.

## Color Palette

| Token       | OKLCH          | Role                         |
| ----------- | -------------- | ---------------------------- |
| background  | 0.985 0.012 90 | warm cream-white canvas      |
| foreground  | 0.2 0.02 90    | soft warm ink                |
| card        | 1.0 0.004 90   | elevated white surfaces      |
| primary     | 0.53 0.16 245  | friendly crayon blue         |
| accent      | 0.79 0.17 85   | sunshine yellow highlight    |
| muted       | 0.955 0.018 280| pastel lavender wash         |
| success     | 0.62 0.16 160  | mint green for correct/green |
| destructive | 0.55 0.22 25   | warm red for invalid/error   |

## Typography

- Display: Nunito — rounded, warm headings and hero text
- Body: Nunito — friendly, legible UI labels and paragraphs
- Mono: JetBrains Mono — calculator, timer, and math numerals
- Scale: hero `text-4xl md:text-6xl font-extrabold tracking-tight`, h2 `text-2xl md:text-3xl font-bold`, label `text-xs font-bold tracking-widest uppercase`, body `text-base`

## Elevation & Depth

Soft layered surfaces: `shadow-subtle` on cards, `shadow-elevated` on popovers/modals, `shadow-pop` on floating reactions and draggable widgets — depth through gentle colored shadows, never hard edges.

## Structural Zones

| Zone    | Background       | Border   | Notes                                    |
| ------- | ---------------- | -------- | ---------------------------------------- |
| Header  | bg-card          | border-b | sticky classroom/lobby top bar           |
| Content | bg-background    | —        | alternating bg-muted/30 section washes   |
| Auth    | bg-gradient-auth | —        | login/join panel floats on pastel wash   |
| Sidebar | bg-card          | border-l | collapsible chat capped at 1/3 width     |
| Footer  | bg-muted/40      | border-t | lobby footer with help/credits           |

## Spacing & Rhythm

Spacious `gap-6`/`gap-8` section rhythm with `p-4`/`p-6` card padding; loose generous density suits young users and touch targets; auth/join panels center with `max-w-md` and `p-8`.

## Component Patterns

- Buttons: pill `rounded-full`, primary uses `bg-gradient-primary`, hover lifts with `shadow-pop`; join button uses `bg-gradient-sunny`
- Cards: `rounded-2xl` (radius 0.9rem), `bg-card`, `shadow-subtle`, `border-border/60`
- Badges: pill `rounded-full`, pastel `bg-muted` or colored `bg-primary/10 text-primary`
- Inputs: `rounded-xl`, `bg-card`, `border-input`, focus ring `ring-primary`; invalid input shows `border-destructive` + inline error text
- Role picker: pill segmented control for Student/Teacher, active segment `bg-primary text-primary-foreground`

## Motion

- Entrance: cards fade+rise 300ms `transition-smooth`; auth/join panels use `pop-in` 350ms
- Hover: buttons lift with shadow + slight scale
- Decorative: `float-up` and `reaction-pop` (3s) for reactions/stickers, `bob` for idle math symbols, `flash` for the final 3-second timer countdown

## Constraints

- Light theme is primary; dark mode tuned but secondary
- Token-only styling — no raw hex/rgb in components
- Nunito + JetBrains Mono only, from bundled fonts
- Rounded, soft, accessible AA+ contrast throughout
- doNotBuild: account registration, password reset, remember-me, multi-device sessions

## Signature Detail

Dated math-symbol graphics anchor each lobby row, and emoji reactions/stickers float as bubbly 3-second animations — numbers made playful, with the login and join flows wearing the same pastel, rounded language.
