export const INDIAN_LANGUAGES = [
  { code: 'te', name: 'Telugu' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'kn', name: 'Kannada' },
  { code: 'en', name: 'English' },
  { code: 'mr', name: 'Marathi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'gu', name: 'Gujarati' },
];

export function normalizeLanguage(codeOrName: string): string {
  if (!codeOrName) return 'English';
  const lower = codeOrName.toLowerCase().trim();
  const match = INDIAN_LANGUAGES.find(
    (l) => l.code === lower || l.name.toLowerCase() === lower
  );
  if (match) return match.name;

  // Capitalize first letter as fallback
  return codeOrName.charAt(0).toUpperCase() + codeOrName.slice(1);
}
