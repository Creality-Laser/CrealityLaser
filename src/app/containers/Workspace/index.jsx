import _ from 'lodash';
import classNames from 'classnames';
import { connect } from 'react-redux';
import pubsub from 'pubsub-js';
import React, { PureComponent } from 'react';
import includes from 'lodash/includes';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Button, Modal } from 'antd';
import { controller } from '../../lib/controller';

// import * as widgetManager from './WidgetManager';
import DefaultWidgets from './DefaultWidgets';
import PrimaryWidgets from './PrimaryWidgets';
import SecondaryWidgets from './SecondaryWidgets';
import Dropzone from '../../components/Dropzone';
import styles from './index.module.scss';

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
import GcodeFileLoader from './widgets/GcodeFileLoader';
import Macro from './widgets/Macro';
import Stop from './widgets/Stop';
import GcodeInfo from './widgets/GcodeInfo';
import Control from './widgets/Control';
import Console from './widgets/Console';

const i18n = {
  _: (str) => str,
};

const ACCEPT = `${LASER_GCODE_SUFFIX}, ${CNC_GCODE_SUFFIX}, ${PRINTING_GCODE_SUFFIX}`;

const reloadPage = (forcedReload = true) => {
  // Reload the current page, without using the cache
  window.location.reload(forcedReload);
};

class Workspace extends PureComponent {
  state = {
    connected: controller.connected,
    isDraggingWidget: false,
  };

  primaryContainer = React.createRef();

  secondaryContainer = React.createRef();

  primaryToggler = React.createRef();

  secondaryToggler = React.createRef();

  defaultContainer = React.createRef();

  controllerEvents = {
    connect: () => {
      this.setState({ connected: controller.connected });
    },
    disconnect: () => {
      this.setState({ connected: controller.connected });
    },
  };

  widgetEventHandler = {
    onRemoveWidget: () => {},
    onDragStart: () => {
      this.setState({ isDraggingWidget: true });
    },
    onDragEnd: () => {
      this.setState({ isDraggingWidget: false });
    },
  };

