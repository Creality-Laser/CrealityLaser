import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, message, Modal, Progress } from 'antd';
import {
  CaretRightOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { MACHINE_SERIES } from '../../../../constants';
import { actions as machineActions } from '../../../../flux/machine';
import { actions as editorActions } from '../../../../flux/editor';
import { actions as laserActions } from '../../../../flux/laser';
import MachineSelection from '../MachineSelection';
import CV20Img from '../assets/CV20.png';
import CV10ProProfileImg from './assets/CV01Pro_profile.png';
import styles from './index.module.scss';

function ConnectStatusBtn(props) {
  const {
    machineInfoConnectedByWiFi,
    currentGcode,
    currentGcoreConfig,
    uploadFileProgress,
    uploadFileSucc,
    uploadFileErr,
    uploadFileLoading,
    handleSendGFileToMachine,
    handleCancelSendGFileToMachine,
    resetUploadFileStatus,
    sendPrintCommand,
  } = props;

  const [isShowOperateModal, setIsShowOperateModal] = useState(false);

  const handleStartMachineComProcess = useCallback(() => {
    const isConnectedWifi =
      machineInfoConnectedByWiFi && machineInfoConnectedByWiFi.status;

    if (!isConnectedWifi) {
      const machineNotConnectedMsg =
        'No device connected, Please check your WIFI Connection.';
      message.warn(machineNotConnectedMsg);
      return;
    }

    const isCanSendFile =
      (currentGcoreConfig && currentGcoreConfig.sourcePath) ||
      (currentGcode && currentGcode.path);

    if (!isCanSendFile) {
      const noFileMsg =
        'The workspace is blank, please add the content and try again.';
      message.warn(noFileMsg);
      return;
    }
    setIsShowOperateModal(true);
  }, [currentGcode, currentGcoreConfig, machineInfoConnectedByWiFi]);

  const handleCancelSendModal = useCallback(() => {
    resetUploadFileStatus();
    setIsShowOperateModal(false);
  }, [resetUploadFileStatus]);

  const handlePreview = useCallback(() => {
    message.info('should preview gcode');
  }, []);

  const handleSendFileToMachine = useCallback(() => {
    try {
      resetUploadFileStatus();
      setTimeout(() => {
        handleSendGFileToMachine();
      }, 0);
    } catch (error) {
      message.error(`Send file to Machine error: ${error.message}`);
    }
  }, [handleSendGFileToMachine, resetUploadFileStatus]);

  const handlePauseMachine = useCallback(() => {
    sendPrintCommand('pause');
  }, [sendPrintCommand]);

  const {
    model = 'CV20',
    status = 'idle',
    process = 0,
  } = machineInfoConnectedByWiFi || {};

  const sourcePath =
    (currentGcoreConfig && currentGcoreConfig.sourcePath) ||
    (currentGcode && currentGcode.thumbnail);

  const isShouldShowProgressbar =
    (uploadFileProgress && uploadFileProgress.progress) ||
    uploadFileSucc ||
    uploadFileErr;

  const isMachineWorking = status === 'work';

  const isMachineIdle = status === 'idle';

  const isMachinePause = status === 'pause';

  const isMachineWaitingToStart = isMachineIdle && uploadFileSucc;

  const isMachineIdleButNotWaitingToStart = isMachineIdle && !uploadFileSucc;

  const isConnectedWifi =
    machineInfoConnectedByWiFi && machineInfoConnectedByWiFi.status;

  const seriesLabel = Object.values(MACHINE_SERIES).find(
    (machine) => machine.value === model
  )?.label;

  const carveModalCancelButton = () => {
    return (
      <Button shape="round" onClick={handleCancelSendModal}>
        Cancel
      </Button>
    );
  };

  const carveModalContentCarveSuccess = () => {
    return (
      <div className={styles.send_modal_content_wrapper}>
        <div className={styles.send_modal_preview_wrapper}>
          <span className={styles.device_disconnected_wrapper}>
            <CheckCircleOutlined
              style={{ fontSize: '88px', color: '#52c41a' }}
            />
            <span className={styles.device_disconnected_label}>Finish!</span>
          </span>
        </div>
        <div className={styles.send_modal_info_block_wrapper}>
          <p style={{ marginBottom: 0, fontWeight: 'bold' }}>Carve Finished.</p>
        </div>
        <div className={styles.operators_wrapper}>
          <Button
            shape="round"
            onClick={() => {
              setTimeout(() => {
                handleCancelSendModal();
              }, 0);
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  const carveModalContentWhenConnectMiss = () => {
    return (
      <div className={styles.send_modal_content_wrapper}>
        <div className={styles.send_modal_preview_wrapper}>
          <span className={styles.device_disconnected_wrapper}>
            <CloseCircleOutlined
              style={{ fontSize: '88px', color: '#f5222d' }}
            />
            <span className={styles.device_disconnected_label}>
              Device DisConnected.
            </span>
          </span>
        </div>
        <div className={styles.send_modal_info_block_wrapper}>
          <p style={{ marginBottom: 0, fontWeight: 'bold' }}>
            The device loses connection, please reconnect the device WiFi.
          </p>
        </div>
        <div className={styles.operators_wrapper}>
          <Button
            shape="round"
            onClick={() => {
              setTimeout(() => {
                handleCancelSendModal();
              }, 0);
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  };
  const carveModalContentWhenMachinePause = () => {
    return (
      <div className={styles.send_modal_content_wrapper}>
        <div className={styles.send_modal_preview_wrapper}>
          <img
            className={styles.send_modal_preview_img}
            src={
              (model === 'CV20' && CV20Img) ||
              (model === 'CV01PRO' && CV10ProProfileImg) ||
              CV10ProProfileImg
            }
            alt="Model"
          />
        </div>
        <div className={styles.send_modal_info_block_wrapper}>
          <p style={{ marginBottom: 0, fontWeight: 'bold' }}>
            Press the button on the engraving machine to resume work.Do not use
            the carving machine unattended
          </p>
        </div>
        <div className={styles.operators_wrapper}>
          <Button
            shape="round"
            onClick={() => {
              sendPrintCommand('stop');
              setTimeout(() => {
                handleCancelSendModal();
              }, 0);
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  const carveModalContentWhenMachineWaitingToStart = () => {
    return (
      <div className={styles.send_modal_content_wrapper}>
        <div className={styles.send_modal_preview_wrapper}>
          <img
            className={styles.send_modal_preview_img}
            src={
              (model === 'CV20' && CV20Img) ||
              (model === 'CV01PRO' && CV10ProProfileImg) ||
              CV10ProProfileImg
            }
            alt="Model"
          />
        </div>
        <div className={styles.send_modal_info_block_wrapper}>
          <p style={{ marginBottom: 0, fontWeight: 'bold' }}>
            Please press the button on the machine to start work.(Press for the
            first time to start preview, press again to start carving.)
          </p>
        </div>
        <div className={styles.operators_wrapper}>
          {carveModalCancelButton()}
        </div>
      </div>
    );
  };

  const carveModalContentWhenMachineWorking = () => {
    return (
      <div className={styles.send_modal_content_wrapper}>
        <div className={styles.send_modal_preview_wrapper}>
          <img
            className={styles.send_modal_preview_img}
            src={sourcePath}
            alt="preview"
          />
        </div>
        <div className={styles.send_modal_info_block_wrapper}>
          <div className={styles.send_modal_info_wrapper}>
            <span className={styles.send_modal_info_model_wrapper}>
              <span className={styles.send_modal_info_model_label}>
                Current Model:&nbsp;
              </span>
              <span className={styles.send_modal_info_model_value}>
                {seriesLabel}
              </span>
            </span>
            <span className={styles.send_modal_info_print_time_wrapper}>
              <span className={styles.send_modal_info_print_time_label}>
                Remain:&nbsp;
              </span>
              <span className={styles.send_modal_info_print_time_value}>
                1h 23min 49s
              </span>
            </span>
          </div>
          <div className={styles.send_file_progress_wrapper}>
            <Progress percent={process.toFixed(0)} />
          </div>
        </div>
        <div className={styles.operators_wrapper}>
          <Button
            shape="round"
            onClick={() => {
              sendPrintCommand('stop');
              setTimeout(() => {
                handleCancelSendModal();
              }, 0);
            }}
          >
            Cancel
          </Button>
          <Button type="primary" shape="round" onClick={handlePauseMachine}>
            Pause
          </Button>
        </div>
      </div>
    );
  };

  const carveModalContentWhenMachineIdle = () => {
    return (
      <div className={styles.send_modal_content_wrapper}>
        <div className={styles.send_modal_preview_wrapper}>
          <img
            className={styles.send_modal_preview_img}
            src={sourcePath}
            alt="preview"
          />
        </div>
        <div className={styles.send_modal_info_block_wrapper}>
          <div className={styles.send_modal_info_wrapper}>
            <span className={styles.send_modal_info_model_wrapper}>
              <span className={styles.send_modal_info_model_label}>
                Current Model:&nbsp;
              </span>
              <span className={styles.send_modal_info_model_value}>
                {seriesLabel}
              </span>
            </span>
            <span className={styles.send_modal_info_print_time_wrapper}>
              <span className={styles.send_modal_info_print_time_label}>
                Work Time:&nbsp;
              </span>
              <span className={styles.send_modal_info_print_time_value}>
                12min
              </span>
            </span>
          </div>
          <div className={styles.send_file_progress_wrapper}>
            {isShouldShowProgressbar && (
              <Progress
                percent={
                  (uploadFileProgress && uploadFileProgress.progress) || 0
                }
                status={
                  (uploadFileSucc && 'success') ||
                  (uploadFileErr && 'exception') ||
                  'active'
                }
              />
            )}
            {!isShouldShowProgressbar && <div style={{ height: '22px' }} />}
          </div>
        </div>
        <div className={styles.operators_wrapper}>
          <Button
            shape="round"
            onClick={() => {
              handleCancelSendGFileToMachine();
              handleCancelSendModal();
            }}
          >
            Cancel
          </Button>
          <span>
            <Button
              style={{ marginRight: '10px' }}
              shape="round"
              onClick={handlePreview}
            >
              Preview
            </Button>
            <Button
              type="primary"
              shape="round"
              onClick={handleSendFileToMachine}
              disabled={uploadFileLoading}
            >
              Send
            </Button>
          </span>
        </div>
      </div>
    );
  };

  const isProgressFinish = process === 10000;

  return (
    <>
      <div className={styles.wrapper}>
        <MachineSelection />
        <span>
          <Button
            type={isConnectedWifi ? 'primary' : 'default'}
            icon={<CaretRightOutlined style={{ fontSize: '24px' }} />}
            onClick={handleStartMachineComProcess}
          />
        </span>
      </div>
      <Modal
        title="Carve"
        visible={isShowOperateModal}
        footer={null}
        onCancel={handleCancelSendModal}
        destroyOnClose
      >
        {!isConnectedWifi && carveModalContentWhenConnectMiss()}
        {isConnectedWifi && isProgressFinish && carveModalContentCarveSuccess()}
        {isConnectedWifi &&
          isMachinePause &&
          carveModalContentWhenMachinePause()}
        {isConnectedWifi &&
          !isProgressFinish &&
          isMachineWaitingToStart &&
          carveModalContentWhenMachineWaitingToStart()}
        {isConnectedWifi &&
          !isProgressFinish &&
          isMachineWorking &&
          carveModalContentWhenMachineWorking()}
        {isConnectedWifi &&
          !isProgressFinish &&
          isMachineIdleButNotWaitingToStart &&
          carveModalContentWhenMachineIdle()}
      </Modal>
    </>
  );
}

ConnectStatusBtn.propTypes = {
  machineInfoConnectedByWiFi: PropTypes.object,
  currentGcode: PropTypes.object,
  currentGcoreConfig: PropTypes.object,
  uploadFileProgress: PropTypes.object,
  uploadFileSucc: PropTypes.bool,
  uploadFileErr: PropTypes.bool,
  uploadFileLoading: PropTypes.bool,
  handleSendGFileToMachine: PropTypes.func,
  handleCancelSendGFileToMachine: PropTypes.func,
  resetUploadFileStatus: PropTypes.func,
  sendPrintCommand: PropTypes.func,
};

const mapStateToProps = (state) => {
  const {
    machine: { machineInfoConnectedByWiFi },
    laser: {
      currentGcode,
      currentGcoreConfig,
      uploadFileProgress,
      uploadFileSucc,
      uploadFileErr,
      uploadFileLoading,
    },
  } = state;

  return {
    machineInfoConnectedByWiFi,
    currentGcoreConfig,
    currentGcode,
    uploadFileProgress,
    uploadFileSucc,
    uploadFileErr,
    uploadFileLoading,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleSendGFileToMachine: () =>
      dispatch(editorActions.handleSendGFileToMachine('laser')),
    handleCancelSendGFileToMachine: () =>
      dispatch(editorActions.handleCancelSendGFileToMachine('laser')),
    resetUploadFileStatus: () => dispatch(laserActions.resetUploadFileStatus()),
    sendPrintCommand: (command) =>
      dispatch(machineActions.sendPrintCommand(command)),
  };
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(ConnectStatusBtn)
);