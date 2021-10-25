import { isArray, includes } from 'lodash';
import EventEmitter from 'events';
import { message } from 'antd';
import { MACHINE_SERIES } from '../../constants';
import store from '../../../store';
import { actions as widgetActions } from '../widget';
import { controller } from '../../lib/controller';

export const valueOf = (obj, key, value) => {
  let result = null;
  Object.keys(obj).forEach((k) => {
    const values = obj[k][key];
    if (isArray(values) && includes(values, String(value))) {
      result = obj[k];
    } else if (values === String(value)) {
      result = obj[k];
    }
  });
  return result;
};

const INITIAL_STATE = {
  series: MACHINE_SERIES.CUSTOM.value,
  size: MACHINE_SERIES.CUSTOM.setting.size,
  laserSize: MACHINE_SERIES.CUSTOM.setting.laserSize,
  style: MACHINE_SERIES.CUSTOM.setting.style,
  machineInfoConnectedByWiFi: null,
  // null |
  // {
  //  model: 'CV20',
  //  status: 'work' | 'idle' | 'pause',
  //  sn: '45684321234rfsdef',
  //  process: 0.125,
  // }
  deviceWareInfoByWiFi: null,
  deviceWareInfoByWiFiErr: false,
  deviceWareInfoByWiFiLoading: false,
  uploadOTAFileLoading: false,
  uploadOTAFileSucc: false,
  uploadOTAFileErr: false,
  uploadOTAFileProgress: null,
};

const ACTION_UPDATE_STATE = 'machine/ACTION_UPDATE_STATE';

const deviceStatusHeartbeatDataAdaptor = (ret = {}) => {
  if (!ret || !ret.data) {
    return null;
  }
  const { model = 'CV-20', status = 1, process: progress } = ret.data;
  const modelMap = {
    'CV-20': 'CV20',
    'CV-30': 'CV30',
    'CV-01 PRO': 'CV01PRO',
  };

  const modelVal = modelMap[model] || 'CV20';

  const statusVal =
    (status === 1 && 'idle') ||
    (status === 2 && 'idle') ||
    (status === 3 && 'work') ||
    (status === 4 && 'pause') ||
    (status === 5 && 'xmcerror_run') ||
    (status === 6 && 'spindleerror_run') ||
    'unknown';

  return {
    model: modelVal,
    status: statusVal,
    process: progress === undefined ? null : progress / 100,
  };
};

export const machineEventEmitter = new EventEmitter();

