import { Link } from "react-router-dom";
import { AuthShell } from "../components/auth/AuthShell";
import { LoginForm } from "../components/auth/LoginForm";

export function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your Lyra workspace."
      footer={
        <>
          New to Lyra?{" "}
          <Link to="/register" className="font-medium text-moss-600 hover:underline dark:text-moss-300">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
