(function () {
  const style = document.createElement("style");
  style.textContent = `
    #cp-assistant-button {
      position: fixed; right: 24px; bottom: 24px; z-index: 9999;
      width: 62px; height: 62px; border: 0; border-radius: 50%;
      color: white; font-size: 27px; cursor: pointer;
      background: linear-gradient(135deg,#4569ed,#8a5ce5);
      box-shadow: 0 10px 30px #3449a64a;
    }
    #cp-assistant {
      position: fixed; right: 24px; bottom: 98px; z-index: 9999;
      width: min(365px,calc(100vw - 30px)); height: 475px;
      display: none; flex-direction: column; overflow: hidden;
      background: white; border: 1px solid #e0e6f2;
      border-radius: 19px; box-shadow: 0 20px 65px #14234235;
      font: 14px Arial,sans-serif; color: #182541;
    }
    #cp-assistant.open { display: flex; }
    .cp-head {
      padding: 17px; color: white;
      background: linear-gradient(110deg,#263f8b,#6655d9);
      display: flex; justify-content: space-between; align-items: center;
    }
    .cp-head small { display: block; margin-top: 5px; opacity: .8; }
    .cp-head button { color: white; background: transparent; font-size: 20px; }
    #cp-messages {
      flex: 1; padding: 14px; overflow-y: auto; background: #f7f8fd;
    }
    .cp-msg {
      max-width: 88%; padding: 11px 12px; margin: 8px 0;
      border-radius: 12px; line-height: 1.5; white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
    .cp-bot { background: white; border: 1px solid #e5e9f3; }
    .cp-user { margin-left: auto; color: white; background: #5868df; }
    .cp-suggestions { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 12px; }
    .cp-suggestions button {
      border: 1px solid #dce2ff; background: #f0f2ff;
      color: #4358c9; border-radius: 18px; padding: 7px 9px;
      font-size: 11px; cursor: pointer;
    }
    .cp-input-row {
      display: flex; gap: 8px; padding: 11px; border-top: 1px solid #e8ebf3;
    }
    #cp-question {
      min-width: 0; flex: 1; padding: 11px;
      border: 1px solid #dce2ed; border-radius: 10px;
    }
    #cp-send {
      border: 0; border-radius: 10px; padding: 0 14px;
      color: white; background: #5868df; cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  document.body.insertAdjacentHTML("beforeend", `
    <button id="cp-assistant-button" aria-label="Open CampusPulse Assistant">✦</button>
    <section id="cp-assistant" aria-label="CampusPulse Assistant">
      <header class="cp-head">
        <div><strong>✦ CampusPulse Assistant</strong>
          <small>Your academic support companion</small>
        </div>
        <button id="cp-close" aria-label="Close chat">×</button>
      </header>
      <div id="cp-messages" aria-live="polite"></div>
      <div class="cp-suggestions">
        <button data-question="Show student analytics">Analytics</button>
        <button data-question="How can I manage my exams?">Exams</button>
        <button data-question="Help me plan my studies">Study plan</button>
        <button data-question="How do I build a resume?">Resume</button>
      </div>
      <form id="cp-chat-form" class="cp-input-row">
        <input id="cp-question" placeholder="Ask me something..." autocomplete="off" required>
        <button id="cp-send" type="submit">Send</button>
      </form>
    </section>
  `);

  const panel = document.getElementById("cp-assistant");
  const messages = document.getElementById("cp-messages");

  function addMessage(text, type) {
    const bubble = document.createElement("div");
    bubble.className = "cp-msg " + type;
    bubble.textContent = text;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
  }

  function answerQuestion(question) {
    const q = question.toLowerCase();

    if (q.includes("analytic") || q.includes("student") ||
        q.includes("attendance") || q.includes("risk") ||
        q.includes("performance") || q.includes("marks")) {
      return "Student Analytics:\nOpen the Student Analytics section to view attendance, marks, risk levels, and recommended interventions. Verify the imported data before making academic decisions.";
    }

    if (q.includes("exam") || q.includes("timetable")) {
      return "Exam Timetable:\nOpen Exam Timetable, enter the subject, date, time, and venue, then select Add Exam. Add only your official exam dates.";
    }

    if (q.includes("plan") || q.includes("task") ||
        q.includes("study") || q.includes("deadline")) {
      return "Smart Planner:\nAdd each task with a due date and priority. Mark tasks complete as you finish them. Start with urgent tasks and schedule short revision sessions.";
    }

    if (q.includes("resume") || q.includes("cv") ||
        q.includes("job")) {
      return "Resume Builder:\nOpen AI Resume Builder, enter your education, skills, contact details, and projects, then generate your resume. Check all details before using it.";
    }

    if (q.includes("interview") || q.includes("question")) {
      return "Mock Interview:\nOpen AI Mock Interview, answer the practice question, and select Review My Answer. Use the STAR method: Situation, Task, Action, Result.";
    }

    if (q.includes("alert") || q.includes("notification")) {
      return "Alerts:\nOpen Alert Notifications to review upcoming exams, overdue tasks, and student-support alerts based on the data currently stored in your browser.";
    }

    if (q.includes("hello") || q.includes("hi ") || q === "hi" ||
        q.includes("hey")) {
      return "Hello! 👋 I'm your CampusPulse Assistant. Ask me about analytics, exams, study planning, resumes, mock interviews, or alerts.";
    }

    return "I can help you navigate CampusPulse AI. Try asking about student analytics, exam timetables, study planning, resume building, mock interviews, or notifications.";
  }

  document.getElementById("cp-assistant-button").addEventListener("click", () => {
    panel.classList.toggle("open");
    if (messages.children.length === 0) {
      addMessage("Hi! 👋 I'm your CampusPulse Assistant. What would you like help with today?", "cp-bot");
    }
  });

  document.getElementById("cp-close").addEventListener("click", () => {
    panel.classList.remove("open");
  });

  document.getElementById("cp-chat-form").addEventListener("submit", event => {
    event.preventDefault();
    const input = document.getElementById("cp-question");
    const question = input.value.trim();
    if (!question) return;

    addMessage(question, "cp-user");
    input.value = "";

   addMessage("Thinking...", "cp-bot");

askCampusPulseAI(question).then(reply => {
  const messages = document.querySelectorAll(".cp-msg.cp-bot");
  const lastMessage = messages[messages.length - 1];

  if (lastMessage && lastMessage.textContent === "Thinking...") {
    lastMessage.textContent = reply;
  } else {
    addMessage(reply, "cp-bot");
  }
});
  });

  document.querySelectorAll(".cp-suggestions button").forEach(button => {
    button.addEventListener("click", () => {
      const question = button.dataset.question;
      addMessage(question, "cp-user");
      askCampusPulseAI(question).then(reply => {
  addMessage(reply, "cp-bot");
});
    });
  });
})();


async function askCampusPulseAI(question) {
  try {
    const response = await fetch(
      "http://127.0.0.1:5000/api/assistant",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: question
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data.reply || "AI server returned no reply.";

  } catch (error) {
    console.error("CampusPulse AI error:", error);
    return "Error: " + error.message;
  }
}