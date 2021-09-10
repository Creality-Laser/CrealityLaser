import React from 'react';
import PropTypes from 'prop-types';
import Slider from 'rc-slider';
import throttle from 'lodash/throttle';

function StyledSlider(props) {
  const {
    style = {},
    disabled = false,
    value,
    min = Number.MIN_SAFE_INTEGER,
    max = Number.MIN_SAFE_INTEGER,
    onChange,
    onAfterChange,
    ...restProps
  } = props;
  return (
    <Slider
      style={{ width: '144px', marginRight: '15px', ...style }}
      disabled={disabled}
      value={value}
      min={min}
      max={max}
      onChange={throttle(onChange, 30)}
      onAfterChange={(...params) =>
        throttle(() => onAfterChange(...params), 30)
      }
      {...restProps}
    />
  );
}

StyledSlider.propTypes = {
  style: PropTypes.object,
  disabled: PropTypes.bool,
  value: PropTypes.any,
  min: PropTypes.number,
  max: PropTypes.number,
  onChange: PropTypes.func,
  onAfterChange: PropTypes.func,
};

export default StyledSlider;
