import isEqual from 'lodash/isEqual';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import pubsub from 'pubsub-js';
import colornames from 'colornames';
import { Modal, Progress } from 'antd';

import Canvas from '../../components/SMCanvas';
import styles from './index.module.scss';
import { controller } from '../../lib/controller';
import {
  CONNECTION_TYPE_SERIAL,
  MACHINE_HEAD_TYPE,
  MARLIN,
  PROTOCOL_TEXT,
  WORKFLOW_STATUS_IDLE,
  WORKFLOW_STATUS_PAUSED,
  WORKFLOW_STATUS_RUNNING,
  WORKFLOW_STATE_IDLE,
  WORKFLOW_STATE_PAUSED,
  WORKFLOW_STATE_RUNNING,
  WORKFLOW_STATUS_UNKNOWN,
  // IMAGE_WIFI_ERROR,
} from '../../constants';
// import { ensureRange } from '../../lib/numeric-utils';
import TargetPoint from '../../components/three-extensions/TargetPoint';
import { actions as machineActions } from '../../flux/machine';
import { actions, WORKSPACE_STAGE } from '../../flux/workspace';
import PrintablePlate from '../CncLaserShared/PrintablePlate';
import IMAGE_WIFI_ERROR from './images/ic_error_64x64.png';

import { loadTexture } from './helpers';
import Loading from './Loading';
import Rendering from './Rendering';
import ToolHead from './ToolHead';
import WorkflowControl from './WorkflowControl';
import SecondaryToolbar from '../CanvasToolbar/SecondaryToolbar';
// import i18n from '../../lib/i18n';
// import ProgressBar from '../../components/ProgressBar';

const i18n = {
  _: (str) => str,
};

class Visualizer extends Component {
  printableArea = null;

  visualizerGroup = new THREE.Group();

  canvas = React.createRef();

  targetPoint = null;

  toolhead = null;

  toolheadRotationAnimation = null;

  pubsubTokens = [];

  pauseStatus = {
    headStatus: false,
    headPower: 0,
  };

  pause3dpStatus = {
    pausing: false,
    pos: null,
  };

  state = {
    // coordinateVisible: true,
    // toolheadVisible: true,
    controller: {
      type: controller.type,
      state: controller.state,
      settings: controller.settings,
    },
    workflowState: controller.workflowState,
    workPosition: {
      x: '0.000',
      y: '0.000',
      z: '0.000',
      e: '0.000',
    },
    gcode: {
      ready: false,

      // Updates by the "sender:status" event
      name: '',
      size: 0,
      total: 0,
      sent: 0,
      received: 0,
    },
  };

  controllerEvents = {
    'serialport:open': () => {
      this.stopToolheadRotationAnimation();
      this.updateWorkPositionToZero();
      this.props.setGcodePrintingIndex(0);
    },
    'serialport:close': (options) => {
      const { dataSource } = options;
      if (dataSource !== PROTOCOL_TEXT) {
        return;
      }
      // reset state related to port and controller
      this.stopToolheadRotationAnimation();
      this.updateWorkPositionToZero();
      this.props.setGcodePrintingIndex(0);

      this.setState(() => ({
        controller: {
          type: controller.type,
          state: controller.state,
        },
        workflowState: controller.workflowState,
      }));

      this.unloadGcode();
    },
    // 'sender:status': (data, dataSource) => {
    'sender:status': (options) => {
      const { data, dataSource } = options;
      if (dataSource !== PROTOCOL_TEXT) {
        return;
      }
      const { name, size, total, sent, received } = data;
      this.setState((state) => ({
        gcode: {
          ...state.gcode,
          name,
          size,
          total,
          sent,
          received,
        },
      }));
      this.props.setGcodePrintingIndex(sent);
      this.renderScene();
    },
    'workflow:state': (options) => {
      const { dataSource, workflowState } = options;
      if (dataSource !== PROTOCOL_TEXT) {
        return;
      }
      if (this.state.workflowState !== workflowState) {
        this.setState({ workflowState });
        switch (workflowState) {
          case WORKFLOW_STATE_IDLE:
            this.stopToolheadRotationAnimation();
            this.updateWorkPositionToZero();
            this.props.setGcodePrintingIndex(0);
            break;
          case WORKFLOW_STATE_RUNNING:
            this.startToolheadRotationAnimation();
            break;
          case WORKFLOW_STATE_PAUSED:
            this.stopToolheadRotationAnimation();
            break;
          default:
            break;
        }
      }
    },
    // FIXME
    'Marlin:state': (options) => {
      const { state, dataSource } = options;
      if (dataSource !== PROTOCOL_TEXT) {
        return;
      }
      const { pos } = state;
      this.setState((state) => ({
        controller: {
          type: MARLIN,
          ...state.controller,
          state,
        },
      }));
      if (this.state.workflowState === WORKFLOW_STATE_RUNNING) {
        this.updateWorkPosition(pos);
      }
    },
    'Marlin:settings': (options) => {
      const { settings, dataSource } = options;
      if (dataSource !== PROTOCOL_TEXT) {
        return;
      }

      this.setState((state) => ({
        controller: {
          type: MARLIN,
          ...state.controller,
          settings,
        },
      }));
    },
  };

