"use client";

export default function ErrorBoundary({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] p-4 text-sm text-[color:var(--danger)]">
      <p>Não foi possível carregar.</p>
      <button type="button" onClick={reset} className="mt-3 rounded-full border border-current px-4 py-2 font-semibold">
        Tentar novamente
      </button>
    </div>
  );
}
