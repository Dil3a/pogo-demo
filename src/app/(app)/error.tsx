'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="text-4xl">⚠️</div>
      <h2 className="text-lg font-bold text-slate-800">Une erreur est survenue</h2>
      <p className="text-sm text-slate-500">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-xl bg-uemf-blue px-6 py-2 text-sm font-bold text-white"
      >
        Réessayer
      </button>
    </div>
  );
}
