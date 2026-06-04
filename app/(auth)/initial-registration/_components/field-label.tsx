import { type ReactNode } from "react";
import { jp } from "@/assets/translations/jp";

type FieldLabelProps = {
  htmlFor: string;
  isRequired?: boolean;
  children: ReactNode;
};

export function FieldLabel({
  htmlFor,
  isRequired = true,
  children,
}: FieldLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-center gap-2 text-sm font-semibold text-slate-700"
    >
      <span>{children}</span>
      <span
        className={
          isRequired
            ? "rounded-sm bg-red-50 px-1.5 py-0.5 text-xs font-bold text-red-700"
            : "rounded-sm bg-slate-100 px-1.5 py-0.5 text-xs font-bold text-slate-500"
        }
      >
        {isRequired
          ? jp.initialRegistration.requiredBadge
          : jp.initialRegistration.optionalBadge}
      </span>
    </label>
  );
}
