import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Modal, Button } from 'antd';
import styles from './index.module.scss';

const i18n = {
  _: (str) => str,
};

class IpInputModal extends PureComponent {
  render() {
    const { visible, onCancel, onOk, ip, onChange } = this.props;

    return (
      <Modal
        visible={visible}
        onCancel={onCancel}
        title={
          <span className={styles.title}>
            <i className={classNames('iconfont', styles.titleIcon)}>&#xe60a;</i>
            <span>{i18n._('Network Connection')}</span>
          </span>
        }
        modalContentWidth="460px"
        minHeight="220px"
      >
        <div>
          <hr className={styles.modalNewDivider} />
          <div className={styles.modalNewContentWrapper}>
            <span className={styles.modalNewContentInputLabel}>IP: </span>
            <input
              className={styles.modalNewContentInput}
              value={ip}
              onChange={(e) => {
                const val = e.target.value;
                onChange(val);
              }}
              onKeyDown={(event) => {
                if (event.keyCode === 13) {
                  onOk(ip);
                }
              }}
            />
          </div>
          <div className={styles.modalNewContentOperatorRow}>
            <Button
              onClick={onCancel}
              wrapperStyle={{
                width: '80px',
                height: '30px',
                marginRight: '30px',
              }}
            >
              {i18n._('Cancel')}
            </Button>
            <Button
              onClick={() => onOk(ip)}
              type="primary"
              wrapperStyle={{ width: '80px', height: '30px' }}
              disabled={!ip || !ip.trim()}
            >
              {i18n._('OK')}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }
}

IpInputModal.propTypes = {
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  ip: PropTypes.string,
  onChange: PropTypes.func,
};

export default IpInputModal;
