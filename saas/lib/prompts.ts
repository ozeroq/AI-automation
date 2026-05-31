export type ToolSlug = "cover-letter" | "email" | "summary";

interface ToolDef {
  label: string;
  system: string;
  buildUser: (input: Record<string, string>) => string;
  fields: { name: string; label: string; placeholder: string; multiline?: boolean }[];
}

export const TOOLS: Record<ToolSlug, ToolDef> = {
  "cover-letter": {
    label: "자기소개서 생성",
    system:
      "너는 한국 채용시장에 정통한 자기소개서 코치다. 과장 없이 구체적 경험 기반으로 작성한다. " +
      "출력은 4개 문단(지원동기 / 핵심역량 / 대표 경험 / 입사 후 포부) 한국어 본문만.",
    buildUser: ({ company, role, experience }) =>
      `지원 회사: ${company}\n직무: ${role}\n핵심 경험 3줄:\n${experience}\n\n위 정보로 800자 내외 자기소개서 작성.`,
    fields: [
      { name: "company", label: "지원 회사", placeholder: "예) 카카오" },
      { name: "role", label: "직무", placeholder: "예) 백엔드 엔지니어" },
      {
        name: "experience",
        label: "핵심 경험 3줄",
        placeholder: "예) 스타트업에서 결제 시스템 0→1 구축 / TPS 5배 개선 / ...",
        multiline: true,
      },
    ],
  },
  email: {
    label: "비즈니스 이메일",
    system:
      "너는 한국 직장 문화를 잘 아는 이메일 작성 보조다. 정중하고 간결하게. " +
      "출력은 '제목:' 1줄 + 본문 5~10줄.",
    buildUser: ({ situation, tone, points }) =>
      `상황: ${situation}\n원하는 톤: ${tone}\n포함할 요점:\n${points}\n\n위에 맞게 이메일 작성.`,
    fields: [
      {
        name: "situation",
        label: "상황",
        placeholder: "예) 거래처에 결제 일정 1주 지연 양해 요청",
        multiline: true,
      },
      { name: "tone", label: "톤", placeholder: "예) 정중하지만 단호하게" },
      {
        name: "points",
        label: "포함할 요점",
        placeholder: "예) 사유, 새 일정, 보상안",
        multiline: true,
      },
    ],
  },
  summary: {
    label: "회의록·문서 요약",
    system:
      "너는 한국어 요약 엔진이다. 출력 형식: '## 한 줄 요약' / '## 핵심 3가지' / '## 액션 아이템'.",
    buildUser: ({ text }) => `다음을 요약:\n\n${text}`,
    fields: [
      {
        name: "text",
        label: "원문",
        placeholder: "회의록·기사·문서를 붙여넣으세요 (최대 ~5000자).",
        multiline: true,
      },
    ],
  },
};
