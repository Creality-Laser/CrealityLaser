import React, { PureComponent } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import styles from './index.module.scss';

/**
 * Widget Component
 */
class Widget extends PureComponent {
  render() {
    const { borderless, fullscreen, className, ...props } = this.props;

    return (
      <div
        {...props}
        className={classNames(
          className,
          styles.widget,
          { [styles['widget-borderless']]: borderless },
          { [styles['widget-fullscreen']]: fullscreen }
        )}
      />
    );
  }
}

Widget.propTypes = {
  className: PropTypes.string,
  borderless: PropTypes.bool,
  fullscreen: PropTypes.bool,
};

Widget.defaultProps = {
  borderless: false,
  fullscreen: false,
};

export default Widget;
