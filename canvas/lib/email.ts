export type SendResult = {
  sent: boolean;
  debug_link?: string; // RESEND 미설정 + non-prod 일 때만
  error?: string;
};

export async function sendMagicLink(
  to: string,
  link: string,
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "PixelRoom <onboarding@resend.dev>";
  const isProd = process.env.NODE_ENV === "production";

  if (!apiKey) {
    if (isProd) {
      console.error("[email] RESEND_API_KEY 미설정. 운영 환경에서는 필수.");
      return { sent: false, error: "이메일 서비스 미설정" };
    }
    console.log(`[email][dev] ${to} 로그인 링크: ${link}`);
    return { sent: false, debug_link: link };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject: "PixelRoom 로그인 링크",
        html: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
  <h2 style="font-size: 20px; margin: 0 0 12px;">PixelRoom 로그인</h2>
  <p style="font-size: 14px; color: #444; line-height: 1.5;">
    아래 버튼을 클릭하면 PixelRoom에 로그인됩니다 (30분 동안 유효).
  </p>
  <p style="margin: 28px 0;">
    <a href="${link}" style="display: inline-block; background: #ff3b81; color: white; padding: 12px 22px; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 14px;">
      로그인 →
    </a>
  </p>
  <p style="font-size: 12px; color: #888; line-height: 1.6;">
    버튼이 동작하지 않으면 아래 링크를 복사해 브라우저에 붙여넣으세요:<br>
    <span style="font-family: monospace; word-break: break-all; color: #666;">${link}</span>
  </p>
  <p style="font-size: 12px; color: #aaa; margin-top: 36px;">
    이 메일을 요청하지 않았다면 무시하셔도 됩니다.
  </p>
</div>`,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("[email] resend failed", res.status, text);
      return { sent: false, error: "메일 전송 실패" };
    }
    return { sent: true };
  } catch (e) {
    console.error("[email] fetch error", e);
    return { sent: false, error: "네트워크 오류" };
  }
}
