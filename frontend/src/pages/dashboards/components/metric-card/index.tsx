import type { LucideIcon } from "lucide-react";

type MetricCardProps = {
  icon: LucideIcon;
  label: string;
  value: string | number | null | undefined;
};

export function MetricCard({ icon: Icon, label, value }: MetricCardProps) {
  return (
    <article className="min-h-32 rounded-lg border border-gray-300 bg-gray-50 p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md border border-gray-300 bg-white text-black">
          <Icon className="h-5 w-5" />
        </span>
        <p className="text-sm font-medium uppercase tracking-wide text-gray-600">
          {label}
        </p>
      </div>
      <p className="mt-5 break-words text-2xl font-semibold">
        {String(value ?? "-")}
      </p>
    </article>
  );
}
