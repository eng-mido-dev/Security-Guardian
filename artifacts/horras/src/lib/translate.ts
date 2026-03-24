export async function translateText(text: string, targetLang: "ar" | "en"): Promise<string> {
  if (!text.trim()) return "";
  try {
    const endpoint = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(endpoint);
    if (!res.ok) return "";
    const data = await res.json();
    return (data as string[][][])[0]?.map((chunk) => chunk[0]).join("") ?? "";
  } catch {
    return "";
  }
}

export const translateToEnglish = (text: string) => translateText(text, "en");
export const translateToArabic = (text: string) => translateText(text, "ar");
