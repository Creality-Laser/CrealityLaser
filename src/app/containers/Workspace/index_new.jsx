import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Sortable from 'react-sortablejs';
import { Modal, Button } from 'antd';
import Dropzone from '../../components/Dropzone';

import { controller } from '../../lib/controller';
import Visualizer from '../../widgets/WorkspaceVisualizer/Visualizer';
import {
  WORKFLOW_STATE_IDLE,
  LASER_GCODE_SUFFIX,
  CNC_GCODE_SUFFIX,
  PRINTING_GCODE_SUFFIX,
  CONNECTION_TYPE_WIFI,
} from '../../constants';
import { actions as workspaceActions } from '../../flux/workspace';
import { actions as widgetActions } from '../../flux/widget';
import Connection from './widgets/Connection';
import Console from './widgets/Console';
import GcodeFileLoader from './widgets/GcodeFileLoader';
import Macro from './widgets/Macro';
import Control from './widgets/Control';
import styles from './index_new.module.scss';

const i18n = {
  _: (str) => str,
};

const ACCEPT = `${LASER_GCODE_SUFFIX}, ${CNC_GCODE_SUFFIX}, ${PRINTING_GCODE_SUFFIX}`;

const reloadPage = (forcedReload = true) => {
  // Reload the current page, without using the cache
  window.location.reload(forcedReload);
};

function Workspace(props) {
  const { style } = props;

  const { isShowWorkspace, defaultWidgets, isConnected, connectionType } =
    props;

  const [connected, setConnected] = useState(false);

  const actions = {
    onDropAccepted: (file) => {
      const { uploadGcodeFile } = props;
      uploadGcodeFile(file);
    },
    onDropRejected: (file) => {
      if (!file) {
        return;
      }
      const title = i18n._('Warning');
      const body = i18n._('Only G-code files are supported');
      Modal.info({
        titleType: 'warn',
        title,
        body,
        bodyStyle: { minHeight: '40px' },
      });
    },
  };

  useEffect(() => {
    const controllerEvents = {
      connect: () => {
        setConnected(controller.connected);
      },
      disconnect: () => {
        setConnected(controller.connected);
      },
    };
    function addControllerEvents() {
      Object.keys(controllerEvents).forEach((eventName) => {
        const callback = controllerEvents[eventName];
        controller.on(eventName, callback);
      });
    }
    addControllerEvents();

    function removeControllerEvents() {
      Object.keys(controllerEvents).forEach((eventName) => {
        const callback = controllerEvents[eventName];
        controller.off(eventName, callback);
      });
    }

    return () => {
      removeControllerEvents();
    };
  }, []);

  const isCurrentConnectedByWiFi =
    isConnected && connectionType === CONNECTION_TYPE_WIFI;

  return (
    <>
      {!connected && (
        <Modal
          footer={
            <Button btnStyle="primary" onClick={reloadPage}>
              {i18n._('Reload')}
            </Button>
          }
        >
          <div style={{ display: 'flex' }}>
            <i className="fa fa-exclamation-circle fa-4x text-danger" />
            <div style={{ marginLeft: 25 }}>
              <h5>{i18n._('Server has stopped working')}</h5>
              <p>
                {i18n._(
                  'A problem caused the server to stop working correctly. Check out the server status and try again.'
                )}
              </p>
            </div>
          </div>
        </Modal>
      )}
      <Dropzone
        disabled={controller.workflowState !== WORKFLOW_STATE_IDLE}
        accept={ACCEPT}
        dragEnterMsg={i18n._('Drop a G-code file here.')}
        onDropAccepted={actions.onDropAccepted}
        onDropRejected={actions.onDropRejected}
      >
        <div className={styles.wrapper} style={style}>
          <div className={styles.left_row_wrapper}>
            <Sortable
              options={{
                animation: 150,
                delay: 0,
                group: {
                  name: 'workspace-left-bar',
                },
                handle: '.sortable-handle',
                filter: '.sortable-filter',
                chosenClass: 'sortable-chosen',
                ghostClass: 'sortable-ghost',
                dataIdAttr: 'data-widget-id',
              }}
            >
              <Connection widgetId="connection" />
              <Macro widgetId="macro" isDisabled={isCurrentConnectedByWiFi} />
              <Console
                minimized
                widgetId="console"
                isDefault
                isShowWorkspace={isShowWorkspace}
              />
            </Sortable>
          </div>
          <div className={styles.center_content_wrapper}>
            <Visualizer />
          </div>
          <div className={styles.right_row_wrapper}>
            <Sortable
              options={{
                animation: 150,
                delay: 0,
                group: {
                  name: 'workspace-left-bar',
                },
                handle: '.sortable-handle',
                filter: '.sortable-filter',
                chosenClass: 'sortable-chosen',
                ghostClass: 'sortable-ghost',
                dataIdAttr: 'data-widget-id',
              }}
            >
              <GcodeFileLoader widgetId="gcodeFileLoader" />
              <Control
                widgetId="control"
                isDisabled={isCurrentConnectedByWiFi}
              />
            </Sortable>
          </div>
        </div>
      </Dropzone>
    </>
  );
}

Workspace.propTypes = {
  ...withRouter.propTypes,
  style: PropTypes.object,
  uploadGcodeFile: PropTypes.func.isRequired,
  isShowWorkspace: PropTypes.bool,
};

const mapStateToProps = (state) => {
  const widget = state.widget;
  const showPrimaryContainer = widget.workspace.primary.show;
  const primaryWidgets = widget.workspace.primary.widgets;
  const showSecondaryContainer = widget.workspace.secondary.show;
  const secondaryWidgets = widget.workspace.secondary.widgets;
  const defaultWidgets = widget.workspace.default.widgets;

  const { isConnected, connectionType } = state.machine;

  return {
    showPrimaryContainer,
    showSecondaryContainer,
    defaultWidgets,
    primaryWidgets,
    secondaryWidgets,
    isConnected,
    connectionType,
  };
};
const mapDispatchToProps = (dispatch) => ({
  uploadGcodeFile: (file) => dispatch(workspaceActions.uploadGcodeFile(file)),
  updateTabContainer: (container, value) =>
    dispatch(widgetActions.updateTabContainer('workspace', container, value)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Workspace));
