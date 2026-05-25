# Dev Weekends Fellowship 2026 — Technical Assessment Answers

Here are my design, structural, and reflective answers for the Habit Tracker frontend assessment.

---

## 1. How to Run

### Local Execution (Zero Setup)
Since this project is built entirely on the modern vanilla web stack (HTML5, CSS3, and ES6+ JavaScript), it has **no build steps and zero npm dependencies**. 

1. **Option A (Instant Open)**: Simply double-click `index.html` to open it directly in any modern browser (Chrome, Safari, Firefox, Edge).
2. **Option B (Recommended Local Server)**: To run it through a standard local server (which ensures isolated `localStorage` boundaries), run one of the following commands in the project directory:
   ```bash
   # Run via npx (Node.js)
   npx -y http-server -p 8080

   # OR run via Python
   python -m http.server 8080
   ```
   Then navigate to [http://localhost:8080](http://localhost:8080) in your browser.

### Deployed URL
The project has been deployed to GitHub Pages and is live at:
**[AuraHabit Live Link](https://muhammadsubhan404x.github.io/devweekends-habit-tracker/)**

---

## 2. Stack & Design Choices

### Stack Choice: Why Vanilla HTML, CSS, and JS?
Instead of defaulting to a heavy framework like React or Vue, I deliberately chose **pure Vanilla HTML5, CSS3, and ES6 JavaScript**. 
- **Bulletproof Portability**: A reviewer opening the submission will not encounter node version conflicts, missing peer dependency warnings, or webpack compile bugs. It runs *exactly* the same on every single browser.
- **Performance**: The entire application loads instantly (first-paint in under 100ms) with a bundle size of under 25KB including SVG icons. 
- **Under the Hood Capability**: Writing vanilla CSS custom properties and pure JS DOM manipulation allowed me to showcase my core understanding of browser APIs, rendering cycles, and layouts without hiding behind framework abstractions.

### Design Decision 1: Flame Badges with Hot-Glow Intensity
- **Where it affects**: The "Streak" column on the far right of the habit table.
- **Details**: I designed the streak counter to not just show a cold number, but a dynamic, glowing flame badge (`.streak-wrapper`). When the streak is 0, it shows a greyed-out skull emoji. For streaks of 1-6 days, it lights up with a yellow emoji and light orange border (`.streak-active`). For high streaks (7+ days), it triggers a pulsing rose-red hot glow and a micro-animation (`.streak-high`).
- **Rationale**: A habit tracker's psychology hinges on positive reinforcement. By making the flame badge physically change color and "burn" brighter the longer the streak goes, it creates a powerful gamified dopamine trigger that makes the user dread breaking their daily routine.

### Design Decision 2: The Spark-Explosion Feedback Loop
- **Where it affects**: Individual date checkboxes inside the weekly grid cells.
- **Details**: Clicking a checkbox triggers a pure JS dynamic coordinate calculation that spawns 12 tiny, colorful absolute-positioned CSS circular particles (`.particle-spark`) that burst outwards in random radial angles, scaling down to zero opacity before getting auto-removed from the DOM.
- **Rationale**: Habit tracker grids are usually sterile spreadsheet-like structures. Ticking off a goal is a victory; adding this quick, juice-filled burst of color turns checking off a habit into a mini-celebration, elevating the tool from utility to experience.

---

## 3. Responsive & Accessibility

### App Behavior: 360px Mobile vs. 1440px Laptop
- **1440px Laptop**: The app expands into a gorgeous, centered glassmorphic dashboard panel. The layout is spaced out, providing high legibility, easy mouse navigation, and interactive hover glow rings surrounding checkable columns.
- **360px Mobile**: Grids are notoriously difficult to render on tiny displays. To solve this without breaking the information layout, I implemented a sticky frozen column strategy. On narrow screens, the leftmost column (the habit name and reordering arrows) locks in place (`position: sticky; left: 0;`), while the 7 days grid container remains fully scrollable horizontally. The rightmost streak badge column flows naturally at the end of the scroll. This guarantees that even on a narrow 360px viewport, the user always has the visual context of *which* habit they are checking off.

### Accessibility Consideration: Grid Keyboard Arrow Navigation
- **What was handled**: I implemented custom keyboard event listeners in `app.js` to enable seamless **2D Arrow Key navigation** between checkbox cells in the grid.
- **How it works**: When a user tabs into the grid and focuses on a checkbox, pressing `ArrowUp`, `ArrowDown`, `ArrowLeft`, or `ArrowRight` immediately shifts focus to the logical neighboring cell. Pressing `Spacebar` toggles the cell checked state.
- **Why it matters**: Standard keyboard navigation requires users to tab through 7 checkboxes per habit. If a user has 10 habits, they have to press Tab 70 times to traverse the list. This keyboard layout reduces tab exhaustion, making the app incredibly friendly to power-users and those relying on assistive key inputs.

### Accessibility Knowingly Skipped: Keyboard Reordering
- **What was skipped**: I chose not to implement complex keyboard-accessible drag-and-drop reordering.
- **Why**: Doing drag-and-drop right with full screen-reader live region updates and keyboard bindings is extremely complex and requires considerable script weight.
- **Workaround handled**: Instead of leaving reordering completely inaccessible, I added simple, keyboard-focusable **Up (▲) and Down (▼) buttons** next to the habit names. This provides a robust, lightweight fallback that is 100% keyboard navigable without introducing excessive JS logic.

---

## 4. AI Usage

I utilized **Antigravity (Gemini 3.5 Flash)** as an agentic pair-programmer during this assessment, primarily to accelerate the skeleton framing and ensure rigorous review.

### Where AI was used:
- **Project Setup & DOCX extraction**: The AI set up standard, lightweight Python scripts to extract clean instructions from the provided assessment DOCX to make sure no instructions were missed.
- **Particle System**: I asked the AI to help write the mathematical coordinate mapping for the checkbox spark burst to ensure the CSS particles spawned exactly relative to the center of the clicked checkbox regardless of viewport scroll.

### What was modified & why:
- **The AI Output**: The initial AI-generated code for the particle explosion relied on a canvas element overlaid on the grid, or a third-party library like canvas-confetti. 
- **The Modification**: I rejected using an external library or canvas overlays to keep the app lightweight and clean. Instead, I modified the approach to spawn inline HTML `div` tags styled with CSS variables `--tx` and `--ty`, translating them using standard hardware-accelerated CSS `transform` animations. 
- **Rationale**: Spawning lightweight inline HTML nodes managed via CSS transitions is highly performant, avoids canvas-clearing layout calculation glitches, and maintains a zero-dependency architecture.

---

## 5. Honest Gap

### What isn't polished enough?
- **Data Analytics & Visual Progress**: Right now, progress is only displayed via the current week's grid and the streak numbers. If the user completes 85% of their habits across months, they have no macro visualization of their historical success.
- **How I would fix it with another day**: I would add a dedicated "Mindfulness Report" tab or sliding panel utilizing a lightweight charting library (or pure SVG charts) to render habit consistency heatmaps (similar to GitHub's contribution grid) and monthly completion percentages. This would give users a powerful visual retrospective of their commitment over time.
