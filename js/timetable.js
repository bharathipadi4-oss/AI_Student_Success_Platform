/**
* Campus Pulse AI - Exam Timetable Management Engine
 * Displays, schedules, filters, counts down, and syncs exam preparations with the Smart Planner.
 */
class TimetableEngine {
  constructor() {
    this.exams = [];
    this.filteredExams = [];
    this.timerInterval = null;
    this.filters = {
      department: 'all',
      difficulty: 'all',
      search: ''
    };
  }
  init() {
    // Load from data.js or localStorage
    const saved = localStorage.getItem('campus_pulse_exams');
    if (saved) {
      try {
        this.exams = JSON.parse(saved);
      } catch (e) {
        this.exams = window.CAMPUS_DATA ? window.CAMPUS_DATA.exams : [];
      }
    } else if (window.CAMPUS_DATA && window.CAMPUS_DATA.exams) {
      this.exams = JSON.parse(JSON.stringify(window.CAMPUS_DATA.exams));
    }
    this.filteredExams = [...this.exams];
    this.bindEvents();
    this.render();
    this.startCountdownTimer();
  }
  save() {
    localStorage.setItem('campus_pulse_exams', JSON.stringify(this.exams));
  }
  bindEvents() {
    const deptFilter = document.getElementById('timetable-filter-dept');
    const diffFilter = document.getElementById('timetable-filter-difficulty');
    const searchInput = document.getElementById('timetable-search');
    const addExamBtn = document.getElementById('timetable-btn-add');
    const exportIcsBtn = document.getElementById('timetable-btn-ics');
    const printBtn = document.getElementById('timetable-btn-print');
    if (deptFilter) deptFilter.addEventListener('change', (e) => {
      this.filters.department = e.target.value;
      this.applyFilters();
    });
    if (diffFilter) diffFilter.addEventListener('change', (e) => {
      this.filters.difficulty = e.target.value;
      this.applyFilters();
    });
    if (searchInput) searchInput.addEventListener('input', (e) => {
      this.filters.search = e.target.value.toLowerCase().trim();
      this.applyFilters();
    });
    if (addExamBtn) addExamBtn.addEventListener('click', () => {
      this.openAddExamModal();
    });
    if (exportIcsBtn) exportIcsBtn.addEventListener('click', () => {
      this.exportICS();
    });
    if (printBtn) printBtn.addEventListener('click', () => {
      window.print();
    });
    // Add Exam Modal Save
    const form = document.getElementById('form-add-exam');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveExam();
      });
    }
    const modalClose = document.getElementById('modal-exam-close');
    if (modalClose) {
      modalClose.addEventListener('click', () => {
        document.getElementById('modal-add-exam').classList.add('hidden');
      });
    }
  }
  applyFilters() {
    this.filteredExams = this.exams.filter(ex => {
      if (this.filters.department !== 'all' && ex.department !== this.filters.department) return false;
        if (this.filters.difficulty !== 'all' && ex.prepDifficulty !== this.filters.difficulty) return false;
      if (this.filters.search) {
        const q = this.filters.search;
        const matchesName = ex.courseName.toLowerCase().includes(q);
        const matchesCode = ex.courseCode.toLowerCase().includes(q);
        const matchesVenue = ex.venue.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesVenue) return false;
      }
      return true;
    });
    this.render();
  }
  render() {
    this.renderCards();
    this.updateNextExamBanner();
  }
  startCountdownTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.updateNextExamBanner();
    }, 1000);
  }
  updateNextExamBanner() {
    const bannerEl = document.getElementById('timetable-next-exam-banner');
    if (!bannerEl) return;
    const now = new Date().getTime();
    // Sort upcoming exams by date
    const upcoming = this.exams
      .filter(ex => new Date(ex.date).getTime() > now - 86400000)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (upcoming.length === 0) {
      bannerEl.innerHTML = `
        <div class="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md flex items-center justify-between">
         <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-blue-200">Exam Countdown</span>
            <h3 class="text-xl font-bold mt-1">No Upcoming Exams Scheduled</h3>
            <p class="text-sm text-blue-100 mt-1">All scheduled examinations have completed.</p>
          </div>
          <i class="fa-solid fa-calendar-check text-4xl text-blue-300 opacity-60"></i>
        </div>
      `;
      return;
    }
    const next = upcoming[0];
    const examDate = new Date(`${next.date}T09:30:00`).getTime();
    const diff = examDate - now;
    if (diff <= 0) {
      bannerEl.innerHTML = `
        <div class="bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-2xl p-6 shadow-md flex items-center justify-between">
          <div>
           <span class="px-2.5 py-1 bg-emerald-500/30 text-emerald-200 text-xs font-bold rounded-full uppercase tracking-wider">Exam Today</span>
            <h3 class="text-2xl font-bold mt-2">${next.courseCode}: ${next.courseName}</h3>
            <p class="text-sm text-emerald-100 mt-1"><i class="fa-regular fa-clock mr-1"></i> ${next.time} &bull; <i class="fa-solid fa-location-dot mr-1"></i> ${next.venue}</p>
          </div>
          <div class="text-right">
            <span class="text-xs text-emerald-200 font-semibold uppercase">Status</span>
            <div class="text-xl font-bold">In Progress</div>
          </div>
        </div>
      `;
      return;
    }
     const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    bannerEl.innerHTML = `
      <div class="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="px-2.5 py-0.5 bg-blue-500/30 text-blue-300 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Upcoming Priority Exam
            </span>
            <span class="text-xs text-blue-200">${next.department}</span>
          </div>
           <h3 class="text-2xl font-black tracking-tight">${next.courseCode} &mdash; ${next.courseName}</h3>
          <div class="flex flex-wrap items-center gap-4 text-xs text-blue-200 mt-2 font-medium">
            <span><i class="fa-regular fa-calendar mr-1"></i> ${next.date}</span>
            <span><i class="fa-regular fa-clock mr-1"></i> ${next.time}</span>
            <span><i class="fa-solid fa-location-dot mr-1"></i> ${next.venue}</span>
            <span><i class="fa-solid fa-user-tie mr-1"></i> ${next.instructor}</span>
          </div>
        </div>
        <div class="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex items-center gap-3 text-center min-w-[280px]">
          <div class="flex-1">
            <div class="text-2xl font-black text-white">${days}</div>
            <div class="text-[10px] uppercase font-bold text-blue-200">Days</div>
          </div>
          <span class="text-lg font-bold text-blue-300">:</span>
          <div class="flex-1">
            <div class="text-2xl font-black text-white">${hours}</div>
            <div class="text-[10px] uppercase font-bold text-blue-200">Hours</div>
          </div>
          <span class="text-lg font-bold text-blue-300">:</span>
          <div class="flex-1">
            <div class="text-2xl font-black text-white">${minutes}</div>
            <div class="text-[10px] uppercase font-bold text-blue-200">Mins</div>
          </div>
          <span class="text-lg font-bold text-blue-300">:</span>
          <div class="flex-1">
            <div class="text-2xl font-black text-white text-emerald-400">${seconds}</div>
            <div class="text-[10px] uppercase font-bold text-emerald-300">Secs</div>
          </div>
        </div>
      </div>
    `;
  }
  renderCards() {
    const container = document.getElementById('timetable-cards-container');
    if (!container) return;
    if (this.filteredExams.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <i class="fa-regular fa-calendar-xmark text-4xl mb-3 text-slate-300"></i>
          <h4 class="text-lg font-semibold text-slate-700">No Exam Schedules Found</h4>
          <p class="text-xs text-slate-400 mt-1">Try adjusting the filter criteria or click "Add Exam Schedule".</p>
        </div>
      `;
      return;
    }
    container.innerHTML = this.filteredExams.map(ex => {
      let diffBadge = 'bg-slate-100 text-slate-700';
       if (ex.prepDifficulty === 'Hard') diffBadge = 'bg-red-100 text-red-700 border border-red-200';
      else if (ex.prepDifficulty === 'Medium') diffBadge = 'bg-amber-100 text-amber-700 border border-amber-200';
      else diffBadge = 'bg-green-100 text-green-700 border border-green-200';
      const topics = ex.topics || ['Comprehensive Syllabus', 'Course Modules'];
      return `
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover-lift flex flex-col justify-between">
          <div>
            <!-- Header -->
            <div class="flex items-start justify-between mb-3">
              <div>
                <span class="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 font-mono">${ex.courseCode}</span>
                <span class="px-2 py-0.5 text-xs font-semibold rounded-full ${diffBadge} ml-1.5">${ex.prepDifficulty} Difficulty</span>
              </div>
              <div class="flex items-center gap-1">
                    <button onclick="window.campusTimetable.deleteExam('${ex.id}')" 
                  class="text-slate-400 hover:text-red-600 p-1 rounded transition" title="Delete Schedule">
                  <i class="fa-regular fa-trash-can text-sm"></i>
                </button>
              </div>
            </div>
            <h4 class="text-lg font-bold text-slate-900 mb-1 leading-snug">${ex.courseName}</h4>
            <p class="text-xs text-slate-500 mb-4">${ex.department} &bull; Semester ${ex.semester}</p>
            <!-- Details Box -->
            <div class="bg-slate-50 rounded-xl p-3.5 mb-4 text-xs space-y-2 border border-slate-100">
              <div class="flex items-center justify-between text-slate-700">
                <span class="text-slate-400 flex items-center gap-1.5"><i class="fa-regular fa-calendar"></i> Date</span>
                <strong class="font-semibold">${ex.date}</strong>
              </div>
                 <div class="flex items-center justify-between text-slate-700">
                <span class="text-slate-400 flex items-center gap-1.5"><i class="fa-regular fa-clock"></i> Time</span>
                <strong class="font-semibold">${ex.time}</strong>
              </div>
              <div class="flex items-center justify-between text-slate-700">
                <span class="text-slate-400 flex items-center gap-1.5"><i class="fa-solid fa-location-dot"></i> Venue</span>
                <strong class="font-semibold">${ex.venue}</strong>
              </div>
              <div class="flex items-center justify-between text-slate-700">
                <span class="text-slate-400 flex items-center gap-1.5"><i class="fa-solid fa-chalkboard-user"></i> Invigilator</span>
                <strong class="font-semibold">${ex.instructor}</strong>
              </div>
            </div>
                <!-- Actionable Prep Metrics -->
            <div class="mb-4">
              <div class="flex items-center justify-between text-xs mb-1.5">
                <span class="text-slate-500 font-medium">Syllabus Coverage</span>
                <span class="font-bold text-slate-800">${ex.syllabusCoverage}%</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div class="h-full rounded-full ${ex.syllabusCoverage >= 80 ? 'bg-green-500' : 'bg-amber-500'}" style="width: ${ex.syllabusCoverage}%"></div>
              </div>
              <div class="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>Recommended Prep: <strong class="text-slate-700 font-semibold">${ex.recommendedHours} hrs</strong></span>
                <span>Max Marks: <strong>${ex.totalMarks || 100}</strong></span>
                 </div>
            </div>
            <!-- Topics -->
            <div class="mb-4">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Key Exam Focus Topics:</span>
              <div class="flex flex-wrap gap-1">
                ${topics.map(t => `<span class="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px]">${t}</span>`).join('')}
              </div>
            </div>
          </div>
          <!-- Bottom Action Buttons -->
          <div class="pt-3 border-t border-slate-100 flex items-center gap-2">
            <button onclick="window.campusTimetable.syncWithPlanner('${ex.id}')"
             class="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-2 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5">
              <i class="fa-solid fa-calendar-plus"></i> Push to Smart Planner
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
  openAddExamModal() {
    const modal = document.getElementById('modal-add-exam');
    if (modal) modal.classList.remove('hidden');
  }
  handleSaveExam() {
    const code = document.getElementById('exam-input-code').value.trim();
    const name = document.getElementById('exam-input-name').value.trim();
    const dept = document.getElementById('exam-input-dept').value;
    const sem = parseInt(document.getElementById('exam-input-sem').value, 10);
    const date = document.getElementById('exam-input-date').value;
    const time = document.getElementById('exam-input-time').value;
    const venue = document.getElementById('exam-input-venue').value.trim();
    const instructor = document.getElementById('exam-input-instructor').value.trim() || 'Faculty Department Staff';
    const diff = document.getElementById('exam-input-diff').value;
    const hours = parseInt(document.getElementById('exam-input-hours').value, 10) || 16;
    const coverage = parseInt(document.getElementById('exam-input-coverage').value, 10) || 75;
     const rawTopics = document.getElementById('exam-input-topics').value.trim();
    const topics = rawTopics ? rawTopics.split(',').map(t => t.trim()) : ['General Syllabus Topics'];
    if (!code || !name || !date || !time || !venue) {
      showToast('Please fill all mandatory exam schedule fields.', 'error');
      return;
    }
    const newExam = {
      id: `EXM-${Date.now()}`,
      courseCode: code,
      courseName: name,
      department: dept,
      semester: sem,
      date: date,
      time: time,
      venue: venue,
      instructor: instructor,
      totalMarks: 100,
        prepDifficulty: diff,
      syllabusCoverage: coverage,
      recommendedHours: hours,
      status: 'Upcoming',
      topics: topics
    };
    this.exams.unshift(newExam);
    this.save();
    this.applyFilters();
    // Add alert notification
    if (window.campusAlerts) {
      window.campusAlerts.addAlert({
        type: 'warning',
        title: `Exam Scheduled: ${code}`,
        message: `${name} scheduled for ${date} at ${venue}. Timetable updated.`,
        actionText: 'View Timetable',
        actionTarget: 'timetable'
      });
    }
  }
  deleteExam(examId) {
    if (!confirm('Are you sure you want to remove this exam schedule?')) return;
    this.exams = this.exams.filter(e => e.id !== examId);
    this.save();
    this.applyFilters();
    showToast('Exam schedule removed.', 'info');
  }
  /**
   * Actionable Bridge: Pushes exam preparation tasks straight into Smart Planner
   */
  syncWithPlanner(examId) {
    const exam = this.exams.find(e => e.id === examId);
    if (!exam) return;
    if (window.campusPlanner) {
      // Calculate a study session due 2 days before the exam
      const examDateObj = new Date(exam.date);
      examDateObj.setDate(examDateObj.getDate() - 2);
      const prepDueDate = examDateObj.toISOString().slice(0, 10);
      window.campusPlanner.addTask({
        id: `TSK-PREP-${Date.now()}`,
        title: `Intensive Revision: ${exam.courseCode} (${exam.courseName})`,
        subject: exam.courseName,
        dueDate: prepDueDate,
        priority: exam.prepDifficulty === 'Hard' ? 'High' : 'Medium',
        completed: false,
        estHours: exam.recommendedHours,
        notes: `Focus on key exam topics: ${(exam.topics || []).join(', ')}. Target: 100% syllabus mastery.`
      });
      showToast(`Created revision task for ${exam.courseCode} in Smart Planner!`, 'success');
      window.switchTab('planner');
    }
  }
  exportICS() {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Campus Pulse AI//Exam Timetable//EN\n";
    this.exams.forEach(ex => {
      const cleanDate = ex.date.replace(/-/g, '');
      icsContent += "BEGIN:VEVENT\n";
      icsContent += `SUMMARY:${ex.courseCode} Exam - ${ex.courseName}\n`;
      icsContent += `DESCRIPTION:Venue: ${ex.venue} | Invigilator: ${ex.instructor}\n`;
      icsContent += `LOCATION:${ex.venue}\n`;
      icsContent += `DTSTART;VALUE=DATE:${cleanDate}\n`;
      icsContent += `DTEND;VALUE=DATE:${cleanDate}\n`;
      icsContent += "STATUS:CONFIRMED\n";
      icsContent += "END:VEVENT\n";
    });
     icsContent += "END:VCALENDAR";
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'campus_pulse_exam_schedule.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported examination schedule to iCalendar (.ics)', 'success');
  }
}
window.addEventListener('DOMContentLoaded', () => {
  window.campusTimetable = new TimetableEngine();
  window.campusTimetable.init();
});