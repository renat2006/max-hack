import type {
  DecisionTreeDataPoint,
  DecisionTreeQuestion,
  DecisionTreeNode,
} from "./decision-tree-types";

// Вычисление энтропии для набора данных
export function calculateEntropy(data: DecisionTreeDataPoint[]): number {
  if (data.length === 0) return 0;

  const labelCounts = new Map<string, number>();
  data.forEach((point) => {
    labelCounts.set(point.label, (labelCounts.get(point.label) || 0) + 1);
  });

  let entropy = 0;
  const total = data.length;

  labelCounts.forEach((count) => {
    const probability = count / total;
    if (probability > 0) {
      entropy -= probability * Math.log2(probability);
    }
  });

  return entropy;
}

// Вычисление Gini Impurity
export function calculateGiniImpurity(data: DecisionTreeDataPoint[]): number {
  if (data.length === 0) return 0;

  const labelCounts = new Map<string, number>();
  data.forEach((point) => {
    labelCounts.set(point.label, (labelCounts.get(point.label) || 0) + 1);
  });

  let gini = 1;
  const total = data.length;

  labelCounts.forEach((count) => {
    const probability = count / total;
    gini -= probability * probability;
  });

  return gini;
}

// Разделение данных по вопросу
export function splitData(
  data: DecisionTreeDataPoint[],
  question: DecisionTreeQuestion,
): { yes: DecisionTreeDataPoint[]; no: DecisionTreeDataPoint[] } {
  const yes: DecisionTreeDataPoint[] = [];
  const no: DecisionTreeDataPoint[] = [];

  data.forEach((point) => {
    const value = point.features[question.feature];

    if (question.type === "categorical") {
      if (question.categories?.includes(String(value))) {
        yes.push(point);
      } else {
        no.push(point);
      }
    } else if (question.type === "numerical" && question.threshold !== undefined) {
      if (Number(value) >= question.threshold) {
        yes.push(point);
      } else {
        no.push(point);
      }
    }
  });

  return { yes, no };
}

// Вычисление Information Gain
export function calculateInformationGain(
  data: DecisionTreeDataPoint[],
  question: DecisionTreeQuestion,
): number {
  const baseEntropy = calculateEntropy(data);
  const { yes, no } = splitData(data, question);

  if (yes.length === 0 || no.length === 0) return 0;

  const weightedEntropy =
    (yes.length / data.length) * calculateEntropy(yes) +
    (no.length / data.length) * calculateEntropy(no);

  return baseEntropy - weightedEntropy;
}

// Обновление Information Gain для всех вопросов
export function updateQuestionsInfoGain(
  questions: DecisionTreeQuestion[],
  data: DecisionTreeDataPoint[],
): DecisionTreeQuestion[] {
  return questions.map((q) => ({
    ...q,
    infoGain: calculateInformationGain(data, q),
  }));
}

// Определение лучшего предсказания для листа
export function getBestPrediction(data: DecisionTreeDataPoint[]): {
  label: string;
  confidence: number;
} {
  if (data.length === 0) return { label: "unknown", confidence: 0 };

  const labelCounts = new Map<string, number>();
  data.forEach((point) => {
    labelCounts.set(point.label, (labelCounts.get(point.label) || 0) + 1);
  });

  let maxCount = 0;
  let bestLabel = "";

  labelCounts.forEach((count, label) => {
    if (count > maxCount) {
      maxCount = count;
      bestLabel = label;
    }
  });

  return {
    label: bestLabel,
    confidence: (maxCount / data.length) * 100,
  };
}

// Вычисление глубины дерева
export function calculateTreeDepth(node: DecisionTreeNode): number {
  if (!node.yesChild && !node.noChild) return node.depth;

  const yesDepth = node.yesChild ? calculateTreeDepth(node.yesChild) : 0;
  const noDepth = node.noChild ? calculateTreeDepth(node.noChild) : 0;

  return Math.max(yesDepth, noDepth);
}

// Подсчет точности дерева
export function calculateAccuracy(
  rootNode: DecisionTreeNode,
  testData: DecisionTreeDataPoint[],
): number {
  let correct = 0;

  testData.forEach((point) => {
    const prediction = predictDataPoint(rootNode, point);
    if (prediction === point.label) {
      correct++;
    }
  });

  return (correct / testData.length) * 100;
}

// Предсказание для одной точки
function predictDataPoint(node: DecisionTreeNode, point: DecisionTreeDataPoint): string {
  // Если это лист
  if (node.prediction) {
    return node.prediction;
  }

  // Если есть вопрос
  if (node.question) {
    const { yes } = splitData([point], node.question);
    const goYes = yes.length > 0;

    if (goYes && node.yesChild) {
      return predictDataPoint(node.yesChild, point);
    } else if (!goYes && node.noChild) {
      return predictDataPoint(node.noChild, point);
    }
  }

  // Fallback
  return getBestPrediction(node.data).label;
}

// Подсчет очков
export function calculateScore(
  accuracy: number,
  depth: number,
  targetDepth: number,
  timeSeconds: number,
): number {
  const accuracyScore = accuracy * 10; // 0-1000 очков
  const depthBonus = Math.max(0, (targetDepth - depth) * 50); // Бонус за меньшую глубину
  const timeBonus = Math.max(0, 300 - timeSeconds); // Бонус за скорость

  return Math.round(accuracyScore + depthBonus + timeBonus);
}

// Подсчет количества узлов
export function countNodes(node: DecisionTreeNode): { total: number; leaves: number } {
  let total = 1;
  let leaves = 0;

  if (!node.yesChild && !node.noChild) {
    leaves = 1;
  } else {
    if (node.yesChild) {
      const yesCount = countNodes(node.yesChild);
      total += yesCount.total;
      leaves += yesCount.leaves;
    }
    if (node.noChild) {
      const noCount = countNodes(node.noChild);
      total += noCount.total;
      leaves += noCount.leaves;
    }
  }

  return { total, leaves };
}
