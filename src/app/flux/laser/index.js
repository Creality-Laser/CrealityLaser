import * as THREE from 'three';
// import { DATA_PREFIX, EPSILON } from '../../constants';
import { DATA_PREFIX, PAGE_PROCESS } from '../../constants';
import { controller } from '../../lib/controller';
import ModelGroup from '../models/ModelGroup';
import ToolPathModelGroup from '../models/ToolPathModelGroup';
import {
  ACTION_RESET_CALCULATED_STATE,
  ACTION_UPDATE_CONFIG,
  ACTION_UPDATE_GCODE_CONFIG,
  ACTION_UPDATE_STATE,
  ACTION_UPDATE_TRANSFORMATION,
} from '../actionType';
import { actions as editorActions, CNC_LASER_STAGE } from '../editor';
// import { baseActions } from '../editor/base';
import SvgModelGroup from '../models/SvgModelGroup';
import { machineEventEmitter } from '../machine';

const INITIAL_STATE = {
  page: PAGE_PROCESS,

  stage: CNC_LASER_STAGE.EMPTY,
  progress: 0,

  modelGroup: new ModelGroup(),
  toolPathModelGroup: new ToolPathModelGroup(),
  svgModelGroup: new SvgModelGroup(),

  isAllModelsPreviewed: false,
  isGcodeGenerating: false,
  gcodeFile: null,

  // model: null,
  selectedModelID: null,
  selectedModelHideFlag: false,
  sourceType: '',
  mode: '',
  showOrigin: null,

  printOrder: 1,
  transformation: {},
  transformationUpdateTime: new Date().getTime(),

  gcodeConfig: {},
  config: {},

  // about wifi params
  currentGcoreConfig: {}, // The custom pre gcode format's config
  // snapshot state
  undoSnapshots: [{ models: [], toolPathModels: [] }], // snapshot { models, toolPathModels }
  redoSnapshots: [], // snapshot { models, toolPathModels }
  canUndo: false,
  canRedo: false,

  // modelGroup state
  hasModel: false,
  isAnyModelOverstepped: false,

  // boundingBox: new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()), // bbox of selected model
  background: {
    enabled: false,
    group: new THREE.Group(),
  },

  previewFailed: false,
  autoPreviewEnabled: false,

  // rendering
  renderingTimestamp: 0,
};

const ACTION_SET_BACKGROUND_ENABLED = 'laser/ACTION_SET_BACKGROUND_ENABLED';

