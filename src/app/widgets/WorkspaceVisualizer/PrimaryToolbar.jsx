import colornames from 'colornames';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'antd';
import Detector from 'three/examples/js/Detector';
// import i18n from '../../lib/i18n';
import styles from './primary-toolbar.module.scss';

const i18n = {
  _: (str) => str,
};

class PrimaryToolbar extends PureComponent {
  render() {
    const { state, actions } = this.props;
    const { coordinateVisible, toolheadVisible, gcodeFilenameVisible } = state;

    return (
      <div>
        <div className={styles.dropdownGroup}>
          <div>WebGL: {Detector.webgl ? 'Enabled' : 'Disabled'}</div>
          <div>
            <Switch
              size="small"
              checked={gcodeFilenameVisible}
              onChange={actions.switchGCodeFilenameVisibility}
            />
            <span>{i18n._('Display G-code Filename')}</span>
          </div>
          <div>
            {coordinateVisible}
            <Switch
              size="small"
              checked={coordinateVisible}
              onChange={actions.switchCoordinateVisibility}
            />
            {coordinateVisible
              ? i18n._('Hide Coordinate System')
              : i18n._('Show Coordinate System')}
          </div>
          <div>
            {toolheadVisible}
            <Switch
              size="small"
              checked={toolheadVisible}
              onChange={actions.switchToolheadVisibility}
            />
            {toolheadVisible
              ? i18n._('Hide Toolhead')
              : i18n._('Show Toolhead')}
          </div>
        </div>
      </div>
    );
  }
}

PrimaryToolbar.propTypes = {
  state: PropTypes.object,
  actions: PropTypes.object,
};

export default PrimaryToolbar;
