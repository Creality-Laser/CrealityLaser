import React from 'react';
// import i18n from '../../lib/i18n';
import styles from './loading.module.scss';

const i18n = {
  _: (str) => str,
};

export default function Loading() {
  return (
    <div className={styles.loader}>
      <div className={styles.loaderIcon}>
        <i className="fa fa-spinner fa-spin" />
      </div>
      <div className={styles.loaderText}>{i18n._('Loading...')}</div>
    </div>
  );
}
