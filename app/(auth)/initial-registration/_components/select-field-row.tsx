import { type ComponentProps, type ReactNode } from "react";
import { FieldLabel } from "./field-label";

export type SelectFieldOption = {
  value: string;
  label: string;
};

type SelectFieldRowProps = Omit<ComponentProps<"select">, "children" | "id"> & {
  id: string;
  label: ReactNode;
  errorMessage?: string;
  isRequired?: boolean;
  options: SelectFieldOption[];
};

export function SelectFieldRow({
  id,
  label,
  errorMessage,
  isRequired,
  options,
  ...selectProps
}: SelectFieldRowProps) {
  return (
    <>
      <FieldLabel htmlFor={id} isRequired={isRequired}>
        {label}
      </FieldLabel>
      <div>
        <select id={id} aria-invalid={Boolean(errorMessage)} {...selectProps}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errorMessage ? (
          <p className="mt-1 text-xs font-semibold text-red-600">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </>
  );
}
