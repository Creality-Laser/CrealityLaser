import { baseActions } from './base';
import { EPSILON } from '../../constants';

export const threejsModelActions = {
  generateThreejsModel:
    (headType, options, machineSize) => (dispatch, getState) => {
      const { modelGroup, toolPathModelGroup } = getState()[headType];

      const modelState = modelGroup.generateModel(options, machineSize);
      const toolPathModelState =
        toolPathModelGroup.generateToolPathModel(options);

      dispatch(
        baseActions.updateState(headType, {
          ...modelState,
          ...toolPathModelState,
        })
      );
    },

  selectModel: (headType, modelID) => (dispatch, getState) => {
    const { modelGroup, toolPathModelGroup } = getState()[headType];
    const selectedModelState = modelGroup.selectModelById(modelID);
    const toolPathModelState = toolPathModelGroup.selectToolPathModel(modelID);

    const state = {
      ...selectedModelState,
      ...toolPathModelState,
    };
    dispatch(baseActions.updateState(headType, state));
  },

  // unselectAllModels: (headType) => (dispatch, getState) => {
  //     const { modelGroup, toolPathModelGroup } = getState()[headType];
  //     const modelState = modelGroup.unselectAllModels();
  //     const toolPathModelState = toolPathModelGroup.unselectAllModels();
  //     dispatch(baseActions.updateState(headType, {
  //         ...modelState,
  //         ...toolPathModelState
  //     }));
  // },

  // callback

  updateSelectedModelTransformation:
    (headType, transformation) => (dispatch, getState) => {
      const { modelGroup, toolPathModelGroup, config } = getState()[headType];
      const modelState =
        modelGroup.updateSelectedModelTransformation(transformation);
      const selectedModel = modelGroup.getSelectedModel();

      if (!selectedModel) {
        return;
      }

      for (const model of modelGroup.getModels()) {
        const toolPath = toolPathModelGroup.getToolPathModel(model.modelID);
        if (toolPath.needPreview) {
          toolPath.updateVisible(false);
          model.updateVisible(true);
        } else {
          toolPath.updateVisible(true);
          model.updateVisible(false);
        }
      }

      const { text, lineHeight, size } = config;
      if (text) {
        const numberOfLines = text.split('\n').length;
        const estimatedHeight =
          numberOfLines === 1
            ? transformation.height
            : transformation.height / (1 + lineHeight * (numberOfLines - 1));
        const newSize = (estimatedHeight * 72) / 25.4;

        if (Math.abs(newSize - size) > EPSILON) {
          const source = {
            width: selectedModel.transformation.width,
            height: selectedModel.transformation.height,
          };
          // svgModelGroup.updateTransformation(transformation);
          modelGroup.updateSelectedSource(source);
          modelGroup.updateSelectedModelTransformation(transformation);
          modelGroup.updateSelectedConfig({ size: Math.ceil(newSize) });
          dispatch(
            baseActions.updateConfig(headType, { size: Math.ceil(newSize) })
          );
        }
      }

      if (modelState) {
        toolPathModelGroup.updateSelectedNeedPreview(true);
        dispatch(
          baseActions.updateTransformation(headType, modelState.transformation)
        );
        dispatch(baseActions.resetCalculatedState(headType));
        dispatch(baseActions.render(headType));
      }

      dispatch(baseActions.render(headType));
    },
};
