// Упрощенная arcade версия Decision Tree игры
// Геймплей: Пошаговая классификация объектов с immediate feedback

export type SimpleDecisionCase = {
  id: string;
  emoji: string;
  title: string;
  features: Record<string, string | number | boolean>;
  correctAnswer: "yes" | "no";
  explanation: string;
};

export type SimpleDecisionChallenge = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  question: string; // Основной вопрос (например "Approve Loan?")
  cases: SimpleDecisionCase[];
  difficulty: "easy" | "medium" | "hard";
  timePerCase: number; // секунды на один кейс
  passingScore: number; // процент правильных ответов
};

// Loan Approval Challenge
export const LOAN_APPROVAL_CHALLENGE: SimpleDecisionChallenge = {
  id: "loan-approval",
  title: "Loan Approval",
  emoji: "🏦",
  description: "Quick decision: Approve or reject loan applications",
  question: "Approve Loan?",
  difficulty: "easy",
  timePerCase: 8,
  passingScore: 70,
  cases: [
    {
      id: "case1",
      emoji: "👨‍💼",
      title: "John, 35",
      features: {
        income: "$85,000/year",
        credit: "750 (Excellent)",
        employed: "5 years",
      },
      correctAnswer: "yes",
      explanation: "High income + excellent credit = Low risk",
    },
    {
      id: "case2",
      emoji: "👩‍🎓",
      title: "Sarah, 22",
      features: {
        income: "$22,000/year",
        credit: "580 (Fair)",
        employed: "6 months",
      },
      correctAnswer: "no",
      explanation: "Low income + short employment = High risk",
    },
    {
      id: "case3",
      emoji: "👨‍🔧",
      title: "Mike, 45",
      features: {
        income: "$65,000/year",
        credit: "700 (Good)",
        employed: "10 years",
      },
      correctAnswer: "yes",
      explanation: "Stable employment + good credit = Approved",
    },
    {
      id: "case4",
      emoji: "👩‍💻",
      title: "Lisa, 28",
      features: {
        income: "$55,000/year",
        credit: "680 (Good)",
        employed: "3 years",
      },
      correctAnswer: "yes",
      explanation: "Decent income + good credit = Approved",
    },
    {
      id: "case5",
      emoji: "👨",
      title: "Tom, 19",
      features: {
        income: "$18,000/year",
        credit: "550 (Poor)",
        employed: "2 months",
      },
      correctAnswer: "no",
      explanation: "Very low income + poor credit = Rejected",
    },
    {
      id: "case6",
      emoji: "👩‍⚕️",
      title: "Emma, 38",
      features: {
        income: "$95,000/year",
        credit: "780 (Excellent)",
        employed: "8 years",
      },
      correctAnswer: "yes",
      explanation: "High income + excellent credit = Easy approval",
    },
    {
      id: "case7",
      emoji: "👨‍🎨",
      title: "Alex, 26",
      features: {
        income: "$32,000/year",
        credit: "620 (Fair)",
        employed: "1 year",
      },
      correctAnswer: "no",
      explanation: "Borderline income + fair credit = Too risky",
    },
    {
      id: "case8",
      emoji: "👩‍🏫",
      title: "Kate, 42",
      features: {
        income: "$72,000/year",
        credit: "720 (Good)",
        employed: "12 years",
      },
      correctAnswer: "yes",
      explanation: "Long employment + solid credit = Approved",
    },
  ],
};

