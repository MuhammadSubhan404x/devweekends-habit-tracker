/**
 * AuraHabit — Core Application Controller
 * Handles application state, calendar calculations, streak algorithms,
 * keyboard navigation, localStorage persistence, and micro-interactions.
 */

// --- STATE MANAGEMENT ---
let habits = []; // Array of { id, name, order, createdAt }
let checkedHistory = {}; // Key format: "habitId_YYYY-MM-DD" -> true
let currentWeekOffset = 0; // Relative to today (0 = this week, -1 = last week, etc.)
let weekStartDay = 1; // 1 = Monday, 0 = Sunday (defaulting to Monday)

// --- DOM ELEMENTS ---
const addHabitForm = document.getElementById('add-habit-form');
const habitNameInput = document.getElementById('habit-name-input');
const prevWeekBtn = document.getElementById('prev-week');
const nextWeekBtn = document.getElementById('next-week');
const todayShortcutBtn = document.getElementById('today-shortcut');
const weekRangeText = document.getElementById('week-range-text');
const emptyState = document.getElementById('empty-state');
const emptyStateBtn = document.getElementById('empty-state-btn');
const gridContainer = document.getElementById('grid-container');
const gridBody = document.getElementById('grid-body');
const gridHeaderRow = document.getElementById('grid-header-row');
const themeToggleBtn = document.getElementById('theme-toggle');
const settingsToggleBtn = document.getElementById('settings-toggle');
const settingsDropdown = document.getElementById('settings-dropdown');
const weekStartSelect = document.getElementById('week-start-select');

// --- HELPER FUNCTIONS ---

