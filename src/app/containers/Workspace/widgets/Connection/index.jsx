import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Button, notification } from 'antd';

import { actions as machineActions } from '../../../../flux/machine';
import {
  CONNECTION_TYPE_SERIAL,
  CONNECTION_TYPE_WIFI,
  EXPERIMENTAL_WIFI_CONTROL,
  MACHINE_SERIES,
  PROTOCOL_TEXT,
} from '../../../../constants';
import Dropdown from '../../components/Dropdown_new';
import SerialConnection from './SerialConnection';
import WifiConnection from './WifiConnection';
import styles from './index.module.scss';

const i18n = {
  _: (str) => str,
};

class Connection extends PureComponent {
  state = {
    isDropped: true,
    alertMessage: '',
    showHomeReminder: false,
  };

  actions = {
    clearAlert: () => {
      this.setState({
        alertMessage: '',
      });
    },
    onSelectTabSerial: () => {
      this.props.updateConnectionState({
        connectionType: CONNECTION_TYPE_SERIAL,
      });
    },
    onSelectTabWifi: () => {
      this.props.updateConnectionState({
        connectionType: CONNECTION_TYPE_WIFI,
      });
    },
    openHomeModal: () => {
      this.setState({
        showHomeReminder: true,
      });
    },
    closeHomeModal: () => {
      this.setState({
        showHomeReminder: false,
      });
    },
    clickHomeModalOk: () => {
      this.props.executeGcodeAutoHome();
      this.setState({
        showHomeReminder: false,
      });
    },
    onToggleDrop: (prevDropped) => {
      this.setState({
        isDropped: !prevDropped,
      });
    },
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { isHomed } = nextProps;
    if (this.props.isHomed !== isHomed && !isHomed) {
      if (this.props.dataSource === PROTOCOL_TEXT) {
        this.actions.openHomeModal();
      }
    }
    if (this.props.isHomed !== isHomed && isHomed) {
      if (this.props.dataSource === PROTOCOL_TEXT) {
        this.actions.closeHomeModal();
      }
    }
  }

  showAlertMessageNotification = (alertMessage) => {
    notification.open({
      message: 'Something Error',
      description: alertMessage,
      onClick: () => {
        this.actions.clearAlert();
      },
    });
  };

  render() {
    const { connectionType, isConnected, series, isHomed } = this.props;
    const { isDropped, alertMessage, showHomeReminder } = this.state;
    const isOriginal = series === MACHINE_SERIES.ORIGINAL.value;

    if (alertMessage) {
      this.showAlertMessageNotification(alertMessage);
    }
    return (
      <>
        <Dropdown
          label={i18n._('Connection')}
          isDropped={isDropped}
          onToggleDrop={this.actions.onToggleDrop}
          wrapperStyle={{
            minWidth: '300px',
          }}
        >
          <div className={styles.contentWrapper}>
            <Button
              onClick={this.actions.onSelectTabSerial}
              disabled={
                isConnected && connectionType !== CONNECTION_TYPE_SERIAL
              }
            >
              {i18n._('Serial Port')}
            </Button>
            <Button
              onClick={this.actions.onSelectTabWifi}
              disabled={isConnected && connectionType !== CONNECTION_TYPE_WIFI}
            >
              {i18n._('Wi-Fi')}
            </Button>
            <span>{connectionType}</span>
            {!EXPERIMENTAL_WIFI_CONTROL && <p>{i18n._('Serial Port')}</p>}
            {connectionType === CONNECTION_TYPE_SERIAL && (
              <SerialConnection
                dataSource={this.props.dataSource}
                style={{ marginTop: '10px' }}
              />
            )}
            {connectionType === CONNECTION_TYPE_WIFI && (
              <WifiConnection style={{ marginTop: '10px' }} />
            )}
          </div>
        </Dropdown>
        <Modal
          visible={
            isConnected &&
            showHomeReminder &&
            !isOriginal &&
            isHomed !== null &&
            !isHomed
          }
          modalContentWidth="460px"
          minHeight="222px"
          title={i18n._('Home Reminder')}
          closable={false}
          onClose={this.actions.clickHomeModalOk}
        >
          <div style={{ borderTop: '1px solid #ddd', padding: '30px 20px' }}>
            <div>
              {/* {i18n._('To continue, the machine needs to go to its home position. Homing works by moving X, Y, Z axes to the pre-defined positions, which will be used as the reference points.')} */}
              {i18n._(
                'The printer will go home to obtain the X, Y, Z positions as the reference points.'
              )}
            </div>
            <div style={{ marginTop: '30px' }}>
              <Button
                type="primary"
                size="small"
                onClick={this.actions.clickHomeModalOk}
                wrapperStyle={{
                  width: '80px',
                  height: '30px',
                  marginLeft: 'auto',
                }}
              >
                {i18n._('OK')}
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  }
}

Connection.propTypes = {
  dataSource: PropTypes.string.isRequired,
  connectionType: PropTypes.string.isRequired,
  series: PropTypes.string.isRequired,
  isHomed: PropTypes.bool,
  isConnected: PropTypes.bool.isRequired,
  updateConnectionState: PropTypes.func.isRequired,
  executeGcodeAutoHome: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownPros) => {
  const { widgets } = state.widget;
  const dataSource = widgets[ownPros.widgetId].dataSource;

  const { connectionType, isConnected, series, isHomed } = state.machine;

  return {
    dataSource,
    connectionType,
    isConnected,
    series,
    isHomed,
  };
};

const mapDispatchToProps = (dispatch) => ({
  executeGcodeAutoHome: () => dispatch(machineActions.executeGcodeAutoHome()),
  updateConnectionState: (state) =>
    dispatch(machineActions.updateConnectionState(state)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Connection);
