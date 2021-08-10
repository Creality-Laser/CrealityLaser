import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ipcRenderer } from 'electron';

export default function useListenLanguageChangeAndChangeLanguage() {
  const { i18n } = useTranslation();
  // handle listen i18n language changed
  useEffect(() => {
    ipcRenderer.on('language-changed', (_, { language }) => {
      if (language === i18n.language) {
        return;
      }
      if (language) {
        i18n.changeLanguage(language);
      }
    });
  }, [i18n]);

  return null;
}
