import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link, withRouter } from 'react-router-dom';
import { SettingFilled } from '@ant-design/icons';
import styles from './index.module.scss';
import icon from '../../../../assets/icon.svg';

function Header(props) {
  const {
    location: { pathname },
  } = props;

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
      <section className={styles.left}>
        <Link
          to="/laser"
          className={classNames({
            [styles.tab_link]: true,
            [styles.tab_active]: pathname === '/laser',
          })}
        >
          <h1 className={styles.app_title}>Laser</h1>
        </Link>
        <span className={styles.divider} />
        <Link
          to="/workspace"
          className={classNames({
            [styles.tab_link]: true,
            [styles.tab_active]: pathname === '/workspace',
          })}
        >
          <h1 className={styles.app_title}>Workspace</h1>
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

Header.propTypes = {
  location: PropTypes.object,
};

export default withRouter(Header);
