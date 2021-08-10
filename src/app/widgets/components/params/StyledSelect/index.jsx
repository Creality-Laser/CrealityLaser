import React from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';

export const { Option } = Select;
function StyledSelect(props) {
  const {
    value,
    disabled = false,
    size = 'small',
    style = {},
    onChange,
    children,
    ...restProps
  } = props;
  return (
    <Select
      value={value}
      disabled={disabled}
      size={size}
      style={{ width: '100px', ...style }}
      onChange={onChange}
      {...restProps}
    >
      {children}
    </Select>
  );
}

StyledSelect.propTypes = {
  value: PropTypes.any,
  disabled: PropTypes.bool,
  size: PropTypes.string,
  style: PropTypes.object,
  onChange: PropTypes.func,
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]),
};

export default StyledSelect;
