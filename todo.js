// Moved from inline script in todo.html

// Theme handling
function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const icon = document.querySelector('.theme-toggle i');
    if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        icon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        icon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'dark');
    }
}

// Load saved theme
if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    const themeIcon = document.querySelector('.theme-toggle i');
    if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
}

// Tab switching
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.timer-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const mode = tab.dataset.mode;
            document.getElementById('pomodoro-mode').classList.toggle('hidden', mode !== 'pomodoro');
            document.getElementById('stopwatch-mode').classList.toggle('hidden', mode !== 'stopwatch');
            document.getElementById('countdown-mode').classList.toggle('hidden', mode !== 'countdown');
        });
    });

    // Multi-task logic
    const addTaskBtn = document.getElementById('add-task-btn');
    const newTaskInput = document.getElementById('new-task-input');
    const prioritySelect = document.getElementById('priority-select');
    const tasksList = document.getElementById('tasks-list');
    let tasks = [];
    let currentTab = 'all';

    function renderTasks() {
        tasksList.innerHTML = '';
        const activeTab = document.querySelector('.timer-tab.active');
        currentTab = activeTab ? activeTab.dataset.mode : 'all';
        let filtered = tasks;
        if (currentTab === 'favourite') {
            filtered = tasks.filter(t => t.favourite);
        } else if (currentTab === 'completed') {
            filtered = tasks.filter(t => t.completed);
        } else if (currentTab === 'priority') {
            filtered = tasks.filter(t => t.priority === 'high');
        }
        filtered.forEach((task, idx) => {
            const card = document.createElement('div');
        // Load tasks from localStorage
        function loadTasks() {
        loadTasks();
        function initialRender() {
            renderTasks();
        }
        initialRender();
            if (saved) {
                try {
                    tasks = JSON.parse(saved);
                } catch (e) {
                    tasks = [];
                }
            }
        }
        function saveTasks() {
            localStorage.setItem('todo-tasks', JSON.stringify(tasks));
        }
            card.className = 'task-card';
            card.style.display = 'flex';
            card.style.alignItems = 'center';
            card.style.justifyContent = 'space-between';
            card.style.marginBottom = '12px';

            const left = document.createElement('div');
            left.style.display = 'flex';
            left.style.alignItems = 'center';
            left.innerHTML = `<span class="task-number" style="margin-right:8px;color:var(--accent-color);font-weight:bold;">${idx + 1}.</span>`;
            const textSpan = document.createElement('span');
            textSpan.className = 'task-text';
            textSpan.textContent = task.text;
            if (task.completed) {
                textSpan.style.textDecoration = 'line-through';
                textSpan.style.color = '#888';
            } else {
                textSpan.style.textDecoration = 'none';
                textSpan.style.color = 'var(--text-color)';
            }
            left.appendChild(textSpan);

            // Priority badge
            const prio = document.createElement('span');
            prio.className = 'task-priority';
            prio.style.marginLeft = '10px';
            prio.style.fontWeight = 'bold';
            prio.textContent = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟠' : '🟢';
            left.appendChild(prio);

            // Actions
            const actions = document.createElement('div');
            actions.className = 'task-actions';

            // Favourite
            const favBtn = document.createElement('button');
            favBtn.className = 'task-action';
            favBtn.title = 'Favourite';
            favBtn.innerHTML = `<i class="fas fa-heart"></i>`;
            if (task.favourite) favBtn.classList.add('favourited');
            favBtn.onclick = () => {
                task.favourite = !task.favourite;
                renderTasks();
            };
            actions.appendChild(favBtn);

            // Complete
            const completeBtn = document.createElement('button');
            completeBtn.className = 'task-action';
            completeBtn.title = 'Complete';
            completeBtn.innerHTML = `<i class="fas fa-check"></i>`;
            if (task.completed) completeBtn.classList.add('completed');
            completeBtn.onclick = () => {
                task.completed = !task.completed;
                renderTasks();
            };
            actions.appendChild(completeBtn);

                    saveTasks();
            // Delete
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'task-action';
            deleteBtn.title = 'Delete';
            deleteBtn.innerHTML = `<i class="fas fa-trash"></i>`;
            deleteBtn.onclick = () => {
                tasks = tasks.filter((_, i) => i !== idx);
                renderTasks();
            };
            actions.appendChild(deleteBtn);

            card.appendChild(left);
                    saveTasks();
            card.appendChild(actions);
            tasksList.appendChild(card);
        });
    }

    addTaskBtn.onclick = () => {
        const text = newTaskInput.value.trim();
        const priority = prioritySelect.value;
        if (!text) {
            newTaskInput.focus();
            return;
                    saveTasks();
        }
        tasks.push({ text, priority, favourite: false, completed: false });
        newTaskInput.value = '';
        renderTasks();
        newTaskInput.focus();
    };

    document.querySelectorAll('.timer-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.timer-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderTasks();
            newTaskInput.focus();
        });
    });

    renderTasks();

    // Initialize displays after DOM ready
            saveTasks();
    updatePomodoroDisplay();
    updateStopwatchDisplay();
    updateCountdownDisplay();
});

