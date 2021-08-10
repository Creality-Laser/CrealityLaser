import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './index.module.scss';

const Button = (props) => {
  const { inverted, className, ...rest } = props;

  return (
    <button
      type="button"
      {...rest}
      className={classNames(className, styles['widget-button'], {
        [styles.disabled]: !!props.disabled,
        [styles.inverted]: inverted,
      })}
    />
  );
};

Button.propTypes = {
  disabled: PropTypes.bool,
  className: PropTypes.string,
  inverted: PropTypes.bool,
};

export default Button;
