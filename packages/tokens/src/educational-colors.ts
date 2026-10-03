/**
 * Educational Color Palette & Behavioral Observation State System
 *
 * Grounded in:
 * 1. Cognitive Load Theory (Sweller, 1988) - Minimizing extraneous visual load with controlled saturation.
 * 2. Affective Filter Hypothesis (Krashen, 1982) - Non-punitive constructive error feedback (Terracotta vs Neon Red).
 * 3. Attention Restoration Theory (Kaplan, 1995) - Soft Sage & Azure promoting sustained reading and problem solving.
 * 4. Zone of Proximal Development & Scaffolding (Vygotsky, 1978) - Warm Amber signaling hints and guided reflection.
 * 5. Visual Stress & Neurodiversity (Irlen, 1991 / BDA Dyslexia Guidelines) - Low-glare cream background option.
 * 6. Anonymous Learning Analytics & Behavioral Telemetry (Learning Analytics Community standards) - Zero-PII state visualization.
 */

export interface EducationalColorDefinition {
  id: string;
  name: string;
  category: "pedagogy" | "behavior_observation" | "accessibility";
  pedagogicalRole: string;
  psychologicalImpact: string;
  light: {
    base: string;
    fg: string;
    surface: string;
    contrastOnBg: number;
  };
  dark: {
    base: string;
    fg: string;
    surface: string;
    contrastOnBg: number;
  };
  telemetryStateKey?: "focus" | "struggle" | "idle" | "mastery" | "overload" | "explore";
}

export const EDUCATIONAL_COLORS: Record<string, EducationalColorDefinition> = {
  focus: {
    id: "edu-focus",
    name: "포커스 애저 (Focus Azure)",
    category: "pedagogy",
    pedagogicalRole: "핵심 개념 강조, 작업 기억 부하를 줄이는 주 정보 전달",
    psychologicalImpact: "주의력을 집중시키고 인지적 안정감을 유도하여 장시간 몰입 지원",
    light: {
      base: "#1d4ed8",
      fg: "#ffffff",
      surface: "#eff6ff",
      contrastOnBg: 7.5,
    },
    dark: {
      base: "#93c5fd",
      fg: "#0b0c0f",
      surface: "#172554",
      contrastOnBg: 9.8,
    },
    telemetryStateKey: "focus",
  },
  scaffold: {
    id: "edu-scaffold",
    name: "스캐폴딩 앰버 (Scaffold Amber)",
    category: "pedagogy",
    pedagogicalRole: "힌트, 단계별 문제 해결 가이드, 사고 촉진(Prompting) 안내",
    psychologicalImpact: "경고나 질책이 아닌 따뜻한 조력과 탐색 유도 (근접발달영역 ZPD 비계 설정)",
    light: {
      base: "#b45309",
      fg: "#ffffff",
      surface: "#fffbeb",
      contrastOnBg: 5.2,
    },
    dark: {
      base: "#fcd34d",
      fg: "#0b0c0f",
      surface: "#451a03",
      contrastOnBg: 12.1,
    },
    telemetryStateKey: "struggle",
  },
  mastery: {
    id: "edu-mastery",
    name: "마스터리 에메랄드 (Mastery Emerald)",
    category: "pedagogy",
    pedagogicalRole: "정답 확인, 개념 마스터, 성취감 및 긍정적 강화(Positive Reinforcement)",
    psychologicalImpact: "도파민 보상 회로를 건강하게 자극하여 자기효능감(Self-efficacy) 강화",
    light: {
      base: "#047857",
      fg: "#ffffff",
      surface: "#ecfdf5",
      contrastOnBg: 5.4,
    },
    dark: {
      base: "#6ee7b7",
      fg: "#0b0c0f",
      surface: "#022c22",
      contrastOnBg: 11.5,
    },
    telemetryStateKey: "mastery",
  },
  feedback: {
    id: "edu-feedback",
    name: "피드백 테라코타 (Feedback Terracotta)",
    category: "pedagogy",
    pedagogicalRole: "오답 수정 안내, 오개념(Misconception) 교정, 재도전 기회 제시",
    psychologicalImpact: "기존 강렬한 네온 레드의 불안감/위협(Affective Filter)을 억제하고 건설적 회복탄력성 형성",
    light: {
      base: "#b91c1c",
      fg: "#ffffff",
      surface: "#fef2f2",
      contrastOnBg: 6.2,
    },
    dark: {
      base: "#fca5a5",
      fg: "#0b0c0f",
      surface: "#450a0a",
      contrastOnBg: 9.2,
    },
    telemetryStateKey: "overload",
  },
  explore: {
    id: "edu-explore",
    name: "익스플로어 바이올렛 (Explore Violet)",
    category: "pedagogy",
    pedagogicalRole: "가상 교구(CPA 모델) 조작, 수학적 시각화, 대안적 풀이 경로 탐구",
    psychologicalImpact: "호기심을 자극하고 유연한 사고와 실험적 태도(Playful Learning) 고취",
    light: {
      base: "#6d28d9",
      fg: "#ffffff",
      surface: "#f5f3ff",
      contrastOnBg: 7.8,
    },
    dark: {
      base: "#c4b5fd",
      fg: "#0b0c0f",
      surface: "#2e1065",
      contrastOnBg: 9.6,
    },
    telemetryStateKey: "explore",
  },
  calm: {
    id: "edu-calm",
    name: "세레니티 틸 (Serenity Teal)",
    category: "accessibility",
    pedagogicalRole: "긴 지문 독해, 장시간 시험 환경에서 시각 피로 완화 및 심박 안정",
    psychologicalImpact: "시각 자극의 급격한 변동을 줄여 주의력 결핍 및 난독 성향 학생의 편안한 정독 유도",
    light: {
      base: "#0369a1",
      fg: "#ffffff",
      surface: "#f0f9ff",
      contrastOnBg: 5.9,
    },
    dark: {
      base: "#7dd3fc",
      fg: "#0b0c0f",
      surface: "#082f49",
      contrastOnBg: 10.7,
    },
  },
  idle: {
    id: "edu-idle",
    name: "뉴트럴 슬레이트 (Neutral Slate)",
    category: "behavior_observation",
    pedagogicalRole: "학습자 유휴(Idle), 시선 이탈, 대기 상태 무기명 관찰 지표",
    psychologicalImpact: "판단이나 평가를 배제한 중립적 상태 표현으로 불필요한 스트레스 방지",
    light: {
      base: "#475569",
      fg: "#ffffff",
      surface: "#f8fafc",
      contrastOnBg: 4.8,
    },
    dark: {
      base: "#94a3b8",
      fg: "#0b0c0f",
      surface: "#1e293b",
      contrastOnBg: 6.2,
    },
    telemetryStateKey: "idle",
  },
};