export const actions = {
  updateState: (state) => {
    return {
      type: ACTION_UPDATE_STATE,
      state,
    };
  },
  init: () => (dispatch) => {
    const { series, size, laserSize, style } =
      store.get('machine') || INITIAL_STATE;

    dispatch(
      actions.updateState({
        series,
        size,
        laserSize,
        style,
      })
    );

    const controllerEvents = {
      'wifi:uploadOTAFileProgress': (progress) => {
        if (progress) {
          dispatch(
            actions.updateState({
              uploadOTAFileProgress: progress,
            })
          );
        }
      },
      'wifi:uploadOTAFileSucc': () => {
        dispatch(
          actions.updateState({
            uploadOTAFileLoading: false,
            uploadOTAFileSucc: true,
            uploadOTAFileErr: false,
            uploadOTAFileProgress: null,
          })
        );
      },
      'wifi:uploadOTAFileErr': () => {
        message.error(`Send OTA file failed`);
        dispatch(
          actions.updateState({
            uploadOTAFileLoading: false,
            uploadOTAFileSucc: false,
            uploadOTAFileErr: true,
            uploadOTAFileProgress: null,
          })
        );
      },
      'wifi:cancelUploadOTAFileSucc': () => {
        dispatch(
          actions.updateState({
            uploadOTAFileLoading: false,
            uploadOTAFileSucc: false,
            uploadOTAFileErr: false,
            uploadOTAFileProgress: null,
          })
        );
      },
      'wifi:cancelUploadOTAFileErr': () => {
        message.error(`Cancel send OTA file failed`);
      },
      'wifi:getDeviceInfoSucc': (ret) => {
        const { data } = ret;
        if (data.model) {
          data.model =
            (data.model === 'CV-20' && 'CV20') ||
            (data.model === 'CV-30' && 'CV30') ||
            (data.model === 'CV-01 Pro' && 'CV01PRO');
        }
        dispatch(
          actions.updateState({
            deviceWareInfoByWiFi: data,
            deviceWareInfoByWiFiErr: false,
            deviceWareInfoByWiFiLoading: false,
          })
        );
      },
      'wifi:getDeviceInfoErr': () => {
        dispatch(
          actions.updateState({
            deviceWareInfoByWiFi: null,
            deviceWareInfoByWiFiErr: true,
            deviceWareInfoByWiFiLoading: false,
          })
        );
      },
      'wifi:getDeviceStatusHeartbeatSucc': (ret) => {
        const { data } = ret;
        console.log(
          data,
          '============= wifi:getDeviceStatusHeartbeatSucc -----------'
        );
        dispatch(
          actions.updateState({
            machineInfoConnectedByWiFi: deviceStatusHeartbeatDataAdaptor(data),
          })
        );
      },
      'wifi:getDeviceStatusHeartbeatErr': () => {
        console.log(`========== wifi:getDeviceStatusHeartbeatErr ===========`);
        dispatch(
          actions.updateState({
            machineInfoConnectedByWiFi: null,
          })
        );
      },
      'wifi:cancalGetDeviceStatusHeartbeatSucc': () => {
        dispatch(
          actions.updateState({
            machineInfoConnectedByWiFi: null,
          })
        );
        console.log(`======= wifi:cancalGetDeviceStatusHeartbeatSucc ====`);
      },
      'wifi:cancalGetDeviceStatusHeartbeatErr': () => {
        console.log(
          `========= wifi:cancalGetDeviceStatusHeartbeatErr ========`
        );
        dispatch(
          actions.updateState({
            machineInfoConnectedByWiFi: null,
          })
        );
      },
    };

    Object.keys(controllerEvents).forEach((event) => {
      controller.on(event, controllerEvents[event]);
    });
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
        dispatch(actions.updateState({ style: seriesInfo.setting.style }));
      store.set('machine.style', seriesInfo.setting.style);
      seriesInfo &&
        dispatch(actions.updateLaserSize(seriesInfo.setting.laserSize));
      dispatch(widgetActions.updateMachineSeries(series));

      // dispatch(printingActions.init());
    }
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

    machineEventEmitter.emit('laserSizeChange', laserSize);

    dispatch(actions.updateState({ laserSize }));
  },
  subscribeDeviceStatusHeartbeat: () => () => {
    controller.wifiGetDeviceStatusHeartbeat();
  },
  unsubscribeDeviceStatusHeartbeat: () => () => {
    controller.wifiCancalGetDeviceStatusHeartbeat();
  },
  sendPrintCommand:
    (command = 'start') =>
    () => {
      controller.wifiSendPrintCommand(command);
    },
  getDeviceWareInfoByWiFi: () => (dispatch) => {
    dispatch(actions.updateState({ deviceWareInfoByWiFiLoading: true }));
    controller.wifiGetDeviceInfo();
  },
  uploadOTAFile: (fileInfo) => (dispatch) => {
    dispatch(actions.updateState({ uploadOTAFileLoading: true }));
    controller.wifiUploadOTAFile(fileInfo);
  },
  cancelUploadOTAFile: () => () => {
    controller.wifiCancelUploadOTAFile();
  },
  resetUploadOTAFileStatus: () => (dispatch) => {
    dispatch(
      actions.updateState({
        uploadOTAFileLoading: false,
        uploadOTAFileSucc: false,
        uploadOTAFileErr: false,
        uploadOTAFileProgress: null,
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
