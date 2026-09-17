"use client";

import React from "react";
import {
  Eye,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  LucideIcon,
} from "lucide-react";

export type ActionButtonVariant =
  | "default"
  | "primary"
  | "success"
  | "danger"
  | "warning"
  | "ghost";

export type ActionButtonSize = "sm" | "md";

export interface ActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ActionButtonVariant;
  size?: ActionButtonSize;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  iconOnly?: boolean;
  tooltip?: string;
}

const VARIANT_STYLES: Record<ActionButtonVariant, string> = {
  default:
    "text-[#8A8F98] hover:text-[#EDEDEF] bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15]",
  primary:
    "text-sky-300 bg-sky-500/15 border border-sky-500/30 hover:bg-sky-500/25 hover:border-sky-500/50",
  success:
    "text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 hover:border-emerald-500/50",
  danger:
    "text-rose-300 bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500/25 hover:border-rose-500/50",
  warning:
    "text-amber-300 bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 hover:border-amber-500/50",
  ghost:
    "text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-transparent border border-transparent",
};

/**
 * Standardized ActionButton with refined micro-interactions and balanced proportions.
 */
export function ActionButton({
  variant = "default",
  size = "sm",
  icon: Icon,
  iconOnly = false,
  tooltip,
  children,
  className = "",
  disabled = false,
  onClick,
  ...props
}: ActionButtonProps) {
  const isIconOnly = iconOnly || (!children && Boolean(Icon));

  const sizeClasses =
    size === "sm"
      ? isIconOnly
        ? "w-8 h-8 p-1.5"
        : "h-8 px-2.5 text-xs gap-1.5"
      : isIconOnly
      ? "w-9 h-9 p-2"
      : "h-9 px-3 text-xs gap-2";

  const iconClasses = size === "sm" ? "w-4 h-4" : "w-4 h-4";

  return (
    <button
      type="button"
      title={tooltip || (typeof children === "string" ? children : undefined)}
      aria-label={tooltip || (typeof children === "string" ? children : undefined)}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 ease-out select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#255798]/50 active:scale-[0.96] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none ${VARIANT_STYLES[variant]} ${sizeClasses} ${className}`}
      {...props}
    >
      {Icon && <Icon className={`${iconClasses} shrink-0`} />}
      {children}
    </button>
  );
}

/** Standard View/Detail Button */
export function ViewButton({
  tooltip = "Xem chi tiết",
  ...props
}: Omit<ActionButtonProps, "icon">) {
  return (
    <ActionButton
      icon={Eye}
      variant="default"
      tooltip={tooltip}
      {...props}
    />
  );
}

/** Standard Edit Button */
export function EditButton({
  tooltip = "Chỉnh sửa",
  ...props
}: Omit<ActionButtonProps, "icon">) {
  return (
    <ActionButton
      icon={Edit3}
      variant="primary"
      tooltip={tooltip}
      {...props}
    />
  );
}

/** Standard Delete Button */
export function DeleteButton({
  tooltip = "Xóa",
  ...props
}: Omit<ActionButtonProps, "icon">) {
  return (
    <ActionButton
      icon={Trash2}
      variant="danger"
      tooltip={tooltip}
      {...props}
    />
  );
}

/** Standard Approve Button */
export function ApproveButton({
  tooltip = "Duyệt",
  ...props
}: Omit<ActionButtonProps, "icon">) {
  return (
    <ActionButton
      icon={CheckCircle2}
      variant="success"
      tooltip={tooltip}
      {...props}
    />
  );
}

/** Standard Reject Button */
export function RejectButton({
  tooltip = "Từ chối",
  ...props
}: Omit<ActionButtonProps, "icon">) {
  return (
    <ActionButton
      icon={XCircle}
      variant="danger"
      tooltip={tooltip}
      {...props}
    />
  );
}

/** More Options Button */
export function MoreButton({
  tooltip = "Tùy chọn khác",
  ...props
}: Omit<ActionButtonProps, "icon">) {
  return (
    <ActionButton
      icon={MoreHorizontal}
      variant="default"
      tooltip={tooltip}
      {...props}
    />
  );
}

/**
 * Standard flex wrapper for table row actions that automatically stops event propagation.
 */
export function TableActionGroup({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`flex items-center justify-end gap-1 ${className}`}
    >
      {children}
    </div>
  );
}
