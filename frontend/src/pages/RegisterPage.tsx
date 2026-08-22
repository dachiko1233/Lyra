import { Link } from "react-router-dom";
import { AuthShell } from "../components/auth/AuthShell";
import { RegisterForm } from "../components/auth/RegisterForm";

export function RegisterPage() {
  return (
    <AuthShell
      title="Start for free"
      subtitle="Stand up a grounded, multilingual support agent on your own docs."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-moss-600 hover:underline dark:text-moss-300">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
