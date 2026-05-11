# Design Brief

## Direction
Jarvis HUD — Retro-futuristic voice chat interface inspired by Iron Man's AI system with glowing cyan-on-black accent design.

## Tone
Industrial sci-fi — bold cyan accents on near-black, geometric precision, minimal decoration but intentional depth through glowing borders and layered transparency.

## Differentiation
Pulsing voice button with concentric ring animation and glowing cyan borders create the signature "active listening" HUD effect.

## Color Palette

| Token              | OKLCH         | Role                               |
| ------------------ | ------------- | ---------------------------------- |
| background         | 0.12 0 0      | Near-black base                    |
| foreground         | 0.92 0 0      | Off-white text                     |
| card               | 0.16 0 0      | Slightly elevated dark surface     |
| primary/accent     | 0.65 0.18 200 | Vivid cyan — futuristic, glowing   |
| secondary          | 0.22 0 0      | Dark slate for depth               |
| muted              | 0.35 0 0      | Mid-gray for subtle UI             |
| border             | 0.25 0 0      | Dark border with cyan glow overlay |

## Typography

- Display: Space Grotesk — geometric, tech-forward sci-fi headings and labels
- Body: General Sans — clean, minimal, readable UI text and chat messages
- Scale: hero `text-6xl font-bold tracking-tight`, h2 `text-3xl font-bold`, label `text-sm uppercase tracking-widest`, body `text-base`

## Elevation & Depth

Glowing cyan borders with inset and outset shadows create the HUD effect. Layered transparency on message bubbles (glass-blur utility). No heavy drop shadows — keep sleek and technical.

## Structural Zones

| Zone    | Background              | Border              | Notes                                        |
| ------- | ----------------------- | ------------------- | -------------------------------------------- |
| Header  | 0.16 0 0 with glass     | 1px cyan glow       | Connection status, mode indicator            |
| Content | 0.12 0 0                | —                   | Chat messages alternate with glass-blur     |
| Input   | 0.16 0 0 with glow      | Glowing cyan border | Voice button centered, text input on sides   |

## Spacing & Rhythm

Compact vertical rhythm (0.75rem gaps between messages), generous horizontal margins (2rem on mobile, 4rem on desktop). Voice button occupies focal point at bottom center with pulse animation.

## Component Patterns

- Buttons: Rounded-lg with hud-border (cyan glow), no fill on secondary, pulse-glow on voice button active state
- Message bubbles: glass-blur background, hud-border, rounded-lg, alternating sender/receiver alignment
- Chat input: glow-border-cyan, dark background, monospace text

## Motion

- Entrance: Subtle fade-in, no bounce (0.2s ease-out)
- Hover: Cyan glow intensifies, subtle scale (0.1) on interactive elements
- Decorative: `pulse-glow` on voice button (2s), `ring-expand` concentric rings on active listening state (1.5s)

## Constraints

- Dark theme only — no light mode
- Cyan and white accents ONLY — no secondary colors
- No gradients or blur on text — only on surfaces and borders
- All glows use OKLCH cyan (0.65 0.18 200) with varied opacity

## Signature Detail

Pulsing concentric-ring voice button animating on active state with cyan glow, creating the "listening" effect that anchors the entire interface's technological identity.