  actions = {
    isCNC: () => {
      return this.props.headType === MACHINE_HEAD_TYPE.CNC.value;
    },
    is3DP: () => {
      return this.props.headType === MACHINE_HEAD_TYPE['3DP'].value;
    },
    isLaser: () => {
      return this.props.headType === MACHINE_HEAD_TYPE.LASER.value;
    },
    handleRun: () => {
      const { connectionType } = this.props;
      if (connectionType === CONNECTION_TYPE_SERIAL) {
        const { workflowState } = this.state;

        if (workflowState === WORKFLOW_STATE_IDLE) {
          controller.command('gcode:start');
        }
        if (workflowState === WORKFLOW_STATE_PAUSED) {
          controller.command('gcode', 'M2411 S1'); // IVI work resume
          if (this.actions.is3DP()) {
            this.pause3dpStatus.pausing = false;
            // const pos = this.pause3dpStatus.pos;
            // const cmd = `G1 X${pos.x} Y${pos.y} Z${pos.z} F1000\n`;
            // controller.command('gcode', cmd);
            // controller.command('gcode:resume');
          } else if (this.actions.isLaser()) {
            if (this.pauseStatus.headStatus) {
              // resume laser power
              // const powerPercent = ensureRange(this.pauseStatus.headPower, 0, 100);
              // const powerStrength = Math.floor(powerPercent * 255 / 100);
              // if (powerPercent !== 0) {
              //     controller.command('gcode', `M3 P${powerPercent} S${powerStrength}`);
              // } else {
              //     controller.command('gcode', 'M3');
              // }
            }
            // setTimeout(() => {
            //     controller.command('gcode:resume');
            // }, 50);
          } else {
            // if (this.pauseStatus.headStatus) {
            //     // resume spindle
            //     //controller.command('gcode', 'M3');
            //     // for CNC machine, resume need to wait >500ms to let the tool head started
            //     setTimeout(() => {
            //         controller.command('gcode:resume');
            //     }, 5000);
            // } else {
            //     controller.command('gcode:resume');
            // }
            // setTimeout(() => {
            //         controller.command('gcode:resume');
            // }, 5000);
          }
        }
      } else {
        const { workflowStatus } = this.props;
        if (workflowStatus === WORKFLOW_STATUS_IDLE) {
          this.props.startServerGcode((err) => {
            if (err) {
              if (err.status === 202) {
                Modal.error({
                  title: i18n._('Filament Runout Recovery'),
                  text: i18n._(
                    'Filament has run out. Please load the new filament to continue printing.'
                  ),
                  img: IMAGE_WIFI_ERROR,
                });
              } else {
                Modal.error({
                  title: i18n._(`Error ${err.status}`),
                  text: i18n._('Unable to start the job.'),
                  img: IMAGE_WIFI_ERROR,
                });
              }
            }
          });
        }
        if (workflowStatus === WORKFLOW_STATUS_PAUSED) {
          this.props.resumeServerGcode((err) => {
            if (err) {
              if (err.status === 202) {
                Modal.error({
                  title: i18n._('Filament Runout Recovery'),
                  text: i18n._(
                    'Filament has run out. Please load the new filament to continue printing.'
                  ),
                  img: IMAGE_WIFI_ERROR,
                });
              } else {
                Modal.error({
                  title: i18n._(`Error ${err.status}`),
                  text: i18n._('Unable to resume the job.'),
                  img: IMAGE_WIFI_ERROR,
                });
              }
            }
          });
        }
      }
    },
    tryPause: () => {
      // delay 500ms to let buffer executed. and status propagated
      setTimeout(() => {
        if (this.state.gcode.received >= this.state.gcode.sent) {
          this.pauseStatus = {
            headStatus: this.state.controller.state.headStatus,
            headPower: this.state.controller.state.headPower,
          };

          if (this.pauseStatus.headStatus) {
            controller.command('gcode', 'M5');
          }

          // toolhead has stopped
          if (this.pause3dpStatus.pausing) {
            this.pause3dpStatus.pausing = false;
            const workPosition = this.state.workPosition;
            this.pause3dpStatus.pos = {
              x: Number(workPosition.x),
              y: Number(workPosition.y),
              z: Number(workPosition.z),
              e: Number(workPosition.e),
            };
            // const pos = this.pause3dpStatus.pos;
            // experience params for retraction: F3000, E->(E-5)
            // const targetE = Math.max(pos.e - 5, 0);
            // const targetZ = Math.min(pos.z + 30, this.props.size.z);
            // const cmd = [
            //     `G1 F3000 E${targetE}\n`,
            //     `G1 Z${targetZ} F3000\n`,
            //     `G1 Y-100\n`,
            //     `G1 F100 E${pos.e}\n`
            // ];
            // controller.command('gcode', cmd);
          }
        } else {
          this.actions.tryPause();
        }
      }, 50);
    },
    handlePause: () => {
      const { connectionType } = this.props;
      if (connectionType === CONNECTION_TYPE_SERIAL) {
        const { workflowState } = this.state;
        if ([WORKFLOW_STATE_RUNNING].includes(workflowState)) {
          if (this.actions.is3DP()) {
            this.pause3dpStatus.pausing = true;
            this.pause3dpStatus.pos = null;
          }

          this.actions.tryPause();
          controller.command('gcode:pause');
        }
      } else {
        const { workflowStatus } = this.props;
        if (workflowStatus === WORKFLOW_STATUS_RUNNING) {
          this.props.pauseServerGcode();
        }
      }
    },
    handleStop: () => {
      const { connectionType } = this.props;
      if (connectionType === CONNECTION_TYPE_SERIAL) {
        const { workflowState } = this.state;
        if ([WORKFLOW_STATE_PAUSED].includes(workflowState)) {
          controller.command('gcode:stop');
        }
      } else {
        const { workflowStatus } = this.props;
        if (workflowStatus !== WORKFLOW_STATUS_IDLE) {
          this.props.stopServerGcode();
        }
      }
    },
    handleClose: () => {
      // dismiss gcode file name
      this.props.clearGcode();
      const { workflowState } = this.state;
      if ([WORKFLOW_STATE_IDLE].includes(workflowState)) {
        controller.command('gcode:unload');
      }
    },
    // canvas
    switchCoordinateVisibility: () => {
      // const visible = !this.state.coordinateVisible;
      // this.setState({ coordinateVisible: visible }, () => {
      //   this.printableArea.changeCoordinateVisibility(visible);
      //   this.renderScene();
      // });
      // this.setState(
      //   (state) => ({
      //     coordinateVisible: !state.coordinateVisible,
      //   }),
      //   () => {
      //     this.printableArea.changeCoordinateVisibility(visible);
      //     this.renderScene();
      //   }
      // );
    },
    autoFocus: () => {
      this.autoFocus();
    },
    zoomIn: () => {
      this.canvas.current.zoomIn();
    },
    zoomOut: () => {
      this.canvas.current.zoomOut();
    },

    switchToolheadVisibility: () => {
      // const visible = !this.state.toolheadVisible;
      // this.toolhead.visible = visible;
      // this.setState({ toolheadVisible: visible });
      // this.renderScene();
    },
  };

