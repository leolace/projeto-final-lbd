export function LoginLoadingState() {
  return (
    <main className="grid min-h-screen place-items-center bg-white px-5 py-8 text-black">
      <div className="flex flex-col items-center gap-3 text-sm text-gray-600">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
        Carregando usuário...
      </div>
    </main>
  );
}
