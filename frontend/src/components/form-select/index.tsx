import type { SelectHTMLAttributes } from "react";

export type FormSelectOption<TValue extends number | string = string> = {
  disabled?: boolean;
  label: string;
  value: TValue;
};

type FormSelectProps<TValue extends number | string = string> = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "className" | "onChange"
> & {
  className?: string;
  onValueChange: (value: string) => void;
  options: FormSelectOption<TValue>[];
  placeholder?: string;
  isLoading?: boolean;
};

const selectClassName =
  "h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-black outline-none transition focus:border-black";

export function FormSelect<TValue extends number | string = string>({
  className,
  onValueChange,
  options,
  placeholder,
  isLoading,
  ...props
}: FormSelectProps<TValue>) {
  return (
    <select
      {...props}
      className={`${selectClassName} ${className ?? ""} ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
      onChange={(event) => onValueChange(event.target.value)}
      disabled={isLoading || props.disabled}
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((option) => (
        <option
          disabled={option.disabled}
          key={String(option.value)}
          value={option.value}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}
