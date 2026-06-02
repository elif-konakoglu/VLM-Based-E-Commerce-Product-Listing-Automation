# UX Guide

## Design Philosophy

- **Admin-first**: Designed for internal power users, not casual shoppers
- **AI as assistant**: Suggestions feel helpful, never authoritative or final
- **Speed-focused**: Minimize clicks between upload and published product
- **Confidence-visible**: Transparency about AI certainty without clutter
- **Trust-building**: Preview builds confidence before committing
- **Error-resilient**: Failures never block the admin from completing their work

## Visual Design System

### Style

Modern, clean SaaS admin aesthetic:

- Left sidebar navigation (collapsible on mobile)
- Top header with breadcrumbs and primary actions
- Card-based content layout
- Soft borders and subtle shadows
- Generous spacing and readable typography
- Strong empty states with clear CTAs
- Prominent primary action buttons

### Color Palette

| Role | Usage |
|------|-------|
| Primary | Action buttons, active navigation, links |
| Success/Green | Published status, high confidence badges |
| Warning/Amber | Medium confidence badges, draft status |
| Danger/Red | Low confidence badges, errors, destructive actions |
| Neutral/Gray | Borders, secondary text, disabled states |
| Background | Page background, card surfaces |

### Typography

- Headings: Inter or system font, semibold
- Body: 14-16px, regular weight
- Monospace: For confidence percentages and technical values
- Line height: 1.5 for body text

### Spacing

- Base unit: 4px
- Component padding: 16px (4 units)
- Section spacing: 24-32px
- Page margins: 24px mobile, 32px desktop

## Page Layouts

### Dashboard Home

```text
┌─────────────────────────────────────────────────┐
│  Sidebar  │  Header: Dashboard                  │
│           │─────────────────────────────────────│
│  - Home   │                                     │
│  - Prods  │  ┌──────┐ ┌──────┐ ┌──────┐       │
│  - New    │  │Total │ │Draft │ │Published│     │
│           │  │  42  │ │  15  │ │   27   │     │
│           │  └──────┘ └──────┘ └──────────┘   │
│           │                                     │
│           │  Recent Products                    │
│           │  ┌─────────────────────────────┐   │
│           │  │ Product card grid            │   │
│           │  └─────────────────────────────┘   │
│           │                                     │
│           │  Recent AI Analyses                 │
│           │  ┌─────────────────────────────┐   │
│           │  │ Analysis activity list       │   │
│           │  └─────────────────────────────┘   │
└───────────┴─────────────────────────────────────┘
```

### New Product Page

