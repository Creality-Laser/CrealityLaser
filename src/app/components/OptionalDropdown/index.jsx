import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Popover } from 'antd';
import styles from './index.module.scss';

// TODO: to be improved
const OptionalDropdown = (props) => {
  const {
    hidden,
    title,
    titleTip,
    onClick,
    disabled = false,
    children,
  } = props;

  return (
    <div>
      <div
        className={classNames(styles['expandable-start'], {
          [styles.show]: !hidden,
        })}
      >
        <Popover title={title} content={titleTip}>
          <div className={styles['expandable-title']}>
            <button type="button" onClick={onClick} disabled={disabled}>
              <i
                className={classNames(
                  styles.icon,
                  hidden ? styles['icon-unchecked'] : styles['icon-checked']
                )}
              />
              <span>{title}</span>
            </button>
          </div>
          <div className={styles['expandable-separator']}>
            <div className={styles['expandable-separator-inner']} />
          </div>
        </Popover>
      </div>
      {!hidden && children}
      {!hidden && false && (
        <div className={styles['expandable-end']}>
          <div style={{ marginTop: '10px', width: '0.1px' }} />
          <div className={styles['expandable-separator']}>
            <div className={styles['expandable-separator-inner']} />
          </div>
        </div>
      )}
      <div className="clearfix" />
    </div>
  );
};

OptionalDropdown.propTypes = {
  title: PropTypes.string.isRequired,
  titleTip: PropTypes.string,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  hidden: PropTypes.bool.isRequired,
};

export default OptionalDropdown;
