import { type ComponentProps, type ReactNode } from "react";
import { FieldLabel } from "./field-label";

export type SelectFieldOption = {
  value: string;
  label: string;
};

type SelectFieldRowProps = Omit<ComponentProps<"select">, "children" | "id"> & {
  id: string;
  label: ReactNode;
  isRequired?: boolean;
  options: SelectFieldOption[];
};

export function SelectFieldRow({
  id,
  label,
  isRequired,
  options,
  ...selectProps
}: SelectFieldRowProps) {
  return (
    <>
      <FieldLabel htmlFor={id} isRequired={isRequired}>
        {label}
      </FieldLabel>
      <select id={id} {...selectProps}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </>
  );
}
