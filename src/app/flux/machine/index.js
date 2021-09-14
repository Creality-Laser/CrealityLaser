import { isArray, includes } from 'lodash';
import EventEmitter from 'events';
import { MACHINE_SERIES } from '../../constants';
import store from '../../../store';
import { actions as widgetActions } from '../widget';

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
  series: MACHINE_SERIES.CV20.value,
  size: MACHINE_SERIES.CV20.setting.size,
  laserSize: MACHINE_SERIES.CV20.setting.laserSize,
  style: MACHINE_SERIES.CV20.setting.style,
};

const ACTION_UPDATE_STATE = 'machine/ACTION_UPDATE_STATE';

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
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case ACTION_UPDATE_STATE:
      return { ...state, ...action.state };
    default:
      return state;
  }
}
