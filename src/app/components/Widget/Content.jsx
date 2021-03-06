import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './index.module.scss';

const Content = ({ className, ...props }) => (
  <div {...props} className={classNames(className, styles['widget-content'])} />
);

Content.propTypes = {
  className: PropTypes.string,
};

export default Content;
