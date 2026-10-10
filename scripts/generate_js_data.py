import json
with open("data/students_enriched.json", "r", encoding="utf-8") as f:
    all_students = json.load(f)
with open("data/dataset_summary.json", "r", encoding="utf-8") as f:
    summary = json.load(f)
with open("data/exams_data.json", "r", encoding="utf-8") as f:
    exams = json.load(f)
# Embed top 120 diverse students for instant offline loading + flag full dataset count
sample_students = all_students[:120]
interview_questions = {
    "software_engineering": [
        {
            "id": "SE1",
            "title": "Explain how a Hash Table works and how collisions are resolved.",
            "category": "Data Structures",
            "difficulty": "Medium",
            "expectedKeywords": ["hash function", "bucket", "collision", "chaining", "open addressing", "linear probing", "o(1)", "load factor"],
            "modelAnswer": "A hash table is a data structure that maps keys to values using a hash function to compute an index into an array of buckets. When two distinct keys hash to the same bucket, a collision occurs. Standard collision resolution techniques include Separate Chaining (where each bucket holds a linked list or red-black tree of colliding entries) and Open Addressing (such as Linear Probing, Quadratic Probing, or Double Hashing). Under a good hash function and low load factor, search, insertion, and deletion achieve average-case O(1) time complexity."
        },
         {
            "id": "SE2",
            "title": "What is the difference between a Process and a Thread? How does context switching differ?",
            "category": "Operating Systems",
            "difficulty": "Medium",
            "expectedKeywords": ["process", "thread", "address space", "memory", "overhead", "context switch", "registers", "stack"],
            "modelAnswer": "A process is an independent execution unit with its own dedicated memory space, file descriptors, and system resources. A thread is a lightweight unit of execution within a process, sharing the parent process's memory space, code, and data, but maintaining its own stack and program counter. Context switching between processes has higher overhead because it requires invalidating the CPU cache (TLB) and switching memory mappings, whereas thread context switching in the same process is faster because memory mappings remain unchanged."
        },
         {
            "id": "SE3",
            "title": "How would you design a rate limiter for an API with millions of daily requests?",
            "category": "System Design",
            "difficulty": "Hard",
            "expectedKeywords": ["token bucket", "leaky bucket", "redis", "sliding window", "distributed", "concurrency", "http 429", "latency"],
            "modelAnswer": "I would design a distributed rate limiter using the Token Bucket or Sliding Window Log algorithm backed by an in-memory cache like Redis. For high throughput, a Redis cluster using Lua scripts can perform atomic decrement and timestamp verification with sub-millisecond latency. If a client exceeds the allowable rate threshold (e.g., 100 requests per minute), the API gateway immediately returns HTTP 429 Too Many Requests along with a Retry-After header."
        },
        {
            "id": "SE4",
            "title": "Explain the SOLID principles of Object-Oriented Design with a practical example.",
              "category": "Software Architecture",
            "difficulty": "Medium",
            "expectedKeywords": ["single responsibility", "open/closed", "liskov", "interface segregation", "dependency inversion", "maintainability", "decoupling"],
            "modelAnswer": "SOLID represents five key principles: Single Responsibility (a class should have one reason to change), Open/Closed (classes should be open for extension but closed for modification, achieved via inheritance/interfaces), Liskov Substitution (subtypes must be substitutable for their base types), Interface Segregation (clients shouldn't be forced to depend on interfaces they do not use), and Dependency Inversion (high-level modules should depend on abstractions rather than concrete implementations)."
        }
    ],
    "data_science_ai": [
        {
            "id": "DS1",
            "title": "What is the Bias-Variance Tradeoff and how do you diagnose high variance versus high bias?",
            "category": "Machine Learning",
            "difficulty": "Medium",
            "expectedKeywords": ["bias", "variance", "overfitting", "underfitting", "training error", "validation error", "regularization", "cross-validation"],
            "modelAnswer": "The bias-variance tradeoff balances model underfitting and overfitting. High bias occurs when an overly simplistic model fails to capture underlying patterns, leading to high training and validation errors. High variance occurs when a model memorizes noise in the training set, causing low training error but high validation error. High variance can be diagnosed via learning curves and mitigated using regularization (L1/L2), dropout, pruning, or gathering more training data."
        },
       {
            "id": "DS2",
            "title": "How does the Transformer Attention mechanism (Self-Attention) work compared to RNNs?",
            "category": "Deep Learning & NLP",
            "difficulty": "Hard",
            "expectedKeywords": ["query", "key", "value", "dot product", "softmax", "parallelization", "long-range dependencies", "sequential"],
            "modelAnswer": "Unlike recurrent neural networks (RNNs) that process tokens sequentially and suffer from vanishing gradients and bottlenecked recurrence, the Transformer's scaled dot-product attention computes interactions between all tokens in parallel. It transforms input representations into Queries (Q), Keys (K), and Values (V). Attention weights are computed as softmax((Q * K^T) / sqrt(d_k)), and then multiplied by V. This enables the model to capture long-range contextual relationships in constant sequential operations."
        },
         {
            "id": "DS3",
            "title": "Explain the difference between ROC-AUC and PR-AUC. When should you prefer Precision-Recall curves?",
                    "category": "Evaluation Metrics",
            "difficulty": "Medium",
            "expectedKeywords": ["roc", "pr", "imbalanced", "false positive", "true positive", "precision", "recall", "skewed"],
            "modelAnswer": "ROC curves plot True Positive Rate against False Positive Rate. PR curves plot Precision against Recall. In severely imbalanced datasets where the negative class dominates (e.g., fraud detection or rare disease diagnosis), ROC curves can look deceptively optimistic because the large denominator of True Negatives keeps FPR low. In such skewed scenarios, PR-AUC is preferred because it focuses exclusively on the positive minority class."
        }
    ],
    "full_stack": [
        {
            "id": "FS1",
            "title": "Explain how React's Virtual DOM and Reconciliation algorithm (Fiber) work.",
            "category": "Frontend Architecture",
            "difficulty": "Medium",
            "expectedKeywords": ["virtual dom", "reconciliation", "diffing", "fiber", "render tree", "re-render", "batching"],
            "modelAnswer": "The Virtual DOM is an in-memory representation of the real DOM tree. When component state changes, React constructs a new virtual DOM tree and diffs it against the previous one using its reconciliation algorithm. React Fiber splits this reconciliation work into incremental units with priority scheduling. Once the optimal minimal set of mutations is computed, React applies batch changes to the real DOM in a single commit phase, avoiding expensive browser layout thrashing."
        },
        {
            "id": "FS2",
            "title": "How do you protect a web application against Cross-Site Scripting (XSS) and CSRF attacks?",
            "category": "Web Security",
            "difficulty": "Hard",
            "expectedKeywords": ["xss", "csrf", "sanitization", "content security policy", "samesite", "httponly", "token", "cors"],
            "modelAnswer": "To mitigate XSS, all user input must be sanitized and contextual HTML-escaped. Furthermore, implementing a strict Content Security Policy (CSP) headers and storing session tokens in HttpOnly, Secure, SameSite cookies prevents client-side JavaScript access. For CSRF, ensure state-changing requests use anti-CSRF tokens verified on the server, enforce SameSite=Strict/Lax cookie policies, and verify Origin/Referer HTTP headers."
        }
    ],
    "behavioral": [
         {
            "id": "BH1",
            "title": "Tell me about a time you worked on a challenging project with tight deadlines. How did you prioritize tasks?",
            "category": "Leadership & Execution",
            "difficulty": "Medium",
            "expectedKeywords": ["star method", "situation", "task", "action", "result", "prioritization", "communication", "delivery"],
            "modelAnswer": "Using the STAR method: In my junior year software engineering project, our team faced a 3-week deadline to deliver a campus resource portal while dealing with unexpected member absences. As team lead, I audited the core requirements, established an MVP backlog, and prioritized high-impact modules using an Eisenhower matrix. We conducted daily 10-minute standups, automated testing, and delivered the functioning portal two days early with 99.4% test coverage."
        },
         {
            "id": "BH2",
            "title": "Describe a situation where you had a technical disagreement with a team member. How did you resolve it?",
            "category": "Collaboration",
            "difficulty": "Medium",
            "expectedKeywords": ["disagreement", "listen", "objective data", "benchmarking", "compromise", "team consensus", "outcome"],
            "modelAnswer": "During our database design phase, a teammate preferred MongoDB for speed, while I advocated for PostgreSQL due to strict relational data consistency. Rather than debating opinions, I set up a quick 1-day spike benchmarking both solutions against our expected schema query patterns. The benchmarks showed Postgres handled our complex joins 3x faster with guaranteed ACID compliance. We reviewed the data together, aligned on Postgres, and maintained positive team trust."
        }
    ]
}
initial_tasks = [
    {
        "id": "TSK-001",
        "title": "Revise Dynamic Programming & Graph Algorithms",
        "subject": "Algorithms & Complexity",
        "dueDate": "2026-10-15",
        "priority": "High",
        "completed": False,
        "estHours": 3.5,
        "notes": "Solve 5 DP problems on LeetCode/HackerRank before mid-semester test"
    },
    {
        "id": "TSK-002",
        "title": "Complete Machine Learning Lab Assignment 3",
        "subject": "Machine Learning Systems",
        "dueDate": "2026-10-16",
        "priority": "High",
        "completed": False,
        "estHours": 2.5,
        "notes": "Implement SVM with RBF kernel and plot decision boundaries"
    },
    {
        "id": "TSK-003",
        "title": "Review Database Normalization (3NF & BCNF)",
        "subject": "Database Management Systems",
        "dueDate": "2026-10-17",
        "priority": "Medium",
        "completed": True,
        "estHours": 2.0,
        "notes": "Practice schema decomposition drills from lecture notes"
    },
    {
        "id": "TSK-004",
        "title": "Attend Remedial Tutoring Clinic for Operating Systems",
        "subject": "Operating Systems",
        "dueDate": "2026-10-18",
        "priority": "High",
        "completed": False,
        "estHours": 1.5,
        "notes": "Mandatory clinic: Paging & Virtual Memory with TA mentor"
    },
      {
        "id": "TSK-005",
        "title": "Draft Technical Portfolio & Resume for Placement Cell",
        "subject": "Career Development",
        "dueDate": "2026-10-20",
        "priority": "Medium",
        "completed": False,
        "estHours": 3.0,
        "notes": "Use Campus Pulse AI Resume Builder to target SWE Intern roles"
    }
]
initial_alerts = [
    {
        "id": "ALT-001",
        "type": "critical",
        "title": "Severe Attendance Alert",
        "message": "18 students have dropped below 70% minimum attendance threshold across Engineering streams. Action required.",
        "timestamp": "10 mins ago",
        "actionText": "Review At-Risk Students",
                "actionTarget": "analytics-at-risk",
        "read": False
    },
    {
        "id": "ALT-002",
        "type": "warning",
        "title": "Midterm Exam Approaching",
        "message": "Algorithms & Complexity (CS301) exam scheduled in 9 days (Oct 18, 2026). Recommended study revision active.",
        "timestamp": "1 hour ago",
        "actionText": "View Exam Timetable",
        "actionTarget": "timetable",
        "read": False
    },
    {
        "id": "ALT-003",
        "type": "info",
        "title": "Automated Intervention Triggered",
        "message": "Campus Pulse AI generated 24 new personalized academic improvement prescriptions for Grade D & F students.",
        "timestamp": "3 hours ago",
        "actionText": "Open Action Hub",
        "actionTarget": "action-hub",
        "read": False
    },
     {
        "id": "ALT-004",
        "type": "success",
        "title": "Placement Drive Announced",
        "message": "TechCorp & CloudScale Campus Placement Drive opens Oct 25. Complete your AI Resume & Mock Interview prep now.",
        "timestamp": "Yesterday",
        "actionText": "Build Resume",
        "actionTarget": "resume",
        "read": True
    }
]
js_code = f"""/**
 * Campus Pulse AI - Core Data Registry
 * Contains datasets, summary metrics, exams, tasks, mock interview questions, and alerts.
 * Supports zero-setup offline execution (file://) and online HTTP serving.
 */
window.CAMPUS_DATA = {{
  summary: {json.dumps(summary, indent=2)},
  students: {json.dumps(sample_students, indent=2)},
  totalStudentCount: {len(all_students)},
  exams: {json.dumps(exams, indent=2)},
  tasks: {json.dumps(initial_tasks, indent=2)},
  alerts: {json.dumps(initial_alerts, indent=2)},
  interviewQuestions: {json.dumps(interview_questions, indent=2)}
}};
console.log("Campus Pulse AI Data Registry initialized with", window.CAMPUS_DATA.students.length, "embedded records out of", window.CAMPUS_DATA.totalStudentCount, "total records.");
"""
import os
os.makedirs("js", exist_ok=True)
with open("js/data.js", "w", encoding="utf-8") as f:
    f.write(js_code)
print("Generated js/data.js successfully.")