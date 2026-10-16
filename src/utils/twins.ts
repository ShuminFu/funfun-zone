// A post's translation ("twin") is a sibling file whose slug is `<main-slug>/<lang>`,
// e.g. `front-desk-agent/zh`. Twins have their own page but stay out of post lists.
export type Lang = "en" | "zh";

const TWIN = /\/(en|zh)$/;

export const twinLang = (id: string) => id.match(TWIN)?.[1] as Lang | undefined;

export const mainId = (id: string) => id.replace(TWIN, "");

export const guessLang = (title: string): Lang =>
  /[㐀-鿿]/.test(title) ? "zh" : "en";