// ==================== POMODORO ====================
let pomodoroSettings = {
    focus: 25,
    shortBreak: 5,
    longBreak: 15
};
let pomodoroState = 'focus'; // focus, shortBreak, longBreak
let pomodoroTime = pomodoroSettings.focus * 60;
let pomodoroRunning = false;
let pomodoroInterval = null;
let pomodoroSession = 1;
let totalPomodoroTime = pomodoroTime;

function adjustSetting(type, delta) {
    pomodoroSettings[type] = Math.max(1, pomodoroSettings[type] + delta);
    document.getElementById(`${type === 'focus' ? 'focus' : type === 'shortBreak' ? 'short-break' : 'long-break'}-minutes`).textContent = pomodoroSettings[type];
    if (!pomodoroRunning && pomodoroState === type) {
        pomodoroTime = pomodoroSettings[type] * 60;
        totalPomodoroTime = pomodoroTime;
        updatePomodoroDisplay();
    }
    if (!pomodoroRunning && type === 'focus' && pomodoroState === 'focus') {
        pomodoroTime = pomodoroSettings.focus * 60;
        totalPomodoroTime = pomodoroTime;
        updatePomodoroDisplay();
    }
}

function updatePomodoroDisplay() {
    const minutes = Math.floor(pomodoroTime / 60);
    const seconds = pomodoroTime % 60;
    const display = document.getElementById('pomodoro-display');
    if (display) display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    const progressEl = document.getElementById('pomodoro-progress');
    if (progressEl && totalPomodoroTime > 0) {
        const progress = (totalPomodoroTime - pomodoroTime) / totalPomodoroTime;
        const circumference = 628;
        progressEl.style.strokeDashoffset = circumference * (1 - progress);
    }
}

function togglePomodoro() {
    pomodoroRunning = !pomodoroRunning;
    const btn = document.getElementById('pomodoro-start');
    if (btn) btn.innerHTML = pomodoroRunning ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    if (pomodoroRunning) {
        pomodoroInterval = setInterval(() => {
            pomodoroTime--;
            updatePomodoroDisplay();
            if (pomodoroTime <= 0) pomodoroComplete();
        }, 1000);
    } else {
        clearInterval(pomodoroInterval);
    }
}

function pomodoroComplete() {
    clearInterval(pomodoroInterval);
    pomodoroRunning = false;
    const startBtn = document.getElementById('pomodoro-start');
    if (startBtn) startBtn.innerHTML = '<i class="fas fa-play"></i>';
    playNotification();
    if (pomodoroState === 'focus') {
        updateSessionDots();
        if (pomodoroSession % 4 === 0) {
            pomodoroState = 'longBreak';
            pomodoroTime = pomodoroSettings.longBreak * 60;
            document.getElementById('pomodoro-label').textContent = 'Long Break';
        } else {
            pomodoroState = 'shortBreak';
            pomodoroTime = pomodoroSettings.shortBreak * 60;
            document.getElementById('pomodoro-label').textContent = 'Short Break';
        }
    } else {
        pomodoroState = 'focus';
        pomodoroTime = pomodoroSettings.focus * 60;
        document.getElementById('pomodoro-label').textContent = 'Focus Time';
        if (pomodoroSession < 4) pomodoroSession++;
        else pomodoroSession = 1;
        updateSessionDotsNext();
    }
    totalPomodoroTime = pomodoroTime;
    updatePomodoroDisplay();
}

function updateSessionDots() {
    const dots = document.querySelectorAll('.session-dot');
    if (dots[pomodoroSession - 1]) {
        dots[pomodoroSession - 1].classList.add('completed');
        dots[pomodoroSession - 1].classList.remove('current');
    }
}

function updateSessionDotsNext() {
    const dots = document.querySelectorAll('.session-dot');
    dots.forEach((dot, i) => {
        dot.classList.remove('current');
        if (i < pomodoroSession - 1) dot.classList.add('completed');
    });
    if (dots[pomodoroSession - 1]) dots[pomodoroSession - 1].classList.add('current');
}

function resetPomodoro() {
    clearInterval(pomodoroInterval);
    pomodoroRunning = false;
    pomodoroState = 'focus';
    pomodoroTime = pomodoroSettings.focus * 60;
    totalPomodoroTime = pomodoroTime;
    pomodoroSession = 1;
    const startBtn = document.getElementById('pomodoro-start');
    if (startBtn) startBtn.innerHTML = '<i class="fas fa-play"></i>';
    const label = document.getElementById('pomodoro-label');
    if (label) label.textContent = 'Focus Time';
    updatePomodoroDisplay();
    const dots = document.querySelectorAll('.session-dot');
    dots.forEach((dot, i) => {
        dot.classList.remove('completed', 'current');
        if (i === 0) dot.classList.add('current');
    });
}

function skipPomodoro() {
    pomodoroTime = 0;
    pomodoroComplete();
}

// ==================== STOPWATCH ====================
let stopwatchTime = 0;
let stopwatchRunning = false;
let stopwatchInterval = null;
let laps = [];

