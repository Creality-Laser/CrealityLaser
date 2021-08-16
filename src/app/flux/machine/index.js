import isEmpty from 'lodash/isEmpty';
import _ from 'lodash';
import request from 'superagent';
import {
  ABSENT_OBJECT,
  WORKFLOW_STATE_IDLE,
  MACHINE_SERIES,
  CONNECTION_TYPE_SERIAL,
  WORKFLOW_STATUS_UNKNOWN,
  WORKFLOW_STATUS_IDLE,
  WORKFLOW_STATUS_PAUSED,
  WORKFLOW_STATUS_RUNNING,
  CONNECTION_STATUS_IDLE,
  CONNECTION_STATUS_CONNECTING,
  CONNECTION_STATUS_CONNECTED,
  MACHINE_HEAD_TYPE,
  WORKFLOW_STATE_PAUSED,
  LASER_MOCK_PLATE_HEIGHT,
  DATA_PREFIX,
} from '../../constants';

import { valueOf } from '../../lib/contants-utils';
import store from '../../../store';
import { Server } from './Server';
// import { actions as printingActions } from '../printing';
import { actions as widgetActions } from '../widget';
import History from './History';
import FixedArray from './FixedArray';
import { controller } from '../../lib/controller';
import { actions as workspaceActions } from '../workspace';
// import MachineSelectModal from '../../modals/modal-machine-select-new';
// import modal from '../../lib/modal';

const INITIAL_STATE = {
  // Machine Info
  series: MACHINE_SERIES.CV20.value,
  headType: null,
  canReselectMachine: false,

  isCustom: false,
  size: MACHINE_SERIES.CV20.setting.size,
  laserSize: MACHINE_SERIES.CV20.setting.laserSize,

  // Serial port
  port: controller.port || '',
  ports: [],

  // Connection state
  connectionStatus: CONNECTION_STATUS_IDLE,
  isOpen: false,
  isConnected: false,
  connectionType: '',

  // Servers
  server: ABSENT_OBJECT,
  serverToken: '',
  servers: [],
  workflowStatus: WORKFLOW_STATUS_UNKNOWN,
  discovering: false,

  // Console
  terminalHistory: new FixedArray(1000),
  history: new History(1000),
  consoleLogs: [],
  // Serial port
  printErrsInfo: [], // record the errors info which received from machine and should show modal
  workingStatus: 'IDLE', // indicate print current status: 'IDLE' | 'WORKING_PC' | 'WORKING_SCREEN' | 'ERROR'

  // from workflowState: idle, running, paused
  workflowState: WORKFLOW_STATE_IDLE,

  isWaitingPrinterReady: false, // waiting printer execute actions (pause, resume, stop) finished.

  isHomed: null,
  enclosure: false,
  enclosureDoor: false,
  laserFocalLength: null,
  laserPower: null,
  headStatus: null,
  nozzleTemperature: 0,
  nozzleTargetTemperature: 0,
  heatedBedTemperature: 0,
  heatedBedTargetTemperature: 0,
  laserCamera: true,
  isFilamentOut: false,

  workPosition: {
    // work position
    x: '0.000',
    y: '0.000',
    z: '0.000',
    a: '0.000',
  },

  originOffset: {
    x: 0,
    y: 0,
    z: 0,
  },

  // laser print mode
  isLaserPrintAutoMode: true,
  materialThickness: 1.5,

  gcodePrintingInfo: {
    sent: 0,
    received: 0,
    total: 0,
    startTime: 0,
    finishTime: 0,
    elapsedTime: 0,
    remainingTime: 0,
  },

  connectionTimeout: 3000,
};

const ACTION_UPDATE_STATE = 'machine/ACTION_UPDATE_STATE';

