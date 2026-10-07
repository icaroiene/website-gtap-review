"use client";

import { useEffect } from "react";
import { startReveal } from "../../motion/reveal";
import { startSmoothScroll } from "../../motion/smoothScroll";

// Liga entradas por scroll e rolagem suave depois do load + idle, fora do
// caminho do LCP. Renderizado pela Navbar (ilha que já existe em todas as
// páginas), para não criar um chunk JS novo no layout.
export function MotionRuntime() {
  useEffect(() => {
    let stops = [];
    let idleId = 0;
    const start = () => {
      document.documentElement.setAttribute("data-motion-ready", "");
      stops = [startReveal(), startSmoothScroll()];
    };
    const schedule = () => {
      idleId = "requestIdleCallback" in window
        ? window.requestIdleCallback(start, { timeout: 1500 })
        : window.setTimeout(start, 200);
    };

    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      window.removeEventListener("load", schedule);
      if ("cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
      window.clearTimeout(idleId);
      stops.forEach((stop) => stop());
    };
  }, []);

  return null;
}
