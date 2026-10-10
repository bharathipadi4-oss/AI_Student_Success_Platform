/**
 * Campus Pulse AI - AI Resume Builder
 * Generates professional resumes from student profiles, offers real-time preview,
 * provides 4 executive themes, and features an AI Bullet Point Enhancer (STAR method).
 */
class ResumeBuilderEngine {
  constructor() {
    this.currentTheme = 'modern';
    this.resumeData = {
      fullName: 'Aarav Sharma',
      email: 'aarav.s@campus.edu',
      phone: '+1 (555) 349-2810',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/aarav-sharma-tech',
      github: 'github.com/aaravsharma',
      website: 'aaravsharma.dev',
      summary: 'High-performing Computer Science undergraduate with proven expertise in algorithmic problem solving, distributed systems, and full-stack engineering. Strong background in scalable system architecture and cloud computing, with dean\'s honors recognition.',
      education: {
        degree: 'Bachelor of Technology in Computer Science & Engineering',
        institution: 'Institute of Advanced Technology & Engineering',
        location: 'Campus Academic Block',
        year: '2023 - 2027 (Expected)',
        gpa: '3.85 / 4.00'
      },
      skills: {
        languages: 'C++, Python, TypeScript, Java, SQL',
        frameworks: 'React, Node.js, Express, Fastify, PyTorch, Tailwind CSS',
        tools: 'Docker, Git, Linux, AWS (S3, EC2), PostgreSQL, Redis',
        concepts: 'Data Structures & Algorithms, Distributed Systems, REST APIs, CI/CD'
      },
      projects: [
        {
          title: 'Campus Pulse AI - Student Success & Analytics Platform',
          tech: 'JavaScript, Chart.js, Tailwind CSS, Machine Learning Models',
          bullets: [
            'Architected full-stack academic intervention portal analyzing 2,300+ student trajectories to forecast at-risk milestones with 91% accuracy.',
            'Engineered automated prescription engine that formulates personalized tutoring workflows and study blocks, projected to lift average GPA by 0.65 points.',
            'Optimized data pipeline with client-side indexing and caching, reducing query latency under 15ms.'
          ]
        },
        {
          title: 'Distributed In-Memory Key-Value Store',
          tech: 'Go, Raft Consensus, gRPC, Docker',
          bullets: [
            'Implemented fault-tolerant distributed storage cluster using Raft consensus protocol capable of handling network partitions seamlessly.',
            'Benchmarked sustained throughput reaching 45,000 requests/sec with sub-5ms p99 read latency under load testing.'
          ]
        }
      ],
      experience: [
        {
          role: 'Software Engineering Intern',
          company: 'CloudScale Technologies',
          location: 'Remote',
          duration: 'Jun 2025 - Aug 2025',
          bullets: [
            'Developed REST microservices in Go and Python processing 1.2M daily telemetric events for cloud infrastructure monitoring.',
            'Automated CI/CD deployment pipelines using GitHub Actions, reducing release cycle time by 35% across four development squads.'
          ]
        }
      ],
      certifications: [
        'Dean\'s Honors List for Academic Excellence (Consecutive 3 Semesters)',
        'AWS Certified Cloud Practitioner',
        'Top 5% Finalist - National Inter-Collegiate Algorithmic Hackathon'
      ]
    };
    // AI Enhancer Presets
    this.enhancerPatterns = {
      default: [
        "Spearheaded end-to-end development of {topic}, elevating workflow efficiency by 34% and accelerating release turnaround.",
        "Architected scalable system integrating {topic}, optimizing latency by 45% while handling thousands of active requests.",
        "Formulated data-driven strategy for {topic}, increasing test coverage from 68% to 94% across production pipelines."
      ]
    };
  }
  init() {
    this.populateStudentDropdown();
    this.bindEvents();
    this.loadFormFromData();
    this.renderResumePreview();
  }
  populateStudentDropdown() {
    const select = 
    document.getElementById('resume-select-student');
    if (!select) return;
    const students = window.CAMPUS_DATA ? window.CAMPUS_DATA.students : [];
    select.innerHTML = '<option value="">-- Choose a Student Profile to Auto-Fill --</option>' + 
      students.slice(0, 40).map(s => `
        <option value="${s.id}">${s.name} (${s.id}) &bull; ${s.department.split(' ')[0]} (GPA: ${s.gpa.toFixed(2)})</option>
      `).join('');
  }
  bindEvents() {
    // Student Auto-Fill Dropdown
    const select = document.getElementById('resume-select-student');
    if (select) {
      select.addEventListener('change', (e) => {
        const id = e.target.value;
        if (!id) return;
        const student = (window.CAMPUS_DATA.students || []).find(s => s.id === id);
        if (student) this.populateFromStudent(student);
      });
    }
    // Theme selector buttons
    const themeBtns = document.querySelectorAll('.resume-theme-btn');
    themeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        themeBtns.forEach(b => b.classList.remove('border-blue-600', 'bg-blue-50'));
        e.currentTarget.classList.add('border-blue-600', 'bg-blue-50');
        this.currentTheme = e.currentTarget.dataset.theme;
        this.renderResumePreview();
      });
    });
    // Form inputs auto-update
    const inputs = document.querySelectorAll('#resume-form input, #resume-form textarea');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        this.readDataFromForm();
        this.renderResumePreview();
      });
    });
    // Print / PDF button
    const printBtn = document.getElementById('resume-btn-print');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }
    // AI Enhancer Trigger
    const enhanceBtn = document.getElementById('resume-btn-ai-enhance');
    if (enhanceBtn) {
      enhanceBtn.addEventListener('click', () => {
        this.enhanceBulletPoint();
      });
    }
  }
  populateFromStudent(student) {
    this.resumeData.fullName = student.name;
    this.resumeData.email = student.email;
    this.resumeData.phone = '+1 (555) 782-' + Math.floor(1000 + Math.random() * 9000);
    this.resumeData.education.degree = `Bachelor of Technology in ${student.department}`;
    this.resumeData.education.gpa = `${student.gpa.toFixed(2)} / 4.00 (${student.riskLevel === "Dean's List" ? "Dean's Honors" : "Good Standing"})`;
    const skills = student.skills || ['Python', 'SQL', 'Data Analysis', 'Problem Solving'];
    this.resumeData.skills.languages = skills.slice(0, 3).join(', ');
    this.resumeData.skills.tools = skills.slice(2).join(', ') + ', Git, Docker';
    this.resumeData.summary = `Motivated ${student.department} student with demonstrated focus in ${student.strongSubject || 'engineering solutions'} and academic GPA of ${student.gpa.toFixed(2)}. Passionate about solving complex industry problems and building resilient software products.`;
    this.loadFormFromData();
    this.renderResumePreview();
    showToast(`Auto-filled resume profile for ${student.name}!`, 'success');
  }
  loadFormFromData() {
    this.setVal('resume-input-name', this.resumeData.fullName);
    this.setVal('resume-input-email', this.resumeData.email);
    this.setVal('resume-input-phone', this.resumeData.phone);
    this.setVal('resume-input-location', this.resumeData.location);
    this.setVal('resume-input-linkedin', this.resumeData.linkedin);
    this.setVal('resume-input-github', this.resumeData.github);
    this.setVal('resume-input-summary', this.resumeData.summary);
    this.setVal('resume-input-degree', this.resumeData.education.degree);
    this.setVal('resume-input-institution', this.resumeData.education.institution);
    this.setVal('resume-input-year', this.resumeData.education.year);
    this.setVal('resume-input-gpa', this.resumeData.education.gpa);
    this.setVal('resume-input-skills-lang', this.resumeData.skills.languages);
    this.setVal('resume-input-skills-tools', this.resumeData.skills.tools);
    this.setVal('resume-input-skills-concepts', this.resumeData.skills.concepts);
    // Load first project
    if (this.resumeData.projects[0]) {
      this.setVal('resume-input-proj-title', this.resumeData.projects[0].title);
      this.setVal('resume-input-proj-tech', this.resumeData.projects[0].tech);
      this.setVal('resume-input-proj-bullets', this.resumeData.projects[0].bullets.join('\n'));
    }
    // Load experience
    if (this.resumeData.experience[0]) {
      this.setVal('resume-input-exp-role', this.resumeData.experience[0].role);
      this.setVal('resume-input-exp-company', this.resumeData.experience[0].company);
      this.setVal('resume-input-exp-duration', this.resumeData.experience[0].duration);
      this.setVal('resume-input-exp-bullets', this.resumeData.experience[0].bullets.join('\n'));
    }
  }
  readDataFromForm() {
    this.resumeData.fullName = this.getVal('resume-input-name') || 'Student Name';
    this.resumeData.email = this.getVal('resume-input-email') || 'student@campus.edu';
    this.resumeData.phone = this.getVal('resume-input-phone') || '';
    this.resumeData.location = this.getVal('resume-input-location') || '';
    this.resumeData.linkedin = this.getVal('resume-input-linkedin') || '';
    this.resumeData.github = this.getVal('resume-input-github') || '';
    this.resumeData.summary = this.getVal('resume-input-summary') || '';
    this.resumeData.education.degree = this.getVal('resume-input-degree') || '';
    this.resumeData.education.institution = this.getVal('resume-input-institution') || '';
    this.resumeData.education.year = this.getVal('resume-input-year') || '';
    this.resumeData.education.gpa = this.getVal('resume-input-gpa') || '';
    this.resumeData.skills.languages = this.getVal('resume-input-skills-lang') || '';
    this.resumeData.skills.tools = this.getVal('resume-input-skills-tools') || '';
    this.resumeData.skills.concepts = this.getVal('resume-input-skills-concepts') || '';
    // Project
    const projBullets = (this.getVal('resume-input-proj-bullets') || '').split('\n').filter(b => b.trim());
    this.resumeData.projects[0] = {
      title: this.getVal('resume-input-proj-title') || 'Key Technical Project',
      tech: this.getVal('resume-input-proj-tech') || 'Python, Git',
      bullets: projBullets.length ? projBullets : ['Engineered end-to-end software module delivering measurable impact.']
    };
    // Experience
    const expBullets = (this.getVal('resume-input-exp-bullets') || '').split('\n').filter(b => b.trim());
    this.resumeData.experience[0] = {
      role: this.getVal('resume-input-exp-role') || 'Engineering Intern',
      company: this.getVal('resume-input-exp-company') || 'Tech Solutions Inc',
      duration: this.getVal('resume-input-exp-duration') || 'Summer 2025',
      location: 'Remote',
      bullets: expBullets.length ? expBullets : ['Collaborated with cross-functional engineering teams to deliver features.']
    };
}
setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  }
  getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }
  /**
   * Actionable AI Feature:
   * Enhances draft bullet points with STAR formula (Situation, Task, Action, Result)
   */
  enhanceBulletPoint() {
    const inputEl = document.getElementById('resume-ai-draft-bullet');
    const outputContainer = document.getElementById('resume-ai-enhanced-results');
    if (!inputEl || !outputContainer) return;
    const draft = inputEl.value.trim();
    if (!draft) {
      showToast('Please enter a draft bullet point to enhance.', 'warning');
      return;
    }
    // Generate 3 polished STAR variations
    const keywords = draft.toLowerCase().split(' ').filter(w => w.length > 3);
    const primaryTopic = keywords.length ? keywords.slice(0, 2).join(' ') : 'core technical workflow';
    const variations = [
      `Architected and deployed high-performance solution for ${primaryTopic}, reducing system bottlenecks by 42% and enhancing data reliability.`,
      `Engineered end-to-end automated module addressing ${primaryTopic}, cutting manual processing time from 4 hours to under 8 minutes across 500+ users.`,
      `Formulated robust algorithmic design for ${primaryTopic}, improving computational execution efficiency by 38% and ensuring 99.8% test coverage.`
    ];
        outputContainer.innerHTML = variations.map((v, i) => `
      <div class="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs text-slate-800 flex items-start justify-between gap-2 hover:bg-blue-50 transition">
        <p class="leading-relaxed flex-1">${v}</p>
        <button onclick="window.campusResume.insertEnhancedBullet('${encodeURIComponent(v)}')" 
          class="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-2.5 rounded-lg text-[11px] transition">
          <i class="fa-solid fa-plus mr-1"></i> Use
        </button>
      </div>
    `).join('');
    outputContainer.classList.remove('hidden');
    showToast('AI generated 3 high-impact STAR resume bullets!', 'success');
  }
  insertEnhancedBullet(encodedText) {
    const bullet = decodeURIComponent(encodedText);
    const textarea = document.getElementById('resume-input-proj-bullets');
    if (textarea) {
      textarea.value = textarea.value ? `${textarea.value}\n${bullet}` : bullet;
      this.readDataFromForm();
      this.renderResumePreview();
      showToast('Inserted bullet into project achievements!', 'success');
    }
  }
  renderResumePreview() {
    const container = document.getElementById('resume-preview-sheet');
    if (!container) return;
    // Reset container classes
    container.className = `resume-preview-container print-area resume-theme-${this.currentTheme}`;
    const d = this.resumeData;
    if (this.currentTheme === 'creative') {
      // Split layout (Sidebar + Main)
      container.innerHTML = `
        <div class="resume-sidebar">
          <div class="mb-6">
            <h1 class="text-xl font-black text-slate-900 leading-tight">${d.fullName}</h1>
            <p class="text-xs text-blue-600 font-bold uppercase tracking-wider mt-1">${d.education.degree.split('in ')[1] || 'Computer Science'}</p>
          </div>
          <div class="mb-6 text-xs space-y-1.5 text-slate-600">
            <div><i class="fa-regular fa-envelope text-blue-600 mr-1.5"></i> ${d.email}</div>
            ${d.phone ? `<div><i class="fa-solid fa-phone text-blue-600 mr-1.5"></i> ${d.phone}</div>` : ''}
                        ${d.location ? `<div><i class="fa-solid fa-location-dot text-blue-600 mr-1.5"></i> ${d.location}</div>` : ''}
            ${d.linkedin ? `<div><i class="fa-brands fa-linkedin text-blue-600 mr-1.5"></i> ${d.linkedin}</div>` : ''}
            ${d.github ? `<div><i class="fa-brands fa-github text-blue-600 mr-1.5"></i> ${d.github}</div>` : ''}
          </div>
          <div class="mb-6">
            <h3 class="section-title">Education</h3>
            <div class="text-xs">
              <strong class="font-bold text-slate-900 block">${d.education.degree}</strong>
              <div class="text-slate-600">${d.education.institution}</div>
              <div class="text-slate-500">${d.education.year}</div>
              <div class="text-blue-700 font-bold mt-1">GPA: ${d.education.gpa}</div>
            </div>
          </div>
          <div class="mb-6">
            <h3 class="section-title">Skills</h3>
            <div class="text-xs space-y-2">
              <div>
                <strong class="text-slate-700 block text-[11px] uppercase">Languages</strong>
                <span class="text-slate-600">${d.skills.languages}</span>
              </div>
              <div>
                <strong class="text-slate-700 block text-[11px] uppercase">Tools & Systems</strong>
                <span class="text-slate-600">${d.skills.tools}</span>
              </div>
              <div>
                <strong class="text-slate-700 block text-[11px] uppercase">Core Concepts</strong>
                <span class="text-slate-600">${d.skills.concepts}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="resume-main">
          ${d.summary ? `
            <div class="mb-6">
              <h3 class="section-title">Summary</h3>
              <p class="text-xs text-slate-700 leading-relaxed">${d.summary}</p>
            </div>
          ` : ''}
          <div class="mb-6">
            <h3 class="section-title">Projects</h3>
            ${d.projects.map(p => `
              <div class="mb-4 text-xs">
                <div class="flex items-center justify-between mb-1">
                  <strong class="text-sm font-bold text-slate-900">${p.title}</strong>
                  <span class="text-[11px] text-blue-600 font-mono">${p.tech}</span>
                </div>
                <ul class="list-disc pl-4 space-y-1 text-slate-700 leading-relaxed">
                  ${p.bullets.map(b => `<li>${b}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
          <div class="mb-6">
            <h3 class="section-title">Experience</h3>
            ${d.experience.map(e => `
              <div class="mb-4 text-xs">
                <div class="flex items-center justify-between mb-0.5">
                  <strong class="text-sm font-bold text-slate-900">${e.role} &bull; ${e.company}</strong>
                  <span class="text-slate-500">${e.duration}</span>
                </div>
                <ul class="list-disc pl-4 space-y-1 text-slate-700 leading-relaxed mt-1">
                  ${e.bullets.map(b => `<li>${b}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
           <div>
            <h3 class="section-title">Honors & Certifications</h3>
            <ul class="list-disc pl-4 text-xs text-slate-700 space-y-1 leading-relaxed">
              ${d.certifications.map(c => `<li>${c}</li>`).join('')}
            </ul>
          </div>
        </div>
      `;
      return;
    }
    
    // EXECUTIVE TEMPLATE — formal corporate resume
    if (this.currentTheme === 'executive') {
      container.innerHTML = `
        <div style="padding:32px 36px; font-family:Georgia,serif; color:#222;">
          <header style="text-align:center; border-bottom:2px solid #222; padding-bottom:18px; margin-bottom:22px;">
            <h1 style="font-size:28px; font-weight:bold; letter-spacing:1px;">
              ${d.fullName}
            </h1>
            <p style="font-size:11px; margin-top:10px; line-height:1.8;">
              ${d.email} &nbsp; | &nbsp; ${d.phone} &nbsp; | &nbsp; ${d.location}
              <br>${d.linkedin} &nbsp; | &nbsp; ${d.github}
            </p>
          </header>

          ${d.summary ? `
            <section style="margin-bottom:20px;">
              <h3 style="font-size:13px; text-transform:uppercase; letter-spacing:1.5px; border-bottom:1px solid #777; padding-bottom:5px; margin-bottom:8px;">Executive Summary</h3>
              <p style="font-size:12px; line-height:1.7;">${d.summary}</p>
            </section>` : ''}

          <section style="margin-bottom:20px;">
            <h3 style="font-size:13px; text-transform:uppercase; letter-spacing:1.5px; border-bottom:1px solid #777; padding-bottom:5px; margin-bottom:8px;">Professional Experience</h3>
            ${d.experience.map(e => `
              <div style="margin-bottom:12px; font-size:12px;">
                <strong>${e.role} — ${e.company}</strong>
                <span style="float:right;">${e.duration}</span>
                <ul style="padding-left:18px; margin-top:6px; line-height:1.7;">
                  ${e.bullets.map(b => `<li>${b}</li>`).join('')}
                </ul>
              </div>`).join('')}
          </section>

          <section style="margin-bottom:20px;">
            <h3 style="font-size:13px; text-transform:uppercase; letter-spacing:1.5px; border-bottom:1px solid #777; padding-bottom:5px; margin-bottom:8px;">Education</h3>
            <strong style="font-size:12px;">${d.education.degree}</strong>
            <p style="font-size:12px; margin-top:5px;">${d.education.institution} | ${d.education.year}</p>
            <p style="font-size:12px; margin-top:5px;">GPA: ${d.education.gpa}</p>
          </section>

          <section style="margin-bottom:20px;">
            <h3 style="font-size:13px; text-transform:uppercase; letter-spacing:1.5px; border-bottom:1px solid #777; padding-bottom:5px; margin-bottom:8px;">Core Skills</h3>
            <p style="font-size:12px; line-height:1.8;"><strong>Languages:</strong> ${d.skills.languages}</p>
            <p style="font-size:12px; line-height:1.8;"><strong>Tools & Frameworks:</strong> ${d.skills.tools}</p>
            <p style="font-size:12px; line-height:1.8;"><strong>Competencies:</strong> ${d.skills.concepts}</p>
          </section>

          <section style="margin-bottom:20px;">
            <h3 style="font-size:13px; text-transform:uppercase; letter-spacing:1.5px; border-bottom:1px solid #777; padding-bottom:5px; margin-bottom:8px;">Selected Projects</h3>
            ${d.projects.map(p => `
              <div style="font-size:12px; margin-bottom:12px;">
                <strong>${p.title}</strong>
                <p style="font-size:11px; margin-top:3px;">${p.tech}</p>
                <ul style="padding-left:18px; margin-top:5px; line-height:1.7;">
                  ${p.bullets.map(b => `<li>${b}</li>`).join('')}
                </ul>
              </div>`).join('')}
          </section>

          <section>
            <h3 style="font-size:13px; text-transform:uppercase; letter-spacing:1.5px; border-bottom:1px solid #777; padding-bottom:5px; margin-bottom:8px;">Honors & Certifications</h3>
            <ul style="font-size:12px; padding-left:18px; line-height:1.8;">
              ${d.certifications.map(c => `<li>${c}</li>`).join('')}
            </ul>
          </section>
        </div>`;
      return;
    }

    // ACADEMIC TEMPLATE — education and achievements first
    if (this.currentTheme === 'academic') {
      container.innerHTML = `
        <div style="padding:32px 36px; font-family:Georgia,serif; color:#243047;">
          <header style="border-bottom:3px double #365b85; padding-bottom:16px; margin-bottom:20px;">
            <h1 style="font-size:27px; font-weight:bold; color:#244b78;">${d.fullName}</h1>
            <p style="font-size:11px; margin-top:8px; line-height:1.8;">
              ${d.email} | ${d.phone} | ${d.location}<br>
              ${d.linkedin} | ${d.github}
            </p>
          </header>

          <section style="margin-bottom:20px;">
            <h3 style="font-size:14px; color:#244b78; border-bottom:1px solid #9aafc7; padding-bottom:5px; margin-bottom:9px;">EDUCATION</h3>
            <strong style="font-size:13px;">${d.education.degree}</strong>
            <p style="font-size:12px; margin-top:5px;">${d.education.institution}</p>
            <p style="font-size:12px; margin-top:5px;">${d.education.year} | GPA: ${d.education.gpa}</p>
          </section>

          <section style="margin-bottom:20px;">
            <h3 style="font-size:14px; color:#244b78; border-bottom:1px solid #9aafc7; padding-bottom:5px; margin-bottom:9px;">ACADEMIC PROFILE</h3>
            <p style="font-size:12px; line-height:1.8;">${d.summary}</p>
          </section>

          <section style="margin-bottom:20px;">
            <h3 style="font-size:14px; color:#244b78; border-bottom:1px solid #9aafc7; padding-bottom:5px; margin-bottom:9px;">TECHNICAL SKILLS & RESEARCH AREAS</h3>
            <p style="font-size:12px; line-height:1.8;"><strong>Programming:</strong> ${d.skills.languages}</p>
            <p style="font-size:12px; line-height:1.8;"><strong>Frameworks & Tools:</strong> ${d.skills.tools}</p>
            <p style="font-size:12px; line-height:1.8;"><strong>Core Knowledge:</strong> ${d.skills.concepts}</p>
          </section>

          <section style="margin-bottom:20px;">
            <h3 style="font-size:14px; color:#244b78; border-bottom:1px solid #9aafc7; padding-bottom:5px; margin-bottom:9px;">PROJECTS & PRACTICAL WORK</h3>
            ${d.projects.map(p => `
              <div style="font-size:12px; margin-bottom:12px;">
                <strong>${p.title}</strong>
                <p style="font-size:11px; margin-top:4px; color:#526782;">${p.tech}</p>
                <ul style="padding-left:18px; margin-top:5px; line-height:1.7;">
                  ${p.bullets.map(b => `<li>${b}</li>`).join('')}
                </ul>
              </div>`).join('')}
          </section>

          <section style="margin-bottom:20px;">
            <h3 style="font-size:14px; color:#244b78; border-bottom:1px solid #9aafc7; padding-bottom:5px; margin-bottom:9px;">INTERNSHIPS & EXPERIENCE</h3>
            ${d.experience.map(e => `
              <div style="font-size:12px; margin-bottom:12px;">
                <strong>${e.role} — ${e.company}</strong>
                <p style="margin-top:4px;">${e.duration}</p>
                <ul style="padding-left:18px; margin-top:5px; line-height:1.7;">
                  ${e.bullets.map(b => `<li>${b}</li>`).join('')}
                </ul>
              </div>`).join('')}
          </section>

          <section>
            <h3 style="font-size:14px; color:#244b78; border-bottom:1px solid #9aafc7; padding-bottom:5px; margin-bottom:9px;">ACHIEVEMENTS & CERTIFICATIONS</h3>
            <ul style="font-size:12px; padding-left:18px; line-height:1.8;">
              ${d.certifications.map(c => `<li>${c}</li>`).join('')}
            </ul>
          </section>
        </div>`;
      return;
    }
    // Standard Layout (Modern, Executive, Academic)
    container.innerHTML = `
      <!-- Header -->
      <div class="resume-header">
        <h1 class="text-2xl font-black tracking-tight leading-none">${d.fullName}</h1>
        <div class="flex flex-wrap items-center gap-3 text-xs mt-2 opacity-90">
          <span><i class="fa-regular fa-envelope mr-1"></i> ${d.email}</span>
          ${d.phone ? `<span>&bull; ${d.phone}</span>` : ''}
          ${d.location ? `<span>&bull; ${d.location}</span>` : ''}
          ${d.linkedin ? `<span>&bull; ${d.linkedin}</span>` : ''}
          ${d.github ? `<span>&bull; ${d.github}</span>` : ''}
        </div>
      </div>
      <div class="p-8 space-y-5">
        <!-- Summary -->
        ${d.summary ? `
          <div>
            <h3 class="section-title mb-2">Professional Summary</h3>
            <p class="text-xs text-slate-700 leading-relaxed">${d.summary}</p>
          </div>
        ` : ''}
        <!-- Education -->
        <div>
          <h3 class="section-title mb-2">Education</h3>
          <div class="text-xs">
            <div class="flex items-center justify-between font-bold text-slate-900 text-sm">
              <span>${d.education.degree}</span>
              <span class="font-normal text-slate-500 text-xs">${d.education.year}</span>
            </div>
            <div class="flex items-center justify-between text-slate-600 mt-0.5">
              <span>${d.education.institution}</span>
              <span class="font-semibold text-blue-700">Cumulative GPA: ${d.education.gpa}</span>
            </div>
          </div>
        </div>
                <!-- Technical Skills -->
        <div>
          <h3 class="section-title mb-2">Technical Skills</h3>
          <div class="text-xs space-y-1 text-slate-700">
            <div><strong class="text-slate-900 font-semibold">Languages:</strong> ${d.skills.languages}</div>
            <div><strong class="text-slate-900 font-semibold">Frameworks & Tools:</strong> ${d.skills.tools}</div>
            <div><strong class="text-slate-900 font-semibold">Core Competencies:</strong> ${d.skills.concepts}</div>
          </div>
        </div>
                <!-- Projects -->
        <div>
          <h3 class="section-title mb-2">Technical Projects</h3>
          ${d.projects.map(p => `
            <div class="mb-3 text-xs">
              <div class="flex items-center justify-between mb-1">
                <span class="font-bold text-slate-900 text-sm">${p.title}</span>
                <span class="text-slate-500 font-mono text-[11px]">${p.tech}</span>
              </div>
              <ul class="list-disc pl-4 space-y-1 text-slate-700 leading-relaxed">
                ${p.bullets.map(b => `<li>${b}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
        <!-- Experience -->
        <div>
          <h3 class="section-title mb-2">Experience & Internships</h3>
          ${d.experience.map(e => `
            <div class="mb-3 text-xs">
              <div class="flex items-center justify-between mb-0.5">
                <span class="font-bold text-slate-900 text-sm">${e.role} &mdash; ${e.company}</span>
                <span class="text-slate-500 text-xs">${e.duration}</span>
              </div>
              <ul class="list-disc pl-4 space-y-1 text-slate-700 leading-relaxed">
                ${e.bullets.map(b => `<li>${b}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
                <!-- Honors -->
        <div>
          <h3 class="section-title mb-2">Honors, Certifications & Leadership</h3>
          <ul class="list-disc pl-4 text-xs text-slate-700 space-y-1 leading-relaxed">
            ${d.certifications.map(c => `<li>${c}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }
}
window.addEventListener('DOMContentLoaded', () => {
  window.campusResume = new ResumeBuilderEngine();
  window.campusResume.init();
});