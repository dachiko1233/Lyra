import { MailCheck } from "lucide-react";

export function VerifyNotice() {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-moss-500/15 text-moss-600 dark:text-moss-300">
        <MailCheck size={22} />
      </span>
      <p className="text-ink-soft dark:text-paper/70">
        We've sent a verification link to your inbox. Click it to activate your
        account, then come back and sign in.
      </p>
    </div>
  );
}
