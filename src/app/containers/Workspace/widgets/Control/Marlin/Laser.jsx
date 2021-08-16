import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Switch, Button, Checkbox, InputNumber as Input } from 'antd';
import TestFocus from './LaserTestFocus';

import { actions as machineActions } from '../../../../../flux/machine';
import {
  CONNECTION_TYPE_WIFI,
  WORKFLOW_STATUS_PAUSED,
  WORKFLOW_STATUS_RUNNING,
} from '../../../../../constants';
import styles from './index.module.scss';

const i18n = {
  _: (str) => str,
};

class Laser extends PureComponent {
  state = {
    workSpeed: 100,
    workSpeedValue: 100,
    laserPowerOpen: this.props.headStatus,
    laserPower: this.props.laserPower || 20,
  };

  actions = {
    isWifiPrinting: () => {
      const { workflowStatus, connectionType } = this.props;
      return (
        _.includes(
          [WORKFLOW_STATUS_RUNNING, WORKFLOW_STATUS_PAUSED],
          workflowStatus
        ) && connectionType === CONNECTION_TYPE_WIFI
      );
    },
    onChangeWorkSpeedValue: (value) => {
      this.setState({
        workSpeedValue: value,
      });
    },
    onClickWorkSpeed: () => {
      const workSpeedValue = this.state.workSpeedValue;
      this.setState(() => ({
        workSpeed: workSpeedValue,
      }));
      if (this.actions.isWifiPrinting()) {
        this.props.server.updateWorkSpeedFactor(workSpeedValue);
      } else {
        this.props.executeGcode(`M220 S${workSpeedValue}`);
      }
    },
    onChangeLaserPower: (value) => {
      this.setState({
        laserPower: value,
      });
    },
    onClickLaserPower: () => {
      if (this.actions.isWifiPrinting()) {
        return;
      }
      if (this.state.laserPowerOpen) {
        this.props.executeGcode('M5');
      } else {
        this.props.executeGcode(`M3 S${this.state.laserPower}`);
      }

      this.setState((state) => ({
        laserPowerOpen: !state.laserPowerOpen,
      }));
    },
    onSaveLaserPower: () => {
      if (this.actions.isWifiPrinting()) {
        this.props.server.updateLaserPower(this.state.laserPower);
      } else {
        if (this.state.laserPowerOpen) {
          this.props.executeGcode(`M3 S${this.state.laserPower}`);
        } else {
          this.props.executeGcode(`M3 S${this.state.laserPower}`);
          this.props.executeGcode('M5');
        }
        this.props.executeGcode('M500');
      }
    },
    onChangeLaserPrintMode: () => {
      this.props.updateState({
        isLaserPrintAutoMode: !this.props.isLaserPrintAutoMode,
      });
    },
    onChangeMaterialThickness: (value) => {
      this.props.updateState({
        materialThickness: value,
      });
    },
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.state.laserPowerOpen !== nextProps.headStatus) {
      this.setState({
        laserPowerOpen: nextProps.headStatus,
      });
    }
  }

  render() {
    const {
      size,
      isLaserPrintAutoMode,
      materialThickness,
      laserFocalLength,
      connectionType,
    } = this.props;
    const { laserPowerOpen, laserPower, workSpeed, workSpeedValue } =
      this.state;
    const actions = this.actions;
    const isWifiPrinting = this.actions.isWifiPrinting();

    return (
      <div className={styles.contentBlock}>
        {connectionType === CONNECTION_TYPE_WIFI && (
          <>
            <div className={styles.contentItem}>
              <span className={styles.contentItemLabel}>
                {i18n._('Printing Auto Mode')}
              </span>
              <span className={styles.contentItemContent}>
                <Checkbox
                  isChecked={isLaserPrintAutoMode}
                  onChange={actions.onChangeLaserPrintMode}
                />
              </span>
            </div>
            {isLaserPrintAutoMode && (
              <div className={styles.contentItem}>
                <span className={styles.contentItemLabel}>
                  {i18n._('Material Thickness')}
                </span>
                <span className={styles.contentItemContent}>
                  <Input
                    className="sm-parameter-row__input"
                    value={materialThickness}
                    max={size.z - 40}
                    min={0}
                    onChange={actions.onChangeMaterialThickness}
                  />
                  <span className={styles.inputUnit}>mm</span>
                </span>
              </div>
            )}
            {isLaserPrintAutoMode && laserFocalLength && (
              <>
                <div className={styles.contentItem}>
                  <span className={styles.contentItemLabel}>
                    {i18n._('Laser Focus')}
                  </span>
                  <span className={styles.contentItemContent}>
                    <span>{laserFocalLength}</span>
                    <span>mm</span>
                  </span>
                </div>
                <div className={styles.contentItem}>
                  <span className={styles.contentItemLabel}>
                    {i18n._('Z Offset')}
                  </span>
                  <span className={styles.contentItemContent}>
                    <span>{laserFocalLength + materialThickness}</span>
                    <span>mm</span>
                  </span>
                </div>
              </>
            )}
          </>
        )}
        <div className={styles.contentItem}>
          <span className={styles.contentItemLabel}>
            {i18n._('Work Speed')}
          </span>
          <span className={styles.contentItemContent}>
            <span>{workSpeed}/</span>
            <span className={styles.inputWrapper}>
              <Input
                value={workSpeedValue}
                max={500}
                min={0}
                onChange={actions.onChangeWorkSpeedValue}
              />
              <span className={styles.inputUnit}>%</span>
            </span>
            <Button
              onClick={actions.onClickWorkSpeed}
              type="primary"
              wrapperStyle={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
              }}
            >
              <span className="iconfont" style={{ fontSize: '12px' }}>
                &#xe69c;
              </span>
            </Button>
          </span>
        </div>
        <div className={styles.contentItem}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <Switch
              disabled={isWifiPrinting}
              checked={laserPowerOpen}
              onClick={this.actions.onClickLaserPower}
            />
            <span style={{ marginLeft: '6px' }}>{i18n._('Laser Power')}</span>
          </span>
          <span className={styles.contentItemContent}>
            <span className={styles.inputWrapper}>
              <Input
                value={laserPower}
                max={100}
                min={0}
                onChange={actions.onChangeLaserPower}
                // disabled={!laserPowerOpen}
              />
              <span className={styles.inputUnit}>%</span>
            </span>
            <Button
              onClick={actions.onSaveLaserPower}
              disabled={!laserPowerOpen}
              type="primary"
              wrapperStyle={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
              }}
            >
              <span className="iconfont" style={{ fontSize: '12px' }}>
                &#xe69c;
              </span>
            </Button>
          </span>
        </div>
        <TestFocus />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const machine = state.machine;
  const {
    size,
    workflowStatus,
    connectionType,
    server,
    laserPower,
    headStatus,
    isLaserPrintAutoMode,
    materialThickness,
    laserFocalLength,
  } = machine;

  return {
    size,
    workflowStatus,
    connectionType,
    server,
    laserPower,
    headStatus,
    isLaserPrintAutoMode,
    materialThickness,
    laserFocalLength,
  };
};

Laser.propTypes = {
  headStatus: PropTypes.bool,
  laserPower: PropTypes.number,
  isLaserPrintAutoMode: PropTypes.bool,
  materialThickness: PropTypes.number,
  laserFocalLength: PropTypes.number,
  workflowStatus: PropTypes.string,
  connectionType: PropTypes.string,
  server: PropTypes.object,
  size: PropTypes.object,

  executeGcode: PropTypes.func.isRequired,
  updateState: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    executeGcode: (gcode, context) =>
      dispatch(machineActions.executeGcode(gcode, context)),
    updateState: (state) => dispatch(machineActions.updateState(state)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Laser);
