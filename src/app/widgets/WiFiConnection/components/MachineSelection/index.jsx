import React, { useState, useCallback, useEffect } from 'react';
import classNames from 'classnames';
// import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Button, Progress, message } from 'antd';
import { MACHINE_SERIES } from '../../../../constants';
import { actions as machineActions } from '../../../../flux/machine';
import CV10ProImg from '../assets/CV01Pro.png';
import CV20Img from '../assets/CV20.png';
import CV30Img from '../assets/CV30.png';
import Ender3sImg from '../assets/Ender3s.png';
import styles from './index.module.scss';

const machines = Object.values(MACHINE_SERIES)
  .map(
    (machine) =>
      machine && machine.value && { label: machine.label, value: machine.value }
  )
  .filter((m) => m.value.startsWith('CV') || m.value.startsWith('Ender'));

function MachineSelection(props) {
  const {
    series,
    updateMachineSeries,
    getDeviceWareInfoByWiFi,
    deviceWareInfoByWiFi,
    deviceWareInfoByWiFiErr,
    deviceWareInfoByWiFiLoading,
    uploadOTAFile,
    cancelUploadOTAFile,
    resetUploadOTAFileStatus,
    uploadOTAFileLoading,
    uploadOTAFileSucc,
    uploadOTAFileErr,
    uploadOTAFileProgress,
    machineInfoConnectedByWiFi,
  } = props;

  const [isShowMachineSelectModal, setIsShowMachineSelectModal] =
    useState(false);
  const [currentSelectedMachine, setCurrentSelectedMachine] = useState(series);
  const [isShowFirmwareUpdateModal, setIsShowFirmwareUpdateModal] =
    useState(false);
  const [otaFile, setOTAFile] = useState(null);

  const handleCancelMachineSelectModal = useCallback(() => {
    setIsShowMachineSelectModal(false);
  }, []);

  const handleShowMachineSelectModal = useCallback(() => {
    getDeviceWareInfoByWiFi();
    setIsShowMachineSelectModal(true);
  }, [getDeviceWareInfoByWiFi]);

  const handleUpdateMachineSeries = useCallback(() => {
    updateMachineSeries(currentSelectedMachine);
    message.success(`Toggle model success`);
  }, [currentSelectedMachine, updateMachineSeries]);

  const handleChangeCurrentSelectedMachine = useCallback((machine) => {
    setCurrentSelectedMachine(machine);
  }, []);

  const handleShowFirmwareUpdateModal = useCallback(() => {
    setIsShowFirmwareUpdateModal(true);
  }, []);

  const handleCancelFirmwareUpdateModal = useCallback(() => {
    setIsShowFirmwareUpdateModal(false);
    resetUploadOTAFileStatus();
    setOTAFile(null);
  }, [resetUploadOTAFileStatus]);

  useEffect(() => {
    if (uploadOTAFileSucc) {
      message.success(`Send firmware file success`);
      handleCancelFirmwareUpdateModal();
    }
  }, [handleCancelFirmwareUpdateModal, uploadOTAFileSucc]);

  const handleFirmwareInputChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const { name, path, size } = file;
      setOTAFile({
        name,
        path,
        size,
      });
    }
  };

  const handleUploadOTAFile = useCallback(() => {
    uploadOTAFile(otaFile);
  }, [otaFile, uploadOTAFile]);

  const handleCancelUploadOTAFile = useCallback(() => {
    cancelUploadOTAFile();
  }, [cancelUploadOTAFile]);

  const seriesLabel = Object.values(MACHINE_SERIES).find(
    (machine) => machine.value === series
  )?.label;

  const isShouldShowOTAFileUploadProgress =
    uploadOTAFileLoading || uploadOTAFileSucc || uploadOTAFileErr;

  const currentConnetedModelSeries =
    machineInfoConnectedByWiFi && machineInfoConnectedByWiFi.model;

  return (
    <>
      <button
        type="button"
        className={styles.status_btn}
        onClick={handleShowMachineSelectModal}
      >
        <span className={styles.status_btn_label}>{seriesLabel}</span>
      </button>
      <Modal
        title="Model"
        maskClosable={false}
        visible={isShowMachineSelectModal}
        footer={
          <div className={styles.modal_footer}>
            <span className={styles.current_fireware_wrapper}>
              <span className={styles.current_fireware_label}>
                Current fireware version:&nbsp;
              </span>
              {deviceWareInfoByWiFiLoading && (
                <span className={styles.current_fireware_loading}>
                  loading...
                </span>
              )}
              {deviceWareInfoByWiFiErr && !deviceWareInfoByWiFiLoading && (
                <span className={styles.current_fireware_error}>error</span>
              )}
              {deviceWareInfoByWiFi && (
                <span className={styles.current_fireware_value}>
                  {deviceWareInfoByWiFi.firmwareVersion}
                </span>
              )}
            </span>
            <Button
              shape="round"
              style={{ marginRight: '10px' }}
              disabled={
                currentSelectedMachine !== series ||
                series !== currentConnetedModelSeries
              }
              onClick={handleShowFirmwareUpdateModal}
            >
              Update Firmware
            </Button>
            <Button
              type="primary"
              shape="round"
              onClick={handleUpdateMachineSeries}
              disabled={currentSelectedMachine === series}
            >
              Enter
            </Button>
          </div>
        }
        width={600}
        onCancel={handleCancelMachineSelectModal}
        destroyOnClose
      >
        <div className={styles.select_wrapper}>
          <div className={styles.sidebar_wrapper}>
            {machines.map((machine) => (
              <button
                type="button"
                key={machine.value}
                className={classNames([
                  styles.sidebar_machine_wrapper,
                  series === machine.value &&
                    styles.sidebar_machine_selected_wrapper,
                  currentSelectedMachine === machine.value &&
                    styles.sidebar_machine_current_choosed_wrapper,
                ])}
                onClick={() =>
                  handleChangeCurrentSelectedMachine(machine.value)
                }
              >
                <span className={styles.sidebar_machine_label}>
                  {machine.label}
                </span>
                <img
                  className={styles.sidebar_machine_profile}
                  alt={machine.label}
                  src={
                    (machine.value === 'CV01PRO' && CV10ProImg) ||
                    (machine.value === 'CV20' && CV20Img) ||
                    (machine.value === 'CV30' && CV30Img) ||
                    (machine.value === 'Ender3s' && Ender3sImg) ||
                    ''
                  }
                />
              </button>
            ))}
          </div>
          <div className={styles.machine_details_wrapper}>
            should show {currentSelectedMachine}&apos;s introduce.
          </div>
        </div>
      </Modal>
      <Modal
        title="Firmware Update"
        maskClosable={false}
        visible={isShowFirmwareUpdateModal}
        footer={
          <div>
            <Button
              danger
              type="text"
              disabled={!uploadOTAFileLoading}
              onClick={handleCancelUploadOTAFile}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              disabled={uploadOTAFileLoading || !otaFile}
              onClick={handleUploadOTAFile}
            >
              Update
            </Button>
          </div>
        }
        onCancel={handleCancelFirmwareUpdateModal}
        destroyOnClose
      >
        <div className={styles.firmware_update_modal_content_wraper}>
          <span>
            <span>Choose firmware file:&nbsp;</span>
            <input
              type="file"
              multiple={false}
              onChange={handleFirmwareInputChange}
              accept=".bin"
            />
          </span>
          {isShouldShowOTAFileUploadProgress && (
            <Progress
              percent={
                (uploadOTAFileProgress && uploadOTAFileProgress.progress) || 0
              }
              status={
                (uploadOTAFileSucc && 'success') ||
                (uploadOTAFileErr && 'exception') ||
                'active'
              }
            />
          )}
        </div>
      </Modal>
    </>
  );
}

