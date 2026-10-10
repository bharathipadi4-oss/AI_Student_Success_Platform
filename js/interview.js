/**
 * Campus Pulse AI - AI Mock Interview Studio
 * Interactive interview simulator with speech recognition, question audio playback,
 * multi-axis AI evaluation engine, and personalized feedback reports.
 */
class MockInterviewEngine {
  constructor() {
    this.currentTrack = 'software_engineering';
    this.currentIndex = 0;
    this.currentQuestion = null;
    this.isRecording = false;
    this.speechRecognition = null;
    this.history = [];
    // Tracks config
    this.trackLabels = {
      software_engineering: 'Software Engineering',
      data_science_ai: 'Data Science & AI',
      full_stack: 'Full Stack Web Dev',
      behavioral: 'Behavioral & HR'
    };
  }
  init() {
    // Load practice history
    const saved = localStorage.getItem('campus_pulse_interview_history');
    if (saved) {
      try {
        this.history = JSON.parse(saved);
      } catch (e) {
        this.history = [];
      }
    }
    this.initSpeechRecognition();
    this.bindEvents();
    this.loadQuestion();
    this.renderHistory();
  }
  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
     this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = true;
      this.speechRecognition.interimResults = true;
      this.speechRecognition.lang = 'en-US';
      this.speechRecognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        const answerInput = document.getElementById('interview-answer-input');
        if (answerInput) {
          answerInput.value = (answerInput.value ? answerInput.value + ' ' : '') + transcript;
          this.updateWordCount();
        }
      };
      this.speechRecognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        this.stopRecording();
      };
        this.speechRecognition.onend = () => {
        if (this.isRecording) {
          this.speechRecognition.start(); // Auto-restart if still recording
        }
      };
    }
  }
  bindEvents() {
    // Track selector tabs
    const trackBtns = document.querySelectorAll('.interview-track-btn');
    trackBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        trackBtns.forEach(b => {
          b.classList.remove('bg-blue-600', 'text-white');
          b.classList.add('bg-slate-100', 'text-slate-700');
        });
        e.currentTarget.classList.remove('bg-slate-100', 'text-slate-700');
        e.currentTarget.classList.add('bg-blue-600', 'text-white');
        this.currentTrack = e.currentTarget.dataset.track;
        this.currentIndex = 0;
        this.loadQuestion();
      });
    });
    // Navigation buttons
    const prevBtn = document.getElementById('interview-btn-prev');
    const nextBtn = document.getElementById('interview-btn-next');
    const randomBtn = document.getElementById('interview-btn-random');
    if (prevBtn) prevBtn.addEventListener('click', () => this.prevQuestion());
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextQuestion());
    if (randomBtn) randomBtn.addEventListener('click', () => this.randomQuestion());
    // Speak question audio
    const speakBtn = document.getElementById('interview-btn-speak');
    if (speakBtn) speakBtn.addEventListener('click', () => this.speakQuestion());
     // Record audio toggle
    const recordBtn = document.getElementById('interview-btn-record');
    if (recordBtn) recordBtn.addEventListener('click', () => this.toggleRecording());
    // Answer input word counter
    const answerInput = document.getElementById('interview-answer-input');
    if (answerInput) {
      answerInput.addEventListener('input', () => this.updateWordCount());
    }
    // Submit for AI Evaluation
    const submitBtn = document.getElementById('interview-btn-submit');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.evaluateAnswer());
    }
  }
 getQuestionsForTrack() {
  const fallbackQuestions = {
    software_engineering: [
      { title: "What is OOP?", category: "Programming", difficulty: "Easy", expectedKeywords: ["class", "object", "inheritance"], modelAnswer: "OOP organizes code using classes and objects. Its main principles include encapsulation, inheritance, polymorphism, and abstraction." },
      { title: "Explain time complexity.", category: "Algorithms", difficulty: "Medium", expectedKeywords: ["algorithm", "complexity", "Big O"], modelAnswer: "Time complexity describes how an algorithm's running time grows with input size, often represented using Big O notation." },
      { title: "What is REST API?", category: "Backend", difficulty: "Medium", expectedKeywords: ["HTTP", "API", "request", "response"], modelAnswer: "A REST API allows systems to communicate through HTTP methods and resources, commonly using JSON." }
    ],
    data_science_ai: [
      { title: "What is machine learning?", category: "AI", difficulty: "Easy", expectedKeywords: ["data", "model", "training"], modelAnswer: "Machine learning uses data to train models that identify patterns and make predictions." },
      { title: "Explain overfitting.", category: "Machine Learning", difficulty: "Medium", expectedKeywords: ["training", "generalization", "data"], modelAnswer: "Overfitting occurs when a model learns training data too closely and performs poorly on unseen data." },
      { title: "What is the difference between AI and ML?", category: "AI Fundamentals", difficulty: "Easy", expectedKeywords: ["artificial intelligence", "machine learning", "model"], modelAnswer: "AI is the broader field of intelligent systems, while machine learning is an approach that learns patterns from data." }
    ],
    full_stack: [
      { title: "What is the difference between frontend and backend?", category: "Web Development", difficulty: "Easy", expectedKeywords: ["user interface", "server", "database"], modelAnswer: "Frontend manages the user interface, while backend handles server logic, APIs, and database operations." },
      { title: "What is React?", category: "Frontend", difficulty: "Easy", expectedKeywords: ["components", "UI", "JavaScript"], modelAnswer: "React is a JavaScript library for building user interfaces using reusable components." },
      { title: "How does a web application connect to a database?", category: "Backend", difficulty: "Medium", expectedKeywords: ["backend", "query", "database", "API"], modelAnswer: "The backend validates requests, executes database queries, and returns the results through an API." }
    ],
    behavioral: [
      { title: "Tell me about yourself.", category: "HR", difficulty: "Easy", expectedKeywords: ["education", "skills", "projects", "goals"], modelAnswer: "Introduce your education, technical skills, projects, strengths, and career goals briefly." },
      { title: "How do you handle challenges?", category: "Behavioral", difficulty: "Medium", expectedKeywords: ["problem", "solution", "team"], modelAnswer: "Explain a real challenge, your responsibility, the actions you took, and the result using the STAR method." },
      { title: "Why should we hire you?", category: "HR", difficulty: "Easy", expectedKeywords: ["skills", "learning", "contribution"], modelAnswer: "Connect your relevant skills, project experience, willingness to learn, and potential contribution to the role." }
    ]
  };

  const allData = window.CAMPUS_DATA?.interviewQuestions;
  const aliases = {
    software_engineering: ["software_engineering", "softwareEngineering", "software"],
    data_science_ai: ["data_science_ai", "dataScienceAI", "data_science", "ai"],
    full_stack: ["full_stack", "fullStack", "full_stack_web"],
    behavioral: ["behavioral", "behavioural", "hr", "behavioral_hr"]
  };

  const keys = aliases[this.currentTrack] || [this.currentTrack];
  let questions = [];

  if (Array.isArray(allData)) {
    questions = allData.filter(q =>
      keys.includes(q.track) || keys.includes(q.category)
    );
  } else if (allData) {
    for (const key of keys) {
      if (Array.isArray(allData[key])) {
        questions = allData[key];
        break;
      }
    }
  }

  if (!questions.length) {
    console.warn("Using built-in questions for:", this.currentTrack);
    questions = fallbackQuestions[this.currentTrack] || fallbackQuestions.software_engineering;
  }

  return questions.map(q => ({
    ...q,
    title: q.title || q.question || q.prompt || "Interview question",
    category: q.category || this.trackLabels[this.currentTrack] || "Interview",
    difficulty: q.difficulty || "Medium",
    expectedKeywords: q.expectedKeywords || q.keywords || [],
    modelAnswer: q.modelAnswer || q.answer || "Explain the concept clearly and give a practical example."
  }));
}
 loadQuestion() {
    const list = this.getQuestionsForTrack();
    if (list.length === 0) return;
    if (this.currentIndex >= list.length) this.currentIndex = 0;
    if (this.currentIndex < 0) this.currentIndex = list.length - 1;
    this.currentQuestion = list[this.currentIndex];
    // Render Question card
    const titleEl = document.getElementById('interview-question-title');
    const categoryEl = document.getElementById('interview-question-category');
    const diffEl = document.getElementById('interview-question-difficulty');
    const countEl = document.getElementById('interview-question-count');
     if (titleEl) titleEl.innerText = this.currentQuestion.title;
    if (categoryEl) categoryEl.innerText = this.currentQuestion.category;
    if (diffEl) {
      diffEl.innerText = `${this.currentQuestion.difficulty} Level`;
      diffEl.className = `px-2.5 py-0.5 text-xs font-semibold rounded-full ${
        this.currentQuestion.difficulty === 'Hard' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
      }`;
    }
    if (countEl) countEl.innerText = `Question ${this.currentIndex + 1} of ${list.length}`;
    // Reset Answer & Feedback container
    const answerInput = document.getElementById('interview-answer-input');
    if (answerInput) answerInput.value = '';
    this.updateWordCount();
    const feedbackSection = document.getElementById('interview-feedback-section');
    if (feedbackSection) feedbackSection.classList.add('hidden');
  }
  nextQuestion() {
  
    console.log("Next button clicked!");

    const questions = this.getQuestionsForTrack();

    if (!questions.length) {
      console.error("No interview questions available.");
      return;
    }

    this.currentIndex = (this.currentIndex + 1) % questions.length;
    this.loadQuestion();
  }

  prevQuestion() {
    const questions = this.getQuestionsForTrack();

    if (!questions.length) {
      console.error("No interview questions available.");
      return;
    }

    this.currentIndex =
      (this.currentIndex - 1 + questions.length) % questions.length;

    this.loadQuestion();
  }
  randomQuestion() {
    const list = this.getQuestionsForTrack();
    if (list.length <= 1) return;
    let nextIdx = Math.floor(Math.random() * list.length);
    if (nextIdx === this.currentIndex) nextIdx = (nextIdx + 1) % list.length;
    this.currentIndex = nextIdx;
    this.loadQuestion();
  }
  speakQuestion() {
    if (!('speechSynthesis' in window) || !this.currentQuestion) {
      showToast('Speech synthesis not supported in this browser.', 'warning');
      return;
    }
     window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(this.currentQuestion.title);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
    showToast('Reading interview question aloud...', 'info');
  }
  toggleRecording() {
    if (!this.speechRecognition) {
      showToast('Speech-to-text is not supported in this browser. Please type your response directly.', 'info');
      return;
    }
    const recordBtn = document.getElementById('interview-btn-record');
    const waveEl = document.getElementById('interview-voice-wave');
     if (this.isRecording) {
      this.stopRecording();
    } else {
      this.isRecording = true;
      try {
        this.speechRecognition.start();
        if (recordBtn) {
          recordBtn.classList.remove('bg-slate-100', 'text-slate-700');
          recordBtn.classList.add('bg-red-600', 'text-white', 'animate-pulse');
          recordBtn.innerHTML = '<i class="fa-solid fa-stop mr-1.5"></i> Stop Recording';
        }
        if (waveEl) waveEl.classList.remove('hidden');
        showToast('Listening... Speak your answer clearly.', 'info');
      } catch (err) {
        this.stopRecording();
      }
    }
    }
  stopRecording() {
    this.isRecording = false;
    if (this.speechRecognition) {
      try { this.speechRecognition.stop(); } catch (e) {}
    }
    const recordBtn = document.getElementById('interview-btn-record');
    const waveEl = document.getElementById('interview-voice-wave');
    if (recordBtn) {
      recordBtn.classList.add('bg-slate-100', 'text-slate-700');
      recordBtn.classList.remove('bg-red-600', 'text-white', 'animate-pulse');
      recordBtn.innerHTML = '<i class="fa-solid fa-microphone mr-1.5"></i> Voice Answer';
    }
    if (waveEl) waveEl.classList.add('hidden');
  }
  updateWordCount() {
    const answerInput = document.getElementById('interview-answer-input');
    const countEl = document.getElementById('interview-word-count');
    if (!answerInput || !countEl) return;
    const words = answerInput.value.trim().split(/\s+/).filter(w => w.length > 0);
    countEl.innerText = `${words.length} words`;
  }
  /**
   * Actionable AI Evaluation Engine
   * Evaluates technical keywords, structural flow, depth, and provides concrete guidance
   */
  evaluateAnswer() {
    const answerInput = document.getElementById('interview-answer-input');
    if (!answerInput || !this.currentQuestion) return;
     const answer = answerInput.value.trim();
    if (answer.length < 20) {
      showToast('Please provide a complete answer (at least 2-3 sentences) for evaluation.', 'warning');
      return;
    }
    if (this.isRecording) this.stopRecording();
    // Show evaluating spinner state
    const submitBtn = document.getElementById('interview-btn-submit');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-1.5"></i> AI Evaluating Answer...';
    submitBtn.disabled = true;
    setTimeout(() => {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      this.processEvaluationResult(answer);
    }, 800);
  }
  processEvaluationResult(answer) {
    const lower = answer.toLowerCase();
    const keywords = this.currentQuestion.expectedKeywords || [];
    // 1. Keyword match score
    let matchedKeywords = [];
    keywords.forEach(kw => {
      if (lower.includes(kw.toLowerCase())) matchedKeywords.push(kw);
    });
    const keywordRatio = keywords.length ? (matchedKeywords.length / keywords.length) : 0.7;
    const techScore = Math.min(100, Math.round(keywordRatio * 60 + 35));
    // 2. Length & Structural depth score
    const wordCount = answer.split(/\s+/).length;
    let structureScore = 50;
    if (wordCount >= 60) structureScore = 90;
    else if (wordCount >= 35) structureScore = 75;
    else structureScore = 60;
    // Check for structured indicator phrases
    if (lower.includes('for example') || lower.includes('in my experience') || lower.includes('firstly') || lower.includes('furthermore')) {
      structureScore = Math.min(100, structureScore + 10);
    }
    // 3. Relevance & Clarity
    const relevanceScore = Math.min(100, Math.round((techScore * 0.6) + (structureScore * 0.4)));
    const confidenceScore = Math.min(100, Math.round(70 + (wordCount > 40 ? 20 : 0) + (matchedKeywords.length * 3)));
    // Overall composite score
    const overallScore = Math.round((techScore * 0.35) + (structureScore * 0.25) + (relevanceScore * 0.25) + (confidenceScore * 0.15));
    // Formulate Strengths & Improvements
    const strengths = [];
    if (matchedKeywords.length >= 2) {
      strengths.push(`Accurately highlighted foundational technical concepts including "${matchedKeywords.slice(0, 3).join('", "')}".`);
    } else {
      strengths.push('Demonstrated good initial understanding of the question subject matter.');
    }
    if (wordCount >= 45) {
      strengths.push('Elaborated with sufficient context and explanatory depth.');
    } else {
      strengths.push('Communicated concisely without extraneous filler words.');
    }
      const improvements = [];
    const missing = keywords.filter(k => !matchedKeywords.includes(k));
    if (missing.length > 0) {
      improvements.push(`Incorporate key industry concepts: consider addressing "${missing.slice(0, 3).join('", "')}".`);
    }
    if (wordCount < 40) {
      improvements.push('Expand your response using the STAR technique (Situation, Task, Action, Result) or include a concrete architectural example.');
    } else {
      improvements.push('Consider contrasting with alternative trade-offs (e.g. latency vs. throughput, or space vs. time complexity).');
    }
     // Save into history
    const entry = {
      id: `INT-${Date.now()}`,
      date: new Date().toLocaleDateString(),
      track: this.trackLabels[this.currentTrack],
      question: this.currentQuestion.title,
      overallScore: overallScore,
      techScore: techScore
    };
    this.history.unshift(entry);
    localStorage.setItem('campus_pulse_interview_history', JSON.stringify(this.history));
    this.renderHistory();
    // Render feedback section
    this.renderFeedbackView(overallScore, techScore, structureScore, relevanceScore, confidenceScore, strengths, improvements);
    showToast(`AI Mock Interview evaluation completed! Score: ${overallScore}/100`, 'success');
  }
   renderFeedbackView(overall, tech, struct, rel, conf, strengths, improvements) {
    const feedbackSection = document.getElementById('interview-feedback-section');
    if (!feedbackSection) return;
    let scoreColor = 'text-blue-600';
    let verdict = 'Strong Candidate';
    if (overall >= 85) { scoreColor = 'text-emerald-600'; verdict = 'Strong Hire / Excellent'; }
    else if (overall >= 70) { scoreColor = 'text-blue-600'; verdict = 'Solid Hire / Good Proficiency'; }
    else if (overall >= 55) { scoreColor = 'text-amber-600'; verdict = 'Needs Revision & Practice'; }
    else { scoreColor = 'text-red-600'; verdict = 'Critical Deficit / Incomplete'; }
    feedbackSection.innerHTML = `
      <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-md">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Evaluation Scorecard</span>
            <div class="flex items-baseline gap-3 mt-1">
              <span class="text-4xl font-black ${scoreColor}">${overall}<span class="text-xl font-normal text-slate-400">/100</span></span>
              <span class="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">${verdict}</span>
            </div>
          </div>
          <button onclick="window.campusInterview.speakModelAnswer()" 
            class="bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-2 px-3.5 rounded-xl text-xs transition flex items-center gap-2">
            <i class="fa-solid fa-volume-high"></i> Listen to Model Answer
          </button>
        </div>
            <!-- 4 Axes Metrics -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 my-5">
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
            <span class="text-slate-400 text-xs block">Technical Depth</span>
            <span class="text-lg font-black text-slate-800">${tech}%</span>
            <div class="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div class="h-full bg-blue-600 rounded-full" style="width: ${tech}%"></div>
            </div>
          </div>
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
            <span class="text-slate-400 text-xs block">Structure & Clarity</span>
            <span class="text-lg font-black text-slate-800">${struct}%</span>
            <div class="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div class="h-full bg-emerald-600 rounded-full" style="width: ${struct}%"></div>
            </div>
          </div>
              <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
            <span class="text-slate-400 text-xs block">Relevance</span>
            <span class="text-lg font-black text-slate-800">${rel}%</span>
            <div class="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div class="h-full bg-purple-600 rounded-full" style="width: ${rel}%"></div>
            </div>
          </div>
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
            <span class="text-slate-400 text-xs block">Confidence & Tone</span>
            <span class="text-lg font-black text-slate-800">${conf}%</span>
            <div class="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div class="h-full bg-amber-600 rounded-full" style="width: ${conf}%"></div>
            </div>
          </div>
        </div>
          <!-- Feedback Highlights -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 text-xs">
          <div class="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4">
            <h5 class="font-bold text-emerald-900 flex items-center gap-1.5 mb-2">
              <i class="fa-solid fa-circle-check text-emerald-600"></i> Key Strengths
            </h5>
            <ul class="list-disc pl-4 space-y-1 text-emerald-800 leading-relaxed">
              ${strengths.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
          <div class="bg-amber-50/60 border border-amber-200 rounded-xl p-4">
            <h5 class="font-bold text-amber-900 flex items-center gap-1.5 mb-2">
              <i class="fa-solid fa-triangle-exclamation text-amber-600"></i> Actionable Growth Areas
            </h5>
            <ul class="list-disc pl-4 space-y-1 text-amber-800 leading-relaxed">
              ${improvements.map(i => `<li>${i}</li>`).join('')}
            </ul>
          </div>
        </div>
        <!-- Exemplary Model Answer -->
        <div class="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs">
          <div class="flex items-center justify-between mb-2">
            <span class="font-bold text-blue-400 flex items-center gap-1.5">
              <i class="fa-solid fa-award"></i> Exemplary Model Answer (Staff Engineer Standard):
            </span>
          </div>
          <p class="leading-relaxed text-slate-300 font-sans">${this.currentQuestion.modelAnswer}</p>
        </div>
      </div>
    `;
    feedbackSection.classList.remove('hidden');
    feedbackSection.scrollIntoView({ behavior: 'smooth' });
  }
    speakModelAnswer() {
    if (!('speechSynthesis' in window) || !this.currentQuestion) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(this.currentQuestion.modelAnswer);
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
    showToast('Playing audio model answer...', 'info');
  }
  renderHistory() {
    const container = document.getElementById('interview-history-container');
    if (!container) return;
    if (this.history.length === 0) {
      container.innerHTML = `
        <div class="py-8 text-center text-slate-400 text-xs">
          <i class="fa-solid fa-clock-rotate-left text-2xl mb-2 text-slate-300"></i>
          <p>No practice sessions recorded yet. Complete an interview to track readiness!</p>
        </div>
      `;
      return;
    }
     container.innerHTML = this.history.slice(0, 5).map(h => `
      <div class="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between text-xs hover:bg-slate-50 transition">
        <div>
          <span class="font-semibold text-slate-800 block truncate max-w-[280px]">${h.question}</span>
          <span class="text-slate-400 text-[11px]">${h.track} &bull; ${h.date}</span>
        </div>
        <div class="text-right">
          <span class="font-bold ${h.overallScore >= 80 ? 'text-emerald-600' : 'text-blue-600'} text-sm">${h.overallScore}/100</span>
          <span class="block text-[10px] text-slate-400">Score</span>
        </div>
      </div>
    `).join('');
  }
}
window.addEventListener('DOMContentLoaded', () => {
  window.campusInterview = new MockInterviewEngine();
  window.campusInterview.init();
});
  