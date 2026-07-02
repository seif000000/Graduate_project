// Central translation dictionary for مُسند — merged from modular locale files.
// Add keys to the relevant file under ./locales/, then use them via t('key').
// Untranslated pages keep Arabic text and stay RTL until migrated to t().
import { core } from './locales/core';
import { publicPages } from './locales/public';
import { userPages } from './locales/user';
import { userPages2 } from './locales/user2';
import { adminPages } from './locales/admin';
import { pharmacyPages } from './locales/pharmacy';

const modules = [core, publicPages, userPages, userPages2, adminPages, pharmacyPages];

export const translations = {
  ar: Object.assign({}, ...modules.map((m) => m.ar)),
  en: Object.assign({}, ...modules.map((m) => m.en)),
};

export const LANGUAGES = ['ar', 'en'];
