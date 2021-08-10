import React, { ReactNode } from 'react';
import ToggleLocale from '../../components/ToggleLocale';
import MachineSelection from '../../components/MachineSelection';
import styles from './index.module.scss';

function Settings(props: any) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <h1 className={styles.title}>Settings</h1>
        <SettingItem>
          <MachineSelection />
        </SettingItem>
        <SettingItem>
          <span>Toggle Locale: </span> <ToggleLocale />
        </SettingItem>
      </div>
    </div>
  );
}

export default Settings;

function SettingItem({ children }: { children: ReactNode }) {
  return <section className={styles.item}>{children}</section>;
}
