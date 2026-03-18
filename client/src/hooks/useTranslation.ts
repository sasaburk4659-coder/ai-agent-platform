import ru from "@/locales/ru.json";

type TranslationKeys = typeof ru;

function getNestedValue(obj: any, path: string): string {
  const keys = path.split(".");
  let value = obj;

  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = value[key];
    } else {
      return path; // Return the key path if not found
    }
  }

  return typeof value === "string" ? value : path;
}

export function useTranslation() {
  const t = (key: string): string => {
    return getNestedValue(ru, key);
  };

  return { t };
}
