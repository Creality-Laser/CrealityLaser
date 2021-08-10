import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import config from '../config/app.config';

// TODO: auto import locales folder
// https://github.com/i18next/i18next-fs-backend#if-set-i18next-initimmediate-option-to-false-it-will-load-the-files-synchronously

// Importing translation files
import translationEN from '../locales/en/translation.json';
import translationZhCN from '../locales/zh-cn/translation.json';
import menuEN from '../locales/en/menu.json';
import menuZhCN from '../locales/zh-cn/menu.json';

const { defaultLanguage, fallbackLng } = config;

// Creating object with the variables of imported translation files
const resources = {
  en: {
    translation: translationEN,
    menu: menuEN,
  },
  zhCn: {
    translation: translationZhCN,
    menu: menuZhCN,
  },
};

// i18N Initialization

i18n.use(initReactI18next).init({
  resources,
  lng: defaultLanguage, // default language
  fallbackLng,
  keySeparator: false,
  ns: ['translation', 'menu'],
  defaultNS: 'translation',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
