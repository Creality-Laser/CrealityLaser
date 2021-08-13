import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Dropdown from '../../components/Dropdown_new';
import ControlPanel from './ControlPanel';
import Marlin from './Marlin';
import styles from './index.module.scss';

const i18n = {
  _: (str) => str,
};

class Control extends PureComponent {
  state = {
    isDropped: false,
  };

  actions = {
    onToggleDrop: (prevDropped) => {
      this.setState({
        isDropped: !prevDropped,
      });
    },
  };

  render() {
    const { isDisabled = false } = this.props;
    const { isDropped } = this.state;

    return (
      <Dropdown
        label={i18n._('Control')}
        isDropped={isDropped}
        onToggleDrop={this.actions.onToggleDrop}
        isDisabled={isDisabled}
        wrapperStyle={{
          minWidth: '370px',
        }}
      >
        <div className={styles.contentWrapper}>
          <div className={styles.contentInnerWrapper}>
            <ControlPanel widgetId="control" />
            <Marlin widgetId="marlin" />
          </div>
        </div>
      </Dropdown>
    );
  }
}

Control.propTypes = {
  isDisabled: PropTypes.bool,
};

export default Control;
