import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { MACHINE_HEAD_TYPE } from '../../../../../constants';
import styles from './index.module.scss';
// import Printing from './Printing';
import Laser from './Laser';
// import CNC from './CNC';

const i18n = {
  _: (str) => str,
};

class MarlinWidget extends PureComponent {
  render() {
    const { headType, isConnected } = this.props;

    if (!headType || !isConnected) {
      return null;
    }

    return (
      <div className={styles.wrapper}>
        <hr className={styles.divider} />
        <div className={styles.header}>
          {headType === MACHINE_HEAD_TYPE['3DP'].value && (
            <span className={styles.label}>{i18n._('FDM')}</span>
          )}
          {headType === MACHINE_HEAD_TYPE.LASER.value && (
            <span className={styles.label}>Laser</span>
          )}
          {headType === MACHINE_HEAD_TYPE.CNC.value && (
            <span className={styles.label}>CNC</span>
          )}
        </div>
        <div className={styles.contentWrapper}>
          {/* {headType === MACHINE_HEAD_TYPE['3DP'].value && <Printing />} */}
          {headType === MACHINE_HEAD_TYPE.LASER.value && <Laser />}
          {/* {headType === MACHINE_HEAD_TYPE.CNC.value && <CNC />} */}
        </div>
      </div>
    );
  }
}

MarlinWidget.propTypes = {
  headType: PropTypes.string,
  isConnected: PropTypes.bool,
};

const mapStateToProps = (state) => {
  const { headType, isConnected } = state.machine;

  return {
    isConnected,
    headType,
  };
};
export default connect(mapStateToProps)(MarlinWidget);