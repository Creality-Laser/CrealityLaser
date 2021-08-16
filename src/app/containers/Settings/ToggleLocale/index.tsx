import React from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import useSendLanguageChanged from '../../../hooks/useSendLanguageChanged';
import config from '../../../../config/app.config';

const { languages } = config;
const { Option } = Select;

export default function ToggleLocale() {
  const changeLanguage = useSendLanguageChanged();
  const { i18n } = useTranslation();

  const handleLanguageChange = (val: string) => {
    changeLanguage(val);
  };

  return (
    <Select
      value={i18n.language}
      style={{ width: 160 }}
      onChange={handleLanguageChange}
    >
      {languages.map(({ label, value: languageCode }) => (
        <Option value={languageCode} key={languageCode}>
          {label}
        </Option>
      ))}
    </Select>
  );
}
