import csv
import json
import random
# Seed for reproducible realistic student profiles
random.seed(42)
first_names_f = ["Aanya", "Priya", "Sophia", "Emma", "Ananya", "Chloe", "Maya", "Sarah", "Elena", "Tanya", "Pooja", "Aisha", "Meera", "Zara", "Isabella", "Fatima", "Olivia", "Divya", "Neha", "Mira", "Kavya", "Sneha", "Rhea", "Emily", "Mia"]
first_names_m = ["Aarav", "Liam", "Rohan", "Marcus", "Devon", "Karthik", "Ethan", "Vikram", "Lucas", "Daniel", "Gabriel", "Samuel", "Jordan", "Noah", "Arjun", "Aditya", "Kabir", "Alex", "David", "Leo", "Nathan", "Zayn", "Ravi", "Kevin", "Ryan"]
last_names = ["Sharma", "Patel", "Chen", "Martinez", "Gupta", "Johnson", "Vance", "Deshmukh", "Brooks", "Krishnan", "Fatima", "Miller", "Davis", "Nair", "Lin", "Scott", "Al-Mansoor", "Iyer", "Rostova", "Kim", "Joshi", "Souza", "Verma", "Wilde", "Reddy", "Osei", "Rahman", "Bell", "Sen", "Wright", "Kaur", "Mehta", "Chopra", "Das", "Singh"]
departments = [
    "Computer Science & Engineering",
    "Data Science & AI",
    "Information Technology",
    "Mechanical Engineering",
    "Business Analytics & Management"
]
dept_skills = {
    "Computer Science & Engineering": [["C++", "Python", "Data Structures", "Docker", "Algorithms"], ["JavaScript", "React", "Node.js", "MongoDB", "Git"], ["Linux", "Cybersecurity", "Networking", "Python", "Wireshark"]],
    "Data Science & AI": [["Python", "Pandas", "Scikit-Learn", "SQL", "Tableau"], ["PyTorch", "Deep Learning", "NLP", "TensorFlow", "Computer Vision"], ["R", "Statistics", "Power BI", "Data Wrangling", "Big Data"]],
    "Information Technology": [["Cloud Computing", "AWS", "DevOps", "Kubernetes", "Linux"], ["Full Stack", "TypeScript", "Next.js", "PostgreSQL", "REST APIs"], ["Network Administration", "Cyber Security", "Database Systems", "SQL"]],
    "Mechanical Engineering": [["AutoCAD", "SolidWorks", "ANSYS", "FEA", "Thermodynamics"], ["Robotics", "MATLAB", "Mechatronics", "Control Systems", "CAD"], ["Manufacturing", "Quality Control", "Lean Six Sigma", "Materials Science"]],
    "Business Analytics & Management": [["Financial Modeling", "Excel VBA", "Power BI", "Tableau", "SQL"], ["Market Analytics", "Python", "Predictive Modeling", "Product Analytics"], ["Operations Research", "Supply Chain Analytics", "Data Storytelling", "Strategic Planning"]]
}
dept_subjects = {
    "Computer Science & Engineering": ["Algorithms & Complexity", "Operating Systems", "Database Management Systems", "Computer Networks", "Software Engineering"],
    "Data Science & AI": ["Machine Learning", "Deep Learning Foundations", "Big Data Processing", "Statistical Inference", "Data Mining & Warehousing"],
    "Information Technology": ["Cloud Infrastructure", "Web Application Development", "Information Security", "Enterprise Systems", "Distributed Computing"],
    "Mechanical Engineering": ["Thermodynamics", "Fluid Dynamics", "Mechanics of Materials", "Computer-Aided Design", "Heat Transfer"],
    "Business Analytics & Management": ["Predictive Business Analytics", "Financial Analytics", "Supply Chain Optimization", "Marketing Metrics", "Managerial Decision Science"]
}
grade_class_labels = {
    0.0: {"grade": "A", "label": "Dean's List / Excellent", "risk": "Dean's List", "badge_class": "badge-success"},
    1.0: {"grade": "B", "label": "Above Average", "risk": "On Track", "badge_class": "badge-info"},
    2.0: {"grade": "C", "label": "Average / Passing", "risk": "On Track", "badge_class": "badge-secondary"},
    3.0: {"grade": "D", "label": "Below Average / At Risk", "risk": "Moderate Risk", "badge_class": "badge-warning"},
    4.0: {"grade": "F", "label": "Critical / Failing", "risk": "High Risk", "badge_class": "badge-danger"}
}
input_csv = "data/Student_performance_data _.csv"
students = []
with open(input_csv, mode="r", encoding="utf-8-sig") as f:
    reader = csv.DictReader(f)
    for idx, row in enumerate(reader):
        student_id = row["StudentID"].strip()
        age = int(row["Age"])
        gender_code = int(row["Gender"]) # 0=Female, 1=Male or vice versa
        gender_str = "Male" if gender_code == 1 else "Female"
        if gender_str == "Male":
            name = f"{random.choice(first_names_m)} {random.choice(last_names)}"
        else:
            name = f"{random.choice(first_names_f)} {random.choice(last_names)}"
            
        study_hours = round(float(row["StudyTimeWeekly"]), 1)
        absences = int(row["Absences"])
        tutoring = int(row["Tutoring"])
        parental_support = int(row["ParentalSupport"])
        extracurricular = int(row["Extracurricular"])
        sports = int(row["Sports"])
        music = int(row["Music"])
        volunteering = int(row["Volunteering"])
        gpa = round(float(row["GPA"]), 2)
        raw_grade_class = float(row["GradeClass"]) if "GradeClass" in row and row["GradeClass"] else 2.0
        
        grade_info = grade_class_labels.get(raw_grade_class, grade_class_labels[2.0])
        # Calculate realistic attendance %
        # Assume 30 total lectures per semester course average
        attendance_pct = round(max(35.0, min(100.0, 100.0 - (absences * 2.15))), 1)
        
        # Assign department & semester deterministically based on StudentID
        id_num = int(student_id)
        dept = departments[id_num % len(departments)]
        semester = 2 + (id_num % 7) # Semester 2 to 8
        
        # Determine actionable risk level
        if gpa < 2.0 or absences >= 18 or raw_grade_class == 4.0:
            risk_level = "High Risk"
            status = "Immediate Intervention"
        elif gpa < 2.5 or absences >= 11 or raw_grade_class == 3.0:
            risk_level = "Moderate Risk"
            status = "Academic Watch"
        elif gpa >= 3.6 and absences <= 4:
            risk_level = "Dean's List"
            status = "Honors Track"
        else:
            risk_level = "On Track"
            status = "Good Standing"
            
        # Determine actionable recommendation & predicted outcome
        cur_subjects = dept_subjects[dept]
        weak_subject = cur_subjects[(id_num + 2) % len(cur_subjects)]
        strong_subject = cur_subjects[(id_num) % len(cur_subjects)]
        if risk_level == "High Risk":
            if tutoring == 0:
                action = f"Mandate 4 hrs/wk intensive tutoring in {weak_subject} & issue attendance warning notice"
                target_gpa = round(min(4.0, gpa + 0.85), 2)
                predicted_impact = f"+0.85 GPA recovery (to {target_gpa}), reduce dropout risk by 78%"
            else:
                action = f"Schedule mandatory Academic Advisor conference & personalized study clinic"
                target_gpa = round(min(4.0, gpa + 0.65), 2)
                predicted_impact = f"+0.65 GPA boost (to {target_gpa}), improve core module pass probability to 88%"
        elif risk_level == "Moderate Risk":
            if study_hours < 8.0:
                action = f"Enroll in Smart Planner structured study sessions (+4 hrs/wk) targeting {weak_subject}"
                target_gpa = round(min(4.0, gpa + 0.50), 2)
                predicted_impact = f"+0.50 GPA improvement (to {target_gpa}), elevate grade class to 'B'"
            else:
                action = f"Assign peer study group in {weak_subject} & bi-weekly progress reviews"
                target_gpa = round(min(4.0, gpa + 0.40), 2)
                predicted_impact = f"+0.40 GPA increase (to {target_gpa}), secure stable standing"
        elif risk_level == "Dean's List":
            action = "Fast-track for AI Research Assistantship, placement honors, and peer mentor leadership"
            predicted_impact = "Top 5% placement priority, accelerated corporate internship nomination"
        else: # On Track
            action = f"Recommend advanced elective certifications & technical hackathon participation in {strong_subject}"
            predicted_impact = "Strengthen placement readiness by 45%, qualify for semester honors"
            
        # Select skills
        skill_sets = dept_skills[dept]
        student_skills = skill_sets[id_num % len(skill_sets)]
        
        # Subject breakdown scores
        # synthesize realistic subject grades aligned with GPA
        base_subject_score = int(gpa * 22 + 10)
        subject_breakdown = []
        for s_idx, subj in enumerate(cur_subjects):
            delta = 6 if subj == strong_subject else (-14 if subj == weak_subject else random.randint(-4, 4))
            score = max(35, min(100, base_subject_score + delta))
            s_att = max(40, min(100, int(attendance_pct + random.randint(-5, 4))))
            subject_breakdown.append({
                "name": subj,
                "score": score,
                "attendance": s_att
            })
        students.append({
            "id": f"STU-{student_id}",
            "rawId": student_id,
            "name": name,
            "email": f"{name.lower().replace(' ', '.')}@campus.edu",
            "gender": gender_str,
            "age": age,
            "department": dept,
            "semester": semester,
            "gpa": gpa,
            "attendance": attendance_pct,
            "absences": absences,
            "studyHoursWeekly": study_hours,
            "tutoring": bool(tutoring),
            "parentalSupport": ["None", "Low", "Moderate", "High", "Very High"][parental_support],
            "extracurricular": bool(extracurricular),
            "sports": bool(sports),
            "music": bool(music),
            "volunteering": bool(volunteering),
            "gradeClass": grade_info["grade"],
            "gradeLabel": grade_info["label"],
            "riskLevel": risk_level,
            "status": status,
            "strongSubject": strong_subject,
            "weakSubject": weak_subject,
            "actionableRecommendation": action,
            "predictedImpact": predicted_impact,
            "skills": student_skills,
            "subjects": subject_breakdown
        })