// Generate Unique IDs
function generateId() {
  return 'habit_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

// Format Date as YYYY-MM-DD
function formatDateString(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Get the date range of the currently viewed week
function getWeekDates() {
  const dates = [];
  const today = new Date();
  
  // Apply week offset
  const baseDate = new Date(today);
  baseDate.setDate(today.getDate() + (currentWeekOffset * 7));
  
  const currentDay = baseDate.getDay(); // 0 is Sunday, 1 is Monday, etc.
  
  // Calculate difference from baseDate to the start of the week
  let diff = 0;
  if (weekStartDay === 1) { // Monday start
    diff = currentDay === 0 ? -6 : 1 - currentDay;
  } else { // Sunday start
    diff = -currentDay;
  }
  
  const startOfWeek = new Date(baseDate);
  startOfWeek.setDate(baseDate.getDate() + diff);
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    dates.push(d);
  }
  
  return dates;
}

// --- LOCAL STORAGE ---
function loadData() {
  const savedHabits = localStorage.getItem('aurahabit_habits');
  const savedHistory = localStorage.getItem('aurahabit_history');
  const savedWeekStart = localStorage.getItem('aurahabit_weekstart');
  const savedTheme = localStorage.getItem('aurahabit_theme');

  if (savedHabits) {
    try {
      habits = JSON.parse(savedHabits);
      // Sort by order descending or ascending as saved
      habits.sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (e) {
      habits = [];
    }
  } else {
    // Inject default habits for visual onboarding if new user
    habits = [
      { id: 'h1', name: 'Read 30 mins', order: 1, createdAt: Date.now() },
      { id: 'h2', name: 'Exercise / Gym', order: 2, createdAt: Date.now() },
      { id: 'h3', name: 'Drink 8L water', order: 3, createdAt: Date.now() }
    ];
  }

  if (savedHistory) {
    try {
      checkedHistory = JSON.parse(savedHistory);
    } catch (e) {
      checkedHistory = {};
    }
  } else {
    // Setup dummy streaks for demo/aesthetic appeal if first loading
    const today = new Date();
    const formattedToday = formatDateString(today);
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const formattedYesterday = formatDateString(yesterday);
    const d3 = new Date();
    d3.setDate(today.getDate() - 2);
    const fd3 = formatDateString(d3);

    checkedHistory[`h1_${formattedToday}`] = true;
    checkedHistory[`h1_${formattedYesterday}`] = true;
    checkedHistory[`h1_${fd3}`] = true;
    checkedHistory[`h2_${formattedYesterday}`] = true;
    checkedHistory[`h2_${fd3}`] = true;
  }

  if (savedWeekStart) {
    weekStartDay = parseInt(savedWeekStart, 10);
    weekStartSelect.value = weekStartDay;
  }

  // Restore Theme
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else {
    // OS Preference Detection
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
}

function saveData() {
  localStorage.setItem('aurahabit_habits', JSON.stringify(habits));
  localStorage.setItem('aurahabit_history', JSON.stringify(checkedHistory));
  localStorage.setItem('aurahabit_weekstart', weekStartDay.toString());
  localStorage.setItem('aurahabit_theme', document.documentElement.getAttribute('data-theme'));
}

// --- STREAK CALCULATION ALGORITHM ---
/**
 * Calculates current consecutive-day streak ending today or yesterday.
 * Our rules (defended in ANSWERS.md):
 * - If today is checked: count today + consecutive days back.
 * - If today is unchecked, but yesterday was checked: count yesterday + consecutive days back.
 * - If both are unchecked: streak is 0.
 */
function calculateStreak(habitId) {
  let streak = 0;
  const today = new Date();
  const formattedToday = formatDateString(today);
  
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const formattedYesterday = formatDateString(yesterday);

  let checkDate = new Date();

  // If today is checked, start evaluating from today
  if (checkedHistory[`${habitId}_${formattedToday}`]) {
    streak = 1;
    checkDate.setDate(today.getDate() - 1);
  } 
  // Else if yesterday is checked, start from yesterday
  else if (checkedHistory[`${habitId}_${formattedYesterday}`]) {
    streak = 1;
    checkDate.setDate(today.getDate() - 2);
  } 
  // Otherwise, streak is 0
  else {
    return 0;
  }

  // Loop backwards to count consecutive checks
  while (true) {
    const dateStr = formatDateString(checkDate);
    if (checkedHistory[`${habitId}_${dateStr}`]) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break; // Streak broken
    }
  }

  return streak;
}

// --- RENDER FUNCTIONS ---

function updateEmptyState() {
  if (habits.length === 0) {
    emptyState.classList.remove('hidden');
    gridContainer.classList.add('hidden');
  } else {
    emptyState.classList.add('hidden');
    gridContainer.classList.remove('hidden');
  }
}

function renderGrid() {
  updateEmptyState();
  if (habits.length === 0) return;

  const dates = getWeekDates();
  const todayStr = formatDateString(new Date());

  // Render Date Headers
  renderHeaders(dates, todayStr);

  // Clear current rows
  gridBody.innerHTML = '';

  // Render Rows
  habits.forEach((habit, idx) => {
    const row = document.createElement('tr');
    row.className = 'habit-row';
    row.dataset.habitId = habit.id;

    // 1. Habit details cell (Name, edit inline, up/down order buttons)
    const habitInfoCell = document.createElement('td');
    habitInfoCell.className = 'col-habit-info';
    
    // Check if we are at start or end of habits array for arrow disabling
    const isFirst = idx === 0;
    const isLast = idx === habits.length - 1;

    habitInfoCell.innerHTML = `
      <div class="habit-cell-content">
        <div class="habit-reorder-buttons" aria-label="Reorder habits">
          <button class="btn-reorder btn-move-up" title="Move Habit Up" ${isFirst ? 'disabled' : ''} aria-label="Move Up">▲</button>
          <button class="btn-reorder btn-move-down" title="Move Habit Down" ${isLast ? 'disabled' : ''} aria-label="Move Down">▼</button>
        </div>
        <div class="habit-name-wrapper">
          <span class="habit-name-text" tabindex="0" title="Click to edit name" role="textbox" aria-label="Habit name">${escapeHTML(habit.name)}</span>
          <button class="btn-delete-row" title="Delete Habit" aria-label="Delete ${escapeHTML(habit.name)}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
        </div>
      </div>
    `;
    row.appendChild(habitInfoCell);

    // 2. The 7 Calendar days checkboxes
    dates.forEach((date, dateIdx) => {
      const dateStr = formatDateString(date);
      const isChecked = !!checkedHistory[`${habit.id}_${dateStr}`];
      const isTodayCol = dateStr === todayStr;
      const isFuture = date > new Date(); // Future columns are disabled

      const dayCell = document.createElement('td');
      dayCell.className = `col-day-cell`;
      if (isTodayCol) dayCell.classList.add('today-col');
      if (isFuture) dayCell.classList.add('future-col');

      const checkboxId = `chk_${habit.id}_${dateStr}`;

      dayCell.innerHTML = `
        <label class="habit-checkbox-label" for="${checkboxId}">
          <input type="checkbox" id="${checkboxId}" class="habit-checkbox-input" 
            data-habit-id="${habit.id}" data-date="${dateStr}" 
            ${isChecked ? 'checked' : ''} 
            ${isFuture ? 'disabled' : ''}
            tabindex="0"
            aria-label="Mark ${escapeHTML(habit.name)} completed on ${dateStr}">
          <span class="checkbox-visual" data-cell-x="${dateIdx}" data-cell-y="${idx}"></span>
        </label>
      `;
      row.appendChild(dayCell);
    });

    // 3. Streak Cell
    const streakCell = document.createElement('td');
    streakCell.className = 'col-streak-cell';
    const streakCount = calculateStreak(habit.id);
    
    let streakClass = '';
    if (streakCount >= 7) streakClass = 'streak-high';
    else if (streakCount > 0) streakClass = 'streak-active';

    streakCell.innerHTML = `
      <div class="streak-wrapper ${streakClass}">
        <span class="streak-flame">${streakCount > 0 ? '🔥' : '💀'}</span>
        <span class="streak-number">${streakCount}d</span>
      </div>
    `;
    row.appendChild(streakCell);

    gridBody.appendChild(row);
  });

  // Calculate and display range text
  const startStr = dates[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const endStr = dates[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  weekRangeText.textContent = `${startStr} — ${endStr}`;
}

function renderHeaders(dates, todayStr) {
  // Clear previous headers from index 1 to 7
  const headerCells = gridHeaderRow.querySelectorAll('th');
  const dayNames = weekStartDay === 1 
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] 
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  dates.forEach((date, i) => {
    const cell = headerCells[i + 1];
    const dateStr = formatDateString(date);
    const isToday = dateStr === todayStr;
    
    cell.className = 'col-day-header';
    if (isToday) cell.classList.add('today');

    cell.innerHTML = `
      ${dayNames[i]}
      <div style="font-size: 11px; opacity: 0.6; font-weight: 500; margin-top: 2px;">
        ${date.getDate()}
      </div>
    `;
  });
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// --- PARTICLE BURST INTERACTION ---
function triggerSparkExplosion(targetEl) {
  const rect = targetEl.getBoundingClientRect();
  const burstX = rect.left + rect.width / 2;
  const burstY = rect.top + rect.height / 2;
  const particleCount = 12;

  const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ffffff'];

  for (let i = 0; i < particleCount; i++) {
    const spark = document.createElement('div');
    spark.className = 'particle-spark';
    
    // Choose random color
    spark.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Set particle initial coords in viewport relative to body absolute
    spark.style.left = `${window.scrollX + burstX}px`;
    spark.style.top = `${window.scrollY + burstY}px`;

    // Generate random velocities/translation values
    const angle = Math.random() * Math.PI * 2;
    const distance = 30 + Math.random() * 40;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;

    spark.style.setProperty('--tx', `${tx}px`);
    spark.style.setProperty('--ty', `${ty}px`);

    document.body.appendChild(spark);

    // Remove particle after animation ends
    spark.addEventListener('animationend', () => {
      spark.remove();
    });
  }
}

// --- CONTROLLER EVENTS & ROUTING ---

// 1. Form Submission (Add Habit)
addHabitForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = habitNameInput.value.trim();
  if (!name) return;

  const newHabit = {
    id: generateId(),
    name: name,
    order: habits.length > 0 ? Math.max(...habits.map(h => h.order || 0)) + 1 : 1,
    createdAt: Date.now()
  };

  habits.push(newHabit);
  habitNameInput.value = '';
  saveData();
  renderGrid();
});

// 2. Click Handler inside Weekly Grid (Checkboxes, Inline Rename, Reorder, Delete)
gridBody.addEventListener('click', (e) => {
  const target = e.target;
  const row = target.closest('.habit-row');
  if (!row) return;
  const habitId = row.dataset.habitId;

  // A. Checkbox change trigger
  if (target.classList.contains('habit-checkbox-input')) {
    const date = target.dataset.date;
    const isChecked = target.checked;

    if (isChecked) {
      checkedHistory[`${habitId}_${date}`] = true;
      triggerSparkExplosion(target.nextElementSibling); // Trigger fireworks animation on checkbox
    } else {
      delete checkedHistory[`${habitId}_${date}`];
    }
    
    saveData();
    
    // Recalculate streak and update badge in DOM directly for ultra performance (no full re-render!)
    const streakCell = row.querySelector('.col-streak-cell');
    const streakCount = calculateStreak(habitId);
    let streakClass = '';
    if (streakCount >= 7) streakClass = 'streak-high';
    else if (streakCount > 0) streakClass = 'streak-active';

    streakCell.innerHTML = `
      <div class="streak-wrapper ${streakClass}">
        <span class="streak-flame">${streakCount > 0 ? '🔥' : '💀'}</span>
        <span class="streak-number">${streakCount}d</span>
      </div>
    `;
  }

  // B. Delete Habit Action
  if (target.closest('.btn-delete-row')) {
    const habitIndex = habits.findIndex(h => h.id === habitId);
    if (habitIndex > -1) {
      const habitName = habits[habitIndex].name;
      if (confirm(`Are you sure you want to delete the habit "${habitName}"?`)) {
        // Remove from habits list
        habits.splice(habitIndex, 1);
        // Clean history
        Object.keys(checkedHistory).forEach(key => {
          if (key.startsWith(habitId + '_')) {
            delete checkedHistory[key];
          }
        });
        saveData();
        renderGrid();
      }
    }
  }

  // C. Move Up Reorder
  if (target.classList.contains('btn-move-up')) {
    const idx = habits.findIndex(h => h.id === habitId);
    if (idx > 0) {
      // Swap orders
      const temp = habits[idx].order;
      habits[idx].order = habits[idx - 1].order;
      habits[idx - 1].order = temp;
      
      saveData();
      renderGrid();
    }
  }

  // D. Move Down Reorder
  if (target.classList.contains('btn-move-down')) {
    const idx = habits.findIndex(h => h.id === habitId);
    if (idx > -1 && idx < habits.length - 1) {
      // Swap orders
      const temp = habits[idx].order;
      habits[idx].order = habits[idx + 1].order;
      habits[idx + 1].order = temp;
      
      saveData();
      renderGrid();
    }
  }
});

// Inline Habit Renaming on doubleclick / single click text
gridBody.addEventListener('focusin', (e) => {
  const target = e.target;
  if (target.classList.contains('habit-name-text')) {
    // Turn cell into inline editable input
    target.setAttribute('contenteditable', 'true');
    
    // Save original name in case they cancel/blur empty
    target.dataset.originalValue = target.textContent;
  }
});

gridBody.addEventListener('focusout', (e) => {
  const target = e.target;
  if (target.classList.contains('habit-name-text')) {
    target.removeAttribute('contenteditable');
    
    const row = target.closest('.habit-row');
    if (!row) return;
    const habitId = row.dataset.habitId;
    const newName = target.textContent.trim();

    if (newName && newName !== target.dataset.originalValue) {
      const habit = habits.find(h => h.id === habitId);
      if (habit) {
        habit.name = newName;
        saveData();
        // Render to update delete buttons labels, but let them keep typing comfortably
        renderGrid();
      }
    } else {
      // Reset to original if left blank
      target.textContent = target.dataset.originalValue || 'Unnamed Habit';
    }
  }
});

gridBody.addEventListener('keydown', (e) => {
  const target = e.target;
  if (target.classList.contains('habit-name-text')) {
    if (e.key === 'Enter') {
      e.preventDefault();
      target.blur(); // Triggers focusout logic to save
    }
    if (e.key === 'Escape') {
      target.textContent = target.dataset.originalValue;
      target.blur();
    }
  }
});

// 3. Navigation Controls
prevWeekBtn.addEventListener('click', () => {
  currentWeekOffset--;
  renderGrid();
});

nextWeekBtn.addEventListener('click', () => {
  currentWeekOffset++;
  renderGrid();
});

todayShortcutBtn.addEventListener('click', () => {
  currentWeekOffset = 0;
  renderGrid();
});

// Empty State CTA Button
emptyStateBtn.addEventListener('click', () => {
  habitNameInput.focus();
});

// 4. Header UI Controls (Dropdown and Theme Toggles)

// Theme toggle logic
themeToggleBtn.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  saveData();
});

