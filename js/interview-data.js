
window.CAMPUS_DATA = window.CAMPUS_DATA || {};

window.CAMPUS_DATA.interviewQuestions = {
  software_engineering: [
    {
      title: "What is Object-Oriented Programming?",
      category: "Technical",
      difficulty: "Easy",
      expectedKeywords: ["class", "object", "encapsulation", "inheritance"],
      modelAnswer:
        "Object-Oriented Programming organizes software using classes and objects. Its main principles include encapsulation, inheritance, polymorphism, and abstraction."
    },
    {
      title: "What is the difference between a stack and a queue?",
      category: "Data Structures",
      difficulty: "Easy",
      expectedKeywords: ["LIFO", "FIFO", "stack", "queue"],
      modelAnswer:
        "A stack follows Last In, First Out (LIFO), while a queue follows First In, First Out (FIFO)."
    }
  ],

  data_science_ai: [
    {
      title: "What is the difference between AI and Machine Learning?",
      category: "Artificial Intelligence",
      difficulty: "Easy",
      expectedKeywords: ["artificial intelligence", "machine learning", "data", "models"],
      modelAnswer:
        "Artificial Intelligence is the broader field of creating systems that perform intelligent tasks. Machine Learning is a subset of AI that learns patterns from data."
    }
  ],

  full_stack: [
    {
      title: "What is the difference between frontend and backend development?",
      category: "Web Development",
      difficulty: "Easy",
      expectedKeywords: ["frontend", "backend", "user interface", "server", "database"],
      modelAnswer:
        "Frontend development builds the user interface people interact with. Backend development handles server logic, APIs, authentication, and data storage."
    }
  ],

  behavioral: [
    {
      title: "Tell me about yourself.",
      category: "Behavioral",
      difficulty: "Easy",
      expectedKeywords: ["education", "skills", "projects", "goals"],
      modelAnswer:
        "Introduce your education, technical skills, relevant projects, achievements, and career goals in a clear and concise way."
    }
  ]
};