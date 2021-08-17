import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

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
    </div>
  );
}

export default Settings;

function SettingItem({ children }: { children: ReactNode }) {
  return <section className={styles.item}>{children}</section>;
}