  actions = {
    onDropAccepted: (file) => {
      this.props.uploadGcodeFile(file);
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
    toggleFromDefault: (widgetId) => () => {
      // clone
      const defaultWidgets = _.slice(this.props.defaultWidgets);
      if (includes(defaultWidgets, widgetId)) {
        defaultWidgets.splice(defaultWidgets.indexOf(widgetId), 1);
        this.props.updateTabContainer('default', {
          widgets: defaultWidgets,
        });
      }
    },
    toggleToDefault: (widgetId) => () => {
      // clone
      const defaultWidgets = _.slice(this.props.defaultWidgets);
      if (!includes(defaultWidgets, widgetId)) {
        defaultWidgets.push(widgetId);
        this.props.updateTabContainer('default', {
          widgets: defaultWidgets,
        });
      }
    },
  };

  componentDidMount() {
    this.addControllerEvents();
    // this.addResizeEventListener();

    // setTimeout(() => {
    //     A workaround solution to trigger componentDidUpdate on initial render
    // this.setState({ mounted: true });
    // }, 0);
  }

  componentDidUpdate() {
    // this.resizeDefaultContainer();
  }

  componentWillUnmount() {
    this.removeControllerEvents();
    // this.removeResizeEventListener();
  }

  resizeDefaultContainer = () => {
    // const sidebar = document.querySelector("#sidebar");

    const sidebar = { offsetWidth: 0 };

    const primaryContainer = this.primaryContainer.current;
    const primaryToggler = this.primaryToggler.current;
    const secondaryContainer = this.secondaryContainer.current;
    const secondaryToggler = this.secondaryToggler.current;
    const defaultContainer = this.defaultContainer.current;
    const { showPrimaryContainer, showSecondaryContainer } = this.props;

    {
      // Mobile-Friendly View
      const { location } = this.props;
      const disableHorizontalScroll = !(
        showPrimaryContainer && showSecondaryContainer
      );

      if (location.pathname === '/workspace' && disableHorizontalScroll) {
        // Disable horizontal scroll
        document.body.scrollLeft = 0;
        document.body.style.overflowX = 'hidden';
      } else {
        // Enable horizontal scroll
        document.body.style.overflowX = '';
      }
    }

    if (showPrimaryContainer) {
      defaultContainer.style.left = `${
        primaryContainer.offsetWidth + sidebar.offsetWidth
      }px`;
      primaryToggler.style.left = `${
        primaryContainer.offsetWidth + sidebar.offsetWidth
      }px`;
    } else {
      defaultContainer.style.left = `${sidebar.offsetWidth}px`;
      primaryToggler.style.left = `${sidebar.offsetWidth}px`;
    }

    if (showSecondaryContainer) {
      defaultContainer.style.right = `${secondaryContainer.offsetWidth}px`;
      secondaryToggler.style.right = `${secondaryContainer.offsetWidth}px`;
    } else {
      defaultContainer.style.right = '0px';
      secondaryToggler.style.right = '0px';
    }

    // Publish a 'resize' event
    pubsub.publish('resize'); // Also see "widgets/Visualizer"
  };

  togglePrimaryContainer = () => {
    const { showPrimaryContainer } = this.props;
    this.props.updateTabContainer('primary', {
      show: !showPrimaryContainer,
    });

    // Publish a 'resize' event
    pubsub.publish('resize'); // Also see "widgets/Visualizer"
  };

  toggleSecondaryContainer = () => {
    const { showSecondaryContainer } = this.props;
    this.props.updateTabContainer('secondary', {
      show: !showSecondaryContainer,
    });

    // Publish a 'resize' event
    pubsub.publish('resize'); // Also see "widgets/Visualizer"
  };

  addResizeEventListener() {
    this.onResizeThrottled = _.throttle(this.resizeDefaultContainer, 50);
    window.addEventListener('resize', this.onResizeThrottled);
  }

  removeResizeEventListener() {
    window.removeEventListener('resize', this.onResizeThrottled);
    this.onResizeThrottled = null;
  }

  addControllerEvents() {
    Object.keys(this.controllerEvents).forEach((eventName) => {
      const callback = this.controllerEvents[eventName];
      controller.on(eventName, callback);
    });
  }

  removeControllerEvents() {
    Object.keys(this.controllerEvents).forEach((eventName) => {
      const callback = this.controllerEvents[eventName];
      controller.off(eventName, callback);
    });
  }

  render() {
    const {
      style,
      className,
      showPrimaryContainer,
      showSecondaryContainer,
      defaultWidgets,
      primaryWidgets,
      secondaryWidgets,
      isShowWorkspace,
      isConnected,
      connectionType,
    } = this.props;

    const actions = { ...this.actions };
    const { connected, isDraggingWidget } = this.state;
    const hidePrimaryContainer = !showPrimaryContainer;
    const hideSecondaryContainer = !showSecondaryContainer;

    const isCurrentConnectedByWiFi =
      isConnected && connectionType === CONNECTION_TYPE_WIFI;

    return (
      <div
        style={style}
        className={classNames(className, styles.workspace, this.state.mounted)}
      >
        {!connected && (
          <Modal disableOverlay showCloseButton={false}>
            <Modal.Body>
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
            </Modal.Body>
            <Modal.Footer>
              <Button btnStyle="primary" onClick={reloadPage}>
                {i18n._('Reload')}
              </Button>
            </Modal.Footer>
          </Modal>
        )}
        <Dropzone
          disabled={
            isDraggingWidget || controller.workflowState !== WORKFLOW_STATE_IDLE
          }
          accept={ACCEPT}
          dragEnterMsg={i18n._('Drop a G-code file here.')}
          onDropAccepted={actions.onDropAccepted}
          onDropRejected={actions.onDropRejected}
        >
          <div className={styles.workspaceTable}>
            <div className={styles.workspaceHeader}>
              <Connection widgetId="connection" />
              <GcodeFileLoader />
              <Macro isDisabled={isCurrentConnectedByWiFi} />
              <Control isDisabled={isCurrentConnectedByWiFi} />
              <Stop isDisabled={isCurrentConnectedByWiFi} />
            </div>
            <div className={styles.workspaceTableRow}>
              {false && (
                <div
                  ref={this.primaryContainer}
                  className={classNames(styles.primaryContainer, {
                    [styles.hidden]: hidePrimaryContainer,
                  })}
                >
                  <PrimaryWidgets
                    defaultWidgets={defaultWidgets}
                    primaryWidgets={primaryWidgets}
                    toggleToDefault={this.actions.toggleToDefault}
                    onRemoveWidget={this.widgetEventHandler.onRemoveWidget}
                    onDragStart={this.widgetEventHandler.onDragStart}
                    onDragEnd={this.widgetEventHandler.onDragEnd}
                    updateTabContainer={this.props.updateTabContainer}
                  />
                </div>
              )}
              {false && (
                <div
                  ref={this.primaryToggler}
                  className={classNames(styles.primaryToggler)}
                >
                  <button
                    type="button"
                    className="btn btn-default"
                    onClick={this.togglePrimaryContainer}
                  >
                    {!hidePrimaryContainer && (
                      <i
                        className="fa fa-chevron-left"
                        style={{ verticalAlign: 'middle' }}
                      />
                    )}
                    {hidePrimaryContainer && (
                      <i
                        className="fa fa-chevron-right"
                        style={{ verticalAlign: 'middle' }}
                      />
                    )}
                  </button>
                </div>
              )}

              <div
                ref={this.defaultContainer}
                className={classNames(styles.defaultContainer, styles.fixed)}
              >
                <DefaultWidgets
                  defaultWidgets={defaultWidgets}
                  toggleFromDefault={this.actions.toggleFromDefault}
                />
              </div>
              {false && (
                <div
                  ref={this.secondaryToggler}
                  className={classNames(styles.secondaryToggler)}
                >
                  <button
                    type="button"
                    className="btn btn-default"
                    onClick={this.toggleSecondaryContainer}
                  >
                    {!hideSecondaryContainer && (
                      <i
                        className="fa fa-chevron-right"
                        style={{ verticalAlign: 'middle' }}
                      />
                    )}
                    {hideSecondaryContainer && (
                      <i
                        className="fa fa-chevron-left"
                        style={{ verticalAlign: 'middle' }}
                      />
                    )}
                  </button>
                </div>
              )}
              {false && (
                <div
                  ref={this.secondaryContainer}
                  className={classNames(styles.secondaryContainer, {
                    [styles.hidden]: hideSecondaryContainer,
                  })}
                >
                  <SecondaryWidgets
                    defaultWidgets={defaultWidgets}
                    secondaryWidgets={secondaryWidgets}
                    toggleToDefault={this.actions.toggleToDefault}
                    onRemoveWidget={this.widgetEventHandler.onRemoveWidget}
                    onDragStart={this.widgetEventHandler.onDragStart}
                    onDragEnd={this.widgetEventHandler.onDragEnd}
                    updateTabContainer={this.props.updateTabContainer}
                  />
                </div>
              )}
            </div>
            <GcodeInfo />
            <Console
              minimized
              widgetId="console"
              isDefault
              isShowWorkspace={isShowWorkspace}
            />
          </div>
        </Dropzone>
      </div>
    );
  }
}

Workspace.propTypes = {
  ...withRouter.propTypes,
  showPrimaryContainer: PropTypes.bool.isRequired,
  showSecondaryContainer: PropTypes.bool.isRequired,
  defaultWidgets: PropTypes.array.isRequired,
  primaryWidgets: PropTypes.array.isRequired,
  secondaryWidgets: PropTypes.array.isRequired,
  updateTabContainer: PropTypes.func.isRequired,
  uploadGcodeFile: PropTypes.func.isRequired,
  isShowWorkspace: PropTypes.bool,
  isConnected: PropTypes.bool,
  connectionType: PropTypes.string,
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
