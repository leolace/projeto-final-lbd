export type StatusMessageStatus = {
  message: string;
  tone: "error" | "success";
};

type StatusMessageProps = {
  status: StatusMessageStatus | null;
};

export function StatusMessage({ status }: StatusMessageProps) {
  if (!status) {
    return null;
  }

  const toneClassName =
    status.tone === "success"
      ? "border-green-700 bg-green-50 text-green-900"
      : "border-red-700 bg-red-50 text-red-900";

  return (
    <div className={`rounded-md border px-3 py-2 text-sm ${toneClassName}`}>
      {status.message}
    </div>
  );
}