export const actions = {
  init: () => (dispatch, getState) => {
    dispatch(editorActions.init('laser'));

    const controllerEvents = {
      'wifi:uploadGcoreProgress': (process) => {
        console.log(process, '======== wifi:uploadGcoreProgress =======');
      },
      'wifi:uploadGcoreSucc': (ret) => {
        console.log(ret, '======== wifi:uploadGcoreSucc =======');
      },
      'wifi:uploadGcoreErr': (err) => {
        console.log(err, '======== wifi:uploadGcoreSucc =======');
      },
      'taskCompleted:generateToolPath': (taskResult) => {
        if (taskResult.headType === 'laser') {
          dispatch(actions.genCurrentGcoreConfig(taskResult));
          dispatch(editorActions.onReceiveTaskResult('laser', taskResult));
        }
      },
      'taskCompleted:generateGcode': (taskResult) => {
        if (taskResult.headType === 'laser') {
          dispatch(editorActions.onReceiveGcodeTaskResult('laser', taskResult));
        }
      },
      'taskProgress:generateToolPath': (taskResult) => {
        if (taskResult.headType === 'laser') {
          dispatch(
            editorActions.updateState('laser', {
              stage: CNC_LASER_STAGE.GENERATING_TOOLPATH,
              progress: taskResult.progress,
            })
          );
        }
      },
      'taskProgress:generateGcode': (taskResult) => {
        if (taskResult.headType === 'laser') {
          dispatch(
            editorActions.updateState('laser', {
              stage: CNC_LASER_STAGE.GENERATING_GCODE,
              progress: taskResult.progress,
            })
          );
        }
      },
    };

    Object.keys(controllerEvents).forEach((event) => {
      controller.on(event, controllerEvents[event]);
    });

    //  when laserSize change.
    machineEventEmitter.on('laserSizeChange', (laserSize) => {
      const state = getState().laser;
      const { modelGroup } = state;

      // update modelGroup's all model's limitSize
      const models = modelGroup.getModels();
      models.forEach((model) => {
        if (model) {
          model.limitSize = laserSize;
        }
      });
      if (models && models.length) {
        // update isAnyModelOverstepped
        dispatch(editorActions.onModelTransform('laser'));
      }
    });
  },

  setBackgroundEnabled: (enabled) => {
    return {
      type: ACTION_SET_BACKGROUND_ENABLED,
      enabled,
    };
  },

  setBackgroundImage:
    (filename, width, height, dx, dy) => (dispatch, getState) => {
      const state = getState().laser;
      const { svgModelGroup } = state;

      svgModelGroup.addImageBackgroundToSVG({
        modelID: 'image-background',
        uploadName: filename,
        transformation: {
          width,
          height,
          positionX: dx + width / 2,
          positionY: dy + height / 2,
        },
      });

      const imgPath = `${DATA_PREFIX}/${filename}`;
      const texture = new THREE.TextureLoader().load(imgPath, () => {
        dispatch(editorActions.render('laser'));
      });
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1,
        map: texture,
      });
      const geometry = new THREE.PlaneGeometry(width, height);
      const mesh = new THREE.Mesh(geometry, material);
      const x = dx + width / 2;
      const y = dy + height / 2;

      mesh.position.set(x, y, -0.001);
      const { group } = state.background;
      group.remove(...group.children);
      group.add(mesh);
      dispatch(actions.setBackgroundEnabled(true));
      dispatch(editorActions.render('laser'));
    },

  removeBackgroundImage: () => (dispatch, getState) => {
    const state = getState().laser;
    const { svgModelGroup } = state;
    svgModelGroup.clearImageBackground();
    const { group } = state.background;
    group.remove(...group.children);
    dispatch(actions.setBackgroundEnabled(false));
    dispatch(editorActions.render('laser'));
  },
  // Gcore is a mid format which should send to machine for generate gcode.
  genCurrentGcoreConfig: (toolPathResult) => (dispatch, getState) => {
    const {
      data: {
        mode,
        transformation: { width, height, positionX, positionY },
        gcodeConfig: {
          density,
          fixedPowerEnabled,
          fixedPower,
          multiPasses,
          jogSpeed,
          workSpeed,
        },
      },
      modelPath,
    } = toolPathResult;

    const isVectorMode = mode && mode === 'vector';

    // current not support vector mode
    if (isVectorMode) {
      return;
    }
    const { series } = getState().machine;

    // Offset from the lower left corner
    const offset = {
      x: positionX - width / 2,
      y: positionY - height / 2,
    };

    // percent number
    const power_rate = fixedPowerEnabled ? fixedPower : 100;

    // work_speed = speed_rate * max_work_speed
    const max_work_speed = 2000;
    const speed_rate = (workSpeed / max_work_speed) * 100;

    // model

    let model = null;
    switch (series) {
      case 'CV01PRO':
        model = 2;
        break;
      case 'CV20':
        model = 20;
        break;
      case 'CV30':
        model = 30;
        break;
      case 'Ender3s':
        model = 0;
        break;
      default:
        model = 0;
        break;
    }

    const gcoreConfig = {
      sourcePath: modelPath,
      offset,
      density,
      power_rate,
      speed_rate,
      model,
      start: 1,
      dire: 1,
      gco_style: 1,
      total_num: multiPasses,
      jog_speed: jogSpeed,
      work_speed: workSpeed,
    };

    console.log(gcoreConfig, '========== gcoreConfig =======');

    dispatch(
      editorActions.updateState('laser', {
        currentGcoreConfig: gcoreConfig,
      })
    );
  },
};

export default function reducer(state = INITIAL_STATE, action) {
  const { headType, type } = action;
  if (headType === 'laser') {
    switch (type) {
      case ACTION_UPDATE_STATE: {
        return { ...state, ...action.state };
      }
      case ACTION_RESET_CALCULATED_STATE: {
        return { ...state, isAllModelsPreviewed: false };
      }
      case ACTION_UPDATE_TRANSFORMATION: {
        return {
          ...state,
          transformation: { ...state.transformation, ...action.transformation },
          transformationUpdateTime: +new Date(),
        };
      }
      case ACTION_UPDATE_GCODE_CONFIG: {
        return {
          ...state,
          gcodeConfig: { ...state.gcodeConfig, ...action.gcodeConfig },
        };
      }
      case ACTION_UPDATE_CONFIG: {
        return { ...state, config: { ...state.config, ...action.config } };
      }
      default:
        return state;
    }
  } else {
    switch (type) {
      case ACTION_SET_BACKGROUND_ENABLED: {
        return {
          ...state,
          background: {
            ...state.background,
            enabled: action.enabled,
          },
        };
      }
      default:
        return state;
    }
  }
}
