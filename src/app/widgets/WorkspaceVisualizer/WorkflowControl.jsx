import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { Button } from 'antd';
import {
  CaretRightOutlined,
  PauseOutlined,
  BorderOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

import {
  // Workflow
  WORKFLOW_STATE_RUNNING,
  WORKFLOW_STATE_PAUSED,
  WORKFLOW_STATE_IDLE,
  WORKFLOW_STATUS_IDLE,
  WORKFLOW_STATUS_RUNNING,
  WORKFLOW_STATUS_PAUSED,
  CONNECTION_TYPE_WIFI,
  WORKFLOW_STATUS_UNKNOWN,
} from '../../constants';
import styles from './index.module.scss';

// import i18n from '../../lib/i18n';

const i18n = {
  _: (str) => str,
};

class WorkflowControl extends PureComponent {
  state = {
    isServerWaiting: false,
  };

  actions = {
    handleRun: () => {
      this.setState({
        isServerWaiting: true,
      });
      this.props.actions.handleRun();
      setTimeout(() => {
        this.setState({
          isServerWaiting: false,
        });
      }, 1000);
    },
    handlePause: () => {
      this.setState({
        isServerWaiting: true,
      });
      this.props.actions.handlePause();
      setTimeout(() => {
        this.setState({
          isServerWaiting: false,
        });
      }, 1000);
    },
    handleClose: () => {
      this.setState({
        isServerWaiting: true,
      });
      this.props.actions.handleClose();
      setTimeout(() => {
        this.setState({
          isServerWaiting: false,
        });
      }, 1000);
    },
    handleStop: () => {
      this.setState({
        isServerWaiting: true,
      });
      this.props.actions.handleStop();
      setTimeout(() => {
        this.setState({
          isServerWaiting: false,
        });
      }, 1000);
    },
  };

  render() {
    const {
      state,
      connectionType,
      workflowStatus,
      isConnected,
      isWaitingPrinterReady,
    } = this.props;
    const { workflowState } = state;
    const { isServerWaiting } = this.state;
    const isWifi = connectionType && connectionType === CONNECTION_TYPE_WIFI;
    const status = isWifi ? workflowStatus : workflowState;
    const isRendered = this.props.renderState === 'rendered';
    const isUploaded = isWifi ? true : this.props.uploadState === 'uploaded';
    const canClose =
      isRendered &&
      _.includes(
        [WORKFLOW_STATE_IDLE, WORKFLOW_STATUS_IDLE, WORKFLOW_STATUS_UNKNOWN],
        status
      ) &&
      !isWaitingPrinterReady;
    const canPlay =
      isConnected &&
      isRendered &&
      isUploaded &&
      !_.includes([WORKFLOW_STATE_RUNNING, WORKFLOW_STATUS_RUNNING], status) &&
      !isWaitingPrinterReady;
    const canPause =
      _.includes([WORKFLOW_STATE_RUNNING, WORKFLOW_STATUS_RUNNING], status) &&
      !isWaitingPrinterReady;
    const canStop =
      _.includes([WORKFLOW_STATE_PAUSED, WORKFLOW_STATUS_PAUSED], status) &&
      !isWaitingPrinterReady;

    const isAnyBtnDisabled = !canClose || !canPlay || !canPause || !canStop;

    const isAllBtnDisabled = !canClose && !canPlay && !canPause && !canStop;

    return (
      <div
        className={classNames(
          styles.workflowControlWrapper,
          isAnyBtnDisabled ? '' : styles.workflowControlWrapperWithBoxShadow,
          isAllBtnDisabled ? styles.workflowControlWrapperDisabled : ''
        )}
      >
        <Button
          type="button"
          className={styles.workflowControlBtn}
          title={i18n._('Run')}
          onClick={this.actions.handleRun}
          disabled={isServerWaiting || !canPlay}
        >
          <CaretRightOutlined />
        </Button>
        <Button
          type="button"
          className={styles.workflowControlBtn}
          title={i18n._('Pause')}
          onClick={this.actions.handlePause}
          disabled={isServerWaiting || !canPause}
        >
          <PauseOutlined />
        </Button>
        <Button
          type="button"
          className={styles.workflowControlBtn}
          title={i18n._('Stop')}
          onClick={this.actions.handleStop}
          disabled={isServerWaiting || !canStop}
        >
          <BorderOutlined style={{ fontSize: '12px' }} />
        </Button>
        <Button
          className={styles.workflowControlBtn}
          title={i18n._('Close')}
          onClick={this.actions.handleClose}
          disabled={isServerWaiting || !canClose}
        >
          <CloseCircleOutlined />
        </Button>
      </div>
    );
  }
}

WorkflowControl.propTypes = {
  uploadState: PropTypes.string.isRequired,
  workflowStatus: PropTypes.string,
  isConnected: PropTypes.bool,
  connectionType: PropTypes.string,
  state: PropTypes.object,
  renderState: PropTypes.string.isRequired,
  actions: PropTypes.shape({
    handleClose: PropTypes.func.isRequired,
    handleRun: PropTypes.func.isRequired,
    handlePause: PropTypes.func.isRequired,
    handleStop: PropTypes.func.isRequired,
  }),
  isWaitingPrinterReady: PropTypes.bool,
};

const mapStateToProps = (state) => {
  const { workspace, machine } = state;

  return {
    renderState: workspace.renderState,
    isWaitingPrinterReady: machine.isWaitingPrinterReady,
  };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(WorkflowControl);
