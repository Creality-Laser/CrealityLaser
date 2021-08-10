import React from 'react';
import PropTypes from 'prop-types';
import { InputNumber } from 'antd';
import styles from './index.module.scss';

const addonHeights = {
  small: 22,
  middle: 30,
  large: 38,
};

const defaultAddonHeight = 22;
function StyledInputNumber(props) {
  const {
    value,
    disabled = false,
    style = {},
    size = 'small',
    min = Number.MIN_SAFE_INTEGER,
    max = Number.MAX_SAFE_INTEGER,
    onChange,
    addonAfter = '',
    ...restProps
  } = props;

  const addonHeight = addonHeights[size]
    ? addonHeights[size]
    : defaultAddonHeight;

  return (
    <span className={styles.wrapper}>
      <InputNumber
        disabled={disabled}
        value={value}
        size={size}
        style={{ width: '50px', ...style }}
        min={min}
        max={max}
        onChange={onChange}
        {...restProps}
      />
      {addonAfter && (
        <span className={styles.unit} style={{ height: addonHeight }}>
          <span>{addonAfter}</span>
        </span>
      )}
    </span>
  );
}

StyledInputNumber.propTypes = {
  value: PropTypes.any,
  disabled: PropTypes.bool,
  style: PropTypes.object,
  min: PropTypes.number,
  max: PropTypes.number,
  onChange: PropTypes.func,
  size: PropTypes.string,
  addonAfter: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
};

export default StyledInputNumber;
