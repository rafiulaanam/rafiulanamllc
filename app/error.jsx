"use client";

export default function GlobalError({ error, reset }) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="font-display text-3xl text-ink">Something went wrong</h1>
      <p className="text-stone">
        An unexpected error occurred. You can try again, or head back to the homepage.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 rounded-lg bg-ink px-5 py-2 text-sm font-medium text-canvas transition hover:bg-clay"
      >
        Try again
      </button>
    </main>
  );
}
