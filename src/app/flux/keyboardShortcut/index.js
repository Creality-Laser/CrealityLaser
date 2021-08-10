import combokeys from '../../lib/combokeys';
import { actions as editorActions } from '../editor';
import { ACTION_UPDATE_STATE } from '../actionType';

export const actions = {
  updateState: (from, state) => {
    return {
      type: ACTION_UPDATE_STATE,
      from,
      state,
    };
  },
  init: () => (dispatch, getState) => {
    const keyEventHandlers = {
      DELETE: () => {
        const from = window.location.hash.split('/')[1];
        if (['laser', 'cnc'].includes(from)) {
          dispatch(editorActions.removeSelectedModel(from));
        }
      },
      DUPLICATE: () => {
        const from = window.location.hash.split('/')[1];
        dispatch(editorActions.duplicateSelectedModel(from));
      },
    };
    Object.keys(keyEventHandlers).forEach((eventName) => {
      const callback = keyEventHandlers[eventName];
      combokeys.on(eventName, callback);
    });
  },
};

export default function reducer() {
  return {};
}
