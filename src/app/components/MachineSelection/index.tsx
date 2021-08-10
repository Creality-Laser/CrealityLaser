import React, { useState } from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import styles from './index.module.scss';

const { Option } = Select;

const defaultMachine = 'CV_01';
const machines = ['CV_01', 'CV_02', 'CV_03'];

export default function MachineSelection() {
  const [currentMachine, setCurrentMachine] = useState(defaultMachine);
  const { t } = useTranslation();

  function handleChange(val: string) {
    setCurrentMachine(val);
  }
  return (
    <section className={styles.machine_selection_wrapper}>
      <span className={styles.machine_selection_label}>
        {t('choose_machine', 'Choose Machine')}
        <span>: </span>
      </span>
      <Select
        value={currentMachine}
        style={{ width: 120 }}
        onChange={handleChange}
      >
        {machines.map((machine) => (
          <Option value={machine} key={machine}>
            {machine}
          </Option>
        ))}
      </Select>
    </section>
  );
}