function updateStopwatchDisplay() {
    const hours = Math.floor(stopwatchTime / 3600);
    const minutes = Math.floor((stopwatchTime % 3600) / 60);
    const seconds = stopwatchTime % 60;
    const el = document.getElementById('stopwatch-display');
    if (el) el.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function toggleStopwatch() {
    stopwatchRunning = !stopwatchRunning;
    const btn = document.getElementById('stopwatch-start');
    if (btn) btn.innerHTML = stopwatchRunning ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    if (stopwatchRunning) {
        stopwatchInterval = setInterval(() => {
            stopwatchTime++;
            updateStopwatchDisplay();
        }, 1000);
    } else {
        clearInterval(stopwatchInterval);
    }
}

function lapStopwatch() {
    if (stopwatchTime > 0) {
        const lastLapTime = laps.length > 0 ? laps[laps.length - 1].total : 0;
        laps.push({ total: stopwatchTime, diff: stopwatchTime - lastLapTime });
        renderLaps();
    }
}

function renderLaps() {
    const container = document.getElementById('laps-container');
    if (!container) return;
    container.innerHTML = laps.map((lap, i) => {
        const formatTime = (t) => {
            const h = Math.floor(t / 3600);
            const m = Math.floor((t % 3600) / 60);
            const s = t % 60;
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        };
        return `
            <div class="lap-item">
                <span class="lap-number">Lap ${i + 1}</span>
                <span class="lap-diff">+${formatTime(lap.diff)}</span>
                <span class="lap-time">${formatTime(lap.total)}</span>
            </div>
        `;
    }).reverse().join('');
}

function resetStopwatch() {
    clearInterval(stopwatchInterval);
    stopwatchRunning = false;
    stopwatchTime = 0;
    laps = [];
    const btn = document.getElementById('stopwatch-start');
    if (btn) btn.innerHTML = '<i class="fas fa-play"></i>';
    updateStopwatchDisplay();
    const container = document.getElementById('laps-container');
    if (container) container.innerHTML = '';
}

// ==================== COUNTDOWN ====================
let countdownSettings = { hours: 0, minutes: 5, seconds: 0 };
let countdownTime = 300;
let countdownRunning = false;
let countdownInterval = null;

function adjustCountdown(type, delta) {
    const max = type === 'hours' ? 23 : 59;
    countdownSettings[type] = Math.max(0, Math.min(max, countdownSettings[type] + delta));
    const el = document.getElementById(`countdown-${type}`);
    if (el) el.textContent = countdownSettings[type];
    if (!countdownRunning) {
        countdownTime = countdownSettings.hours * 3600 + countdownSettings.minutes * 60 + countdownSettings.seconds;
        updateCountdownDisplay();
    }
}

function updateCountdownDisplay() {
    const hours = Math.floor(countdownTime / 3600);
    const minutes = Math.floor((countdownTime % 3600) / 60);
    const seconds = countdownTime % 60;
    const el = document.getElementById('countdown-display');
    if (!el) return;
    if (hours > 0) {
        el.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        el.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

function toggleCountdown() {
    if (countdownTime <= 0) return;
    countdownRunning = !countdownRunning;
    const btn = document.getElementById('countdown-start');
    if (btn) btn.innerHTML = countdownRunning ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    const settingsEl = document.getElementById('countdown-settings');
    if (settingsEl) settingsEl.style.opacity = countdownRunning ? '0.5' : '1';
    const label = document.getElementById('countdown-label');
    if (label) label.textContent = countdownRunning ? 'Counting down...' : 'Set your timer';
    if (countdownRunning) {
        countdownInterval = setInterval(() => {
            countdownTime--;
            updateCountdownDisplay();
            if (countdownTime <= 0) countdownComplete();
        }, 1000);
    } else {
        clearInterval(countdownInterval);
    }
}

function countdownComplete() {
    clearInterval(countdownInterval);
    countdownRunning = false;
    const btn = document.getElementById('countdown-start');
    if (btn) btn.innerHTML = '<i class="fas fa-play"></i>';
    const label = document.getElementById('countdown-label');
    if (label) label.textContent = "Time's up!";
    const settingsEl = document.getElementById('countdown-settings');
    if (settingsEl) settingsEl.style.opacity = '1';
    playNotification();
}

function resetCountdown() {
    clearInterval(countdownInterval);
    countdownRunning = false;
    countdownTime = countdownSettings.hours * 3600 + countdownSettings.minutes * 60 + countdownSettings.seconds;
    const btn = document.getElementById('countdown-start');
    if (btn) btn.innerHTML = '<i class="fas fa-play"></i>';
    const label = document.getElementById('countdown-label');
    if (label) label.textContent = 'Set your timer';
    const settingsEl = document.getElementById('countdown-settings');
    if (settingsEl) settingsEl.style.opacity = '1';
    updateCountdownDisplay();
}

// ==================== NOTIFICATION ====================
// ==================== TODO LIST ====================

// ========== (Keep notification code below for timer) ==========
function playNotification() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Audio notification not supported');
    }
    if (Notification.permission === 'granted') {
        new Notification('Timer Complete!', { body: 'Your timer has finished.' });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}
