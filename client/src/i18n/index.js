import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './en.json';
import fr from './fr.json';
import es from './es.json';
import ar from './ar.json';

export const LANGUAGES = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'es', label: 'Español', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      es: { translation: es },
      ar: { translation: ar },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr', 'es', 'ar'],
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] },
  });

export function applyDirection(lang) {
  const meta = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
  document.documentElement.lang = meta.code;
  document.documentElement.dir = meta.dir;
}

i18n.on('languageChanged', applyDirection);
applyDirection(i18n.language?.slice(0, 2) || 'en');

export default i18n;
