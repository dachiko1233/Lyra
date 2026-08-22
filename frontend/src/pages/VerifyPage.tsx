import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, ApiError } from "../api/client";
import { AuthShell, FormError, FormSuccess } from "../components/auth/AuthShell";
import { VerifyNotice } from "../components/auth/VerifyNotice";
import { Button } from "../components/ui/Button";

type State =
  | { kind: "notice" }
  | { kind: "verifying" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export function VerifyPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>(
    token ? { kind: "verifying" } : { kind: "notice" },
  );

  useEffect(() => {
    if (!token) return;
    let active = true;
    api
      .verify(token)
      .then((res) => active && setState({ kind: "success", message: res.message }))
      .catch((err) =>
        active &&
        setState({
          kind: "error",
          message: err instanceof ApiError ? err.message : "Verification failed.",
        }),
      );
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <AuthShell
      title={
        state.kind === "notice"
          ? "Check your inbox"
          : state.kind === "success"
            ? "You're verified"
            : "Verify your email"
      }
      footer={
        <Link to="/login" className="font-medium text-moss-600 hover:underline dark:text-moss-300">
          Go to sign in
        </Link>
      }
    >
      {state.kind === "notice" && <VerifyNotice />}
      {state.kind === "verifying" && (
        <div className="flex items-center justify-center gap-2 py-4 text-ink-soft dark:text-paper/70">
          <Loader2 className="animate-spin" size={18} /> Verifying…
        </div>
      )}
      {state.kind === "success" && (
        <div className="space-y-5">
          <FormSuccess message={state.message} />
          <Button as="link" to="/login" size="lg" className="w-full">
            Continue to sign in
          </Button>
        </div>
      )}
      {state.kind === "error" && (
        <div className="space-y-5">
          <FormError message={state.message} />
          <Button as="link" to="/register" variant="secondary" size="lg" className="w-full">
            Back to sign up
          </Button>
        </div>
      )}
    </AuthShell>
  );
}