// Medical Diagnosis Challenge
export const MEDICAL_DIAGNOSIS_CHALLENGE: SimpleDecisionChallenge = {
  id: "medical-risk",
  title: "Medical Risk",
  emoji: "🏥",
  description: "Assess patient risk level for insurance",
  question: "High Risk?",
  difficulty: "medium",
  timePerCase: 9,
  passingScore: 75,
  cases: [
    {
      id: "case1",
      emoji: "🧑",
      title: "Patient A",
      features: {
        age: "25 years",
        BMI: "22 (Normal)",
        smoker: "No",
        exercise: "Regular",
      },
      correctAnswer: "no",
      explanation: "Young + healthy lifestyle = Low risk",
    },
    {
      id: "case2",
      emoji: "👴",
      title: "Patient B",
      features: {
        age: "68 years",
        BMI: "32 (Obese)",
        smoker: "Yes (20 years)",
        exercise: "None",
      },
      correctAnswer: "yes",
      explanation: "Senior + multiple risk factors = High risk",
    },
    {
      id: "case3",
      emoji: "👨‍🦳",
      title: "Patient C",
      features: {
        age: "55 years",
        BMI: "26 (Overweight)",
        smoker: "No",
        exercise: "Moderate",
      },
      correctAnswer: "no",
      explanation: "Middle age + active lifestyle = Manageable risk",
    },
    {
      id: "case4",
      emoji: "👩",
      title: "Patient D",
      features: {
        age: "42 years",
        BMI: "35 (Obese)",
        smoker: "Yes (10 years)",
        exercise: "Rare",
      },
      correctAnswer: "yes",
      explanation: "Obesity + smoking = High risk category",
    },
    {
      id: "case5",
      emoji: "🧑‍🦱",
      title: "Patient E",
      features: {
        age: "30 years",
        BMI: "21 (Normal)",
        smoker: "No",
        exercise: "Daily",
      },
      correctAnswer: "no",
      explanation: "Young + very active = Low risk",
    },
    {
      id: "case6",
      emoji: "👵",
      title: "Patient F",
      features: {
        age: "72 years",
        BMI: "28 (Overweight)",
        smoker: "Former (quit 15y ago)",
        exercise: "Light",
      },
      correctAnswer: "no",
      explanation: "Senior but quit smoking + stays active = Moderate risk",
    },
  ],
};

// Job Matching Challenge
export const JOB_MATCHING_CHALLENGE: SimpleDecisionChallenge = {
  id: "job-match",
  title: "Job Match",
  emoji: "💼",
  description: "Match candidates to senior developer role",
  question: "Good Fit?",
  difficulty: "hard",
  timePerCase: 10,
  passingScore: 80,
  cases: [
    {
      id: "case1",
      emoji: "👨‍💻",
      title: "Candidate A",
      features: {
        experience: "12 years",
        education: "MS Computer Science",
        skills: "React, Node, AWS",
        leadership: "Led 5 teams",
      },
      correctAnswer: "yes",
      explanation: "Senior experience + strong leadership = Perfect match",
    },
    {
      id: "case2",
      emoji: "👩‍🎓",
      title: "Candidate B",
      features: {
        experience: "1 year",
        education: "BS Computer Science",
        skills: "HTML, CSS, JavaScript",
        leadership: "None",
      },
      correctAnswer: "no",
      explanation: "Junior level + no leadership = Not ready for senior role",
    },
    {
      id: "case3",
      emoji: "👨‍🔬",
      title: "Candidate C",
      features: {
        experience: "8 years",
        education: "PhD Computer Science",
        skills: "Python, ML, Data",
        leadership: "Research team lead",
      },
      correctAnswer: "yes",
      explanation: "Strong academic + tech lead experience = Good fit",
    },
    {
      id: "case4",
      emoji: "👩‍💼",
      title: "Candidate D",
      features: {
        experience: "15 years (Java)",
        education: "BS Engineering",
        skills: "Java, Spring, SQL",
        leadership: "Architecture lead",
      },
      correctAnswer: "no",
      explanation: "Wrong tech stack (Java vs React/Node) = Not a match",
    },
    {
      id: "case5",
      emoji: "👨‍🏫",
      title: "Candidate E",
      features: {
        experience: "10 years",
        education: "BS Computer Science",
        skills: "React, Node, TypeScript",
        leadership: "Senior engineer",
      },
      correctAnswer: "yes",
      explanation: "Perfect tech stack + senior level = Great match",
    },
  ],
};

export const SIMPLE_DECISION_CHALLENGES = [
  LOAN_APPROVAL_CHALLENGE,
  MEDICAL_DIAGNOSIS_CHALLENGE,
  JOB_MATCHING_CHALLENGE,
];