// Settings dropdown display toggle
settingsToggleBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  settingsDropdown.classList.toggle('dropdown-active');
});

// Close dropdown on click outside
document.addEventListener('click', () => {
  settingsDropdown.classList.remove('dropdown-active');
});

// Week start day select change listener
weekStartSelect.addEventListener('change', () => {
  weekStartDay = parseInt(weekStartSelect.value, 10);
  saveData();
  renderGrid();
});

// --- ACCESSIBILITY KEYBOARD GRID NAVIGATION ---
/**
 * Enables smooth grid navigation using Arrow keys.
 * Focused cells allow:
 * - ArrowUp / ArrowDown: navigate between rows on same column
 * - ArrowLeft / ArrowRight: navigate between days on same row
 */
gridBody.addEventListener('keydown', (e) => {
  const activeEl = document.activeElement;
  if (!activeEl || !activeEl.classList.contains('habit-checkbox-input')) return;

  const currentCheckbox = activeEl;
  const currentCell = currentCheckbox.closest('.col-day-cell');
  if (!currentCell) return;

  const currentRow = currentCell.closest('.habit-row');
  if (!currentRow) return;

  const dayCells = Array.from(currentRow.querySelectorAll('.col-day-cell'));
  const currentColIndex = dayCells.indexOf(currentCell);

  const allRows = Array.from(gridBody.querySelectorAll('.habit-row'));
  const currentRowIndex = allRows.indexOf(currentRow);

  let targetRowIndex = currentRowIndex;
  let targetColIndex = currentColIndex;

  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault();
      targetRowIndex = Math.max(0, currentRowIndex - 1);
      break;
    case 'ArrowDown':
      e.preventDefault();
      targetRowIndex = Math.min(allRows.length - 1, currentRowIndex + 1);
      break;
    case 'ArrowLeft':
      e.preventDefault();
      targetColIndex = Math.max(0, currentColIndex - 1);
      break;
    case 'ArrowRight':
      e.preventDefault();
      targetColIndex = Math.min(6, currentColIndex + 1);
      break;
    default:
      return; // Do nothing for other keys
  }

  const targetRow = allRows[targetRowIndex];
  const targetDayCells = Array.from(targetRow.querySelectorAll('.col-day-cell'));
  const targetCell = targetDayCells[targetColIndex];
  
  if (targetCell) {
    const targetCheckbox = targetCell.querySelector('.habit-checkbox-input');
    if (targetCheckbox) {
      targetCheckbox.focus();
    }
  }
});

// --- INITIALIZE APPLICATION ---
window.addEventListener('DOMContentLoaded', () => {
  loadData();
  renderGrid();
});
