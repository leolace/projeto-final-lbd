type PageStateProps = {
  message: string;
  tone?: "default" | "error";
};

export function PageState({ message, tone = "default" }: PageStateProps) {
  return (
    <div
      className={`rounded-lg border px-4 py-8 text-center text-sm ${
        tone === "error"
          ? "border-gray-300 bg-gray-50 text-black"
          : "border-gray-300 bg-gray-50 text-gray-600"
      }`}
    >
      {message}
    </div>
  );
}
