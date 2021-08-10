import { useTranslation } from 'react-i18next';
import { ipcRenderer } from 'electron';

function useSendLanguageChanged() {
  const { i18n } = useTranslation();
  return (language: string) => {
    i18n.changeLanguage(language);
    ipcRenderer.send('language-changed', language);
  };
}

export default useSendLanguageChanged;
