"use client";

import React from "react";
import { LucideIcon, Plus, RefreshCw } from "lucide-react";

export interface PageHeaderStat {
  label: string;
  value: string | number;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
}

export interface PageHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  stats?: PageHeaderStat[];
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Standardized PageHeader component for all Admin list management views.
 * Adheres strictly to Linear/Modern dark mode design tokens with iStar brand blue (#255798).
 */
export default function PageHeader({
  badge,
  title,
  description,
  stats,
  children,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={`mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 ${className}`}
    >
      {/* Title & Description */}
      <div className="min-w-0">
        {badge && (
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium tracking-wider uppercase bg-[#255798]/15 text-[#4d8ee8] border border-[#255798]/30">
              {badge}
            </span>
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text tracking-tight truncate">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-[#8A8F98] mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Right side: Stats & Actions */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
        {/* Optional Stats Badges */}
        {stats && stats.length > 0 && (
          <div className="flex items-center gap-2">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-xs"
                >
                  {Icon && <Icon className="w-4 h-4 text-[#4d8ee8]" />}
                  <span className="text-[#8A8F98]">{stat.label}:</span>
                  <span className="font-semibold text-[#EDEDEF]">
                    {typeof stat.value === "number"
                      ? stat.value.toLocaleString()
                      : stat.value}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Custom Actions or Children */}
        {actions || children}
      </div>
    </div>
  );
}

/** Standard Primary Action Button (e.g. Create / Add New) */
export function HeaderPrimaryButton({
  onClick,
  icon: Icon = Plus,
  children,
  className = "",
  disabled = false,
}: {
  onClick?: () => void;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`h-10 inline-flex items-center justify-center gap-2 px-4 text-xs font-medium rounded-lg text-white bg-[#255798] hover:bg-[#316ebf] border border-[#255798]/50 shadow-[0_0_16px_rgba(37,87,152,0.35)] hover:shadow-[0_0_24px_rgba(37,87,152,0.5)] transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{children}</span>
    </button>
  );
}

/** Standard Secondary Action Button (e.g. Refresh, Export, Settings) */
export function HeaderSecondaryButton({
  onClick,
  icon: Icon,
  children,
  className = "",
  disabled = false,
  isLoading = false,
}: {
  onClick?: () => void;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
}) {
  const RenderIcon = isLoading ? RefreshCw : Icon;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`h-10 inline-flex items-center justify-center gap-2 px-3.5 text-xs font-medium rounded-lg text-[#8A8F98] hover:text-[#EDEDEF] bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {RenderIcon && (
        <RenderIcon
          className={`w-3.5 h-3.5 shrink-0 ${isLoading ? "animate-spin text-[#4d8ee8]" : ""}`}
        />
      )}
      {children && <span>{children}</span>}
    </button>
  );
}
