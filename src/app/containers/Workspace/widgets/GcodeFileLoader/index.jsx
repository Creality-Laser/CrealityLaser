import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';

import classNames from 'classnames';
import { connect } from 'react-redux';
import _ from 'lodash';
import path from 'path';
import request from 'superagent';
import { Modal, Button, Checkbox } from 'antd';

import { createDefaultWidget } from '../../../../components/SMWidget';
import { pathWithRandomSuffix } from '../../../../../shared/lib/random-utils';
import styles from './index.module.scss';
import {
  CONNECTION_TYPE_WIFI,
  DATA_PREFIX,
  // IMAGE_WIFI_CONNECTED,
  // IMAGE_WIFI_CONNECT_WAITING,
  // IMAGE_WIFI_ERROR,
  MACHINE_HEAD_TYPE,
} from '../../../../constants';
import { actions as workspaceActions } from '../../../../flux/workspace';
import IMAGE_WIFI_CONNECTED from './images/connection/ic_complete_64x64.png';
import IMAGE_WIFI_CONNECT_WAITING from './images/connection/ic_waiting-64x64.png';
import IMAGE_WIFI_ERROR from './images/connection/ic_error_64x64.png';

// import controller from '../../lib/controller';

const i18n = {
  _: (str) => str,
};

class GcodeFileLoader extends PureComponent {
  fileInput = React.createRef();

  changeNameInput = [];

  state = {
    loadToWorkspaceOnLoad: false,
    selectFileName: '',
    selectFileType: '',
    fileUploadProgress: 0,
    fileUploading: false,
  };

  actions = {
    onChangeFile: async (event) => {
      const file = event.target.files[0];

      if (!file) {
        return;
      }

      const acceptedFormats = ['.gcode', '.nc', '.cnc'];
      const isValidFormat =
        file &&
        file.name &&
        acceptedFormats.some((format) =>
          file.name.toLowerCase().endsWith(format)
        );

      if (!isValidFormat) {
        const title = i18n._('Warning');
        const body = i18n._('Only G-code files are supported');
        Modal.warn({
          titleType: 'warn',
          title,
          body,
          bodyStyle: { minHeight: '40px' },
        });
        return;
      }

      const { loadToWorkspaceOnLoad } = this.state;

      if (loadToWorkspaceOnLoad) {
        this.props.uploadGcodeFile(file);
      } else {
        this.props.uploadGcodeFileToList(file);
      }
    },
    onClickToUpload: () => {
      this.fileInput.current.value = null;
      this.fileInput.current.click();
    },

    onChangeShouldPreview: (e) => {
      const isChecked = e.target.checked;
      this.setState({
        loadToWorkspaceOnLoad: isChecked,
      });
    },

    loadGcodeToWorkspace: () => {
      const selectFileName = this.state.selectFileName;
      const find = this.props.gcodeFiles.find(
        (v) => v.uploadName === selectFileName
      );
      if (!find) {
        return;
      }
      this.props.renderGcodeFile(find);
    },

    // File item operations
    onRenameStart: (uploadName, index, event) => {
      this.props.renameGcodeFile(uploadName, null, true);
      event.stopPropagation();
      setTimeout(() => {
        this.changeNameInput[index].current.focus();
      }, 0);
    },
    onRenameEnd: (uploadName, index) => {
      let newName = this.changeNameInput[index].current.value;
      const m = uploadName.match(/(.gcode|.cnc|.nc)$/);
      if (m) {
        newName += m[0];
      }
      this.props.renameGcodeFile(uploadName, newName, false);
    },
    onKeyDown: (e) => {
      let keynum;
      if (window.event) {
        keynum = e.keyCode;
      } else if (e.which) {
        keynum = e.which;
      }
      if (keynum === 13) {
        e.target.blur();
      }
    },
    onSelectFile: (selectFileName, name, event) => {
      if (
        event &&
        (event.target.className.indexOf('input-select') > -1 ||
          event.target.className.indexOf('fa-check') > -1)
      ) {
        return;
      }
      // this.props.renameGcodeFile(selectFileName, name, false, true);
      const filename = path.basename(selectFileName);
      let type = '';
      if (filename.endsWith('.gcode')) {
        type = MACHINE_HEAD_TYPE['3DP'].value;
      }
      if (filename.endsWith('.nc')) {
        type = MACHINE_HEAD_TYPE.LASER.value;
      }
      if (filename.endsWith('.cnc')) {
        type = MACHINE_HEAD_TYPE.CNC.value;
      }
      if (this.state.selectFileName === selectFileName) {
        this.setState({
          selectFileName: '',
          selectFileType: type,
        });
      } else {
        this.setState({
          selectFileName,
          selectFileType: type,
        });
      }
    },
    onRemoveFile: (gcodeFile) => {
      this.props.removeGcodeFile(gcodeFile);
    },

    // Wi-Fi transfer file to Snapmaker
    sendFile: () => {
      this.setState({
        fileUploading: true,
      });
      const selectFileName = this.state.selectFileName;
      const find = this.props.gcodeFiles.find(
        (v) => v.uploadName === selectFileName
      );
      if (!find) {
        return;
      }
      const gcodePath = `${DATA_PREFIX}/${find.uploadName}`;
      request.get(gcodePath).end((err1, res) => {
        const gcode = res.text;
        const blob = new Blob([gcode], { type: 'text/plain' });
        const file = new File([blob], find.name);
        this.props.server.uploadFile(
          find.name,
          file,
          (err, data, text) => {
            this.setState(
              {
                fileUploading: false,
              },
              () => {
                this.setState({
                  fileUploadProgress: 0,
                });
              }
            );
            if (err) {
              Modal.error({
                title: i18n._('Failed to Send File'),
                text,
                img: IMAGE_WIFI_ERROR,
              });
            } else {
              Modal.error({
                title: i18n._('File Sent Successfully'),
                text: i18n._(
                  'Please confirm and choose whether to start to print this file on the touchscreen.'
                ),
                img: IMAGE_WIFI_CONNECTED,
              });
            }
          },
          (p) => {
            this.setState({
              fileUploadProgress: p,
            });
          }
        );
      });
    },
  };

