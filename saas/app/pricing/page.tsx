import Link from "next/link";

export default function Pricing() {
  return (
    <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto">
      <Link href="/" className="text-sm opacity-70 hover:underline">
        ← 홈
      </Link>
      <h1 className="text-3xl font-bold mt-4">요금</h1>
      <p className="opacity-70 mt-2">
        가입·결제 없이 모든 도구를 하루 3회 무료로 사용할 수 있습니다.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mt-8">
        <div className="p-6 rounded-2xl border">
          <h2 className="font-semibold text-lg">Free</h2>
          <p className="text-3xl font-bold mt-2">₩0</p>
          <ul className="text-sm mt-4 space-y-1 opacity-90">
            <li>· 도구별 하루 3회</li>
            <li>· 결과 다운로드 불가</li>
            <li>· 표준 모델</li>
          </ul>
        </div>
        <div className="p-6 rounded-2xl border-2 border-black">
          <h2 className="font-semibold text-lg">Pro</h2>
          <p className="text-3xl font-bold mt-2">
            ₩9,900<span className="text-base opacity-60">/월</span>
          </p>
          <ul className="text-sm mt-4 space-y-1 opacity-90">
            <li>· 모든 도구 무제한</li>
            <li>· Claude Opus 사용</li>
            <li>· 히스토리 30일 저장</li>
            <li>· 우선 응답 큐</li>
          </ul>
          <Link
            href="/api/checkout?plan=pro"
            className="block mt-6 px-4 py-3 rounded-lg bg-black text-white text-center"
          >
            Pro 시작하기
          </Link>
        </div>
      </div>

      <p className="text-xs opacity-60 mt-8">
        ※ Stripe 환경변수 설정 후 결제 활성화됩니다. (`.env.example` 참고)
      </p>
    </main>
  );
}
