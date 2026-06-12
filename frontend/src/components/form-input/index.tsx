import type { InputHTMLAttributes } from "react";

type FormInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className" | "onChange"
> & {
  className?: string;
  onValueChange: (value: string) => void;
};

const inputClassName =
  "h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-black outline-none transition focus:border-black";

export function FormInput({
  className,
  onValueChange,
  ...props
}: FormInputProps) {
  return (
    <input
      {...props}
      className={`${inputClassName} ${className ?? ""}`}
      onChange={(event) => onValueChange(event.target.value)}
    />
  );
}
