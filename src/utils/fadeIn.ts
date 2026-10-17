// Fade newly appended list items in, unless the reader asked for less motion.
export function fadeIn(el: Element) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  el.animate(
    [
      { opacity: 0, transform: "translateY(8px)" },
      { opacity: 1, transform: "none" },
    ],
    { duration: 300, easing: "ease-out" }
  );
}
