import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { actions as machineActions } from '../../flux/machine';
import ConnectStatusBtn from './components/ConnectStatusBtn';
// import styles from './index.module.scss';

function WiFiConnection(props) {
  const {
    // machineInfoConnectedByWiFi,
    subscribeDeviceStatusHeartbeat,
    unsubscribeDeviceStatusHeartbeat,
  } = props;

  // subscribe device status heartbeat
  useEffect(() => {
    setTimeout(() => {
      subscribeDeviceStatusHeartbeat();
    }, 3000);
    return () => {
      unsubscribeDeviceStatusHeartbeat();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <ConnectStatusBtn />;
}

WiFiConnection.propTypes = {
  // machineInfoConnectedByWiFi: PropTypes.object,
  subscribeDeviceStatusHeartbeat: PropTypes.func,
  unsubscribeDeviceStatusHeartbeat: PropTypes.func,
};

const mapStateToProps = () => {
  // const {
  //   machine: { machineInfoConnectedByWiFi },
  // } = state;
  // return {
  //   machineInfoConnectedByWiFi,
  // };
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {
    subscribeDeviceStatusHeartbeat: () =>
      dispatch(machineActions.subscribeDeviceStatusHeartbeat()),
    unsubscribeDeviceStatusHeartbeat: () =>
      dispatch(machineActions.unsubscribeDeviceStatusHeartbeat()),
  };
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(WiFiConnection)
);
