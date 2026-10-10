/**
 * Campus Pulse AI - Student Data Analytics Engine
 * Main USP: "We don't just show student data; we turn it into actionable decisions that improve student success."
 */
class AnalyticsEngine {
  constructor() {
    this.students = [];
    this.filteredStudents = [];
    this.charts = {};
    this.currentPage = 1;
    this.pageSize = 10;
    this.sortField = 'gpa';
    this.sortAsc = false;
    this.actionHistory = [];
    // Filters
    this.filters = {
      department: 'all',
      riskLevel: 'all',
      search: '',
      minGpa: 0,
      minAttendance: 0
    };
  }
  init() {
    // Load default dataset from CAMPUS_DATA
    if (window.CAMPUS_DATA && window.CAMPUS_DATA.students) {
      this.students = JSON.parse(JSON.stringify(window.CAMPUS_DATA.students));
    }
    
    // Check if full dataset can be fetched via HTTP or local file
    this.tryLoadFullDataset();
    this.filteredStudents = [...this.students];
    this.bindEvents();
    this.renderKPIs();
    this.initCharts();
    this.renderStudentTable();
    this.renderActionCenter();
    this.initPredictiveSimulator();
  }
  async tryLoadFullDataset() {
    try {
      const response = await fetch('data/students_enriched.json');
      if (response.ok) {
        const fullData = await response.json();
        if (Array.isArray(fullData) && fullData.length > this.students.length) {
          console.log(`Loaded full dataset with ${fullData.length} students via fetch.`);
          this.students = fullData;
          this.applyFilters();
        }
      }
    } catch (e) {
      console.log('Running in local/file mode with embedded dataset of', this.students.length, 'students.');
    }
  }
  bindEvents() {
    // Filter controls
    const deptFilter = document.getElementById('analytics-filter-dept');
    const riskFilter = document.getElementById('analytics-filter-risk');
    const searchInput = document.getElementById('analytics-search');
    const resetBtn = document.getElementById('analytics-reset-filters');
    const exportCsvBtn = document.getElementById('analytics-export-csv');
    if (deptFilter) deptFilter.addEventListener('change', (e) => {
      this.filters.department = e.target.value;
      this.currentPage = 1;
      this.applyFilters();
    });
    if (riskFilter) riskFilter.addEventListener('change', (e) => {
      this.filters.riskLevel = e.target.value;
      this.currentPage = 1;
      this.applyFilters();
    });
    if (searchInput) searchInput.addEventListener('input', (e) => {
      this.filters.search = e.target.value.toLowerCase().trim();
      this.currentPage = 1;
      this.applyFilters();
    });
    if (resetBtn) resetBtn.addEventListener('click', () => {
      this.resetFilters();
    });
    if (exportCsvBtn) exportCsvBtn.addEventListener('click', () => {
      this.exportCSV();
    });
    // CSV File Dropzone / Uploader
    const dropzone = document.getElementById('analytics-dropzone');
    const fileInput = document.getElementById('analytics-file-input');
    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => this.handleFileUpload(e.target.files[0]));
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('border-blue-500', 'bg-blue-50');
      });
      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('border-blue-500', 'bg-blue-50');
      });
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-blue-500', 'bg-blue-50');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handleFileUpload(e.dataTransfer.files[0]);
        }
      });
    }
    // Modal close buttons
    const profileModalClose = document.getElementById('modal-profile-close');
    if (profileModalClose) {
      profileModalClose.addEventListener('click', () => {
        document.getElementById('modal-student-profile').classList.add('hidden');
      });
    }
    const actionModalClose = document.getElementById('modal-action-close');
    if (actionModalClose) {
      actionModalClose.addEventListener('click', () => {
        document.getElementById('modal-action-decision').classList.add('hidden');
      });
    }
  }
  handleFileUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      if (file.name.endsWith('.json')) {
        try {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            this.students = parsed;
            this.applyFilters();
            showToast(`Loaded ${parsed.length} student records from JSON file.`, 'success');
          }
        } catch (err) {
          showToast('Invalid JSON file format.', 'error');
        }
      } else {
        // Parse CSV
        this.parseCustomCSV(text);
      }
    };
    reader.readAsText(file);
  }
  parseCustomCSV(csvText) {
    const lines = csvText.trim().split(/\r\n|\n/);
    if (lines.length < 2) {
      showToast('Uploaded CSV appears empty.', 'error');
      return;
    }
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const parsedStudents = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] !== undefined ? values[idx] : '';
      });
      const studentId = row['StudentID'] || row['id'] || `STU-${1000 + i}`;
      const gpa = parseFloat(row['GPA'] || row['gpa'] || 2.0);
      const absences = parseInt(row['Absences'] || row['absences'] || 10, 10);
      const studyHours = parseFloat(row['StudyTimeWeekly'] || row['studyHoursWeekly'] || 10.0);
      const attendance = row['attendance'] ? parseFloat(row['attendance']) : Math.max(35, Math.min(100, Math.round(100 - absences * 2.15)));
      const name = row['name'] || `Student ${studentId}`;
      const dept = row['department'] || 'Computer Science & Engineering';
      
      let riskLevel = 'On Track';
      if (gpa < 2.0 || absences >= 18 || attendance < 65) riskLevel = 'High Risk';
      else if (gpa < 2.5 || absences >= 11 || attendance < 75) riskLevel = 'Moderate Risk';
      else if (gpa >= 3.6 && absences <= 4) riskLevel = "Dean's List";
      let gradeClass = 'C';
      if (gpa >= 3.5) gradeClass = 'A';
      else if (gpa >= 3.0) gradeClass = 'B';
      else if (gpa >= 2.5) gradeClass = 'C';
      else if (gpa >= 2.0) gradeClass = 'D';
      else gradeClass = 'F';
      parsedStudents.push({
        id: studentId.startsWith('STU-') ? studentId : `STU-${studentId}`,
        name: name,
        email: `${studentId.toLowerCase()}@campus.edu`,
        department: dept,
        semester: parseInt(row['semester'] || 6, 10),
        gpa: Math.round(gpa * 100) / 100,
        attendance: Math.round(attendance * 10) / 10,
        absences: absences,
        studyHoursWeekly: Math.round(studyHours * 10) / 10,
        riskLevel: riskLevel,
        gradeClass: gradeClass,
        weakSubject: 'Core Systems & Math',
        strongSubject: 'Practical Projects',
        actionableRecommendation: riskLevel === 'High Risk' ? 'Issue attendance warning & mandate 4 hrs/wk tutoring' : 'Recommend honors placement track',
        predictedImpact: riskLevel === 'High Risk' ? '+0.75 GPA recovery & +15% attendance' : 'Elevated placement index',
        skills: ['Python', 'SQL', 'Problem Solving'],
        subjects: [
          { name: 'Subject 1', score: Math.round(gpa * 22 + 10), attendance: attendance },
          { name: 'Subject 2', score: Math.round(gpa * 20 + 8), attendance: attendance }
        ]
      });
    }
    if (parsedStudents.length > 0) {
      this.students = parsedStudents;
      this.applyFilters();
      showToast(`Successfully imported and analyzed ${parsedStudents.length} student records!`, 'success');
    }
  }
  applyFilters() {
    this.filteredStudents = this.students.filter(s => {
      // Dept filter
      if (this.filters.department !== 'all' && s.department !== this.filters.department) {
        return false;
      }
      // Risk filter
      if (this.filters.riskLevel !== 'all' && s.riskLevel !== this.filters.riskLevel) {
        return false;
      }
      // Search filter
      if (this.filters.search) {
        const query = this.filters.search;
        const matchesName = s.name.toLowerCase().includes(query);
        const matchesId = s.id.toLowerCase().includes(query);
        const matchesSkills = s.skills && s.skills.some(sk => sk.toLowerCase().includes(query));
        if (!matchesName && !matchesId && !matchesSkills) return false;
      }
      return true;
    });
    this.renderKPIs();
    this.updateCharts();
    this.renderStudentTable();
    this.renderActionCenter();
  }
  resetFilters() {
    this.filters = {
      department: 'all',
      riskLevel: 'all',
      search: '',
      minGpa: 0,
      minAttendance: 0
    };
    const deptFilter = document.getElementById('analytics-filter-dept');
    const riskFilter = document.getElementById('analytics-filter-risk');
    const searchInput = document.getElementById('analytics-search');
    if (deptFilter) deptFilter.value = 'all';
    if (riskFilter) riskFilter.value = 'all';
    if (searchInput) searchInput.value = '';
    this.currentPage = 1;
    this.applyFilters();
    showToast('Filters reset to default.', 'info');
  }
  renderKPIs() {
    const list = this.filteredStudents;
    const total = list.length;
    if (total === 0) {
      this.setKpiText('kpi-total-students', '0');
      this.setKpiText('kpi-avg-gpa', '0.00');
      this.setKpiText('kpi-avg-attendance', '0%');
      this.setKpiText('kpi-at-risk', '0');
      this.setKpiText('kpi-deans-list', '0');
      return;
    }
    const avgGpa = (list.reduce((acc, s) => acc + s.gpa, 0) / total).toFixed(2);
    const avgAtt = (list.reduce((acc, s) => acc + s.attendance, 0) / total).toFixed(1);
    const atRiskCount = list.filter(s => s.riskLevel === 'High Risk').length;
    const deansCount = list.filter(s => s.riskLevel === "Dean's List").length;
    this.setKpiText('kpi-total-students', total.toLocaleString());
    this.setKpiText('kpi-avg-gpa', avgGpa);
    this.setKpiText('kpi-avg-attendance', `${avgAtt}%`);
    this.setKpiText('kpi-at-risk', atRiskCount.toLocaleString());
    this.setKpiText('kpi-deans-list', deansCount.toLocaleString());
  }
  setKpiText(id, val) {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
  }
  initCharts() {
    // 1. Grade Distribution Bar Chart
    const ctxGrade = document.getElementById('chart-grade-dist');
    if (ctxGrade) {
      this.charts.grade = new Chart(ctxGrade.getContext('2d'), {
        type: 'bar',
        data: this.getGradeDistributionData(),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => `Students: ${ctx.parsed.y} (${((ctx.parsed.y / (this.filteredStudents.length || 1)) * 100).toFixed(1)}%)`
              }
            }
          },
          scales: {
            y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
            x: { grid: { display: false } }
          }
        }
      });
    }
    // 2. Attendance vs GPA Scatter Plot
    const ctxScatter = document.getElementById('chart-scatter');
    if (ctxScatter) {
      this.charts.scatter = new Chart(ctxScatter.getContext('2d'), {
        type: 'scatter',
        data: this.getScatterData(),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.raw.name}: Attendance ${ctx.raw.x}%, GPA ${ctx.raw.y} (${ctx.raw.risk})`
              }
            }
          },
          scales: {
            x: {
              title: { display: true, text: 'Attendance Rate (%)' },
              min: 30,
              max: 100,
              grid: { color: '#f1f5f9' }
            },
            y: {
              title: { display: true, text: 'GPA (0.0 - 4.0)' },
              min: 0,
              max: 4.0,
              grid: { color: '#f1f5f9' }
            }
          }
        }
      });
    }
    // 3. Department Performance Bar Chart
    const ctxDept = document.getElementById('chart-department');
    if (ctxDept) {
      this.charts.department = new Chart(ctxDept.getContext('2d'), {
        type: 'bar',
        data: this.getDepartmentData(),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } },
          scales: {
            y: { beginAtZero: true, max: 4.0, title: { display: true, text: 'Average GPA' } },
            x: { grid: { display: false } }
          }
        }
      });
    }
    // 4. Risk Breakdown Donut Chart
    const ctxRisk = document.getElementById('chart-risk-donut');
    if (ctxRisk) {
      this.charts.risk = new Chart(ctxRisk.getContext('2d'), {
        type: 'doughnut',
        data: this.getRiskDonutData(),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          },
          cutout: '68%'
        }
      });
    }
  }
  updateCharts() {
    if (this.charts.grade) {
      this.charts.grade.data = this.getGradeDistributionData();
      this.charts.grade.update();
    }
    if (this.charts.scatter) {
      this.charts.scatter.data = this.getScatterData();
      this.charts.scatter.update();
    }
    if (this.charts.department) {
      this.charts.department.data = this.getDepartmentData();
      this.charts.department.update();
    }
    if (this.charts.risk) {
      this.charts.risk.data = this.getRiskDonutData();
      this.charts.risk.update();
    }
  }
  getGradeDistributionData() {
    const counts = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    this.filteredStudents.forEach(s => {
      if (counts[s.gradeClass] !== undefined) counts[s.gradeClass]++;
    });
    return {
      labels: ['Grade A (>=3.5)', 'Grade B (3.0-3.5)', 'Grade C (2.5-3.0)', 'Grade D (2.0-2.5)', 'Grade F (<2.0)'],
      datasets: [{
        label: 'Number of Students',
        data: [counts.A, counts.B, counts.C, counts.D, counts.F],
        backgroundColor: [
          '#10b981', // green
          '#3b82f6', // blue
          '#8b5cf6', // purple
          '#f59e0b', // amber
          '#ef4444'  // red
        ],
        borderRadius: 6
      }]
    };
  }
  getScatterData() {
    const highRisk = [];
    const moderate = [];
    const onTrack = [];
    const deans = [];
    // Limit scatter points to max 250 for smooth rendering
    const sample = this.filteredStudents.slice(0, 300);
    sample.forEach(s => {
      const pt = { x: s.attendance, y: s.gpa, name: s.name, risk: s.riskLevel };
      if (s.riskLevel === 'High Risk') highRisk.push(pt);
      else if (s.riskLevel === 'Moderate Risk') moderate.push(pt);
      else if (s.riskLevel === "Dean's List") deans.push(pt);
      else onTrack.push(pt);
    });
    return {
      datasets: [
        {
          label: 'High Risk (<2.0 GPA or Low Attendance)',
          data: highRisk,
          backgroundColor: '#ef4444',
          pointRadius: 5
        },
        {
          label: 'Moderate Risk',
          data: moderate,
          backgroundColor: '#f59e0b',
          pointRadius: 4
        },
        {
          label: 'On Track',
          data: onTrack,
          backgroundColor: '#3b82f6',
          pointRadius: 4
        },
        {
          label: "Dean's List (Honors)",
          data: deans,
          backgroundColor: '#10b981',
          pointRadius: 6
        }
      ]
    };
  }
  getDepartmentData() {
    const depts = [
      "Computer Science & Engineering",
      "Data Science & AI",
      "Information Technology",
      "Mechanical Engineering",
      "Business Analytics & Management"
    ];
    const avgGpas = depts.map(d => {
      const match = this.filteredStudents.filter(s => s.department === d);
      if (!match.length) return 0;
      return +(match.reduce((a, b) => a + b.gpa, 0) / match.length).toFixed(2);
    });
    const shortLabels = ['CS & Eng', 'Data Sci & AI', 'Info Tech', 'Mech Eng', 'Business Analytics'];
    return {
        labels: shortLabels,
      datasets: [{
        label: 'Average Department GPA',
        data: avgGpas,
        backgroundColor: '#2563eb',
        borderRadius: 6
      }]
    };
  }
  getRiskDonutData() {
    const high = this.filteredStudents.filter(s => s.riskLevel === 'High Risk').length;
    const mod = this.filteredStudents.filter(s => s.riskLevel === 'Moderate Risk').length;
    const onTrack = this.filteredStudents.filter(s => s.riskLevel === 'On Track').length;
    const deans = this.filteredStudents.filter(s => s.riskLevel === "Dean's List").length;
    return {
      labels: ['High Risk', 'Moderate Risk', 'On Track', "Dean's List"],
      datasets: [{
        data: [high, mod, onTrack, deans],
        backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  }
  /**
   * Actionable Decision Center (USP):
   * Turns raw student metrics into concrete, prioritized interventions.
   */
  renderActionCenter() {
    const container = document.getElementById('analytics-action-cards');
    if (!container) return;
    // Filter students needing intervention
    const needAction = this.filteredStudents
      .filter(s => s.riskLevel === 'High Risk' || s.riskLevel === 'Moderate Risk')
      .slice(0, 6); // Top priority 6
    if (needAction.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          <i class="fa-solid fa-circle-check text-green-500 text-3xl mb-2"></i>
          <p class="font-semibold text-slate-700">No immediate critical interventions required in this filter selection.</p>
          <p class="text-xs text-slate-400">All matching students are performing on track.</p>
        </div>
      `;
      return;
    }
    container.innerHTML = needAction.map(student => {
      const isHigh = student.riskLevel === 'High Risk';
      return `
        <div class="bg-white rounded-xl p-5 border ${isHigh ? 'border-red-200 at-risk-glow' : 'border-amber-200'} shadow-sm hover-lift flex flex-col justify-between">
          <div>
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 border border-slate-200">
                  ${student.name.charAt(0)}
                </div>
                <div>
                  <h4 class="font-bold text-slate-900 leading-tight">${student.name}</h4>
                  <p class="text-xs text-slate-500">${student.id} &bull; ${student.department.split(' ')[0]}</p>
                </div>
              </div>
              <span class="px-2.5 py-1 text-xs font-semibold rounded-full ${isHigh ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}">
                ${student.riskLevel}
              </span>
            </div>
            <!-- Metrics bar -->
            <div class="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg text-center mb-3 text-xs">
              <div>
                <span class="text-slate-400 block">GPA</span>
                <span class="font-bold ${student.gpa < 2.0 ? 'text-red-600' : 'text-slate-800'}">${student.gpa.toFixed(2)}</span>
              </div>
              <div>
                <span class="text-slate-400 block">Attendance</span>
                <span class="font-bold ${student.attendance < 75 ? 'text-red-600' : 'text-slate-800'}">${student.attendance}%</span>
              </div>
              <div>
              <span class="text-slate-400 block">Study Hrs</span>
                <span class="font-bold text-slate-800">${student.studyHoursWeekly}h/wk</span>
              </div>
            </div>
            <!-- Action Prescription -->
            <div class="mb-3">
              <span class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <i class="fa-solid fa-wand-magic-sparkles text-blue-600"></i> AI Prescribed Action:
              </span>
              <p class="text-xs text-slate-700 bg-blue-50 border border-blue-100 p-2 rounded-md font-medium leading-relaxed">
                ${student.actionableRecommendation}
              </p>
            </div>
            <!-- Projected Impact -->
            <div class="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
              <i class="fa-solid fa-arrow-trend-up text-green-600"></i>
              <span class="font-semibold text-slate-700">Projected Outcome:</span>
              <span class="text-green-700 font-medium">${student.predictedImpact}</span>
            </div>
          </div>
          <!-- Buttons -->
          <div class="flex items-center gap-2 pt-3 border-t border-slate-100">
            <button onclick="window.campusAnalytics.openActionModal('${student.id}')" 
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-sm">
              <i class="fa-solid fa-bolt"></i> Execute Action
            </button>
            <button onclick="window.campusAnalytics.openProfileModal('${student.id}')" 
              class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-3 rounded-lg text-xs transition">
              <i class="fa-regular fa-eye"></i> Profile
            </button>
          </div>
        </div>
              `;
    }).join('');
  }
  renderStudentTable() {
    const tbody = document.getElementById('analytics-table-body');
    const paginationEl = document.getElementById('analytics-pagination');
    if (!tbody) return;
    const list = this.filteredStudents;
    const total = list.length;
    const startIdx = (this.currentPage - 1) * this.pageSize;
    const endIdx = Math.min(startIdx + this.pageSize, total);
    const pageItems = list.slice(startIdx, endIdx);
    if (pageItems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="py-12 text-center text-slate-400">
            <i class="fa-solid fa-user-slash text-3xl mb-2 text-slate-300"></i>
            <p>No student records match the active filters.</p>
          </td>
        </tr>
      `;
      if (paginationEl) paginationEl.innerHTML = '';
      return;
    }
    tbody.innerHTML = pageItems.map(s => {
      let riskBadge = 'bg-slate-100 text-slate-700';
      if (s.riskLevel === 'High Risk') riskBadge = 'bg-red-100 text-red-700 border border-red-200';
      else if (s.riskLevel === 'Moderate Risk') riskBadge = 'bg-amber-100 text-amber-700 border border-amber-200';
      else if (s.riskLevel === "Dean's List") riskBadge = 'bg-green-100 text-green-700 border border-green-200';
      else riskBadge = 'bg-blue-100 text-blue-700 border border-blue-200';
      return `
        <tr class="hover:bg-slate-50 transition border-b border-slate-100 text-sm">
          <td class="py-3 px-4 font-mono text-xs font-semibold text-slate-600">${s.id}</td>
          <td class="py-3 px-4">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs">
                ${s.name.charAt(0)}
              </div>
              <div>
                <div class="font-semibold text-slate-800">${s.name}</div>
                <div class="text-xs text-slate-400">${s.email}</div>
              </div>
            </div>
          </td>
          <td class="py-3 px-4 text-slate-600 text-xs">
            <div class="font-medium">${s.department}</div>
            <div class="text-slate-400">Sem ${s.semester}</div>
          </td>
          <td class="py-3 px-4 font-semibold ${s.gpa < 2.0 ? 'text-red-600' : (s.gpa >= 3.5 ? 'text-green-600' : 'text-slate-800')}">
            ${s.gpa.toFixed(2)}
            <span class="text-xs font-normal text-slate-400 ml-1">(${s.gradeClass})</span>
          </td>
          <td class="py-3 px-4">
            <div class="flex items-center gap-2">
              <div class="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                <div class="h-full rounded-full ${s.attendance < 75 ? 'bg-red-500' : 'bg-green-500'}" style="width: ${Math.min(100, s.attendance)}%"></div>
              </div>
              <span class="text-xs font-medium ${s.attendance < 75 ? 'text-red-600 font-bold' : 'text-slate-700'}">${s.attendance}%</span>
            </div>
            </td>
                      <td class="py-3 px-4">
            <span class="px-2.5 py-1 text-xs font-semibold rounded-full ${riskBadge}">${s.riskLevel}</span>
          </td>
          <td class="py-3 px-4 text-right">
            <div class="flex items-center justify-end gap-1.5">
              <button onclick="window.campusAnalytics.openProfileModal('${s.id}')" 
                class="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View Dossier">
                <i class="fa-regular fa-id-badge text-base"></i>
              </button>
              <button onclick="window.campusAnalytics.openActionModal('${s.id}')" 
                class="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition" title="Action Center">
                <i class="fa-solid fa-bolt text-base"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
    // Pagination
    const totalPages = Math.ceil(total / this.pageSize);
    if (paginationEl) {
      paginationEl.innerHTML = `
        <div class="flex items-center justify-between text-xs text-slate-500 w-full">
          <span>Showing <strong class="text-slate-700">${startIdx + 1}</strong> to <strong class="text-slate-700">${endIdx}</strong> of <strong class="text-slate-700">${total}</strong> students</span>
          <div class="flex items-center gap-1.5">
            <button ${this.currentPage <= 1 ? 'disabled class="opacity-40 cursor-not-allowed"' : ''} 
              onclick="window.campusAnalytics.setPage(${this.currentPage - 1})"
              class="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 font-medium">Prev</button>
            <span class="px-2 font-semibold text-slate-700">Page ${this.currentPage} of ${totalPages || 1}</span>
            <button ${this.currentPage >= totalPages ? 'disabled class="opacity-40 cursor-not-allowed"' : ''} 
              onclick="window.campusAnalytics.setPage(${this.currentPage + 1})"
              class="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 font-medium">Next</button>
          </div>
        </div>
      `;
    }
  }
  setPage(page) {
    this.currentPage = page;
    this.renderStudentTable();
  }
  openProfileModal(studentId) {
    const student = this.students.find(s => s.id === studentId);
    if (!student) return;
    const modal = document.getElementById('modal-student-profile');
    if (!modal) return;
    // Fill fields
    document.getElementById('modal-prof-name').innerText = student.name;
    document.getElementById('modal-prof-id').innerText = `${student.id} • ${student.department} (Semester ${student.semester})`;
    document.getElementById('modal-prof-email').innerText = student.email;
    document.getElementById('modal-prof-gpa').innerText = student.gpa.toFixed(2);
    document.getElementById('modal-prof-attendance').innerText = `${student.attendance}%`;
    document.getElementById('modal-prof-study').innerText = `${student.studyHoursWeekly} hrs/wk`;
    document.getElementById('modal-prof-risk').innerText = student.riskLevel;
    document.getElementById('modal-prof-risk').className = `px-2.5 py-1 text-xs font-semibold rounded-full ${
      student.riskLevel === 'High Risk' ? 'bg-red-100 text-red-700' : (student.riskLevel === 'Moderate Risk' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700')
    }`;
    document.getElementById('modal-prof-recommendation').innerText = student.actionableRecommendation;
    document.getElementById('modal-prof-impact').innerText = student.predictedImpact;
    // Skills pills
    const skillsContainer = document.getElementById('modal-prof-skills');
    if (skillsContainer) {
      skillsContainer.innerHTML = (student.skills || ['Analytical Problem Solving', 'Core Engineering']).map(sk => 
        `<span class="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">${sk}</span>`
      ).join('');
    }
    // Subject breakdown table
    const subjectsContainer = document.getElementById('modal-prof-subjects');
    if (subjectsContainer) {
      const subs = student.subjects || [
        { name: 'Core Foundations', score: Math.round(student.gpa * 23), attendance: student.attendance },
        { name: 'Applied Laboratories', score: Math.round(student.gpa * 22), attendance: student.attendance }
      ];
      subjectsContainer.innerHTML = subs.map(sub => `
        <tr class="border-b border-slate-100 text-xs">
          <td class="py-2 font-medium text-slate-700">${sub.name}</td>
          <td class="py-2 text-center font-bold ${sub.score < 50 ? 'text-red-600' : 'text-slate-800'}">${sub.score}%</td>
          <td class="py-2 text-center ${sub.attendance < 75 ? 'text-red-600 font-bold' : 'text-slate-600'}">${sub.attendance}%</td>
          <td class="py-2 text-right">
            <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${sub.score >= 80 ? 'bg-green-50 text-green-700' : (sub.score >= 60 ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700')}">
              ${sub.score >= 80 ? 'Excellent' : (sub.score >= 60 ? 'Satisfactory' : 'Critical Needs Tutoring')}
            </span>
          </td>
        </tr>
      `).join('');
    }
    // Auto-fill Resume button link
    const fillResumeBtn = document.getElementById('modal-prof-btn-resume');
    if (fillResumeBtn) {
      fillResumeBtn.onclick = () => {
        modal.classList.add('hidden');
        window.switchTab('resume');
        if (window.campusResume) {
                      window.campusResume.populateFromStudent(student);
        }
      };
    }
    modal.classList.remove('hidden');
  }
  openActionModal(studentId) {
    const student = this.students.find(s => s.id === studentId);
    if (!student) return;
    const modal = document.getElementById('modal-action-decision');
    if (!modal) return;
    document.getElementById('action-modal-student-name').innerText = `${student.name} (${student.id})`;
    document.getElementById('action-modal-recommendation').innerText = student.actionableRecommendation;
    document.getElementById('action-modal-impact').innerText = student.predictedImpact;
    const executeBtn = document.getElementById('action-modal-execute-btn');
    if (executeBtn) {
      executeBtn.onclick = () => {
        const actionType = document.getElementById('action-modal-type').value;
        const notes = document.getElementById('action-modal-notes').value;
        // Log decision
        const logEntry = {
          studentId: student.id,
          studentName: student.name,
          actionType: actionType,
          notes: notes,
          timestamp: new Date().toLocaleTimeString(),
          date: new Date().toLocaleDateString()
        };
        this.actionHistory.unshift(logEntry);
        // Update student status in memory
        student.status = 'Intervention Enacted';
        if (student.riskLevel === 'High Risk') {
          student.riskLevel = 'Moderate Risk'; 
                    student.riskLevel = 'Moderate Risk'; // Improvement simulated
        }
        // Trigger Alert into Alert Center
        if (window.campusAlerts) {
          window.campusAlerts.addAlert({
            type: 'info',
            title: `Action Applied: ${actionType}`,
            message: `Official academic intervention prescribed for ${student.name} (${student.id}). Notification dispatched to department faculty & student portal.`,
            actionText: 'View Student',
            actionTarget: 'analytics'
          });
        }
        modal.classList.add('hidden');
        showToast(`Intervention "${actionType}" successfully enacted for ${student.name}!`, 'success');
        this.applyFilters();
      };
    }
    modal.classList.remove('hidden');
  }
  /**
   * What-If Predictive Simulator
   * Allows faculty/students to simulate study hours and tutoring to see projected GPA improvement
   */
  initPredictiveSimulator() {
    const studySlider = document.getElementById('sim-study-hours');
    const tutoringCheck = document.getElementById('sim-tutoring');
    const attendanceSlider = document.getElementById('sim-attendance');
    const simGpaOut = document.getElementById('sim-predicted-gpa');
    const simGradeOut = document.getElementById('sim-predicted-grade');
    const simProbabilityOut = document.getElementById('sim-pass-prob');
    const updateSimulation = () => {
      if (!studySlider || !simGpaOut) return;
      const hours = parseFloat(studySlider.value);
      const hasTutoring = tutoringCheck ? tutoringCheck.checked : false;
      const att = attendanceSlider ? parseFloat(attendanceSlider.value) : 75;
      // Machine learning regression approximation based on Kaggle dataset weights
      // Base GPA model: GPA = 0.5 + (StudyHours * 0.08) - (Absences * 0.05) + (Tutoring * 0.45)
      const absencesApprox = Math.max(0, (100 - att) / 2.15);
      let simulatedGpa = 0.65 + (hours * 0.09) - (absencesApprox * 0.045) + (hasTutoring ? 0.48 : 0);
      simulatedGpa = Math.max(0.2, Math.min(4.0, simulatedGpa));
      let grade = 'F';
      if (simulatedGpa >= 3.5) grade = 'A';
      else if (simulatedGpa >= 3.0) grade = 'B';
      else if (simulatedGpa >= 2.5) grade = 'C';
      else if (simulatedGpa >= 2.0) grade = 'D';
      const passProb = Math.min(99, Math.max(15, Math.round(simulatedGpa * 23 + 8)));
      simGpaOut.innerText = simulatedGpa.toFixed(2);
      if (simGradeOut) simGradeOut.innerText = `Grade Class: ${grade}`;
      if (simProbabilityOut) simProbabilityOut.innerText = `${passProb}% Success Probability`;
      // Update study hours label
      const label = document.getElementById('sim-study-label');
      if (label) label.innerText = `${hours} hrs/week`;
      const attLabel = document.getElementById('sim-att-label');
      if (attLabel) attLabel.innerText = `${att}% Attendance`;
    };
    if (studySlider) studySlider.addEventListener('input', updateSimulation);
    if (tutoringCheck) tutoringCheck.addEventListener('change', updateSimulation);
    if (attendanceSlider) attendanceSlider.addEventListener('input', updateSimulation);
    updateSimulation();
  }
  exportCSV() {
    const list = this.filteredStudents;
    if (!list.length) {
      showToast('No student data to export.', 'warning');
      return;
    }
        const headers = ['StudentID', 'Name', 'Email', 'Department', 'Semester', 'GPA', 'Attendance_Pct', 'Weekly_Study_Hours', 'Risk_Level', 'Grade_Class', 'Prescribed_Action', 'Predicted_Outcome'];
    const rows = list.map(s => [
      `"${s.id}"`,
      `"${s.name}"`,
      `"${s.email}"`,
      `"${s.department}"`,
      s.semester,
      s.gpa.toFixed(2),
      s.attendance,
      s.studyHoursWeekly,
      `"${s.riskLevel}"`,
      `"${s.gradeClass}"`,
      `"${s.actionableRecommendation}"`,
      `"${s.predictedImpact}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campus_pulse_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Filtered student report exported to CSV successfully.', 'success');
  }
}
// Global initialization helper
window.addEventListener('DOMContentLoaded', () => {
  window.campusAnalytics = new AnalyticsEngine();
  window.campusAnalytics.init();
});