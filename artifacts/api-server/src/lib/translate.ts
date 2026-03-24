type LangCode = "ar" | "en";

export async function translateText(text: string, targetLang: LangCode): Promise<string> {
  if (!text || !text.trim()) return "";
  try {
    const endpoint = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(endpoint);
    if (!res.ok) return "";
    const data = (await res.json()) as string[][][];
    return data[0]?.map((chunk) => chunk[0] ?? "").join("") ?? "";
  } catch {
    return "";
  }
}

export async function translateVideoFields(title: string, description: string): Promise<{ titleAr: string; descriptionAr: string }> {
  const [titleAr, descriptionAr] = await Promise.all([
    translateText(title, "ar"),
    description ? translateText(description, "ar") : Promise.resolve(""),
  ]);
  return { titleAr, descriptionAr };
}
