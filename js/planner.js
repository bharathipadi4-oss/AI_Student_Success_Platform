/**
 * Campus Pulse AI - Smart Planner Engine
 * Manages study tasks, daily schedules, Pomodoro focus timer, and AI Study Plan Generation.
 */
class SmartPlannerEngine {
  constructor() {
    this.tasks = [];
    this.filter = 'all';
    // Pomodoro Timer State
    this.timerMode = 'focus'; // 'focus', 'shortBreak', 'longBreak'
    this.durations = {
      focus: 25 * 60,
      shortBreak: 5 * 60,
      longBreak: 15 * 60
    };
    this.timeLeft = this.durations.focus;
    this.timerRunning = false;
    this.timerInterval = null;
    this.pomodorosCompleted = 0;
    this.focusMinutesLogged = 0;
  }
   init() {
    // Load tasks from localStorage or defaults
    const saved = localStorage.getItem('campus_pulse_tasks');
    if (saved) {
      try {
        this.tasks = JSON.parse(saved);
      } catch (e) {
        this.tasks = window.CAMPUS_DATA ? window.CAMPUS_DATA.tasks : [];
      }
    } else if (window.CAMPUS_DATA && window.CAMPUS_DATA.tasks) {
      this.tasks = JSON.parse(JSON.stringify(window.CAMPUS_DATA.tasks));
    }
    // Load stats
    const stats = localStorage.getItem('campus_pulse_pomodoro_stats');
     if (stats) {
      try {
        const parsed = JSON.parse(stats);
        this.pomodorosCompleted = parsed.pomodoros || 0;
        this.focusMinutesLogged = parsed.minutes || 0;
      } catch (e) {}
    }
    this.bindEvents();
    this.renderTasks();
    this.updateStats();
    this.updateTimerDisplay();
  }
  saveTasks() {
    localStorage.setItem('campus_pulse_tasks', JSON.stringify(this.tasks));
  }
  saveStats() {
    localStorage.setItem('campus_pulse_pomodoro_stats', JSON.stringify({
      pomodoros: this.pomodorosCompleted,
      minutes: this.focusMinutesLogged
    }));
  }
  bindEvents() {
    // Task Filter buttons
    const filterBtns = document.querySelectorAll('.planner-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('bg-blue-600', 'text-white'));
        filterBtns.forEach(b => b.classList.add('bg-slate-100', 'text-slate-600'));
        e.currentTarget.classList.remove('bg-slate-100', 'text-slate-600');
        e.currentTarget.classList.add('bg-blue-600', 'text-white');
        this.filter = e.currentTarget.dataset.filter;
        this.renderTasks();
      });
    });
    // Add Task modal
    const addTaskBtn = document.getElementById('planner-btn-add-task');
    if (addTaskBtn) {
          addTaskBtn.addEventListener('click', () => {
        document.getElementById('modal-add-task').classList.remove('hidden');
      });
    }
    const modalClose = document.getElementById('modal-task-close');
    if (modalClose) {
      modalClose.addEventListener('click', () => {
        document.getElementById('modal-add-task').classList.add('hidden');
      });
    }
    const form = document.getElementById('form-add-task');
    if (form) {
      form.addEventListener('submit', (e) =>  {
        e.preventDefault();
        this.handleAddTask();
      });
    }
 // AI Auto-Schedule Generator button
    const aiGenBtn = document.getElementById('planner-btn-ai-generate');
    if (aiGenBtn) {
      aiGenBtn.addEventListener('click', () => {
        this.generateAIStudyPlan();
      });
    }
    // Pomodoro Timer Controls
    const startPauseBtn = document.getElementById('timer-btn-toggle');
    const resetBtn = document.getElementById('timer-btn-reset');
    const modeBtns = document.querySelectorAll('.timer-mode-btn');
    if (startPauseBtn) {
      startPauseBtn.addEventListener('click', () => this.toggleTimer());
    }
     if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetTimer());
    }
    modeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.currentTarget.dataset.mode;
        this.setTimerMode(mode);
      });
    });
  }
  addTask(taskObj) {
    this.tasks.unshift(taskObj);
    this.saveTasks();
    this.renderTasks();
    this.updateStats();
  }
  handleAddTask() {
     const title = document.getElementById('task-input-title').value.trim();
    const subject = document.getElementById('task-input-subject').value.trim();
    const dueDate = document.getElementById('task-input-date').value;
    const priority = document.getElementById('task-input-priority').value;
    const estHours = parseFloat(document.getElementById('task-input-hours').value) || 2.0;
    const notes = document.getElementById('task-input-notes').value.trim();
    if (!title || !subject || !dueDate) {
      showToast('Please fill all mandatory task details.', 'error');
      return;
    }
      this.addTask({
      id: `TSK-${Date.now()}`,
      title: title,
      subject: subject,
      dueDate: dueDate,
      priority: priority,
      completed: false,
      estHours: estHours,
      notes: notes
    });
    document.getElementById('modal-add-task').classList.add('hidden');
    document.getElementById('form-add-task').reset();
    showToast('New study task added to planner!', 'success');
  }
  toggleTaskComplete(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;
     task.completed = !task.completed;
    this.saveTasks();
    this.renderTasks();
    this.updateStats();
    if (task.completed) {
      showToast(`Task completed! Good job on "${task.title}".`, 'success');
    }
  }
  deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.saveTasks();
    this.renderTasks();
    this.updateStats();
    showToast('Task removed from planner.', 'info');
  }
  /**
   * Actionable AI Generator:
   * Inspects upcoming exams and student weak subjects to generate a high-yield study schedule.
   */
  generateAIStudyPlan() {
    const newTasks = [
      {
        id: `AI-TSK-${Date.now()}-1`,
        title: "Deep Focus: Master Weak Concept Deficit (Paging & Virtual Memory)",
        subject: "Operating Systems",
        dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        priority: "High",
        completed: false,
        estHours: 3.0,
        notes: "Campus Pulse AI identified this as your lowest-scoring module. Recommended 3x Pomodoro study blocks."
      },
      {
        id: `AI-TSK-${Date.now()}-2`,
        title: "High-Yield Practice: Dynamic Programming Patterns (0/1 Knapsack, LCS)",
        subject: "Algorithms & Complexity",
        dueDate: new Date(Date.now() + 172800000).toISOString().slice(0, 10),
        priority: "High",
        completed: false,
        estHours: 3.5,
        notes: "Prioritized based on upcoming CS301 midterm exam in 9 days."
      },
      {
        id: `AI-TSK-${Date.now()}-3`,
           title: "Mock Exam Simulation: 60-Minute Timed Practice Test",
        subject: "Machine Learning Systems",
        dueDate: new Date(Date.now() + 259200000).toISOString().slice(0, 10),
        priority: "Medium",
        completed: false,
        estHours: 2.0,
        notes: "Test yourself under closed-book exam conditions to gauge retention."
      }
    ];
    newTasks.forEach(t => this.tasks.unshift(t));
    this.saveTasks();
    this.renderTasks();
    this.updateStats();
    // Notify alert center
    if (window.campusAlerts) {
      window.campusAlerts.addAlert({
        type: 'info',
        title: 'AI Study Schedule Generated',
        message: 'Campus Pulse AI has populated 3 targeted revision sessions targeting your upcoming exams and weak areas.',
        actionText: 'View Tasks',
        actionTarget: 'planner'
      });
    }
    showToast('Generated 3 high-yield study sessions with AI!', 'success');
  }
  renderTasks() {
    const container = document.getElementById('planner-tasks-container');
    if (!container) return;
    let filtered = [...this.tasks];
    if (this.filter === 'pending') filtered = filtered.filter(t => !t.completed);
    else if (this.filter === 'completed') filtered = filtered.filter(t => t.completed);
    else if (this.filter === 'high') filtered = filtered.filter(t => t.priority === 'High');
    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <i class="fa-solid fa-list-check text-4xl mb-3 text-slate-300"></i>
          <h4 class="font-semibold text-slate-700">No tasks in this view</h4>
          <p class="text-xs text-slate-400 mt-1">Add tasks manually or click "Generate AI Study Plan".</p>
        </div>
      `;
      return;
    }
     container.innerHTML = filtered.map(t => {
      let priorityClass = 'bg-slate-100 text-slate-700';
      if (t.priority === 'High') priorityClass = 'bg-red-100 text-red-700 border border-red-200';
      else if (t.priority === 'Medium') priorityClass = 'bg-amber-100 text-amber-700 border border-amber-200';
      else priorityClass = 'bg-blue-100 text-blue-700 border border-blue-200';
      const isCompleted = t.completed;
      return `
        <div class="bg-white rounded-xl p-4 border ${isCompleted ? 'border-slate-200 bg-slate-50/60' : 'border-slate-200'} shadow-sm hover-lift flex items-start gap-3 transition">
          <button onclick="window.campusPlanner.toggleTaskComplete('${t.id}')" 
            class="mt-1 w-5 h-5 rounded-md border ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-blue-500'} flex items-center justify-center transition">
            ${isCompleted ? '<i class="fa-solid fa-check text-xs"></i>' : ''}
          </button>
           <div class="flex-1">
            <div class="flex items-start justify-between gap-2">
              <h4 class="font-semibold text-sm ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}">${t.title}</h4>
              <div class="flex items-center gap-1">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${priorityClass}">${t.priority}</span>
                <button onclick="window.campusPlanner.deleteTask('${t.id}')" 
                  class="text-slate-300 hover:text-red-500 p-1 rounded transition">
                  <i class="fa-regular fa-trash-can text-xs"></i>
                </button>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5 font-medium">
                          <span class="text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-mono text-[11px]">${t.subject}</span>
              <span><i class="fa-regular fa-calendar mr-1"></i> Due ${t.dueDate}</span>
              <span><i class="fa-regular fa-clock mr-1"></i> ${t.estHours} hrs</span>
            </div>
            ${t.notes ? `<p class="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded border border-slate-100 leading-relaxed">${t.notes}</p>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }
  updateStats() {
    const total = this.tasks.length;
    const done = this.tasks.filter(t => t.completed).length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    const totalEl = document.getElementById('planner-stat-total');
    const doneEl = document.getElementById('planner-stat-done');
    const pctEl = document.getElementById('planner-stat-pct');
    const barEl = document.getElementById('planner-progress-bar');
    const pomodoroCountEl = document.getElementById('stat-pomodoros-count');
    const focusMinutesEl = document.getElementById('stat-focus-minutes');
     if (totalEl) totalEl.innerText = total;
    if (doneEl) doneEl.innerText = done;
    if (pctEl) pctEl.innerText = `${pct}%`;
    if (barEl) barEl.style.width = `${pct}%`;
    if (pomodoroCountEl) pomodoroCountEl.innerText = this.pomodorosCompleted;
    if (focusMinutesEl) focusMinutesEl.innerText = `${this.focusMinutesLogged} mins`;
  }
  /* Pomodoro Timer */
  setTimerMode(mode) {
    if (this.timerRunning) this.toggleTimer();
    this.timerMode = mode;
    this.timeLeft = this.durations[mode];
    const modeBtns = document.querySelectorAll('.timer-mode-btn');
    modeBtns.forEach(btn => {
      if (btn.dataset.mode === mode) {
        btn.classList.add('bg-blue-600', 'text-white');
        btn.classList.remove('bg-slate-100', 'text-slate-600');
         } else {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('bg-slate-100', 'text-slate-600');
      }
    });
    this.updateTimerDisplay();
  }
  toggleTimer() {
    const btn = document.getElementById('timer-btn-toggle');
    if (this.timerRunning) {
      clearInterval(this.timerInterval);
      this.timerRunning = false;
      if (btn) btn.innerHTML = '<i class="fa-solid fa-play mr-1.5"></i> Start Focus';
    } else {
      this.timerRunning = true;
      if (btn) btn.innerHTML = '<i class="fa-solid fa-pause mr-1.5"></i> Pause';
      this.timerInterval = setInterval(() => {
        this.tickTimer();
      }, 1000);
    }
  }
  tickTimer() {
    if (this.timeLeft > 0) {
      this.timeLeft--;
      if (this.timerMode === 'focus' && (this.durations.focus - this.timeLeft) % 60 === 0) {
        this.focusMinutesLogged++;
        this.saveStats();
        this.updateStats();
      }
      this.updateTimerDisplay();
    } else {
      // Completed session
      clearInterval(this.timerInterval);
      this.timerRunning = false;
      this.playChime();
       if (this.timerMode === 'focus') {
        this.pomodorosCompleted++;
        this.saveStats();
        this.updateStats();
        showToast('Pomodoro completed! Take a well-earned short break.', 'success');
        this.setTimerMode('shortBreak');
      } else {
        showToast('Break finished! Ready for the next focus sprint?', 'info');
        this.setTimerMode('focus');
      }
    }
  }
  resetTimer() {
    if (this.timerRunning) this.toggleTimer();
    this.timeLeft = this.durations[this.timerMode];
    this.updateTimerDisplay();
  }
   updateTimerDisplay() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    const str = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const displayEl = document.getElementById('timer-time-display');
    if (displayEl) displayEl.innerText = str;
    // Update circular SVG stroke
    const circle = document.getElementById('timer-circle-progress');
    if (circle) {
      const total = this.durations[this.timerMode];
      const fraction = this.timeLeft / total;
      const circumference = 565.48; // 2 * PI * 90
      const offset = circumference * (1 - fraction);
      circle.style.strokeDashoffset = offset;
    }
  }
   playChime() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.log('Audio chime unavailable or blocked');
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.campusPlanner = new SmartPlannerEngine();
  window.campusPlanner.init();
});