MachineSelection.propTypes = {
  series: PropTypes.string.isRequired,
  updateMachineSeries: PropTypes.func.isRequired,
  getDeviceWareInfoByWiFi: PropTypes.func.isRequired,
  deviceWareInfoByWiFi: PropTypes.object,
  deviceWareInfoByWiFiErr: PropTypes.bool,
  deviceWareInfoByWiFiLoading: PropTypes.bool,
  uploadOTAFile: PropTypes.func,
  cancelUploadOTAFile: PropTypes.func,
  resetUploadOTAFileStatus: PropTypes.func,
  uploadOTAFileLoading: PropTypes.bool,
  uploadOTAFileSucc: PropTypes.bool,
  uploadOTAFileErr: PropTypes.bool,
  uploadOTAFileProgress: PropTypes.object,
  machineInfoConnectedByWiFi: PropTypes.object,
};

const mapStateToProps = (state) => {
  const {
    machine: {
      series,
      deviceWareInfoByWiFi,
      deviceWareInfoByWiFiErr,
      deviceWareInfoByWiFiLoading,
      uploadOTAFileLoading,
      uploadOTAFileSucc,
      uploadOTAFileErr,
      uploadOTAFileProgress,
      machineInfoConnectedByWiFi,
    },
  } = state;

  return {
    series,
    deviceWareInfoByWiFi,
    deviceWareInfoByWiFiErr,
    deviceWareInfoByWiFiLoading,
    uploadOTAFileLoading,
    uploadOTAFileSucc,
    uploadOTAFileErr,
    uploadOTAFileProgress,
    machineInfoConnectedByWiFi,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateMachineSeries: (series) =>
      dispatch(machineActions.updateMachineSeries(series)),
    getDeviceWareInfoByWiFi: () =>
      dispatch(machineActions.getDeviceWareInfoByWiFi()),
    uploadOTAFile: (fileInfo) =>
      dispatch(machineActions.uploadOTAFile(fileInfo)),
    cancelUploadOTAFile: () => dispatch(machineActions.cancelUploadOTAFile()),
    resetUploadOTAFileStatus: () =>
      dispatch(machineActions.resetUploadOTAFileStatus()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MachineSelection);
