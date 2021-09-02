import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';

import ToggleLocale from './ToggleLocale';
import MachineSelection from './MachineSelection';
import styles from './index.module.scss';

function Settings() {
  const { t } = useTranslation();

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <h1 className={styles.title}>{t('Settings')}</h1>
        <SettingItem>
          <MachineSelection />
        </SettingItem>
        <SettingItem>
          <span>{t('Toggle Locale')}: </span> <ToggleLocale />
        </SettingItem>
      </div>
      <Button
        onClick={() => {
          window.location.hash = '/laser';
        }}
        className={styles.backBtn}
        icon={<BackIcon />}
      />
    </div>
  );
}

const BackIcon = () => (
  <svg
    className="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="22166"
    width="200"
    height="200"
  >
    <path
      d="M648 307.2H217.6l128-128c12.8-12.8 12.8-32 0-44.8-12.8-12.8-32-12.8-44.8 0L118.4 315.2c-6.4 6.4-9.6 14.4-9.6 22.4s3.2 16 9.6 22.4l180.8 180.8c12.8 12.8 32 12.8 44.8 0 12.8-12.8 12.8-32 0-44.8L219.2 371.2H648c120 0 216 96 216 216s-96 216-216 216H320c-17.6 0-32 14.4-32 32s14.4 32 32 32h328c155.2 0 280-124.8 280-280s-124.8-280-280-280z"
      p-id="22167"
    ></path>
  </svg>
);

export default Settings;

function SettingItem({ children }: { children: ReactNode }) {
  return <section className={styles.item}>{children}</section>;
}
