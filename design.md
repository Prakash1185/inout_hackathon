Design System

Core UX Principles

- Game-first, fitness-second
- High visual feedback (reward, progress, urgency)
- Social pressure & engagement
- Simple, intuitive, fast interactions

# Color System

## Background Colors

| Usage              | Color                  |
| ------------------ | ---------------------- |
| Primary Background | #28396C                |
| Card Surface       | #1E2C55                |
| Divider / Border   | rgba(255,255,255,0.08) |

## Primary Accent

| Usage   | Color                 |
| ------- | --------------------- |
| Primary | #B5E18B               |
| Hover   | #A2D472               |
| Glow    | rgba(181,225,139,0.3) |

## Secondary Text

| Usage       | Color   |
| ----------- | ------- |
| Sub-heading | #F0FFC2 |
| Muted Text  | #EAE6BC |

## Graph Colors

Use vibrant colors:

- #B5E18B (Green)
- #4DA6FF (Blue)
- #FF8A4C (Orange)
- #9B5CFF (Purple)

# Typography

## Fonts

- Heading: **Oswald**
- Body: **Montserrat**

## Hierarchy

| Usage          | Font              | Size    |
| -------------- | ----------------- | ------- |
| Hero Numbers   | Oswald Bold       | 32–48px |
| Section Titles | Oswald            | 18–22px |
| Subtext        | Montserrat Medium | 12–14px |
| Labels         | Montserrat Light  | 10–12px |

# Layout Structure

All screens follow:

[ Top Bar ]  
[ Hero Section ]  
[ Primary Action ]  
[ Secondary Info (cards) ]  
[ Live Feedback ]  
[ Bottom Navigation ]

---

# UI COMPONENTS

---

## 1. Card Component

### Usage

- Stats
- Missions
- Feed items
- Alerts

### Style

- Background: #1E2C55
- Border Radius: 16–20px
- Padding: 12–16px
- Border: subtle (rgba white 8%)

---

## 2. Button

### Primary Button

- Background: #B5E18B
- Text: Dark
- Radius: 12px
- Usage: Start Activity, Confirm

### Secondary Button

- Outline / glass style
- Usage: Cancel, Secondary actions

---

## 3. Progress Bar

### Usage

- Zone control
- Streak progress
- Activity progress

### Style

- Background: dark muted
- Fill: gradient green (#B5E18B → #A2D472)

---

## 4. Stat Block

### Usage

- Distance
- Steps
- Calories
- Rank

### Structure

- Label (small, muted)
- Value (bold, large)

---

## 5. Map Tile

### States

- Owned → Green (#B5E18B)
- Rival → Red / Orange
- Neutral → Grey

### Style

- Rounded square
- Glow on active zones

---

## 6. Alert Card

### Usage

- Urgency
- Warnings
- Updates

### Example

"You are losing Sector 18"

### Style

- Accent border (red/orange)
- Slight glow

---

## 7. Mission Card

### Structure

- Title
- Description
- Reward badge

### Style

- Icon on left
- Reward on right
- Dark card background

---

## 8. Leaderboard Item

### Structure

- Rank number
- Avatar
- Name
- Score

### Highlight

- Current user highlighted
- Top 3 styled differently

---

## 9. Activity Feed Card

### Structure

- Avatar
- Action text
- Timestamp

### Example

"Yuvraj captured Sector 62"

---

## 10. Streak Indicator

### Usage

- Daily streak
- Activity consistency

### Style

- Fire icon 🔥
- Bold number

---

## 11. Graph Component

### Usage

- Weekly progress
- Activity trends

### Style

- Smooth curves
- Gradient fill
- Minimal grid

---

## 12. Timer Component

### Usage

- Activity tracking

### Style

- Circular OR digital
- Glow effect when active

---

## 13. Floating Action Button (FAB)

### Usage

- Quick start activity

### Style

- Circular
- Glow effect
- Bottom-right position

---

# SCREEN COMPONENT BREAKDOWN

---

## Home Dashboard

Components:

- Hero Block (zones owned)
- AQI Indicator
- Stat Blocks
- Alert Card
- Mini Map Preview
- Primary Button

---

## Map Screen

Components:

- Map Grid
- Floating Info Card
- Action Button (Start/Pause)
- Zone Indicators

---

## Activity Screen

Components:

- Timer
- Stats (distance, steps)
- Progress bar
- Mission tracker
- Control buttons

---

## Missions Screen

Components:

- Mission Cards
- Event Highlight Card
- Reward Section

---

## Leaderboard

Components:

- Rank Highlight Card
- Leaderboard List
- Squad Section

---

## Social Feed

Components:

- Feed Cards
- Activity Updates

---

## Profile Screen

Components:

- Profile Card
- Stats Grid
- Achievements
- Weekly Graph

---

# INTERACTION RULES

- Always show feedback (capture, reward, progress)
- Avoid empty states
- Use subtle animations (optional)
- Prioritize clarity over complexity

FINAL GOAL

Every screen should answer instantly:

"What is happening right now?"

- Progress
- Reward
- Action
- Competition

---

we have to follow this instruction carefully and some points to keep in mind :
-> we do not have to make it an ai slop
-> no feature bloationg
-> UI should be clean
-> modals should open when ever needed from react modals
-> use charts when needed
-> keep it minimal and sleek design like a professional app onboarding and smooth animations
-> animations should not feel jerk
-> use only defined colord and it shades
-> do not use multiple shades
-> no translate animations
-> use rounded md for cordernsds
-> use a classis sleek modern app design
-> our app is both dark and loght mode support
-> try to implementt both tabs and dropdown menu navigations supprt
-> use proper icons
-> UI should not look like ai genertaed
