import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import styles from './index.module.scss';

function SegmentControls(props) {
  const { items = [], currentValue = '', onChange = () => {} } = props;

  const onClickItem = ({ label, value, disabled }) => {
    if (disabled) {
      return;
    }
    if (value === currentValue) {
      return;
    }
    onChange(value, { label, value, disabled });
  };

  return (
    <div className={styles.wrapper}>
      {items.map(({ label, value, disabled = false }) => (
        <button
          type="button"
          key={value}
          className={classNames({
            [styles.item]: true,
            [styles.item_active]: currentValue === value,
            [styles.item_disabled]: disabled,
          })}
          onClick={() => onClickItem({ label, value, disabled })}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

SegmentControls.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      disabled: PropTypes.bool,
    })
  ),
  currentValue: PropTypes.string,
  onChange: PropTypes.func,
};

export default SegmentControls;
