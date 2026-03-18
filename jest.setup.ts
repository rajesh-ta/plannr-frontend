import "@testing-library/jest-dom";

// Suppress noisy redux-toolkit selector stability warnings in tests
const originalWarn = console.warn.bind(console);
console.warn = (...args: unknown[]) => {
  if (
    typeof args[0] === "string" &&
    args[0].includes("Selector unknown returned a different result")
  )
    return;
  originalWarn(...args);
};
