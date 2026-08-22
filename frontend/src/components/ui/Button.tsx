import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss-500 disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "bg-moss-500 text-white shadow-sm hover:bg-moss-600 hover:shadow-md active:translate-y-px",
  secondary:
    "bg-transparent text-ink dark:text-paper border border-ink/15 dark:border-paper/20 hover:border-moss-500 hover:text-moss-600 dark:hover:text-moss-300",
  ghost:
    "bg-transparent text-ink-soft dark:text-paper/70 hover:bg-ink/5 dark:hover:bg-paper/10",
};

const sizes: Record<Size, string> = {
  sm: "text-sm px-3.5 py-2",
  md: "text-sm px-5 py-2.5",
  lg: "text-base px-6 py-3",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { as?: "button" };
type LinkProps = CommonProps & { as: "link"; to: string };
type AnchorProps = CommonProps & { as: "a"; href: string };

export function Button(props: ButtonProps | LinkProps | AnchorProps) {
  const { variant = "primary", size = "md", className = "", children } = props;
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (props.as === "link") {
    return (
      <Link to={props.to} className={cls}>
        {children}
      </Link>
    );
  }
  if (props.as === "a") {
    return (
      <a href={props.href} className={cls}>
        {children}
      </a>
    );
  }
  const { variant: _v, size: _s, className: _c, as: _a, children: _ch, ...rest } =
    props as ButtonProps;
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
