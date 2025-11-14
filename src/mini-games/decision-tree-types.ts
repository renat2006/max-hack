export type DecisionTreeDataPoint = {
  id: number;
  features: Record<string, string | number | boolean>;
  label: string; // Класс (например, "approved", "rejected")
  emoji?: string;
};

export type DecisionTreeQuestion = {
  id: string;
  feature: string;
  displayText: string;
  type: "categorical" | "numerical";
  threshold?: number; // Для числовых признаков
  categories?: string[]; // Для категориальных
  infoGain?: number; // Information Gain этого вопроса
};

export type DecisionTreeNode = {
  id: string;
  question?: DecisionTreeQuestion;
  data: DecisionTreeDataPoint[];
  yesChild?: DecisionTreeNode;
  noChild?: DecisionTreeNode;
  prediction?: string; // Если это лист
  confidence?: number; // % точности предсказания
  depth: number;
};

export type DecisionTreeChallenge = {
  id: string;
  title: string;
  description: string;
  dataset: DecisionTreeDataPoint[];
  availableQuestions: DecisionTreeQuestion[];
  targetDepth: number; // Целевая глубина дерева
  minAccuracy: number; // Минимальная точность (%)
  emoji: string;
};

export type DecisionTreeState = {
  rootNode: DecisionTreeNode;
  currentNode: DecisionTreeNode | null;
  completedNodes: Set<string>;
  accuracy: number;
  treeDepth: number;
  score: number;
};

export type DecisionTreeMetrics = {
  totalNodes: number;
  leafNodes: number;
  depth: number;
  accuracy: number;
  entropy: number;
  giniImpurity: number;
};
