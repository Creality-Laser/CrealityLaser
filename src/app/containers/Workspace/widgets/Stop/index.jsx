import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button, Modal } from 'antd';

import { controller } from '../../../../lib/controller';
import styles from './index.module.scss';

const i18n = {
  _: (str) => str,
};

const reloadPage = (forcedReload = true) => {
  // Reload the current page, without using the cache
  window.location.reload(forcedReload);
};

class Stop extends PureComponent {
  state = {
    halted: false,
  };

  actions = {
    stop: () => {
      controller.command('reset');
      this.setState({ halted: true });
    },
  };

  render() {
    const { isDisabled = false } = this.props;

    const { halted } = this.state;

    return (
      <>
        <Button
          type="danger"
          disabled={halted || isDisabled}
          style={{
            width: '80px',
            height: '30px',
            minWidth: '80px',
            position: 'absolute',
            right: '20px',
          }}
          title={i18n._('Reset')}
          onClick={this.actions.stop}
        >
          {i18n._('STOP')}
        </Button>
        <Modal
          closable={false}
          maskClosable={false}
          visible={halted}
          zIndex={1100}
          modalContentWidth="460px"
          minHeight="178px"
        >
          <div className={styles.wrapper}>
            <div className={styles.content}>
              <span>
                <i className={classNames('iconfont', styles.contentIcon)}>
                  &#xe6b1;
                </i>
              </span>
              <div className={styles.contentContent}>
                <h5>{i18n._('Server has halted intentionally by you')}</h5>
                <p>
                  {i18n._(
                    'Emergency stop triggered, Please restart the Snapmaker then reconnect.'
                  )}
                </p>
              </div>
            </div>
            <div className={styles.footer}>
              <Button
                onClick={reloadPage}
                type="primary"
                style={{ width: '80px', height: '30px' }}
              >
                {i18n._('Reload')}
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  }
}

Stop.propTypes = {
  isDisabled: PropTypes.bool,
};

export default Stop;