  constructor(props) {
    super(props);

    const size = props.size;
    this.printableArea = new PrintablePlate(size, false);
  }

  componentDidMount() {
    try {
      this.handleResizeWindowWhenGoBack();
      this.subscribe();
      this.addControllerEvents();
      this.setupToolhead();
      this.setupTargetPoint();
      this.visualizerGroup.add(this.props.modelGroup);
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Listen on props updates.
   *
   * When new G-code list received:
   *  - Re-render G-code objects
   *  - Upload G-code to controller
   */
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps.size, this.props.size)) {
      const size = nextProps.size;
      this.printableArea.updateSize(size);
    }

    if (
      this.props.workflowStatus !== WORKFLOW_STATUS_IDLE &&
      nextProps.workflowStatus === WORKFLOW_STATUS_IDLE
    ) {
      this.stopToolheadRotationAnimation();
      this.updateWorkPositionToZero();
      this.props.setGcodePrintingIndex(0);
    }
    if (
      this.props.workflowStatus !== WORKFLOW_STATUS_UNKNOWN &&
      nextProps.workflowStatus === WORKFLOW_STATUS_UNKNOWN
    ) {
      this.stopToolheadRotationAnimation();
      this.updateWorkPositionToZero();
      this.props.setGcodePrintingIndex(0);
    }
    if (
      this.props.workflowStatus !== WORKFLOW_STATUS_RUNNING &&
      nextProps.workflowStatus === WORKFLOW_STATUS_RUNNING
    ) {
      for (let i = 0; i < nextProps.gcodePrintingInfo.sent; i++) {
        this.props.setGcodePrintingIndex(i);
      }
      this.startToolheadRotationAnimation();
      this.renderScene();
    }
    if (
      this.props.workflowStatus !== WORKFLOW_STATUS_PAUSED &&
      nextProps.workflowStatus === WORKFLOW_STATUS_PAUSED
    ) {
      this.stopToolheadRotationAnimation();
    }
    if (
      nextProps.gcodePrintingInfo.sent > 0 &&
      nextProps.gcodePrintingInfo.sent !== this.props.gcodePrintingInfo.sent
    ) {
      this.updateWorkPosition(this.props.workPosition);
      this.props.setGcodePrintingIndex(nextProps.gcodePrintingInfo.sent);
      this.renderScene();
    }
    if (nextProps.renderingTimestamp !== this.props.renderingTimestamp) {
      this.renderScene();
    }
    if (
      nextProps.renderState === 'rendered' &&
      this.props.renderState !== 'rendered'
    ) {
      this.autoFocus();
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
    this.removeControllerEvents();
  }

