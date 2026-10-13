import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import "./button.css";

type Variant = "primary" | "secondary" | "neutral" | "generate" | "key" | "success" | "aqua" | "mint";
type Size = "sm" | "md" | "lg";

type Shared = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type LinkButton = Shared & { to: string };
type AnchorButton = Shared & { href: string };
type NativeButton = Shared & ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined; href?: undefined };

function classNames(variant: Variant, size: Size, className?: string) {
  return ["app-btn", `app-btn-${variant}`, `app-btn-${size}`, className].filter(Boolean).join(" ");
}

export default function Button(props: LinkButton | AnchorButton | NativeButton) {
  const variant = props.variant ?? "primary";
  const size = props.size ?? "md";
  const names = classNames(variant, size, props.className);

  if ("to" in props && props.to) {
    return <Link to={props.to} className={names}>{props.children}</Link>;
  }
  if ("href" in props && props.href) {
    return <a href={props.href} className={names}>{props.children}</a>;
  }

  const native = props as NativeButton;
  const {
    children,
    type = "button",
    variant: unusedVariant,
    size: unusedSize,
    className: unusedClassName,
    ...rest
  } = native;
  void unusedVariant;
  void unusedSize;
  void unusedClassName;
  return <button type={type} className={names} {...rest}>{children}</button>;
}
