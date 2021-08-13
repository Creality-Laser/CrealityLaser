/* eslint react/no-set-state: 0 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import { Button } from 'antd';
import { MACHINE_HEAD_TYPE, MACHINE_SERIES } from '../../../../../constants';
import styles from './index.module.scss';

const i18n = {
  _: (str) => str,
};

class MachineSelectModal extends PureComponent {
  state = {
    series: this.props.series || MACHINE_SERIES.test.value,
    headType: this.props.headType || MACHINE_HEAD_TYPE['3DP'].value,
  };

  actions = {
    onChangeSeries: (v) => {
      this.setState({
        series: v.value,
      });
    },
    onChangeHeadType: (v) => {
      this.setState({
        headType: v,
      });
    },
  };

  handleClose = () => {
    setTimeout(() => {
      this.removeContainer();
    });
  };

  handleConfirm = () => {
    setTimeout(() => {
      this.removeContainer();
      this.props.onConfirm &&
        this.props.onConfirm(this.state.series, this.state.headType);
    });
  };

  removeContainer() {
    const { container } = this.props;
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  }

  render() {
    const state = this.state;
    const actions = this.actions;

    return (
      <div className={`${styles.wrapper}`} styles={{ zIndex: '1100' }}>
        <div
          className={styles.content_wrapper}
          style={{ width: '460px', heigh: '260px' }}
        >
          <div className={styles.titleWrapper}>
            {/* <span className={styles.close_icon_wrapper} onClick={this.handleClose}>
                            <i className={`iconfont  ${styles.close_icon}`}>&#xe6b0;</i>
                        </span> */}
            <span className={styles.title}>
              Which toolhead is attached to your IVI?
            </span>
          </div>

          <div className={styles.content}>
            {this.props.hasHead !== false && (
              <div className={styles.headTypeWrapper}>
                <div
                  className={classNames(
                    styles.headTypeItem,
                    state.headType === '3dp' ? styles.headTypeItemActived : ''
                  )}
                  onClick={() => actions.onChangeHeadType('3dp')}
                >
                  <span className={styles.headTypeIconWrapper}>
                    <i className={classNames('iconfont', styles.headTypeIcon)}>
                      &#xe6d3;
                    </i>
                  </span>
                  <span className={styles.headTypeLabel}>FDM</span>
                </div>
                <div
                  className={classNames(
                    styles.headTypeItem,
                    state.headType === 'laser' ? styles.headTypeItemActived : ''
                  )}
                  onClick={() => actions.onChangeHeadType('laser')}
                >
                  <span className={styles.headTypeIconWrapper}>
                    <i className={classNames('iconfont', styles.headTypeIcon)}>
                      &#xe6d2;
                    </i>
                  </span>
                  <span className={styles.headTypeLabel}>Laser</span>
                </div>
                <div
                  className={classNames(
                    styles.headTypeItem,
                    state.headType === 'cnc' ? styles.headTypeItemActived : ''
                  )}
                  onClick={() => actions.onChangeHeadType('cnc')}
                >
                  <span className={styles.headTypeIconWrapper}>
                    <i className={classNames('iconfont', styles.headTypeIcon)}>
                      &#xe6d1;
                    </i>
                  </span>
                  <span className={styles.headTypeLabel}>CNC</span>
                </div>
              </div>
            )}
            <div className={styles.promptPlateWrapper}>
              {state.headType === '3dp' && (
                <span>
                  <span className={styles.promptPlateSymbol}>*</span>&nbsp;
                  <span>
                    Please
                    <span className={styles.promptPlateSymbol}>
                      {' '}
                      make sure{' '}
                    </span>
                    the build plate for FDM 3D printing is installed.
                  </span>
                </span>
              )}
              {state.headType === 'laser' && (
                <span>
                  <span className={styles.promptPlateSymbol}>*</span>&nbsp;
                  <span>
                    The black side of the work table is for laser. Please
                    <span className={styles.promptPlateSymbol}>
                      {' '}
                      make sure{' '}
                    </span>
                    you use the right side.
                  </span>
                </span>
              )}
              {state.headType === 'cnc' && (
                <span>
                  <span className={styles.promptPlateSymbol}>*</span>&nbsp;
                  <span>
                    The wood side of the work table is for CNC. Please
                    <span className={styles.promptPlateSymbol}>
                      {' '}
                      make sure{' '}
                    </span>
                    you use the right side.
                  </span>
                </span>
              )}
            </div>
            <div className={classNames(styles.operatorsWrapper)}>
              {/* <Button
                                wrapperStyle={{ width: '80px', height: '30px', marginRight: '20px' }}
                                onClick={this.handleClose}
                            >
                                {i18n._('Cancel')}
                            </Button> */}
              <Button
                type="primary"
                wrapperStyle={{ width: '80px', height: '30px' }}
                onClick={this.handleConfirm}
              >
                {i18n._('Choose')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

MachineSelectModal.propTypes = {
  series: PropTypes.string,
  headType: PropTypes.string,
  hasHead: PropTypes.bool,
  onConfirm: PropTypes.func,
  container: PropTypes.any,
};

export default (options) =>
  new Promise((resolve) => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const props = {
      ...options,
      onClose: () => {
        resolve();
      },
      container,
    };

    ReactDOM.render(<MachineSelectModal {...props} />, container);
  });