export const actions = {
  // Update state directly
  updateState: (state) => {
    return {
      type: ACTION_UPDATE_STATE,
      state,
    };
  },

  // Initialize machine, get machine configurations via API
  init: () => (dispatch, getState) => {
    // Machine

    const {
      series = INITIAL_STATE.series,
      size = INITIAL_STATE.size,
      laserSize = INITIAL_STATE.laserSize,
    } = store.get('machine') || {};
    const machinePort = store.get('port') || '';
    const serverToken = store.get('server.token') || '';
    const connectionType =
      store.get('connection.type') || CONNECTION_TYPE_SERIAL;
    const connectionTimeout =
      store.get('connection.timeout') || INITIAL_STATE.connectionTimeout;

    const seriesInfo = valueOf(MACHINE_SERIES, 'value', series);

    dispatch(
      actions.updateState({
        series,
        size: seriesInfo ? seriesInfo.setting.size : size,
        laserSize: seriesInfo ? seriesInfo.setting.laserSize : laserSize,
        serverToken,
        port: machinePort,
        connectionType,
        connectionTimeout,
      })
    );

    // FIXME: this is a temporary solution, please solve the init dependency issue
    // setTimeout(() => dispatch(actions.updateMachineSize(machine.size)), 1000);

    // Register event listeners
    const controllerEvents = {
      // 'Marlin:state': (state) => {
      'Marlin:state': (options) => {
        const { state } = options;
        const {
          pos,
          originOffset,
          headStatus,
          headPower,
          temperature,
          zFocus,
          isHomed,
          workingStatus,
        } = state;

        const machineState = getState().machine;

        if (
          machineState.workPosition.x !== pos.x ||
          machineState.workPosition.y !== pos.y ||
          machineState.workPosition.z !== pos.z
        ) {
          dispatch(
            actions.updateState({
              workPosition: {
                ...machineState.workPosition,
                ...pos,
              },
            })
          );
        }
        if (
          machineState.originOffset.x !== originOffset.x ||
          machineState.originOffset.y !== originOffset.y ||
          machineState.originOffset.z !== originOffset.z
        ) {
          dispatch(
            actions.updateState({
              originOffset: {
                ...machineState.originOffset,
                ...originOffset,
              },
            })
          );
        }

        dispatch(
          actions.updateState({
            headStatus,
            laserPower: headPower,
            laserFocalLength: zFocus + LASER_MOCK_PLATE_HEIGHT,
            nozzleTemperature: parseFloat(temperature.t),
            nozzleTargetTemperature: parseFloat(temperature.tTarget),
            heatedBedTemperature: parseFloat(temperature.b),
            heatedBedTargetTemperature: parseFloat(temperature.bTarget),
            isHomed,
            workingStatus,
          })
        );
      },
      // 'Marlin:settings': (settings) => {
      'Marlin:settings': (options) => {
        const { enclosure = false, enclosureDoor = false } = options.settings;

        // enclosure is changed
        dispatch(
          actions.updateState({
            enclosure,
            enclosureDoor,
          })
        );
      },
      'http:discover': (objects) => {
        const { servers } = getState().machine;
        const newServers = [];
        for (const object of objects) {
          const find = servers.find((v) => v.equal(object));
          if (find) {
            newServers.push(find);
          } else {
            const server = new Server(
              object.name,
              object.address,
              object.model
            );
            newServers.push(server);
          }
        }

        dispatch(actions.updateState({ servers: newServers }));

        // TODO: refactor this behavior to Component not flux
        setTimeout(() => {
          const state = getState().machine;
          if (state.discovering) {
            dispatch(actions.updateState({ discovering: false }));
          }
        }, 600);
      },
      'serialport:open': (options) => {
        const { port, err } = options;
        if (err && err !== 'inuse') {
          return;
        }
        const state = getState().machine;
        // For Warning Don't initialize
        const ports = [...state.ports];
        if (ports.indexOf(port) === -1) {
          ports.push(port);
        }
        dispatch(
          actions.updateState({
            port,
            ports,
            isOpen: true,
            connectionStatus: CONNECTION_STATUS_CONNECTING,
            connectionType: CONNECTION_TYPE_SERIAL,
          })
        );
      },
      'serialport:connected': (data) => {
        const { err } = data;
        if (err) {
          return;
        }
        dispatch(
          actions.updateState({
            isConnected: true,
            connectionStatus: CONNECTION_STATUS_CONNECTED,
          })
        );
        dispatch(workspaceActions.loadGcode());
      },
      'serialport:close': (options) => {
        const { port } = options;
        const state = getState().machine;
        const ports = [...state.ports];
        const portIndex = ports.indexOf(port);
        if (portIndex !== -1) {
          ports.splice(portIndex, 1);
        }
        if (!isEmpty(ports)) {
          // this.port = ports[0];
          dispatch(
            actions.updateState({
              port: ports[0],
              ports,
              isOpen: false,
              isConnected: false,
              connectionStatus: CONNECTION_STATUS_IDLE,
            })
          );
        } else {
          // this.port = '';
          dispatch(
            actions.updateState({
              port: '',
              ports,
              isOpen: false,
              isConnected: false,
              connectionStatus: CONNECTION_STATUS_IDLE,
            })
          );
        }
        dispatch(
          actions.updateState({
            workPosition: {
              x: '0.000',
              y: '0.000',
              z: '0.000',
              a: '0.000',
            },

            originOffset: {
              x: 0,
              y: 0,
              z: 0,
            },
          })
        );
        dispatch(workspaceActions.unloadGcode());
      },
      'serialport:print:action:wait': (data) => {
        const { isWaiting } = data;
        dispatch(
          actions.updateState({
            isWaitingPrinterReady: isWaiting,
          })
        );
      },
      'serialport:print:error': (payload) => {
        if (!payload) {
          return;
        }
        const {
          data,
          data: { stage, errCode, msg, showWarningModal },
        } = payload;
        console.log(
          `get print error: stage: ${stage}, errCode: ${errCode}, msg: ${msg}, showWarningModal: ${showWarningModal}`
        );

        const { printErrsInfo } = getState().machine;

        const isShouldCacheErr =
          showWarningModal &&
          !printErrsInfo.find((err) => err && err.errCode === errCode);

        if (isShouldCacheErr) {
          dispatch(
            actions.updateState({
              printErrsInfo: [...printErrsInfo, data],
            })
          );
        }
      },
      'serialport:print:door:closed': () => {
        // should auto resume printing, if paused by door opened.
        const doorOpenedWarningErrCode = 3;
        const { printErrsInfo, workflowState, enclosureDoor } =
          getState().machine;
        if (!enclosureDoor) {
          dispatch(
            actions.updateState({
              enclosureDoor: true,
            })
          );
        }
        const isPrintingPaused =
          workflowState && workflowState === WORKFLOW_STATE_PAUSED;
        const isDoorOpenedWarningExisted =
          printErrsInfo &&
          printErrsInfo.find(
            (err) => err && err.errCode === doorOpenedWarningErrCode
          );
        const isShouldAutoResume =
          isPrintingPaused && isDoorOpenedWarningExisted;
        if (isShouldAutoResume) {
          // remove door Opened warning modal;
          dispatch(actions.removePrintErrInfo(doorOpenedWarningErrCode));
          // resume printing
          controller.command('gcode', 'M2411 S1');
        }
      },
      'work:pause': () => {
        // modal({
        //   titleType: 'warn',
        //   title: 'Warning',
        //   body: 'Filament Runout',
        // });
      },
      'workflow:state': (options) => {
        const { workflowState } = options;
        dispatch(
          actions.updateState({
            workflowState,
          })
        );
      },
      'sender:status': (options) => {
        const { data } = options;
        const {
          total,
          sent,
          received,
          startTime,
          finishTime,
          elapsedTime,
          remainingTime,
        } = data;
        dispatch(
          actions.updateState({
            gcodePrintingInfo: {
              total,
              sent,
              received,
              startTime,
              finishTime,
              elapsedTime,
              remainingTime,
            },
          })
        );
      },
    };

    Object.keys(controllerEvents).forEach((event) => {
      controller.on(event, controllerEvents[event]);
    });
  },

  updateMachineState: (state) => (dispatch) => {
    const { series, headType, canReselectMachine } = state;
    headType &&
      dispatch(
        actions.updateState({
          headType,
        })
      );
    if (canReselectMachine !== undefined && canReselectMachine !== null) {
      dispatch(
        actions.updateState({
          canReselectMachine,
        })
      );
    }
    series && dispatch(actions.updateMachineSeries(series));
  },

  updateMachineSeries: (series) => (dispatch, getState) => {
    store.set('machine.series', series);

    const oldSeries = getState().machine.series;
    if (oldSeries !== series) {
      dispatch(actions.updateState({ series }));
      const seriesInfo = valueOf(MACHINE_SERIES, 'value', series);
      seriesInfo &&
        dispatch(actions.updateMachineSize(seriesInfo.setting.size));
      seriesInfo &&
        dispatch(actions.updateLaserSize(seriesInfo.setting.laserSize));
      dispatch(widgetActions.updateMachineSeries(series));
      // dispatch(printingActions.init());
    }
  },

  updatePort: (port) => (dispatch) => {
    dispatch(actions.updateState({ port }));
    store.set('port', port);
  },
  updateServerToken: (token) => (dispatch) => {
    dispatch(actions.updateState({ serverToken: token }));
    store.set('server.token', token);
  },
  updateMachineSize: (size) => (dispatch) => {
    size.x = Math.min(size.x, 1000);
    size.y = Math.min(size.y, 1000);
    size.z = Math.min(size.z, 1000);

    store.set('machine.size', size);

    dispatch(actions.updateState({ size }));

    // dispatch(printingActions.updateActiveDefinitionMachineSize(size));
  },
  updateLaserSize: (laserSize) => (dispatch) => {
    if (!laserSize) {
      return;
    }
    laserSize.x = Math.min(laserSize.x, 1000);
    laserSize.y = Math.min(laserSize.y, 1000);
    laserSize.z = Math.min(laserSize.z, 1000);

    store.set('machine.laserSize', laserSize);

    dispatch(actions.updateState({ laserSize }));
  },
  resetHomeState: () => (dispatch) => {
    dispatch(actions.updateState({ isHomed: null }));
  },

  executeGcodeG54: (series, headType) => (dispatch) => {
    if (
      series !== MACHINE_SERIES.ORIGINAL.value &&
      (headType === MACHINE_HEAD_TYPE.LASER.value ||
        headType === MACHINE_HEAD_TYPE.CNC.value)
    ) {
      dispatch(actions.executeGcode('G54'));
    }
  },

  executeGcode: (gcode, context) => (dispatch, getState) => {
    const machine = getState().machine;

    const { isConnected, connectionType, server } = machine;
    if (!isConnected) {
      return;
    }
    // if (port && workflowState === WORKFLOW_STATE_IDLE) {
    if (connectionType === CONNECTION_TYPE_SERIAL) {
      // controller.command('gcode', gcode, context);
      controller.command('gcode', gcode, context);
      // } else if (server && workflowStatus === STATUS_IDLE) {
    } else {
      server.executeGcode(gcode, (result) => {
        if (result) {
          dispatch(actions.addConsoleLogs(result));
        }
      });
    }
  },

  executeGcodeAutoHome: () => (dispatch, getState) => {
    const { series, headType } = getState().machine;
    dispatch(actions.executeGcode('G53'));
    dispatch(actions.executeGcode('G28'));
    dispatch(actions.executeGcodeG54(series, headType));
  },

  // Enclosure
  getEnclosureState: () => () => {
    controller.writeln('M2010', { source: 'query' });
  },
  setEnclosureState: (doorDetection) => () => {
    controller.writeln(`M2010 S${doorDetection ? '1' : '0'}`, {
      source: 'query',
    });
  },
  updateConnectionTimeout: (time) => (dispatch) => {
    store.set('connection.timeout', time);
    dispatch(actions.updateState({ connectionTimeout: time }));
  },

  // Server
  discoverServers: () => (dispatch, getState) => {
    dispatch(actions.updateState({ discovering: true }));

    setTimeout(() => {
      const state = getState().machine;
      if (state.discovering) {
        dispatch(actions.updateState({ discovering: false }));
      }
    }, 3000);

    controller.listHTTPServers();
  },

  setServer: (server) => (dispatch) => {
    dispatch(
      actions.updateState({
        server,
      })
    );
  },

  updateConnectionState: (state) => (dispatch) => {
    dispatch(actions.updateState(state));
    state.connectionType && store.set('connection.type', state.connectionType);
  },

  openServer: (callback) => (dispatch, getState) => {
    const { server, serverToken, isOpen } = getState().machine;

    if (isOpen) {
      return;
    }
    server.open(serverToken || server.token, (err, data, text) => {
      if (err) {
        callback && callback(err, data, text);
        return;
      }
      const { token } = data;
      dispatch(actions.updateServerToken(token));
      dispatch(
        actions.updateState({
          isOpen: true,
          connectionStatus: CONNECTION_STATUS_CONNECTING,
        })
      );
      server.removeAllListeners('http:confirm');
      server.removeAllListeners('http:status');
      server.removeAllListeners('http:close');

      // upload timestamp to server
      server.uploadTimestamp();

      server.once('http:confirm', (result) => {
        const { series, headType, status, isHomed } = result.data;
        dispatch(
          actions.updateState({
            workflowStatus: status,
            isConnected: true,
            connectionStatus: CONNECTION_STATUS_CONNECTED,
            isHomed,
          })
        );
        if (series && headType) {
          dispatch(
            actions.updateMachineState({
              series,
              headType,
              canReselectMachine: false,
            })
          );
          dispatch(actions.executeGcodeG54(series, headType));
          if (
            _.includes(
              [WORKFLOW_STATUS_PAUSED, WORKFLOW_STATUS_RUNNING],
              status
            )
          ) {
            server.getGcodeFile((msg, gcode) => {
              if (msg) {
                return;
              }
              dispatch(workspaceActions.clearGcode());
              let suffix = 'gcode';
              if (headType === MACHINE_HEAD_TYPE.LASER.value) {
                suffix = 'nc';
              } else if (headType === MACHINE_HEAD_TYPE.CNC.value) {
                suffix = 'cnc';
              }
              dispatch(workspaceActions.clearGcode());
              dispatch(workspaceActions.renderGcode(`print.${suffix}`, gcode));
            });
          }
        } else {
          // MachineSelectModal({
          //   series,
          //   headType,
          //   onConfirm: (seriesT, headTypeT) => {
          //     dispatch(
          //       actions.updateMachineState({
          //         series: seriesT,
          //         headType: headTypeT,
          //         canReselectMachine: true,
          //       })
          //     );
          //     dispatch(actions.executeGcodeG54(seriesT, headTypeT));
          //   },
          // });
        }
      });
      server.on('http:status', (result) => {
        const { workPosition, originOffset, gcodePrintingInfo } =
          getState().machine;
        const {
          status,
          isHomed,
          x,
          y,
          z,
          offsetX,
          offsetY,
          offsetZ,
          laserFocalLength,
          laserPower,
          nozzleTemperature,
          nozzleTargetTemperature,
          heatedBedTemperature,
          heatedBedTargetTemperature,
        } = result.data;

        dispatch(
          actions.updateState({
            workflowStatus: status,
            laserFocalLength,
            laserPower,
            isHomed,
            nozzleTemperature,
            nozzleTargetTemperature,
            heatedBedTemperature,
            heatedBedTargetTemperature,
          })
        );

        if (x && y && z) {
          if (
            workPosition.x !== x ||
            workPosition.y !== y ||
            workPosition.z !== z
          ) {
            dispatch(
              actions.updateState({
                workPosition: {
                  x: `${x.toFixed(3)}`,
                  y: `${y.toFixed(3)}`,
                  z: `${z.toFixed(3)}`,
                  a: '0.000',
                },
              })
            );
          }
        }
        if (
          offsetX !== undefined &&
          offsetY !== undefined &&
          offsetZ !== undefined
        ) {
          if (
            originOffset.x !== offsetX ||
            originOffset.y !== offsetY ||
            originOffset.z !== offsetZ
          ) {
            dispatch(
              actions.updateState({
                originOffset: {
                  x: `${offsetX.toFixed(3)}`,
                  y: `${offsetY.toFixed(3)}`,
                  z: `${offsetZ.toFixed(3)}`,
                  a: '0.000',
                },
              })
            );
          }
        }

        dispatch(
          actions.updateState({
            gcodePrintingInfo: {
              ...gcodePrintingInfo,
              ...result.data.gcodePrintingInfo,
            },
          })
        );
      });
      server.once('http:close', () => {
        dispatch(actions.uploadCloseServerState());
      });
      callback && callback(null, data);
    });
  },

  closeServer: () => (dispatch, getState) => {
    const { server } = getState().machine;
    server.close(() => {
      dispatch(actions.uploadCloseServerState());
    });
  },

  uploadCloseServerState: () => (dispatch) => {
    // dispatch(actions.updateServerToken(''));
    dispatch(
      actions.updateState({
        isOpen: false,
        isConnected: false,
        connectionStatus: CONNECTION_STATUS_IDLE,
        isHomed: null,
        workflowStatus: WORKFLOW_STATUS_UNKNOWN,
        laserFocalLength: null,
        workPosition: {
          // work position
          x: '0.000',
          y: '0.000',
          z: '0.000',
          a: '0.000',
        },

        originOffset: {
          x: 0,
          y: 0,
          z: 0,
        },
      })
    );
  },

  startServerGcode: (callback) => (dispatch, getState) => {
    const {
      server,
      size,
      workflowStatus,
      isLaserPrintAutoMode,
      series,
      headType,
      laserFocalLength,
      materialThickness,
    } = getState().machine;
    const { gcodeFile } = getState().workspace;
    const { background } = getState().laser;
    if (workflowStatus !== WORKFLOW_STATUS_IDLE || gcodeFile === null) {
      return;
    }

    const gcodeFilePath = `${DATA_PREFIX}/${gcodeFile.uploadName}`;

    request.get(gcodeFilePath).end((err, res) => {
      if (err) {
        return;
      }
      const gcode = res.text;

      const blob = new Blob([gcode], { type: 'text/plain' });
      const file = new File([blob], gcodeFile.name);
      const promises = [];
      if (
        series !== MACHINE_SERIES.ORIGINAL.value &&
        headType === MACHINE_HEAD_TYPE.LASER.value
      ) {
        if (isLaserPrintAutoMode && laserFocalLength) {
          const promise = new Promise((resolve) => {
            server.executeGcode(
              `G53;\nG0 Z${laserFocalLength + materialThickness} F1500;\nG54;`,
              () => {
                resolve();
              }
            );
          });
          promises.push(promise);
        }

        // Camera Aid Background mode, force machine to work on machine coordinates (Origin = 0,0)
        if (background.enabled) {
          const { workPosition, originOffset } = getState().machine;
          let x = parseFloat(workPosition.x) - parseFloat(originOffset.x);
          let y = parseFloat(workPosition.y) - parseFloat(originOffset.y);

          // Fix bug for x or y out of range
          x = Math.max(0, Math.min(x, size.x - 20));
          y = Math.max(0, Math.min(y, size.y - 20));

          const promise = new Promise((resolve) => {
            server.executeGcode(
              `G53;\nG0 X${x} Y${y};\nG54;\nG92 X${x} Y${y};`,
              () => {
                resolve();
              }
            );
          });
          promises.push(promise);
        }
      }
      Promise.all(promises).then(() => {
        server.uploadGcodeFile(gcodeFile.name, file, headType, (msg) => {
          if (msg) {
            return;
          }
          server.startGcode((err2) => {
            if (err2) {
              callback && callback(err2);
              return;
            }
            dispatch(
              actions.updateState({
                workflowStatus: WORKFLOW_STATUS_RUNNING,
              })
            );
          });
        });
      });
    });
  },

  resumeServerGcode: (callback) => (dispatch, getState) => {
    const { server } = getState().machine;
    server.resumeGcode((err) => {
      if (err) {
        callback && callback(err);
        return;
      }
      dispatch(
        actions.updateState({
          workflowStatus: WORKFLOW_STATUS_RUNNING,
        })
      );
    });
  },

  pauseServerGcode: () => (dispatch, getState) => {
    const { server, workflowStatus } = getState().machine;
    if (workflowStatus !== WORKFLOW_STATUS_RUNNING) {
      return;
    }
    server.pauseGcode((msg) => {
      if (msg) {
        return;
      }
      dispatch(
        actions.updateState({
          workflowStatus: WORKFLOW_STATUS_PAUSED,
        })
      );
    });
  },

  stopServerGcode: () => (dispatch, getState) => {
    const { server, workflowStatus } = getState().machine;
    if (workflowStatus === WORKFLOW_STATUS_IDLE) {
      return;
    }
    server.stopGcode((msg) => {
      if (msg) {
        return;
      }
      dispatch(
        actions.updateState({
          workflowStatus: WORKFLOW_STATUS_IDLE,
        })
      );
    });
  },

  addConsoleLogs: (consoleLogs) => (dispatch) => {
    dispatch(
      actions.updateState({
        consoleLogs,
      })
    );
  },
  removePrintErrInfo: (errCode) => (dispatch, getState) => {
    const { printErrsInfo } = getState().machine;

    dispatch(
      actions.updateState({
        printErrsInfo: printErrsInfo.filter(
          (err) => err && err.errCode !== errCode
        ),
      })
    );
  },
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case ACTION_UPDATE_STATE:
      return { ...state, ...action.state };
    default:
      return state;
  }
}
