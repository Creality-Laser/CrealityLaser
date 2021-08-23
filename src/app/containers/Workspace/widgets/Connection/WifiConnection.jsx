import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { map, includes } from 'lodash';
import { Button, Select, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { actions as machineActions } from '../../../../flux/machine';
import {
  ABSENT_OBJECT,
  CONNECTION_STATUS_CONNECTED,
  CONNECTION_STATUS_CONNECTING,
  CONNECTION_STATUS_IDLE,
  CONNECTION_TYPE_WIFI,
  MACHINE_HEAD_TYPE,
  WORKFLOW_STATUS_IDLE,
  WORKFLOW_STATUS_PAUSED,
  WORKFLOW_STATUS_RUNNING,
  WORKFLOW_STATUS_UNKNOWN,
} from '../../../../constants';
import styles from './index.module.scss';
import LaserState from './LaserState';
import IpInputModal from './Modal/IpInputModal';
import FeedbackModal from './Modal/FeedbackModal';
import { Server } from '../../../../flux/machine/Server';
import CyCleIcon from './components/CyCleIcon';

const { Option } = Select;

const i18n = {
  _: (str) => str,
};

class WifiConnection extends PureComponent {
  state = {
    server: {},
    connectModalVisible: false,
    ip: '',
    feedBackType: '', // connection modal feedback type;
  };

  actions = {
    onRefreshServers: () => {
      this.props.discoverServers();
    },
    onChangeServerOption: (__, option) => {
      const find = this.props.servers.find(
        (v) => v.name === option.name && v.address === option.address
      );
      if (find) {
        this.actions.setServer(find);
        this.setState({
          server: find,
        });
      }
    },
    setServer: (server) => {
      this.props.setServer(server);
    },
    openServer: () => {
      this.props.openServer((err, data, text) => {
        if (err) {
          this.actions.showWifiError(err, text);
        }
      });
    },
    closeServer: () => {
      const workflowStatus = this.props.workflowStatus;
      if (
        includes(
          [WORKFLOW_STATUS_PAUSED, WORKFLOW_STATUS_RUNNING],
          workflowStatus
        )
      ) {
        this.setState({
          feedBackType: 'closeConfirm',
        });
      } else {
        this.props.closeServer();
      }
    },
    hideWifiConnectionMessage: () => {
      this.setState({
        feedBackType: '',
      });
    },
    showWifiConnecting: () => {
      this.setState({
        feedBackType: 'waiting',
      });
    },
    showWifiConnected: () => {
      this.setState({ feedBackType: 'success' });
      setTimeout(() => {
        this.actions.hideWifiConnectionMessage();
      }, 2000);
    },
    showWifiDisConnected: () => {
      this.setState({
        feedBackType: 'warn',
      });
      setTimeout(() => {
        this.actions.hideWifiConnectionMessage();
      }, 1000);
    },
    showWifiError: (err, data) => {
      Modal.warn({
        titleType: 'warn',
        title: err.status ? i18n._(`Error ${err.status}`) : i18n._('Error'),
        body: i18n._(data || err.message),
        bodyStyle: { minHeight: '40px' },
      });
    },
    onCloseWifiConnectionMessage: () => {
      this.actions.hideWifiConnectionMessage();
      this.props.closeServer();
    },
    onConnectIp: (ip) => {
      this.setState({
        connectModalVisible: false,
        ip: '',
      });
      const server = new Server('Manual', ip);
      this.actions.setServer(server);
      this.actions.openServer();
    },
  };

  componentDidMount() {
    setTimeout(() => this.props.discoverServers());

    // Auto set server when first launch
    if (this.props.server === ABSENT_OBJECT && this.props.servers.length) {
      this.autoSetServer(this.props.servers);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // Simply compare 2 arrays
    if (nextProps.servers !== this.props.servers) {
      this.autoSetServer(nextProps.servers);
    }

    if (nextProps.connectionType === CONNECTION_TYPE_WIFI) {
      if (
        this.props.connectionStatus !== CONNECTION_STATUS_CONNECTING &&
        nextProps.connectionStatus === CONNECTION_STATUS_CONNECTING
      ) {
        this.actions.showWifiConnecting();
      }
      if (
        this.props.connectionStatus !== CONNECTION_STATUS_CONNECTED &&
        nextProps.connectionStatus === CONNECTION_STATUS_CONNECTED
      ) {
        this.actions.showWifiConnected();
      }
      if (
        this.props.connectionStatus !== CONNECTION_STATUS_IDLE &&
        nextProps.connectionStatus === CONNECTION_STATUS_IDLE
      ) {
        this.actions.showWifiDisConnected();
      }
    }
  }

  autoSetServer(servers) {
    const { server } = this.props;

    const find = servers.find(
      (v) => v.name === server.name && v.address === server.address
    );
    if (find) {
      this.setState({
        server: find,
      });
      this.props.setServer(find);
    }

    // Default select first server
    if (!find && servers.length) {
      this.setState({
        server: servers[0],
      });
      this.props.setServer(servers[0]);
    }
  }

  renderServerOptions = (server) => {
    return (
      <div
        style={{
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
        }}
      >
        <i>
          {server.name} ({server.address})
        </i>
      </div>
    );
  };

  renderServerValue = (server) => {
    return (
      <div
        style={{
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
        }}
      >
        <i>
          {server.name} ({server.address})
        </i>
      </div>
    );
  };

  render() {
    const {
      headType,
      servers,
      workflowStatus,
      discovering,
      isConnected,
      isOpen,
    } = this.props;
    const { server, connectModalVisible, ip, feedBackType } = this.state;

    return (
      <div>
        <div
          className="form-group"
          style={{ marginTop: '10px', marginBottom: '10px' }}
        >
          <div className={styles.portSelectRow}>
            <Select
              size="small"
              style={{ flex: 1, marginRight: '10px', maxWidth: '260px' }}
              onChange={this.actions.onChangeServerOption}
              disabled={isOpen}
              placeholder={i18n._('Choose a machine')}
              value={server.address}
            >
              {map(servers, (s) => ({
                label: s.name,
                value: s.address,
                name: s.name,
                address: s.address,
              })).map((server) => {
                return (
                  <Option key={server.address}>
                    <div
                      style={{
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                      }}
                    >
                      <i>
                        {server.name} ({server.address})
                      </i>
                    </div>
                  </Option>
                );
              })}
            </Select>
            <button
              type="button"
              className={styles.freshBtn}
              title={i18n._('Add')}
              onClick={() => {
                this.setState({ connectModalVisible: true });
              }}
              disabled={isOpen}
            >
              <span className={classNames(discovering && styles.freshBtnIcon)}>
                <PlusOutlined />
              </span>
            </button>
          </div>
        </div>
        {isConnected && (
          <div
            style={{
              marginTop: '10px',
              marginBottom: '10px',
            }}
          >
            <div className={styles['connection-state']}>
              <span className={styles['connection-state-name']}>
                {server.name}
              </span>
              <span className={styles['connection-state-icon']}>
                {workflowStatus === WORKFLOW_STATUS_UNKNOWN && (
                  <i className="sm-icon-14 sm-icon-idle" />
                )}
                {workflowStatus === WORKFLOW_STATUS_IDLE && (
                  <i className="sm-icon-14 sm-icon-idle" />
                )}
                {workflowStatus === WORKFLOW_STATUS_PAUSED && (
                  <i className="sm-icon-14 sm-icon-paused" />
                )}
                {workflowStatus === WORKFLOW_STATUS_RUNNING && (
                  <i className="sm-icon-14 sm-icon-running" />
                )}
              </span>
            </div>
            <div
              className={classNames(
                styles.separator,
                styles['separator-underline']
              )}
              style={{
                marginTop: '10px',
              }}
            />
            {headType === MACHINE_HEAD_TYPE.LASER.value && (
              <LaserState headType={headType} />
            )}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {!isConnected && (
            <Button
              size="small"
              type="primary"
              disabled={isOpen}
              onClick={this.actions.openServer}
            >
              {i18n._('Open')}
            </Button>
          )}
          {isConnected && (
            <Button
              size="small"
              type="danger-linear"
              onClick={this.actions.closeServer}
            >
              {i18n._('Close')}
            </Button>
          )}
        </div>
        {feedBackType && feedBackType === 'success' && (
          <FeedbackModal
            visible
            type="success"
            content={i18n._('Connected')}
            onCancel={() => this.setState({ feedBackType: '' })}
          />
        )}
        {feedBackType && feedBackType === 'warn' && (
          <FeedbackModal
            visible
            type="warn"
            content={i18n._('Disconnected')}
            onCancel={() => this.setState({ feedBackType: '' })}
          />
        )}
        {feedBackType && feedBackType === 'waiting' && (
          <Modal
            visible
            modalContentWidth="460px"
            minHeight="150px"
            onCancel={this.actions.hideWifiConnectionMessage}
            title={i18n._('Screen Authorization Needed')}
          >
            <hr />
            <div style={{ paddingLeft: '20px' }}>
              {i18n._(
                'Please tap Yes on Snapmaker touchscreen to confirm Wi-Fi connection.'
              )}
            </div>
          </Modal>
        )}
        {feedBackType && feedBackType === 'closeConfirm' && (
          <Modal
            visible
            onCancel={this.actions.hideWifiConnectionMessage}
            modalContentWidth="460px"
            minHeight="150px"
            title={i18n._('Disconnection')}
          >
            <div>
              <hr />
              <div style={{ marginLeft: '20px' }}>
                {i18n._(
                  'The machine is working, disconnect will stop current print.'
                )}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  marginRight: '20px',
                  marginTop: '10px',
                }}
              >
                <Button
                  onClick={this.actions.hideWifiConnectionMessage}
                  style={{
                    width: '80px',
                    height: '30px',
                    marginRight: '20px',
                  }}
                >
                  {i18n._('Cancel')}
                </Button>
                <Button
                  onClick={() => {
                    this.actions.hideWifiConnectionMessage();
                    this.props.closeServer();
                  }}
                  type="primary"
                  style={{ width: '80px', height: '30px' }}
                >
                  {i18n._('OK')}
                </Button>
              </div>
            </div>
          </Modal>
        )}
        {connectModalVisible && (
          <IpInputModal
            visible={connectModalVisible}
            onCancel={() => {
              this.setState({
                connectModalVisible: false,
                ip: '',
              });
            }}
            onOk={this.actions.onConnectIp}
            ip={ip}
            onChange={(val) => {
              this.setState({
                ip: val,
              });
            }}
          />
        )}
      </div>
    );
  }
}

WifiConnection.propTypes = {
  headType: PropTypes.string,
  servers: PropTypes.array.isRequired,
  discovering: PropTypes.bool.isRequired,
  server: PropTypes.object.isRequired,
  workflowStatus: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  isConnected: PropTypes.bool.isRequired,
  connectionType: PropTypes.string.isRequired,
  connectionStatus: PropTypes.string.isRequired,

  discoverServers: PropTypes.func.isRequired,
  openServer: PropTypes.func.isRequired,
  closeServer: PropTypes.func.isRequired,
  setServer: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const machine = state.machine;

  const {
    headType,
    servers,
    discovering,
    server,
    workflowStatus,
    isOpen,
    isConnected,
    connectionStatus,
    connectionType,
  } = machine;

  return {
    headType,
    servers,
    discovering,
    server,
    workflowStatus,
    isOpen,
    isConnected,
    connectionStatus,
    connectionType,
  };
};

const mapDispatchToProps = (dispatch) => ({
  discoverServers: () => dispatch(machineActions.discoverServers()),
  openServer: (callback) => dispatch(machineActions.openServer(callback)),
  closeServer: (state) => dispatch(machineActions.closeServer(state)),
  setServer: (server) => dispatch(machineActions.setServer(server)),
});

export default connect(mapStateToProps, mapDispatchToProps)(WifiConnection);
