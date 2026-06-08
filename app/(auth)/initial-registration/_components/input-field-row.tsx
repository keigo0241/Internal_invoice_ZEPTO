import { type ComponentProps, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { FieldLabel } from "./field-label";

type InputFieldRowProps = Omit<ComponentProps<typeof Input>, "id"> & {
  id: string;
  label: ReactNode;
  errorMessage?: string;
  isRequired?: boolean;
};

export function InputFieldRow({
  id,
  label,
  errorMessage,
  isRequired,
  ...inputProps
}: InputFieldRowProps) {
  return (
    <>
      <FieldLabel htmlFor={id} isRequired={isRequired}>
        {label}
      </FieldLabel>
      <div>
        <Input id={id} aria-invalid={Boolean(errorMessage)} {...inputProps} />
        {errorMessage ? (
          <p className="mt-1 text-xs font-semibold text-red-600">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </>
  );
}
