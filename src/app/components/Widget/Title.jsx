import classNames from 'classnames';
import React from 'react';
import PropTypes from 'prop-types';
import styles from './index.module.scss';

const Title = ({ className, ...props }) => (
  <div {...props} className={classNames(className, styles['widget-title'])} />
);

Title.propTypes = {
  className: PropTypes.string,
};

export default Title;
