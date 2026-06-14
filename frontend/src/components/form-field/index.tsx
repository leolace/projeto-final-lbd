import type { ReactNode } from "react";

type FormFieldProps = {
  children: ReactNode;
  label: string;
};

export function FormField({ children, label }: FormFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}