  handleResizeWindowWhenGoBack() {
    window.addEventListener(
      'hashchange',
      (event) => {
        if (event.newURL.endsWith('workspace')) {
          this.canvas.current.resizeWindow();
        }
      },
      false
    );
  }

  setupTargetPoint() {
    this.targetPoint = new TargetPoint({
      color: colornames('indianred'),
      radius: 0.5,
    });
    this.visualizerGroup.add(this.targetPoint);
  }

  setupToolhead() {
    // const color = colornames('silver');
    const color = '#193BDE';
    const url = 'textures/brushed-steel-texture.jpg';
    loadTexture(url, (err, texture) => {
      this.toolhead = new ToolHead(color, texture);
      this.visualizerGroup.add(this.toolhead);

      this.toolheadRotationAnimation = new TWEEN.Tween(
        this.toolhead.rotation
      ).to({ x: 0, y: 0, z: Number.MAX_VALUE }, Number.MAX_VALUE);
    });
  }

  unloadGcode() {
    this.props.unloadGcode();
  }

  subscribe() {
    const tokens = [
      pubsub.subscribe('resize', () => {
        this.canvas.current.resizeWindow();
      }),
    ];
    this.pubsubTokens = this.pubsubTokens.concat(tokens);
  }

  unsubscribe() {
    this.pubsubTokens.forEach((token) => {
      pubsub.unsubscribe(token);
    });
    this.pubsubTokens = [];
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

  startToolheadRotationAnimation() {
    this.toolheadRotationAnimation.start();
  }

  stopToolheadRotationAnimation() {
    this.toolheadRotationAnimation.stop();
  }

  updateWorkPositionToZero() {
    this.updateWorkPosition({
      x: '0.000',
      y: '0.000',
      z: '0.000',
      e: '0.000',
    });
  }

  updateWorkPosition(pos) {
    // this.setState({
    //   workPosition: {
    //     ...this.state.workPosition,
    //     ...pos,
    //   },
    // });

    this.setState((state) => ({
      workPosition: {
        ...state.workPosition,
        ...pos,
      },
    }));

    let { x = 0, y = 0, z = 0 } = { ...pos };
    x = Number(x) || 0;
    y = Number(y) || 0;
    z = Number(z) || 0;
    this.toolhead && this.toolhead.position.set(x, y, z);
    this.targetPoint && this.targetPoint.position.set(x, y, z);
  }

  autoFocus() {
    const child = this.props.modelGroup.children[0];
    this.canvas.current.autoFocus(child);
  }

  notice() {
    const { stage, progress } = this.props;
    switch (stage) {
      case WORKSPACE_STAGE.EMPTY:
        return '';
      case WORKSPACE_STAGE.LOADING_GCODE:
        return i18n._('Loading Gcode...{{progress}}%', {
          progress: (100.0 * progress).toFixed(1),
        });
      case WORKSPACE_STAGE.LOAD_GCODE_SUCCEED:
        return i18n._('Loaded Gcode successfully.');
      case WORKSPACE_STAGE.LOAD_GCODE_FAILED:
        return i18n._('Failed to load Gcode.');
      default:
        return '';
    }
  }

  renderScene() {
    this.canvas.current.renderScene();
  }

  render() {
    const state = this.state;
    const notice = this.notice();
    const { gcodeFile } = this.props;

    return (
      <div
        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
      >
        <div className={styles['visualizer-notice']}>
          <p>{notice}</p>
        </div>
        <div className={styles['visualizer-progress']}>
          {/* <ProgressBar progress={this.props.progress * 100} /> */}
          <Progress percent={this.props.progress * 100} />
        </div>
        {gcodeFile !== null && (
          <div className={styles['visualizer-info']}>
            <p>{i18n._(gcodeFile.name)}</p>
          </div>
        )}
        <div className={styles['canvas-content']}>
          {this.props.uploadState === 'uploading' && <Loading />}
          {this.props.renderState === 'rendering' && <Rendering />}
          {/* <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px' }}> */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: '20px',
              transform: 'translateX(-50%)',
            }}
          >
            <WorkflowControl
              workflowStatus={this.props.workflowStatus}
              isConnected={this.props.isConnected}
              connectionType={this.props.connectionType}
              state={state}
              actions={this.actions}
              uploadState={this.props.uploadState}
            />
          </div>
          <Canvas
            ref={this.canvas}
            size={this.props.size}
            modelGroup={this.visualizerGroup}
            printableArea={this.printableArea}
            cameraInitialPosition={new THREE.Vector3(0, 0, 230)}
            cameraInitialTarget={
              new THREE.Vector3(
                this.props.size.x / 1.2,
                this.props.size.y / 2,
                0
              )
            }
          />
        </div>
        <div className={styles['canvas-footer']}>
          <SecondaryToolbar
            zoomIn={this.actions.zoomIn}
            zoomOut={this.actions.zoomOut}
            autoFocus={this.actions.autoFocus}
          />
        </div>
      </div>
    );
  }
}