```text
┌─────────────────────────────────────────────────────────┐
│  Header: New Product          [Preview] [Save] [Publish]│
│─────────────────────────────────────────────────────────│
│                                                          │
│  ┌─── Left Column ───────┐  ┌─── Right Column ───────┐ │
│  │                        │  │                         │ │
│  │  Image Upload Zone     │  │  Product Form           │ │
│  │  ┌──────────────────┐  │  │                         │ │
│  │  │  Drop images here │  │  │  Main Category    [94%]│ │
│  │  │  or click to      │  │  │  [Women Clothing    ▼] │ │
│  │  │  browse            │  │  │                         │ │
│  │  └──────────────────┘  │  │  Target Audience  [96%]│ │
│  │                        │  │  [women            ▼]  │ │
│  │  Image Gallery         │  │                         │ │
│  │  ┌────┐ ┌────┐ ┌────┐ │  │  Subcategory      [88%]│ │
│  │  │ ★  │ │    │ │    │ │  │  [Midi Dress       ]   │ │
│  │  └────┘ └────┘ └────┘ │  │                         │ │
│  │  ★ = main image        │  │  Tags             [82%]│ │
│  │                        │  │  [women, dress, ...]   │ │
│  │  [🔍 Analyze with AI] │  │                         │ │
│  │                        │  │  ... more fields ...    │ │
│  │  AI Status:            │  │                         │ │
│  │  ✓ Analysis complete   │  │  Marketing Title  [80%]│ │
│  │                        │  │  [Floral Print Mi...]  │ │
│  └────────────────────────┘  │                         │ │
│                              └─────────────────────────┘ │
│                                                          │
│  ┌─── Chat Panel (collapsible) ──────────────────────┐  │
│  │  Ask AI about this product                         │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │ Chat messages...                             │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  [Type your question...              ] [Send]     │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### Product List

```text
┌─────────────────────────────────────────────────────────┐
│  Header: Products                    [+ New Product]     │
│─────────────────────────────────────────────────────────│
│                                                          │
│  [All] [Draft] [Published] [Archived]    [🔍 Search...] │
│                                                          │
│  ┌───┬────────────────┬──────────┬────────┬──────────┐ │
│  │ ■ │ Title          │ Category │ Status │ Updated  │ │
│  ├───┼────────────────┼──────────┼────────┼──────────┤ │
│  │🖼 │ Floral Midi... │ Women    │ Draft  │ 2 min    │ │
│  │🖼 │ Denim Jacket   │ Unisex   │ Pub'd  │ 1 hr     │ │
│  │🖼 │ Cotton Tee     │ Men      │ Draft  │ 3 hr     │ │
│  └───┴────────────────┴──────────┴────────┴──────────┘ │
│                                                          │
│  Showing 1-20 of 42              [← Prev] [Next →]      │
└──────────────────────────────────────────────────────────┘
```

## Confidence Badge Design

### Visual Variants

| Confidence | Badge Color | Icon | Text |
|-----------|-------------|------|------|
| 80-100% | Green/teal | checkmark | "94% High" |
| 50-79% | Amber/yellow | info | "65% Medium" |
| 0-49% | Red/orange | warning | "35% Low — Review carefully" |

### Badge Placement

Each AI-suggested field shows its badge inline to the right of the field label:

```text
Main Category                          [94% ✓ High]
┌──────────────────────────────────────────────────┐
│ Women Clothing                                    │
└──────────────────────────────────────────────────┘
```

For low-confidence fields, add helper text below:

```text
Material Estimate                      [35% ⚠ Low]
┌──────────────────────────────────────────────────┐
│ lightweight woven fabric                          │
└──────────────────────────────────────────────────┘
⚠ Low confidence — please verify this suggestion
```

## Human-in-the-Loop Copy Guidelines

### Preferred Language

- "AI suggestion" (not "AI decision")
- "Review before saving"
- "Edit to match your assessment"
- "Admin-approved final value"
- "Low confidence — please verify"
- "This field was suggested by AI and can be edited"
- "You have the final say"

### Avoided Language

- "AI decision" (implies finality)
- "Final AI category" (incorrect framing)
- "Automatically approved" (never happens)
- "AI-confirmed" (model doesn't confirm)
- "Accurate" (cannot guarantee)

## Product Preview Design

The preview simulates an end-user product page:

```text
┌─────────────────────────────────────────────────────────┐
│  ⚠ ADMIN PREVIEW — This is how the product would appear │
│─────────────────────────────────────────────────────────│
│                                                          │
│  ┌──────────────────┐  Product Title                    │
│  │                  │  Category > Subcategory            │
│  │   Large Image    │                                    │
│  │                  │  Description text here...          │
│  │                  │                                    │
│  └──────────────────┘  • Bullet point one               │
│                         • Bullet point two               │
│  Thumbnails:            • Bullet point three             │
│  ┌──┐ ┌──┐ ┌──┐                                        │
│  │  │ │  │ │  │       Colors: ● ● ●                    │
│  └──┘ └──┘ └──┘       Pattern: Floral                  │
│                         Material: Lightweight woven      │
│                         Style: Casual feminine           │
└──────────────────────────────────────────────────────────┘
```

Key requirements:
- Uses current unsaved form values (not DB data)
- Clearly labeled as "Admin Preview"
- Updates live as form values change (if open side-by-side)
- Responsive layout showing both desktop and mobile views

## Chat Panel Design

### Layout

Collapsible panel at the bottom or right side of the product form:

```text
┌─── Ask AI about this product ─────────── [▼ Collapse] ─┐
│                                                          │
│  ┌─ You ─────────────────────────────────────────────┐  │
│  │ Is this more casual or formal?                     │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌─ AI ──────────────────────────────────────────────┐  │
│  │ Based on the floral print pattern and relaxed      │  │
│  │ silhouette, this dress appears more casual...      │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────┐ [Send]  │
│  │ Ask about style, material, or category...   │         │
│  └────────────────────────────────────────────┘         │
└──────────────────────────────────────────────────────────┘
```

### Chat UX Rules

- Admin messages right-aligned or distinct color
- AI messages left-aligned with AI indicator
- Loading dots while waiting for response
- Error message with retry if model fails
- Chat history persisted and loaded on page revisit

## Empty States

Every page/section needs a helpful empty state:

| Location | Empty State Text | CTA |
|----------|-----------------|-----|
| Product List | "No products yet. Create your first product." | [+ New Product] |
| Image Gallery | "Upload a product image to begin." | Upload zone |
| AI Suggestions | "Run AI analysis to generate suggestions." | [Analyze with AI] |
| Chat History | "Ask questions about this product image." | Focus input |
| AI Error | "AI could not generate suggestions. You can retry or fill fields manually." | [Retry] |

## Loading States

| Action | Loading UX |
|--------|-----------|
| Image upload | Progress bar with percentage |
| AI analysis | Skeleton + "Analyzing image..." text (30-90s) |
| Product save | Button spinner + disabled state |
| Publish | Button spinner + confirmation |
| Chat response | Typing dots in chat bubble |
| Product list | Table skeleton rows |

## Responsive Behavior

| Breakpoint | Layout Change |
|-----------|--------------|
| Desktop (>1024px) | Two-column layout, sidebar visible |
| Tablet (768-1024px) | Single column, sidebar collapsible |
| Mobile (<768px) | Single column, hamburger menu, stacked form |

## Accessibility Considerations

- All interactive elements keyboard-accessible
- Focus indicators visible
- Color not sole indicator (icons + text supplement badges)
- Form labels associated with inputs
- Error messages linked to fields via aria-describedby
- Loading states announced to screen readers
