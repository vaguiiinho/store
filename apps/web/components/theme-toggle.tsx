"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const enabled = window.localStorage.getItem("store-theme") !== "light";
    setDark(enabled);
    document.documentElement.dataset.theme = enabled ? "dark" : "light";
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    window.localStorage.setItem("store-theme", next ? "dark" : "light");
  }

  return <button type="button" onClick={toggle} aria-label="Alternar tema" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-lg transition hover:scale-105">{dark ? "☀" : "☾"}</button>;
}
