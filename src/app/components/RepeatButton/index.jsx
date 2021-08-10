import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

class RepeatButton extends PureComponent {
  actions = {
    handleHoldDown: () => {
      const delay = Number(this.props.delay) || 500;
      const throttle = Number(this.props.throttle) || 50;

      this.timeout = setTimeout(() => {
        this.actions.handleRelease();

        this.interval = setInterval(() => {
          if (this.interval) {
            this.props.onClick();
          }
        }, throttle);
      }, delay);
    },
    handleRelease: () => {
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    },
  };

  UNSAFE_componentWillMount() {
    this.timeout = null;
    this.interval = null;
  }

  componentWillUnmount() {
    this.actions.handleRelease();
  }

  render() {
    const { delay, throttle, children, className } = this.props;
    // eslint-disable-next-line no-delete-var
    delete delay;
    // eslint-disable-next-line no-delete-var
    delete throttle;

    return (
      <button
        type="button"
        className={className}
        onMouseDown={this.actions.handleHoldDown}
        onMouseUp={this.actions.handleRelease}
        onMouseLeave={this.actions.handleRelease}
      >
        {children}
      </button>
    );
  }
}

RepeatButton.propTypes = {
  delay: PropTypes.number,
  throttle: PropTypes.number,
  onClick: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default RepeatButton;