  constructor(props) {
    super(props);
    this.props.setTitle('Gcode Files');
  }

  componentDidMount() {
    for (let i = 0; i < 5; i++) {
      this.changeNameInput[i] = React.createRef();
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      nextProps.gcodeFiles.length > 0 &&
      (nextProps.gcodeFiles.length !== this.props.gcodeFiles.length ||
        nextProps.gcodeFiles[0].uploadName !==
          this.props.gcodeFiles[0].uploadName)
    ) {
      this.actions.onSelectFile(nextProps.gcodeFiles[0].uploadName);
    }
  }

  componentWillUnmount() {
    for (let i = 0; i < 5; i++) {
      this.changeNameInput[i] = null;
    }
  }

  render() {
    const { gcodeFiles, isConnected, headType, connectionType } = this.props;
    const {
      loadToWorkspaceOnLoad,
      selectFileName,
      selectFileType,
      fileUploading,
      fileUploadProgress,
    } = this.state;
    const isHeadType = selectFileType === headType;
    const actions = this.actions;
    const hasFile = gcodeFiles.length > 0;

    return (
      <>
        <div className={styles.contentWrapper}>
          <input
            ref={this.fileInput}
            type="file"
            accept=".gcode,.nc,.cnc"
            style={{ display: 'none' }}
            multiple={false}
            onChange={actions.onChangeFile}
          />
          <Button
            type="primary"
            onClick={actions.onClickToUpload}
            block
            size="small"
          >
            {i18n._('Open G-code File')}
          </Button>
          <div
            style={{ marginTop: '10px', marginBottom: '16px' }}
            className={styles.previewRow}
          >
            <span style={{ paddingLeft: '4px' }}>
              {i18n._('Preview in workspace')}
            </span>
            <Checkbox
              checked={loadToWorkspaceOnLoad}
              onChange={actions.onChangeShouldPreview}
              style={{ width: '20px', height: '20px' }}
            />
          </div>
          {gcodeFiles && gcodeFiles.length > 0 && (
            <div className={styles.gcodeFilesWrapper}>
              {_.map(gcodeFiles, (gcodeFile) => {
                const name =
                  gcodeFile.name.length > 33
                    ? `${gcodeFile.name.substring(
                        0,
                        13
                      )}...${gcodeFile.name.substring(
                        gcodeFile.name.length - 10,
                        gcodeFile.name.length
                      )}`
                    : gcodeFile.name;
                let size = '';
                const { isRenaming } = gcodeFile;

                if (gcodeFile.size / 1024 / 1024 > 1) {
                  size = `${(gcodeFile.size / 1024 / 1024).toFixed(2)} MB`;
                } else if (gcodeFile.size / 1024 > 1) {
                  size = `${(gcodeFile.size / 1024).toFixed(2)} KB`;
                } else {
                  size = `${gcodeFile.size.toFixed(2)} B`;
                }
                const lastModifiedDate = new Date(gcodeFile.lastModifiedDate);
                const date = `${lastModifiedDate.getFullYear()}.${lastModifiedDate.getMonth()}.${lastModifiedDate.getDay()}   ${lastModifiedDate.getHours()}:${lastModifiedDate.getMinutes()}`;

                return (
                  <div key={pathWithRandomSuffix(gcodeFile.uploadName) + name}>
                    <div
                      className={classNames(styles.gcodeFile, {
                        [styles.selected]:
                          selectFileName === gcodeFile.uploadName,
                      })}
                      onClick={(event) =>
                        actions.onSelectFile(gcodeFile.uploadName, name, event)
                      }
                      onKeyDown={noop}
                      role="button"
                      tabIndex={0}
                    >
                      <button
                        type="button"
                        className={classNames(styles.gcodeFileRemove)}
                        onClick={() => {
                          actions.onRemoveFile(gcodeFile);
                        }}
                      >
                        <i
                          className={classNames(
                            'iconfont',
                            styles.gcodeFileRemoveIcon
                          )}
                        >
                          x
                        </i>
                      </button>
                      <div
                        className={classNames(
                          'input-text',
                          styles.gcodeFileText
                        )}
                      >
                        <div
                          className={classNames(styles.gcodeFileTextName, {
                            [styles.haveOpacity]: isRenaming === false,
                          })}
                          // onClick={(event) => actions.onRenameStart(uploadName, index, event)}
                        >
                          <div
                            className={styles.gcodeFileTextRename}
                            title={gcodeFile.name}
                          >
                            {name}
                          </div>
                        </div>
                        <div className={styles.gcodeFileTextInfo}>
                          <span>{size}</span>
                          <span>{date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {gcodeFiles && gcodeFiles.length > 0 && (
            <hr className={styles.divider} />
          )}
          <Button
            disabled={!hasFile}
            onClick={actions.loadGcodeToWorkspace}
            size="small"
            block
          >
            {i18n._('Load G-code to Workspace')}
          </Button>
          <Button
            disabled={
              !(
                hasFile &&
                isConnected &&
                isHeadType &&
                connectionType === CONNECTION_TYPE_WIFI
              )
            }
            size="small"
            onClick={actions.sendFile}
            style={{ marginTop: '10px' }}
            block
          >
            {i18n._('Send to IVI via Wi-Fi')}
          </Button>
        </div>
        <Modal
          visible={fileUploading}
          onCancel={() => this.setState({ fileUploading: false })}
          modalContentWidth="360px"
          minHeight="150px"
          title={null}
          maskClosable={false}
        >
          <div style={{ padding: '0px 30px 20px', textAlign: 'center' }}>
            <img
              src={IMAGE_WIFI_CONNECT_WAITING}
              alt="loading"
              width="64"
              height="64"
            />
            <p style={{ fontSize: '16px', marginTop: '10px' }}>
              {i18n._('Sending File')}
            </p>
            <p style={{ fontSize: '16px', color: '#cbcbcb' }}>
              <span>{i18n._('Please wait for the file transfer.')}</span>{' '}
              <span>({(fileUploadProgress * 100).toFixed(2)}%)</span>
            </p>
          </div>
        </Modal>
      </>
    );
  }
}

GcodeFileLoader.propTypes = {
  setTitle: PropTypes.func,
  gcodeFiles: PropTypes.array.isRequired,

  headType: PropTypes.string,
  isConnected: PropTypes.bool.isRequired,
  connectionType: PropTypes.string.isRequired,
  server: PropTypes.object.isRequired,

  renameGcodeFile: PropTypes.func.isRequired,
  removeGcodeFile: PropTypes.func.isRequired,

  uploadGcodeFile: PropTypes.func.isRequired,
  renderGcodeFile: PropTypes.func.isRequired,
  uploadGcodeFileToList: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const { gcodeFiles } = state.workspace;
  const { server, isConnected, headType, connectionType } = state.machine;

  return {
    gcodeFiles,
    headType,
    isConnected,
    connectionType,
    server,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    renameGcodeFile: (uploadName, newName, isRenaming) =>
      dispatch(
        workspaceActions.renameGcodeFile(uploadName, newName, isRenaming)
      ),
    uploadGcodeFile: (fileInfo) =>
      dispatch(workspaceActions.uploadGcodeFile(fileInfo)),
    removeGcodeFile: (fileInfo) =>
      dispatch(workspaceActions.removeGcodeFile(fileInfo)),
    renderGcodeFile: (file) =>
      dispatch(workspaceActions.renderGcodeFile(file, false)),
    uploadGcodeFileToList: (fileInfo) =>
      dispatch(workspaceActions.uploadGcodeFileToList(fileInfo)),
  };
};

export default createDefaultWidget(
  connect(mapStateToProps, mapDispatchToProps)(GcodeFileLoader)
);
