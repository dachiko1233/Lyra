"""HTML email templates. UTF-8 throughout so multilingual content renders."""

from __future__ import annotations

_BASE = """\
<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;background:#f5f4ef;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1a1f1b;">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px;">
    <div style="font-weight:700;font-size:20px;color:#3c6e57;margin-bottom:24px;">Lyra</div>
    <div style="background:#ffffff;border:1px solid #dddace;border-radius:14px;padding:28px;">
      {body}
    </div>
    <p style="color:#6b716a;font-size:12px;margin-top:24px;text-align:center;">
      Lyra · Self-hosted, grounded AI support in 100+ languages.
    </p>
  </div>
</body>
</html>
"""


def _btn(href: str, label: str) -> str:
    return (
        f'<a href="{href}" '
        'style="display:inline-block;background:#3c6e57;color:#ffffff;'
        'text-decoration:none;font-weight:600;padding:12px 22px;border-radius:9px;">'
        f"{label}</a>"
    )


def verification_html(link: str) -> str:
    body = f"""
      <h1 style="font-size:22px;margin:0 0 12px;">Confirm your email</h1>
      <p style="color:#454b45;line-height:1.6;margin:0 0 20px;">
        Thanks for signing up for Lyra. Confirm your email to activate your
        account and start grounding answers in your own documents.
      </p>
      <p style="margin:0 0 24px;">{_btn(link, "Verify my email")}</p>
      <p style="color:#6b716a;font-size:13px;line-height:1.6;margin:0;">
        This link expires in 24 hours and can be used once. If you didn't create
        a Lyra account, you can safely ignore this email.
      </p>
    """
    return _BASE.format(body=body)


def welcome_html(app_url: str) -> str:
    body = f"""
      <h1 style="font-size:22px;margin:0 0 12px;">You're verified 🎉</h1>
      <p style="color:#454b45;line-height:1.6;margin:0 0 20px;">
        Your Lyra account is ready. Upload your FAQs, product docs, and policies —
        Lyra answers only from those, across 100+ languages, and says
        "I don't have that information" rather than guessing.
      </p>
      <p style="margin:0 0 8px;">{_btn(app_url, "Open Lyra")}</p>
    """
    return _BASE.format(body=body)


def receipt_html(amount: str | None) -> str:
    line = f"Amount: <strong>{amount}</strong><br>" if amount else ""
    body = f"""
      <h1 style="font-size:22px;margin:0 0 12px;">Thanks for upgrading to Pro</h1>
      <p style="color:#454b45;line-height:1.6;margin:0 0 16px;">
        Your Lyra Pro plan is active. {line}
        Higher daily limits, more documents, and priority answers are enabled now —
        enforced server-side the moment your payment cleared.
      </p>
      <p style="color:#6b716a;font-size:13px;margin:0;">
        Questions about your plan? Just reply to this email.
      </p>
    """
    return _BASE.format(body=body)
