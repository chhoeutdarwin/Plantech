document.addEventListener('DOMContentLoaded', () => {
    // ==================== DOM ELEMENTS ====================
    const scheduleContainer = document.getElementById('schedule-container');
    const clearButton = document.getElementById('clear-schedule');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const menuToggle = document.getElementById('menu-toggle');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const progressBar = document.getElementById('progress-bar');
    const quoteText = document.getElementById('quote-text');
    const downloadBtn = document.getElementById('download-schedule');
    const downloadPdfBtn = document.getElementById('download-pdf');
    const exportJsonBtn = document.getElementById('export-json');
    const importJsonBtn = document.getElementById('import-json');
    const importFileInput = document.getElementById('import-file');
    const shareBtn = document.getElementById('share-schedule');
    const toastContainer = document.getElementById('toast-container');
    const colorBtns = document.querySelectorAll('.color-btn');
    const viewBtns = document.querySelectorAll('.view-btn');
    const prevDayBtn = document.getElementById('prev-day');
    const nextDayBtn = document.getElementById('next-day');
    const shortcutsBtn = document.getElementById('shortcuts-btn');
    const todayBtn = document.getElementById('today-btn'); // May not exist in compact UI
    const currentDateEl = document.getElementById('current-date');
    const weekContainer = document.getElementById('week-container');
    const monthContainer = document.getElementById('month-container');
    const streakCount = document.getElementById('streak-count');
    const tasksCompleted = document.getElementById('tasks-completed');
    const tasksTotal = document.getElementById('tasks-total');
    const currentTimeEl = document.getElementById('current-time');
    const notificationBanner = document.getElementById('notification-banner');
    const enableNotificationsBtn = document.getElementById('enable-notifications');
    const dismissBannerBtn = document.getElementById('dismiss-banner');

    // Modal Elements
    const pomodoroModal = document.getElementById('pomodoro-modal');
    const taskModal = document.getElementById('task-modal');
    const shortcutsModal = document.getElementById('shortcuts-modal');
    const closeModals = document.querySelectorAll('.close-modal');
    
    // Timer Elements
    const timerMinutes = document.getElementById('timer-minutes');
    const timerSeconds = document.getElementById('timer-seconds');
    const timerStart = document.getElementById('timer-start');
    const timerPause = document.getElementById('timer-pause');
    const timerReset = document.getElementById('timer-reset');
    const timerTask = document.getElementById('timer-task');
    const presetBtns = document.querySelectorAll('.preset-btn');

    // Task Modal Elements
    const modalHour = document.getElementById('modal-hour');
    const modalTaskName = document.getElementById('modal-task-name');
    const modalCategory = document.getElementById('modal-category');
    const modalPriority = document.getElementById('modal-priority');
    const modalDuration = document.getElementById('modal-duration');
    const modalNotes = document.getElementById('modal-notes');
    const modalRecurring = document.getElementById('modal-recurring');
    const modalRecurrence = document.getElementById('modal-recurrence');
    const modalNotification = document.getElementById('modal-notification');
    const modalNotifyBefore = document.getElementById('modal-notify-before');
    const modalSave = document.getElementById('modal-save');
    const modalDelete = document.getElementById('modal-delete');
    const modalPomodoro = document.getElementById('modal-pomodoro');

    // ==================== CONSTANTS ====================
    const startHour = 0;
    const endHour = 23;
    
    const quotes = [
        "The secret of getting ahead is getting started.",
        "The best way to predict the future is to create it.",
        "Don't watch the clock; do what it does. Keep going.",
        "The future belongs to those who believe in the beauty of their dreams.",
        "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        "Your time is limited, don't waste it living someone else's life.",
        "The only way to do great work is to love what you do.",
        "Believe you can and you're halfway there.",
        "It always seems impossible until it's done.",
        "The harder you work for something, the greater you'll feel when you achieve it.",
        "To those who ever gives up is gay.",
        "Productivity is being able to do things that you were never able to do before.",
        "Start where you are. Use what you have. Do what you can.",
        "Don't count the days, make the days count.",
        "Great things are done by a series of small things brought together."
        
    ];

    const categoryEmojis = {
        none: '📋',
        work: '💼',
        personal: '👤',
        health: '💪',
        learning: '📚',
        social: '👥',
        errands: '🛒'
    };

    // ==================== STATE ====================
    let currentDate = new Date();
    let currentView = 'day';
    let timerInterval = null;
    let timerMinutesLeft = 25;
    let timerSecondsLeft = 0;
    let timerRunning = false;
    let notificationTimeout = null;

    // ==================== UTILITY FUNCTIONS ====================
    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const formatDateDisplay = (date) => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (formatDate(date) === formatDate(today)) return 'Today';
        if (formatDate(date) === formatDate(tomorrow)) return 'Tomorrow';
        if (formatDate(date) === formatDate(yesterday)) return 'Yesterday';
        
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const getDateKey = (date = currentDate) => formatDate(date);

    const showToast = (message, type = 'info') => {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`;
        toastContainer.appendChild(toast);
        
        setTimeout(() => toast.remove(), 3000);
    };

    const playNotificationSound = () => {
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
    };

    // ==================== THEME MANAGEMENT ====================
    let isDarkMode = localStorage.getItem('theme') === 'dark';

    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        isDarkMode = theme === 'dark';
        // Update icon
        const icon = darkModeToggle.querySelector('i');
        if (icon) {
            icon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
        }
    };

    const applyColorTheme = (color) => {
        document.documentElement.setAttribute('data-color', color);
        localStorage.setItem('colorTheme', color);
        colorBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === color);
        });
    };

    darkModeToggle.addEventListener('click', () => {
        applyTheme(isDarkMode ? 'light' : 'dark');
    });

    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            applyColorTheme(btn.dataset.theme);
        });
    });

    // ==================== DATA MANAGEMENT ====================
    const getAllSchedules = () => {
        return JSON.parse(localStorage.getItem('allSchedules')) || {};
    };

    const saveAllSchedules = (schedules) => {
        localStorage.setItem('allSchedules', JSON.stringify(schedules));
    };

    const getSchedule = (dateKey = getDateKey()) => {
        const allSchedules = getAllSchedules();
        return allSchedules[dateKey] || {};
    };

    const saveTask = (hour, taskData, dateKey = getDateKey()) => {
        const allSchedules = getAllSchedules();
        if (!allSchedules[dateKey]) {
            allSchedules[dateKey] = {};
        }
        
        if (taskData && taskData.task) {
            allSchedules[dateKey][hour] = taskData;
        } else {
            delete allSchedules[dateKey][hour];
        }
        
        saveAllSchedules(allSchedules);
        updateProgress();
        updateStats();
    };

    const applyRecurringTasks = (dateKey) => {
        const allSchedules = getAllSchedules();
        const today = new Date(dateKey);
        const dayOfWeek = today.getDay();
        
        Object.keys(allSchedules).forEach(key => {
            const schedule = allSchedules[key];
            Object.keys(schedule).forEach(hour => {
                const task = schedule[hour];
                if (task.recurring) {
                    const shouldApply = 
                        (task.recurrence === 'daily') ||
                        (task.recurrence === 'weekdays' && dayOfWeek >= 1 && dayOfWeek <= 5) ||
                        (task.recurrence === 'weekly' && new Date(key).getDay() === dayOfWeek);
                    
                    if (shouldApply && key !== dateKey) {
                        if (!allSchedules[dateKey]) allSchedules[dateKey] = {};
                        if (!allSchedules[dateKey][hour]) {
                            allSchedules[dateKey][hour] = { ...task, completed: false };
                        }
                    }
                }
            });
        });
        
        saveAllSchedules(allSchedules);
    };

    // ==================== SCHEDULE GENERATION ====================
    const generateTimeBlocks = () => {
        scheduleContainer.innerHTML = '';
        const schedule = getSchedule();
        
        for (let hour = startHour; hour <= endHour; hour++) {
            const timeBlock = document.createElement('div');
            timeBlock.classList.add('time-block');
            timeBlock.dataset.hour = hour;
            timeBlock.draggable = true;

            const taskData = schedule[hour] || {};
            
            if (taskData.category) {
                timeBlock.dataset.category = taskData.category;
            }
            if (taskData.priority) {
                timeBlock.dataset.priority = taskData.priority;
            }

            // Checkbox
            const completionCheckbox = document.createElement('input');
            completionCheckbox.type = 'checkbox';
            completionCheckbox.classList.add('completion-checkbox');
            completionCheckbox.checked = taskData.completed || false;

            // Time Label
            const timeLabel = document.createElement('span');
            timeLabel.classList.add('time-label');
            timeLabel.textContent = `${String(hour).padStart(2, '0')}:00`;

            // Task Input
            const taskInput = document.createElement('input');
            taskInput.type = 'text';
            taskInput.classList.add('task-input');
            taskInput.placeholder = 'What will you do?';
            taskInput.value = taskData.task || '';
            if (taskData.completed) {
                taskInput.classList.add('completed');
            }

            // Category Badge
            const categoryBadge = document.createElement('span');
            categoryBadge.classList.add('category-badge');
            if (taskData.category && taskData.category !== 'none') {
                categoryBadge.classList.add(taskData.category);
                categoryBadge.textContent = categoryEmojis[taskData.category];
            }

            // Action Buttons
            const actionBtns = document.createElement('div');
            actionBtns.classList.add('action-btns');
            
            const editBtn = document.createElement('button');
            editBtn.classList.add('action-btn', 'edit-btn');
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.title = 'Edit task details';
            
            const timerBtn = document.createElement('button');
            timerBtn.classList.add('action-btn', 'timer-btn');
            timerBtn.innerHTML = '<i class="fas fa-stopwatch"></i>';
            timerBtn.title = 'Start Pomodoro timer';

            actionBtns.appendChild(editBtn);
            actionBtns.appendChild(timerBtn);

            // Recurring indicator
            if (taskData.recurring) {
                const recurringIndicator = document.createElement('span');
                recurringIndicator.classList.add('recurring-indicator');
                recurringIndicator.innerHTML = '<i class="fas fa-sync-alt"></i>';
                recurringIndicator.title = `Recurring: ${taskData.recurrence}`;
                actionBtns.appendChild(recurringIndicator);
            }

            // Save Button

            const saveButton = document.createElement('button');
            saveButton.classList.add('save-btn');
            if (taskData && taskData.task) {
                saveButton.textContent = 'Saved';
                saveButton.classList.add('saved');
            } else {
                saveButton.textContent = 'Save';
            }

            timeBlock.appendChild(completionCheckbox);
            timeBlock.appendChild(timeLabel);
            timeBlock.appendChild(taskInput);
            timeBlock.appendChild(categoryBadge);
            timeBlock.appendChild(actionBtns);
            timeBlock.appendChild(saveButton);
            scheduleContainer.appendChild(timeBlock);
        }
        
        highlightCurrentHour();
        setupDragAndDrop();
    };

    // ==================== DRAG AND DROP ====================
    const setupDragAndDrop = () => {
        const timeBlocks = document.querySelectorAll('.time-block');
        
        timeBlocks.forEach(block => {
            block.addEventListener('dragstart', (e) => {
                block.classList.add('dragging');
                e.dataTransfer.setData('text/plain', block.dataset.hour);
            });
            
            block.addEventListener('dragend', () => {
                block.classList.remove('dragging');
            });
            
            block.addEventListener('dragover', (e) => {
                e.preventDefault();
                block.classList.add('drag-over');
            });
            
            block.addEventListener('dragleave', () => {
                block.classList.remove('drag-over');
            });
            
            block.addEventListener('drop', (e) => {
                e.preventDefault();
                block.classList.remove('drag-over');
                
                const fromHour = e.dataTransfer.getData('text/plain');
                const toHour = block.dataset.hour;
                
                if (fromHour !== toHour) {
                    const schedule = getSchedule();
                    const fromTask = schedule[fromHour];
                    const toTask = schedule[toHour];
                    
                    if (fromTask) {
                        saveTask(toHour, fromTask);
                        saveTask(fromHour, toTask || null);
                        generateTimeBlocks();
                        showToast('Task moved successfully', 'success');
                    }
                }
            });
        });
    };

    // ==================== UI UPDATES ====================
    const updateProgress = () => {
        const schedule = getSchedule();
        const tasks = Object.values(schedule).filter(item => item.task);
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(item => item.completed).length;
        const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        progressBar.style.width = `${progress}%`;
        
        tasksCompleted.textContent = completedTasks;
        tasksTotal.textContent = totalTasks;
    };

    const updateStats = () => {
        updateStreak();
        updateCurrentTime();
    };

    const updateStreak = () => {
        const allSchedules = getAllSchedules();
        let streak = 0;
        let checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - 1); // Start from yesterday
        
        while (true) {
            const dateKey = formatDate(checkDate);
            const schedule = allSchedules[dateKey];
            
            if (schedule) {
                const tasks = Object.values(schedule).filter(t => t.task);
                const completed = tasks.filter(t => t.completed);
                
                if (tasks.length > 0 && completed.length === tasks.length) {
                    streak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else if (tasks.length > 0) {
                    break;
                } else {
                    checkDate.setDate(checkDate.getDate() - 1);
                    if (streak === 0 && checkDate < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) break;
                }
            } else {
                if (streak > 0) break;
                checkDate.setDate(checkDate.getDate() - 1);
                if (checkDate < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) break;
            }
        }
        
        // Check if today is complete too
        const todaySchedule = getSchedule(formatDate(new Date()));
        if (todaySchedule) {
            const todayTasks = Object.values(todaySchedule).filter(t => t.task);
            const todayCompleted = todayTasks.filter(t => t.completed);
            if (todayTasks.length > 0 && todayCompleted.length === todayTasks.length) {
                streak++;
            }
        }
        
        streakCount.textContent = streak;
        localStorage.setItem('streak', streak);
    };

    const updateCurrentTime = () => {
        const now = new Date();
        currentTimeEl.textContent = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
    };

    const highlightCurrentHour = () => {
        const now = new Date();
        const currentHour = now.getHours();
        const isToday = formatDate(currentDate) === formatDate(now);
        
        document.querySelectorAll('.time-block').forEach(block => {
            block.classList.remove('current');
            if (isToday && parseInt(block.dataset.hour) === currentHour) {
                block.classList.add('current');
            }
        });
    };

    const updateDateDisplay = () => {
        currentDateEl.textContent = formatDateDisplay(currentDate);
    };

    // ==================== VIEW MANAGEMENT ====================
    const switchView = (view) => {
        currentView = view;
        viewBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        document.querySelectorAll('.view-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${view}-view`).classList.add('active');
        
        if (view === 'week') renderWeekView();
        if (view === 'month') renderMonthView();
        if (view === 'stats') renderStatsView();
    };

    const renderWeekView = () => {
        weekContainer.innerHTML = '';
        const weekStart = new Date(currentDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        for (let i = 0; i < 7; i++) {
            const day = new Date(weekStart);
            day.setDate(day.getDate() + i);
            const dateKey = formatDate(day);
            const schedule = getSchedule(dateKey);
            const isToday = formatDate(day) === formatDate(new Date());
            
            const dayEl = document.createElement('div');
            dayEl.classList.add('week-day');
            if (isToday) dayEl.classList.add('today');
            
            dayEl.innerHTML = `
                <div class="week-day-header">
                    <div class="day-name">${days[i]}</div>
                    <div class="day-number">${day.getDate()}</div>
                </div>
            `;
            
            const tasksContainer = document.createElement('div');
            tasksContainer.classList.add('week-tasks');
            
            Object.keys(schedule).sort((a, b) => parseInt(a) - parseInt(b)).forEach(hour => {
                const task = schedule[hour];
                if (task.task) {
                    const taskEl = document.createElement('div');
                    taskEl.classList.add('week-task');
                    if (task.completed) taskEl.classList.add('completed');
                    taskEl.textContent = `${String(hour).padStart(2, '0')}:00 - ${task.task}`;
                    tasksContainer.appendChild(taskEl);
                }
            });
            
            dayEl.appendChild(tasksContainer);
            dayEl.addEventListener('click', () => {
                currentDate = day;
                updateDateDisplay();
                switchView('day');
                generateTimeBlocks();
            });
            
            weekContainer.appendChild(dayEl);
        }
    };

    const renderMonthView = () => {
        monthContainer.innerHTML = '';
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startOffset = firstDay.getDay();
        
        // Month header
        const header = document.createElement('div');
        header.classList.add('month-header');
        header.innerHTML = `
            <button class="nav-btn" id="prev-month"><i class="fas fa-chevron-left"></i></button>
            <h2>${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
            <button class="nav-btn" id="next-month"><i class="fas fa-chevron-right"></i></button>
        `;
        monthContainer.appendChild(header);
        
        // Day labels
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        days.forEach(day => {
            const label = document.createElement('div');
            label.classList.add('day-label');
            label.textContent = day;
            monthContainer.appendChild(label);
        });
        
        // Days from previous month
        const prevMonth = new Date(year, month, 0);
        for (let i = startOffset - 1; i >= 0; i--) {
            const dayEl = createMonthDay(new Date(year, month - 1, prevMonth.getDate() - i), true);
            monthContainer.appendChild(dayEl);
        }
        
        // Days of current month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayEl = createMonthDay(new Date(year, month, day), false);
            monthContainer.appendChild(dayEl);
        }
        
        // Days from next month
        const remainingDays = 42 - (startOffset + lastDay.getDate());
        for (let day = 1; day <= remainingDays; day++) {
            const dayEl = createMonthDay(new Date(year, month + 1, day), true);
            monthContainer.appendChild(dayEl);
        }
        
        // Month navigation
        document.getElementById('prev-month')?.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderMonthView();
        });
        
        document.getElementById('next-month')?.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderMonthView();
        });
    };

    const createMonthDay = (date, isOtherMonth) => {
        const dateKey = formatDate(date);
        const schedule = getSchedule(dateKey);
        const tasks = Object.values(schedule).filter(t => t.task);
        const isToday = formatDate(date) === formatDate(new Date());
        
        const dayEl = document.createElement('div');
        dayEl.classList.add('month-day');
        if (isOtherMonth) dayEl.classList.add('other-month');
        if (isToday) dayEl.classList.add('today');
        
        dayEl.innerHTML = `
            <div class="month-day-number">${date.getDate()}</div>
            ${tasks.length > 0 ? `<div class="month-task-count">${tasks.length} task${tasks.length > 1 ? 's' : ''}</div>` : ''}
            <div class="month-task-dots">
                ${tasks.slice(0, 5).map(t => `<span class="task-dot ${t.completed ? 'completed' : ''}"></span>`).join('')}
            </div>
        `;
        
        dayEl.addEventListener('click', () => {
            currentDate = new Date(date);
            updateDateDisplay();
            switchView('day');
            generateTimeBlocks();
        });
        
        return dayEl;
    };

    const renderStatsView = () => {
        renderCompletionChart();
        renderWeeklyChart();
        renderCategoryChart();
        renderHeatmap();
    };

    const renderCompletionChart = () => {
        const ctx = document.getElementById('completion-chart')?.getContext('2d');
        if (!ctx) return;
        
        const schedule = getSchedule();
        const tasks = Object.values(schedule).filter(t => t.task);
        const completed = tasks.filter(t => t.completed).length;
        const pending = tasks.length - completed;
        
        if (window.completionChart) window.completionChart.destroy();
        
        window.completionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Pending'],
                datasets: [{
                    data: [completed, pending],
                    backgroundColor: ['#28a745', '#dc3545'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    };

    const renderWeeklyChart = () => {
        const ctx = document.getElementById('weekly-chart')?.getContext('2d');
        if (!ctx) return;
        
        const labels = [];
        const completedData = [];
        const totalData = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateKey = formatDate(date);
            const schedule = getSchedule(dateKey);
            const tasks = Object.values(schedule).filter(t => t.task);
            
            labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            completedData.push(tasks.filter(t => t.completed).length);
            totalData.push(tasks.length);
        }
        
        if (window.weeklyChart) window.weeklyChart.destroy();
        
        window.weeklyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Completed',
                        data: completedData,
                        backgroundColor: '#28a745'
                    },
                    {
                        label: 'Total',
                        data: totalData,
                        backgroundColor: '#007bff'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    };

    const renderCategoryChart = () => {
        const ctx = document.getElementById('category-chart')?.getContext('2d');
        if (!ctx) return;
        
        const allSchedules = getAllSchedules();
        const categoryCount = {};
        
        Object.values(allSchedules).forEach(schedule => {
            Object.values(schedule).forEach(task => {
                if (task.category && task.category !== 'none') {
                    categoryCount[task.category] = (categoryCount[task.category] || 0) + 1;
                }
            });
        });
        
        const colors = {
            work: '#007bff',
            personal: '#6f42c1',
            health: '#28a745',
            learning: '#fd7e14',
            social: '#e83e8c',
            errands: '#17a2b8'
        };
        
        if (window.categoryChart) window.categoryChart.destroy();
        
        window.categoryChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(categoryCount).map(c => categoryEmojis[c] + ' ' + c.charAt(0).toUpperCase() + c.slice(1)),
                datasets: [{
                    data: Object.values(categoryCount),
                    backgroundColor: Object.keys(categoryCount).map(c => colors[c] || '#6c757d'),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    };

    const renderHeatmap = () => {
        const heatmap = document.getElementById('activity-heatmap');
        if (!heatmap) return;
        
        heatmap.innerHTML = '';
        const allSchedules = getAllSchedules();
        
        for (let week = 0; week < 53; week++) {
            for (let day = 0; day < 7; day++) {
                const date = new Date();
                date.setDate(date.getDate() - ((52 - week) * 7 + (6 - day)));
                const dateKey = formatDate(date);
                const schedule = allSchedules[dateKey] || {};
                const tasks = Object.values(schedule).filter(t => t.task);
                const completed = tasks.filter(t => t.completed).length;
                
                const cell = document.createElement('div');
                cell.classList.add('heatmap-cell');
                cell.title = `${dateKey}: ${completed} tasks completed`;
                
                if (completed > 0) {
                    if (completed >= 8) cell.classList.add('level-4');
                    else if (completed >= 5) cell.classList.add('level-3');
                    else if (completed >= 3) cell.classList.add('level-2');
                    else cell.classList.add('level-1');
                }
                
                heatmap.appendChild(cell);
            }
        }
    };

    // ==================== EVENT LISTENERS ====================
    scheduleContainer.addEventListener('click', (e) => {
        const timeBlock = e.target.closest('.time-block');
        if (!timeBlock) return;
        
        const hour = timeBlock.dataset.hour;
        const taskInput = timeBlock.querySelector('.task-input');
        const checkbox = timeBlock.querySelector('.completion-checkbox');
        
        if (e.target.classList.contains('save-btn')) {
            if (e.target.textContent === 'Saved') {
                e.target.textContent = 'Save';
                e.target.classList.remove('saved');
                return;
            }
            const schedule = getSchedule();
            const existingTask = schedule[hour] || {};

            saveTask(hour, {
                ...existingTask,
                task: taskInput.value,
                completed: checkbox.checked
            });

            e.target.textContent = 'Saved';
            e.target.classList.add('saved');
            showToast('Task saved!', 'success');
        }
        
        if (e.target.closest('.edit-btn')) {
            openTaskModal(hour);
        }
        
        if (e.target.closest('.timer-btn')) {
            const schedule = getSchedule();
            const task = schedule[hour];
            if (task && task.task) {
                timerTask.textContent = task.task;
            }
            openModal(pomodoroModal);
        }
    });

    scheduleContainer.addEventListener('change', (e) => {
        if (e.target.classList.contains('completion-checkbox')) {
            const timeBlock = e.target.closest('.time-block');
            const taskInput = timeBlock.querySelector('.task-input');
            const hour = timeBlock.dataset.hour;
            
            taskInput.classList.toggle('completed', e.target.checked);
            
            const schedule = getSchedule();
            const existingTask = schedule[hour] || {};
            
            saveTask(hour, {
                ...existingTask,
                task: taskInput.value,
                completed: e.target.checked
            });
            
            if (e.target.checked) {
                showToast('Task completed! 🎉', 'success');
            }
        }
    });

    // View switching
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    // Date navigation
    prevDayBtn.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() - 1);
        updateDateDisplay();
        if (currentView === 'day') generateTimeBlocks();
        else if (currentView === 'week') renderWeekView();
    });

    nextDayBtn.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() + 1);
        updateDateDisplay();
        if (currentView === 'day') generateTimeBlocks();
        else if (currentView === 'week') renderWeekView();
    });

    // Click on date to go to today
    currentDateEl.addEventListener('click', () => {
        currentDate = new Date();
        updateDateDisplay();
        if (currentView === 'day') generateTimeBlocks();
        else if (currentView === 'week') renderWeekView();
        else if (currentView === 'month') renderMonthView();
    });

    // Legacy today button support
    if (todayBtn) {
        todayBtn.addEventListener('click', () => {
            currentDate = new Date();
            updateDateDisplay();
            if (currentView === 'day') generateTimeBlocks();
            else if (currentView === 'week') renderWeekView();
            else if (currentView === 'month') renderMonthView();
        });
    }

    // Clear schedule
    clearButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear today\'s schedule? This cannot be undone.')) {
            const allSchedules = getAllSchedules();
            delete allSchedules[getDateKey()];
            saveAllSchedules(allSchedules);
            generateTimeBlocks();
            showToast('Schedule cleared', 'info');
        }
    });

    // ==================== DROPDOWN MENU ====================
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('hidden');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdownMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            dropdownMenu.classList.add('hidden');
        }
    });

    // Shortcuts button
    if (shortcutsBtn) {
        shortcutsBtn.addEventListener('click', () => {
            shortcutsModal.style.display = 'flex';
            dropdownMenu.classList.add('hidden');
        });
    }

    // ==================== EXPORT/IMPORT ====================
    const closeMenu = () => dropdownMenu.classList.add('hidden');

    downloadBtn.addEventListener('click', () => {
        closeMenu();
        const schedule = getSchedule();
        let scheduleText = `My Schedule - ${formatDateDisplay(currentDate)}\n${'='.repeat(40)}\n\n`;
        
        for (let hour = startHour; hour <= endHour; hour++) {
            const item = schedule[String(hour)];
            if (item && item.task) {
                const status = item.completed ? '[✓]' : '[ ]';
                const category = item.category ? ` [${categoryEmojis[item.category]}]` : '';
                scheduleText += `${String(hour).padStart(2, '0')}:00 ${status}${category} ${item.task}\n`;
            }
        }
        
        const blob = new Blob([scheduleText], { type: 'text/plain' });
        const anchor = document.createElement('a');
        anchor.download = `schedule-${getDateKey()}.txt`;
        anchor.href = window.URL.createObjectURL(blob);
        anchor.click();
        window.URL.revokeObjectURL(anchor.href);
        showToast('Schedule downloaded!', 'success');
    });

    downloadPdfBtn.addEventListener('click', async () => {
        closeMenu();
        showToast('Generating image...', 'info');
        
        try {
            const canvas = await html2canvas(scheduleContainer, {
                backgroundColor: getComputedStyle(document.body).backgroundColor
            });
            
            const link = document.createElement('a');
            link.download = `schedule-${getDateKey()}.png`;
            link.href = canvas.toDataURL();
            link.click();
            showToast('Image saved!', 'success');
        } catch (error) {
            showToast('Failed to generate image', 'error');
        }
    });

    exportJsonBtn.addEventListener('click', () => {
        closeMenu();
        const allSchedules = getAllSchedules();
        const blob = new Blob([JSON.stringify(allSchedules, null, 2)], { type: 'application/json' });
        const anchor = document.createElement('a');
        anchor.download = `schedule-backup-${getDateKey()}.json`;
        anchor.href = window.URL.createObjectURL(blob);
        anchor.click();
        window.URL.revokeObjectURL(anchor.href);
        showToast('Schedule exported!', 'success');
    });

    importJsonBtn.addEventListener('click', () => {
        closeMenu();
        importFileInput.click();
    });

    importFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                const existing = getAllSchedules();
                saveAllSchedules({ ...existing, ...imported });
                generateTimeBlocks();
                showToast('Schedule imported successfully!', 'success');
            } catch (error) {
                showToast('Invalid file format', 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    });

    shareBtn.addEventListener('click', async () => {
        closeMenu();
        const schedule = getSchedule();
        let shareText = `📅 My Schedule - ${formatDateDisplay(currentDate)}\n\n`;
        
        Object.keys(schedule).sort((a, b) => parseInt(a) - parseInt(b)).forEach(hour => {
            const task = schedule[hour];
            if (task.task) {
                const emoji = task.completed ? '✅' : '⬜';
                shareText += `${emoji} ${String(hour).padStart(2, '0')}:00 - ${task.task}\n`;
            }
        });
        
        if (navigator.share) {
            try {
                await navigator.share({ text: shareText });
                showToast('Shared successfully!', 'success');
            } catch (error) {
                if (error.name !== 'AbortError') {
                    await navigator.clipboard.writeText(shareText);
                    showToast('Copied to clipboard!', 'success');
                }
            }
        } else {
            await navigator.clipboard.writeText(shareText);
            showToast('Copied to clipboard!', 'success');
        }
    });

    // ==================== MODALS ====================
    const openModal = (modal) => {
        modal.classList.add('show');
    };

    const closeModal = (modal) => {
        modal.classList.remove('show');
    };

    closeModals.forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(btn.closest('.modal'));
        });
    });

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });

    const openTaskModal = (hour) => {
        const schedule = getSchedule();
        const task = schedule[hour] || {};
        
        modalHour.value = hour;
        modalTaskName.value = task.task || '';
        modalCategory.value = task.category || 'none';
        modalPriority.value = task.priority || 'low';
        modalDuration.value = task.duration || '1';
        modalNotes.value = task.notes || '';
        modalRecurring.checked = task.recurring || false;
        modalRecurrence.value = task.recurrence || 'daily';
        modalRecurrence.disabled = !task.recurring;
        modalNotification.checked = task.notification || false;
        modalNotifyBefore.value = task.notifyBefore || '5';
        
        openModal(taskModal);
    };

    modalRecurring.addEventListener('change', () => {
        modalRecurrence.disabled = !modalRecurring.checked;
    });

    modalSave.addEventListener('click', () => {
        const hour = modalHour.value;

        saveTask(hour, {
            task: modalTaskName.value,
            category: modalCategory.value,
            priority: modalPriority.value,
            duration: modalDuration.value,
            notes: modalNotes.value,
            recurring: modalRecurring.checked,
            recurrence: modalRecurrence.value,
            notification: modalNotification.checked,
            notifyBefore: modalNotifyBefore.value,
            completed: false
        });

        generateTimeBlocks();

        // Update the Save button for this hour to show 'Saved'
        setTimeout(() => {
            const scheduleContainer = document.getElementById('schedule-container');
            if (scheduleContainer) {
                const timeBlock = scheduleContainer.querySelector(`.time-block[data-hour="${hour}"]`);
                if (timeBlock) {
                    const saveBtn = timeBlock.querySelector('.save-btn');
                    if (saveBtn) {
                        saveBtn.textContent = 'Saved';
                        saveBtn.classList.add('saved');
                    }
                }
            }
        }, 10); // Wait for DOM update

        closeModal(taskModal);
        showToast('Task saved!', 'success');

        if (modalNotification.checked) {
            scheduleNotification(hour, modalTaskName.value, parseInt(modalNotifyBefore.value));
        }
    });

    modalDelete.addEventListener('click', () => {
        const hour = modalHour.value;
        saveTask(hour, null);
        generateTimeBlocks();
        closeModal(taskModal);
        showToast('Task deleted', 'info');
    });

    modalPomodoro.addEventListener('click', () => {
        timerTask.textContent = modalTaskName.value || 'No task selected';
        closeModal(taskModal);
        openModal(pomodoroModal);
    });

    // ==================== POMODORO TIMER ====================
    const updateTimerDisplay = () => {
        timerMinutes.textContent = String(timerMinutesLeft).padStart(2, '0');
        timerSeconds.textContent = String(timerSecondsLeft).padStart(2, '0');
    };

    const startTimer = () => {
        if (timerRunning) return;
        timerRunning = true;
        
        timerInterval = setInterval(() => {
            if (timerSecondsLeft === 0) {
                if (timerMinutesLeft === 0) {
                    clearInterval(timerInterval);
                    timerRunning = false;
                    playNotificationSound();
                    showToast('Timer complete! Take a break! 🎉', 'success');
                    if (Notification.permission === 'granted') {
                        new Notification('Pomodoro Complete!', {
                            body: 'Time for a break!',
                            icon: 'images/icon.png'
                        });
                    }
                    return;
                }
                timerMinutesLeft--;
                timerSecondsLeft = 59;
            } else {
                timerSecondsLeft--;
            }
            updateTimerDisplay();
        }, 1000);
    };

    const pauseTimer = () => {
        clearInterval(timerInterval);
        timerRunning = false;
    };

    const resetTimer = (minutes = 45) => {
        pauseTimer();
        timerMinutesLeft = minutes;
        timerSecondsLeft = 0;
        updateTimerDisplay();
    };

    timerStart.addEventListener('click', startTimer);
    timerPause.addEventListener('click', pauseTimer);
    timerReset.addEventListener('click', () => resetTimer());

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            resetTimer(parseInt(btn.dataset.minutes));
        });
    });

    // ==================== NOTIFICATIONS ====================
    const checkNotificationPermission = () => {
        if ('Notification' in window) {
            if (Notification.permission === 'default') {
                const dismissed = localStorage.getItem('notificationBannerDismissed');
                if (!dismissed) {
                    notificationBanner.classList.remove('hidden');
                }
            }
        }
    };

    enableNotificationsBtn?.addEventListener('click', async () => {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            showToast('Notifications enabled!', 'success');
        }
        notificationBanner.classList.add('hidden');
    });

    dismissBannerBtn?.addEventListener('click', () => {
        notificationBanner.classList.add('hidden');
        localStorage.setItem('notificationBannerDismissed', 'true');
    });

    const scheduleNotification = (hour, task, minutesBefore) => {
        const now = new Date();
        const taskTime = new Date(currentDate);
        taskTime.setHours(parseInt(hour), 0, 0, 0);
        taskTime.setMinutes(taskTime.getMinutes() - minutesBefore);
        
        const delay = taskTime.getTime() - now.getTime();
        
        if (delay > 0 && Notification.permission === 'granted') {
            setTimeout(() => {
                new Notification('Task Reminder', {
                    body: `${task} starts in ${minutesBefore} minutes`,
                    icon: 'images/icon.png'
                });
                playNotificationSound();
            }, delay);
        }
    };

    const checkUpcomingTasks = () => {
        if (Notification.permission !== 'granted') return;
        
        const now = new Date();
        const schedule = getSchedule(formatDate(now));
        
        Object.keys(schedule).forEach(hour => {
            const task = schedule[hour];
            if (task.notification && !task.notified) {
                const taskTime = new Date();
                taskTime.setHours(parseInt(hour), 0, 0, 0);
                taskTime.setMinutes(taskTime.getMinutes() - (parseInt(task.notifyBefore) || 5));
                
                if (now >= taskTime && now < new Date(taskTime.getTime() + 60000)) {
                    new Notification('Task Reminder', {
                        body: `${task.task} starts soon!`,
                        icon: 'images/icon.png'
                    });
                    playNotificationSound();
                    task.notified = true;
                    saveTask(hour, task);
                }
            }
        });
    };

    // ==================== KEYBOARD SHORTCUTS ====================
    document.addEventListener('keydown', (e) => {
        // Don't trigger shortcuts when typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            if (e.key === 'Escape') {
                e.target.blur();
            }
            return;
        }
        
        // Close modals on Escape
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.show').forEach(modal => closeModal(modal));
            return;
        }
        
        // Show shortcuts
        if (e.key === '?') {
            openModal(shortcutsModal);
            return;
        }
        
        // Navigation
        if (e.key === 'ArrowLeft') {
            currentDate.setDate(currentDate.getDate() - 1);
            updateDateDisplay();
            if (currentView === 'day') generateTimeBlocks();
        }
        
        if (e.key === 'ArrowRight') {
            currentDate.setDate(currentDate.getDate() + 1);
            updateDateDisplay();
            if (currentView === 'day') generateTimeBlocks();
        }
        
        // View switching
        if (e.key.toLowerCase() === 'd') switchView('day');
        if (e.key.toLowerCase() === 'w') switchView('week');
        if (e.key.toLowerCase() === 'm') switchView('month');
        if (e.key.toLowerCase() === 's' && !e.ctrlKey) switchView('stats');
        
        // Today
        if (e.key.toLowerCase() === 't') {
            currentDate = new Date();
            updateDateDisplay();
            generateTimeBlocks();
        }
        
        // Pomodoro
        if (e.key.toLowerCase() === 'p') {
            openModal(pomodoroModal);
        }
        
        // New task in current hour
        if (e.key.toLowerCase() === 'n') {
            const currentHour = new Date().getHours();
            openTaskModal(String(currentHour));
        }
        
        // Save all (Ctrl+S)
        if (e.ctrlKey && e.key.toLowerCase() === 's') {
            e.preventDefault();
            document.querySelectorAll('.time-block').forEach(block => {
                const hour = block.dataset.hour;
                const taskInput = block.querySelector('.task-input');
                const checkbox = block.querySelector('.completion-checkbox');
                const schedule = getSchedule();
                const existingTask = schedule[hour] || {};
                
                if (taskInput.value) {
                    saveTask(hour, {
                        ...existingTask,
                        task: taskInput.value,
                        completed: checkbox.checked
                    });
                }
            });
            showToast('All tasks saved!', 'success');
        }
        
        // Export (Ctrl+E)
        if (e.ctrlKey && e.key.toLowerCase() === 'e') {
            e.preventDefault();
            exportJsonBtn.click();
        }
    });

    // ==================== INITIALIZATION ====================
    const init = () => {
        // Set initial theme
        const savedTheme = localStorage.getItem('theme') || 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        applyTheme(savedTheme);
        
        // Set color theme
        const savedColor = localStorage.getItem('colorTheme') || 'default';
        applyColorTheme(savedColor);
        
        // Set random quote
        quoteText.textContent = `"${quotes[Math.floor(Math.random() * quotes.length)]}"`;
        
        // Apply recurring tasks
        applyRecurringTasks(getDateKey());
        
        // Generate UI
        updateDateDisplay();
        generateTimeBlocks();
        updateStats();
        
        // Check notifications
        checkNotificationPermission();
        setInterval(checkUpcomingTasks, 60000);
        
        // Update current hour highlight every minute
        setInterval(highlightCurrentHour, 60000);
        
        // Update time display every second
        setInterval(updateCurrentTime, 1000);
        updateCurrentTime();
    };
    
    init();
    setInterval(() => {
        quoteText.textContent = `"${quotes[Math.floor(Math.random() * quotes.length)]}"`;
    }, 3000); // Change quote every 30 seconds

    // If page loaded with #add-task hash, open the task modal for the current hour
    if (window.location.hash === '#add-task') {
        const hour = String(new Date().getHours());
        try {
            openTaskModal(hour);
            // remove hash without reloading
            history.replaceState(null, '', window.location.pathname);
        } catch (e) {
            console.warn('Failed to open task modal from hash', e);
        }
    }
});