/**
 * State mappings for anonymous behavioral observation heatmaps
 */
export const BEHAVIORAL_OBSERVATION_STATES = {
  focus: {
    label: "몰입 / 온태스크",
    description: "문항을 지속적으로 읽거나 정상적인 속도로 인터랙션을 진행 중",
    colorLight: "#1d4ed8",
    colorDark: "#93c5fd",
    badgeBg: "#eff6ff",
    badgeFg: "#1d4ed8",
  },
  struggle: {
    label: "지체 / 스캐폴딩 필요",
    description: "동일 문항에 2분 이상 머무르거나 힌트 버튼 주변을 배회 중",
    colorLight: "#b45309",
    colorDark: "#fcd34d",
    badgeBg: "#fffbeb",
    badgeFg: "#b45309",
  },
  idle: {
    label: "유휴 / 이탈",
    description: "입력 없이 3분 이상 창 비활성 또는 정지 상태",
    colorLight: "#475569",
    colorDark: "#94a3b8",
    badgeBg: "#f1f5f9",
    badgeFg: "#475569",
  },
  mastery: {
    label: "완료 / 개념 숙달",
    description: "높은 정확도와 안정된 소요 시간으로 문제 풀이 완료",
    colorLight: "#047857",
    colorDark: "#6ee7b7",
    badgeBg: "#ecfdf5",
    badgeFg: "#047857",
  },
  overload: {
    label: "과부하 / 다중 재시도",
    description: "짧은 시간 내 3회 이상 연속 오답 또는 급격한 무작위 클릭",
    colorLight: "#b91c1c",
    colorDark: "#fca5a5",
    badgeBg: "#fef2f2",
    badgeFg: "#b91c1c",
  },
  explore: {
    label: "탐색 / 교구 조작",
    description: "가상 분수막대, 수직선, 수모형 등을 능동적으로 드래그·배치 중",
    colorLight: "#6d28d9",
    colorDark: "#c4b5fd",
    badgeBg: "#f5f3ff",
    badgeFg: "#6d28d9",
  },
} as const;

export type BehavioralStateKey = keyof typeof BEHAVIORAL_OBSERVATION_STATES;
