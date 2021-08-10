import React from 'react';
import { Link } from 'react-router-dom';
import { SettingFilled } from '@ant-design/icons';
import styles from './index.module.scss';
import icon from '../../../../assets/icon.svg';

function Header() {
  return (
    <div className={styles.wrapper}>
      <section className={styles.left}>
        <Link to="/laser" className={styles.logo_wrapper}>
          <img
            className={styles.logo}
            width="30px"
            role="presentation"
            alt="CV Laser logo"
            src={icon}
          />
          <h1 className={styles.app_title}>CV Laser</h1>
        </Link>
      </section>
      <section className={styles.right}>
        <Link to="/settings" className={styles.logo_wrapper}>
          <SettingFilled style={{ fontSize: '22px', color: 'white' }} />
        </Link>
      </section>
    </div>
  );
}

export default Header;