print(f"Processed {len(students)} total student records successfully.")
# Save enriched JSON
with open("data/students_enriched.json", "w", encoding="utf-8") as f:
    json.dump(students, f, indent=2)
    # Save lightweight summary
summary = {
    "totalStudents": len(students),
    "averageGPA": round(sum(s["gpa"] for s in students) / len(students), 2),
    "averageAttendance": round(sum(s["attendance"] for s in students) / len(students), 1),
    "averageStudyHours": round(sum(s["studyHoursWeekly"] for s in students) / len(students), 1),
    "highRiskCount": sum(1 for s in students if s["riskLevel"] == "High Risk"),
    "moderateRiskCount": sum(1 for s in students if s["riskLevel"] == "Moderate Risk"),
    "onTrackCount": sum(1 for s in students if s["riskLevel"] == "On Track"),
    "deansListCount": sum(1 for s in students if s["riskLevel"] == "Dean's List"),
    "departments": departments,
    "gradeDistribution": {
        "A": sum(1 for s in students if s["gradeClass"] == "A"),
        "B": sum(1 for s in students if s["gradeClass"] == "B"),
        "C": sum(1 for s in students if s["gradeClass"] == "C"),
        "D": sum(1 for s in students if s["gradeClass"] == "D"),
        "F": sum(1 for s in students if s["gradeClass"] == "F")
    }
}
with open("data/dataset_summary.json", "w", encoding="utf-8") as f:
    json.dump(summary, f, indent=2)
    print("Generated data/students_enriched.json and data/dataset_summary.json successfully.")