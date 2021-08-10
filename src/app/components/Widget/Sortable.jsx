import classNames from 'classnames';
import React from 'react';
import PropTypes from 'prop-types';
import styles from './index.module.scss';

const Sortable = (props) => {
  const { children, className, style, ...rest } = props;

  return (
    <div
      className={classNames(className, styles['widget-sortable'])}
      style={style}
    >
      <a {...rest}>{children}</a>
    </div>
  );
};

Sortable.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  style: PropTypes.object,
};

export default Sortable;
