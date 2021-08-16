import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './index.module.scss';

class Dropdown extends PureComponent {
  actions = {
    onClickBar: () => {
      if (this.props.isDisabled && !this.props.isDropped) {
        return;
      }
      this.props.onToggleDrop(this.props.isDropped);
    },
  };

  render() {
    const { label, children, wrapperStyle, isDropped, isDisabled } = this.props;

    return (
      <div
        className={`${styles.wrapper} ${
          isDisabled ? styles.wrapperDisabled : ''
        }`}
        style={wrapperStyle}
      >
        <button
          className={classNames(styles.bar, isDropped ? styles.barr : '')}
          onClick={this.actions.onClickBar}
          type="button"
        >
          <span className={styles.label}>{label}</span>
          <span
            className={classNames(
              styles.faBtn,
              isDropped ? styles.faBtnRotate : ''
            )}
          >
            <span className={`iconfont ${styles.faBtnIcon}`}>&#xe69b;</span>
          </span>
        </button>
        <div
          className={`${styles.contentWrapper} ${
            isDropped ? '' : styles.contentWrapperPackup
          }`}
        >
          {children}
        </div>
      </div>
    );
  }
}

Dropdown.propTypes = {
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  onToggleDrop: PropTypes.func,
  children: PropTypes.element,
  wrapperStyle: PropTypes.object,
  isDropped: PropTypes.bool,
  isDisabled: PropTypes.bool,
};

export default Dropdown;
