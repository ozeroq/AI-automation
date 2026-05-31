import Link from "next/link";

const TOOLS = [
  {
    slug: "cover-letter",
    emoji: "📝",
    title: "자기소개서 생성",
    desc: "지원 회사·직무·경험 3줄만 넣으면 자소서 초안이 30초 안에.",
  },
  {
    slug: "email",
    emoji: "✉️",
    title: "비즈니스 이메일",
    desc: "상황·톤·요점만 입력하면 정중한 한국어 이메일이 완성.",
  },
  {
    slug: "summary",
    emoji: "📋",
    title: "회의록·문서 요약",
    desc: "긴 회의록·기사·문서를 3줄/10줄/액션아이템으로 요약.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-16 max-w-3xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight">AI 도구 모음</h1>
        <p className="mt-3 text-lg opacity-80">
          자기소개서·이메일·요약을 30초 안에. <strong>하루 3번 무료</strong>.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {TOOLS.map((t) => (
          <Link
            key={t.slug}
            href={`/tools/${t.slug}`}
            className="block p-5 rounded-xl border hover:shadow-md transition"
          >
            <div className="text-3xl mb-2">{t.emoji}</div>
            <h2 className="font-semibold">{t.title}</h2>
            <p className="text-sm opacity-70 mt-1">{t.desc}</p>
          </Link>
        ))}
      </section>

      <section className="mt-16 p-6 rounded-xl bg-zinc-100 dark:bg-zinc-900">
        <h2 className="text-xl font-semibold mb-2">요금</h2>
        <ul className="text-sm space-y-1 opacity-90">
          <li>· 무료: 하루 3회 / 도구당</li>
          <li>· Pro: 월 9,900원 — 무제한 + GPT급 모델 + 히스토리 저장</li>
        </ul>
        <Link
          href="/pricing"
          className="inline-block mt-4 px-4 py-2 rounded-lg bg-black text-white text-sm"
        >
          Pro 시작하기
        </Link>
      </section>

      <footer className="mt-16 text-xs opacity-60">
        Powered by Claude · 데이터는 저장하지 않습니다.
      </footer>
    </main>
  );
}
