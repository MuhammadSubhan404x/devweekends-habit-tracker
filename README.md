# AuraHabit — Mindful Habit Tracker

Welcome to **AuraHabit**, a beautiful, premium, single-page weekly habit tracker designed to help you build consistency and manifest your daily routines. 

This project was built from scratch as part of my technical assessment for the **Dev Weekends Fellowship 2026**.

## Deployed URL
The project is live at: [AuraHabit on GitHub Pages](https://muhammadsubhan404x.github.io/devweekends-habit-tracker/)

---

## ⚡ Quick Start: How to Run

Since AuraHabit is built with zero external framework dependencies (Vanilla HTML, CSS, and JS), it has **no install steps** and runs perfectly on any browser!

### Option 1: Direct File Launch
1. Clone this repository or download the source code.
2. Double-click the `index.html` file to open it directly in your web browser.

### Option 2: Local HTTP Server (Recommended)
Running through an HTTP server ensures correct local storage isolation and optimal performance:
```bash
# Run using npx (No install needed)
npx -y http-server -p 8080

# OR run using Python's built-in server
python -m http.server 8080
```
Then open [http://localhost:8080](http://localhost:8080) in your web browser.

---

## ✨ Features Built

- **Premium Responsive Grid**: Dynamic 7-day habit checklist showing habits down the left, days across the top, and dates mapped to actual calendar weeks.
- **Glassmorphism Aesthetic**: Sleek dark/light theme switching with smooth transitions, custom accent gradients, and system preference auto-detection.
- **Mobile Locked Layout**: On screens below 768px (like 360px phones), the habit name column is locked in place while the weekly grid scrolls horizontally, guaranteeing context is never lost.
- **Live Streak Tracking**: Automatic current streak calculator represented by visual flame badges that intensify from yellow to orange/red as streaks grow.
- **Custom Week Preferences**: A preferences menu that allows toggling the week start day between **Monday** and **Sunday**.
- **Interactive Sparks Particle Burst**: Spawns CSS sparks upon checking a habit cell to provide instant positive feedback!
- **Robust Keyboard Grid Navigation**: Complete accessibility using Arrow Keys to navigate between cells, Spacebar to check/uncheck cells, and Tab for main controls.
- **Full Persistence**: Automatic local storage synchronization ensures your habits, custom ordering, renaming changes, and historical checks persist across page refreshes.

---

## 📂 File Architecture
- `index.html`: Core HTML skeleton using accessible ARIA roles and structured markup.
- `styles.css`: Visual style system containing CSS variables, dark/light themes, animations, and media queries.
- `app.js`: Application logic containing calendar calculations, streak algorithm, event binding, and local storage saves.
- `ANSWERS.md`: Technical and design reflections answering the assessment questions.
