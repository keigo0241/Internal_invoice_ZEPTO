import { type ComponentProps, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { FieldLabel } from "./field-label";

type InputFieldRowProps = Omit<ComponentProps<typeof Input>, "id"> & {
  id: string;
  label: ReactNode;
  isRequired?: boolean;
};

export function InputFieldRow({
  id,
  label,
  isRequired,
  ...inputProps
}: InputFieldRowProps) {
  return (
    <>
      <FieldLabel htmlFor={id} isRequired={isRequired}>
        {label}
      </FieldLabel>
      <Input id={id} {...inputProps} />
    </>
  );
}
