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

        // ==================== TODO LIST (WITH SAVE) ====================
        const addTaskBtn = document.getElementById('add-task-btn');
        const newTaskInput = document.getElementById('new-task-input');
        const prioritySelect = document.getElementById('priority-select');
        const tasksList = document.getElementById('tasks-list');
        // tabs variable already declared above

        let tasks = JSON.parse(localStorage.getItem('todo-tasks')) || [];
        let currentTab = 'all';

        // Save tasks
        function saveTasks() {
            localStorage.setItem('todo-tasks', JSON.stringify(tasks));
        }

        // Render tasks
        function renderTasks() {
            tasksList.innerHTML = '';

            let filtered = tasks;
            if (currentTab === 'favourite') filtered = tasks.filter(t => t.favourite);
            if (currentTab === 'completed') filtered = tasks.filter(t => t.completed);
            if (currentTab === 'priority') filtered = tasks.filter(t => t.priority === 'high');

            filtered.forEach((task, idx) => {
                    const card = document.createElement('div');
                    card.className = 'task-card';
                    card.style.display = 'flex';
                    card.style.flexDirection = 'column';
                    card.style.alignItems = 'flex-start';
                    card.style.gap = '6px';
                    card.style.marginBottom = '12px';

                    // Top row: index + text
                    const topRow = document.createElement('div');
                    topRow.style.display = 'flex';
                    topRow.style.alignItems = 'center';
                    topRow.style.gap = '8px';

                    const indexEl = document.createElement('span');
                    indexEl.className = 'task-index';
                    // display saved-order index (1-based)
                    const savedIndex = tasks.indexOf(task);
                    indexEl.textContent = savedIndex >= 0 ? String(savedIndex + 1) : '';

                    const text = document.createElement('span');
                    text.textContent = task.text;
                    text.style.marginRight = '10px';
                    if (task.completed) {
                        text.style.textDecoration = 'line-through';
                        text.style.opacity = '0.6';
                    }

                    topRow.append(indexEl, text);

                    // Actions row: priority + buttons (placed below the text)
                    const actions = document.createElement('div');
                    actions.className = 'task-actions';

                    // priority badge (top-right)
                    const badge = document.createElement('div');
                    const pcls = task.priority === 'high' ? 'priority-high' : task.priority === 'medium' ? 'priority-medium' : 'priority-low';
                    badge.className = `priority-badge ${pcls}`;

                    const buttons = document.createElement('div');
                    buttons.className = 'task-buttons';

                    const favBtn = document.createElement('button');
                    favBtn.className = 'task-action heart small';
                    favBtn.innerHTML = `<i class="fas fa-heart" aria-hidden="true"></i>`;
                    favBtn.setAttribute('aria-label', 'Favourite task');
                    favBtn.title = 'Favourite';
                    if (task.favourite) favBtn.classList.add('favourited');
                    favBtn.onclick = () => {
                        task.favourite = !task.favourite;
                        saveTasks();
                        renderTasks();
                    };

                    const doneBtn = document.createElement('button');
                    doneBtn.className = 'task-action small';
                    if (task.completed) doneBtn.classList.add('completed');
                    doneBtn.innerHTML = `<i class="fas fa-check" aria-hidden="true"></i>`;
                    doneBtn.setAttribute('aria-label', 'Toggle complete');
                    doneBtn.title = 'Complete';
                    doneBtn.onclick = () => {
                        task.completed = !task.completed;
                        saveTasks();
                        renderTasks();
                    };

                    const delBtn = document.createElement('button');
                    delBtn.className = 'task-action delete small';
                    delBtn.innerHTML = `<i class="fas fa-trash" aria-hidden="true"></i>`;
                    delBtn.setAttribute('aria-label', 'Delete task');
                    delBtn.title = 'Delete';
                    delBtn.onclick = () => {
                        const realIndex = tasks.indexOf(task);
                        if (realIndex > -1) tasks.splice(realIndex, 1);
                        saveTasks();
                        renderTasks();
                    };

                    buttons.append(favBtn, doneBtn, delBtn);
                    actions.append(buttons);

                    card.append(badge, topRow, actions);
                    tasksList.appendChild(card);
            });
        }

        // Add task
        addTaskBtn.onclick = () => {
            const text = newTaskInput.value.trim();
            if (!text) return;

            tasks.push({
                text,
                priority: prioritySelect.value,
                favourite: false,
                completed: false
            });

            saveTasks();
            renderTasks();
            newTaskInput.value = '';
        };

        // Tabs
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentTab = tab.dataset.mode;
                renderTasks();
            });
        });

        // Initial load
        renderTasks();
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