Visualizer.propTypes = {
  // redux
  size: PropTypes.object.isRequired,
  uploadState: PropTypes.string.isRequired,
  headType: PropTypes.string,
  gcodeFile: PropTypes.object,
  isConnected: PropTypes.bool.isRequired,
  connectionType: PropTypes.string.isRequired,
  workflowStatus: PropTypes.string.isRequired,
  renderState: PropTypes.string.isRequired,
  renderingTimestamp: PropTypes.number.isRequired,
  stage: PropTypes.number.isRequired,
  progress: PropTypes.number.isRequired,
  unloadGcode: PropTypes.func.isRequired,
  clearGcode: PropTypes.func.isRequired,
  setGcodePrintingIndex: PropTypes.func.isRequired,

  startServerGcode: PropTypes.func.isRequired,
  pauseServerGcode: PropTypes.func.isRequired,
  resumeServerGcode: PropTypes.func.isRequired,
  stopServerGcode: PropTypes.func.isRequired,

  gcodePrintingInfo: PropTypes.shape({
    sent: PropTypes.number,
  }),
  workPosition: PropTypes.object,

  modelGroup: PropTypes.object,
};

const mapStateToProps = (state) => {
  const machine = state.machine;
  const workspace = state.workspace;
  return {
    size: machine.size,
    headType: machine.headType,
    workflowStatus: machine.workflowStatus,
    isConnected: machine.isConnected,
    connectionType: machine.connectionType,
    uploadState: workspace.uploadState,
    gcodeList: workspace.gcodeList,
    gcodeFile: workspace.gcodeFile,
    gcodePrintingInfo: machine.gcodePrintingInfo,
    workPosition: machine.workPosition,
    modelGroup: workspace.modelGroup,
    renderState: workspace.renderState,
    renderingTimestamp: workspace.renderingTimestamp,
    stage: workspace.stage,
    progress: workspace.progress,
  };
};

const mapDispatchToProps = (dispatch) => ({
  clearGcode: () => dispatch(actions.clearGcode()),
  unloadGcode: () => dispatch(actions.unloadGcode()),
  setGcodePrintingIndex: (index) =>
    dispatch(actions.setGcodePrintingIndex(index)),

  startServerGcode: (callback) =>
    dispatch(machineActions.startServerGcode(callback)),
  pauseServerGcode: () => dispatch(machineActions.pauseServerGcode()),
  resumeServerGcode: (callback) =>
    dispatch(machineActions.resumeServerGcode(callback)),
  stopServerGcode: () => dispatch(machineActions.stopServerGcode()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Visualizer);
