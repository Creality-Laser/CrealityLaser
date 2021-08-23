import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { createDefaultWidget } from '../../../../components/SMWidget';
import ControlPanel from './ControlPanel';
import Marlin from './Marlin';
import styles from './index.module.scss';

const i18n = {
  _: (str) => str,
};

class Control extends PureComponent {
  constructor(props) {
    super(props);
    this.props.setTitle('Control');
  }

  render() {
    return (
      <>
        <div className={styles.contentWrapper}>
          <div className={styles.contentInnerWrapper}>
            <ControlPanel widgetId="control" />
            <Marlin widgetId="marlin" />
          </div>
        </div>
      </>
    );
  }
}

Control.propTypes = {
  setTitle: PropTypes.func,
};

export default createDefaultWidget(Control);
