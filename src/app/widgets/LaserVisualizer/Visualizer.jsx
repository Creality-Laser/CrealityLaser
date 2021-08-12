import React, { Component } from 'react';
import * as THREE from 'three';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import isEqual from 'lodash/isEqual';
import Canvas from '../../components/SMCanvas';
import PrintablePlate from '../CncLaserShared/PrintablePlate';
import { actions as editorActions } from '../../flux/editor';
import AddImage from './components/AddImage';
import UndoRedoBtns from './components/UndoRedoBtns';
import styles from './index.module.scss';
import { PAGE_EDITOR } from '../../constants';
// eslint-disable-next-line no-unused-vars
import CncLaserSvgEditor from '../CncLaserSvgEditor';

import CanvasContextMenu from './components/CanvasContextMenu';
import CanvasViewController from './components/CanvasViewController';
import ProgressInfo from './components/ProgressBar';

class Visualizer extends Component {
  contextMenuRef = React.createRef();

  visualizerRef = React.createRef();

  printableArea = null;

  svgCanvas = React.createRef();

  canvas = React.createRef();

  actions = {
    // canvas footer
    zoomIn: () => {
      this.canvas.current.zoomIn();
    },
    zoomOut: () => {
      this.canvas.current.zoomOut();
    },
    autoFocus: () => {
      this.canvas.current.autoFocus();
    },
    onSelectModel: (model) => {
      this.props.selectModel(model);
    },
    onUnselectAllModels: () => {
      this.props.unselectAllModels();
    },
    onModelAfterTransform: () => {
      this.props.onModelAfterTransform();
    },
    onModelTransform: () => {
      this.props.onModelTransform();
    },
  };

  constructor(props) {
    super(props);

    const size = props.size;
    this.printableArea = new PrintablePlate(size);
  }

  componentDidMount() {
    this.canvas.current && this.canvas.current.resizeWindow();
    this.canvas.current.disable3D();

    window.addEventListener(
      'hashchange',
      (event) => {
        if (event.newURL.endsWith('laser')) {
          this.canvas.current && this.canvas.current.resizeWindow();
        }
      },
      false
    );
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { renderingTimestamp } = nextProps;

    if (!isEqual(nextProps.size, this.props.size)) {
      const size = nextProps.size;
      this.printableArea.updateSize(size);
      this.canvas.current.setCamera(
        new THREE.Vector3(0, 0, Math.min(size.z, 300)),
        new THREE.Vector3()
      );
    }

    /*
        this.canvas.current.updateTransformControl2D();
        const { model } = nextProps;
        if (model !== this.props.model) {
            if (!model) {
                this.canvas.current.controls.detach();
            } else {
                this.canvas.current.controls.attach(model);

                const sourceType = model.modelInfo.source.type;
                if (sourceType === 'text') {
                    this.canvas.current.setTransformControls2DState({ enabledScale: false });
                } else {
                    this.canvas.current.setTransformControls2DState({ enabledScale: true });
                }
            }
        }
        */

    this.canvas.current.updateTransformControl2D();
    // const { model } = nextProps;
    const { selectedModelID } = nextProps;
    if (selectedModelID !== this.props.selectedModelID) {
      const selectedModel = this.props.getSelectedModel();
      if (!selectedModel) {
        this.canvas.current.controls.detach();
      } else {
        const sourceType = selectedModel.sourceType;
        if (sourceType === 'text') {
          this.canvas.current.setTransformControls2DState({
            enabledScale: false,
          });
        } else {
          this.canvas.current.setTransformControls2DState({
            enabledScale: true,
          });
        }
        // this.canvas.current.controls.attach(model);
        // const meshObject = nextProps.getSelectedModel().meshObject;
        const meshObject = selectedModel.meshObject;
        if (meshObject && !selectedModel.hideFlag) {
          this.canvas.current.controls.attach(meshObject);
        } else {
          this.canvas.current.controls.detach();
        }
      }
    } else {
      const selectedModel = this.props.getSelectedModel();
      if (!selectedModel) {
        this.canvas.current.controls.detach();
      } else {
        if (selectedModel.hideFlag) {
          this.canvas.current.controls.detach();
        } else {
          this.canvas.current.controls.attach(selectedModel.meshObject);
        }
      }
    }

    if (renderingTimestamp !== this.props.renderingTimestamp) {
      this.canvas.current.renderScene();
    }
  }

  showContextMenu = (event) => {
    this.contextMenuRef.current.show(event);
  };

  render() {
    const {
      canUndo,
      canRedo,
      undo,
      redo,
      togglePage,
      uploadImage,
      setAutoPreview,
      gcodeFile,
      stage,
      progress,
    } = this.props;

    const isModelSelected = !!this.props.selectedModelID;

    // const isEditor = this.props.page === PAGE_EDITOR;

    // const isEditor = true;

    return (
      <div
        ref={this.visualizerRef}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        {/* {isEditor && ( */}
        {true && (
          <div className={styles['visualizer-top-left']}>
            <AddImage
              togglePage={togglePage}
              uploadImage={uploadImage}
              setAutoPreview={setAutoPreview}
              insertDefaultTextVector={this.props.insertDefaultTextVector}
              genQrcode={this.props.genQrcode}
              genQrcodeModel={this.props.genQrcodeModel}
            />
          </div>
        )}
        <div
          style={{
            // visibility: isEditor ? 'visible' : 'hidden',
            visibility: 'hidden',
          }}
        >
          <CncLaserSvgEditor
            ref={this.svgCanvas}
            size={this.props.size}
            svgModelGroup={this.props.svgModelGroup}
            insertDefaultTextVector={this.props.insertDefaultTextVector}
            showContextMenu={this.showContextMenu}
          />
        </div>
        <div
          className={styles['canvas-content']}
          style={{
            // visibility: !isEditor ? 'visible' : 'hidden',
            visibility: 'visible',
          }}
        >
          <Canvas
            ref={this.canvas}
            size={this.props.size}
            backgroundGroup={this.props.backgroundGroup}
            modelGroup={this.props.modelGroup.object}
            toolPathModelGroup={this.props.toolPathModelGroup.object}
            printableArea={this.printableArea}
            cameraInitialPosition={
              new THREE.Vector3(40, 0, Math.min(this.props.size.z + 100, 300))
            }
            cameraInitialTarget={new THREE.Vector3(40, 0, 0)}
            onSelectModel={this.actions.onSelectModel}
            onUnselectAllModels={this.actions.onUnselectAllModels}
            onModelAfterTransform={this.actions.onModelAfterTransform}
            onModelTransform={this.actions.onModelTransform}
            showContextMenu={this.showContextMenu}
            transformSourceType="2D"
          />
        </div>
        <div className={styles['canvas-footer']}>
          <div>
            <CanvasViewController
              zoomIn={this.actions.zoomIn}
              zoomOut={this.actions.zoomOut}
              autoFocus={this.actions.autoFocus}
            />
          </div>
          <div>
            <UndoRedoBtns
              canUndo={canUndo}
              canRedo={canRedo}
              undo={undo}
              redo={redo}
            />
          </div>
        </div>
        <div className={styles['visualizer-progress']}>
          <ProgressInfo
            stage={stage}
            progress={progress}
            gcodeFile={gcodeFile}
          />
        </div>
        <CanvasContextMenu
          ref={this.contextMenuRef}
          isModelSelected={isModelSelected}
          duplicateSelectedModel={this.props.duplicateSelectedModel}
          bringSelectedModelToFront={this.props.bringSelectedModelToFront}
          sendSelectedModelToBack={this.props.sendSelectedModelToBack}
          onSetSelectedModelPosition={this.props.onSetSelectedModelPosition}
          onFlipSelectedModel={this.props.onFlipSelectedModel}
          removeSelectedModel={this.props.removeSelectedModel}
        />
      </div>
    );
  }
}

Visualizer.propTypes = {
  // page: PropTypes.string.isRequired,
  stage: PropTypes.number.isRequired,
  progress: PropTypes.number.isRequired,

  canUndo: PropTypes.bool.isRequired,
  canRedo: PropTypes.bool.isRequired,
  undo: PropTypes.func.isRequired,
  redo: PropTypes.func.isRequired,
  uploadImage: PropTypes.func.isRequired,
  setAutoPreview: PropTypes.func.isRequired,
  togglePage: PropTypes.func.isRequired,
  // hasModel: PropTypes.bool.isRequired,
  size: PropTypes.object.isRequired,
  // model: PropTypes.object,
  selectedModelID: PropTypes.string,
  backgroundGroup: PropTypes.object.isRequired,
  modelGroup: PropTypes.object.isRequired,
  svgModelGroup: PropTypes.object.isRequired,
  toolPathModelGroup: PropTypes.object.isRequired,
  renderingTimestamp: PropTypes.number.isRequired,
  gcodeFile: PropTypes.object,

  // func
  // getEstimatedTime: PropTypes.func.isRequired,
  getSelectedModel: PropTypes.func.isRequired,
  bringSelectedModelToFront: PropTypes.func.isRequired,
  sendSelectedModelToBack: PropTypes.func.isRequired,
  insertDefaultTextVector: PropTypes.func.isRequired,
  genQrcode: PropTypes.func.isRequired,
  genQrcodeModel: PropTypes.func.isRequired,

  onSetSelectedModelPosition: PropTypes.func.isRequired,
  onFlipSelectedModel: PropTypes.func.isRequired,
  selectModel: PropTypes.func.isRequired,
  unselectAllModels: PropTypes.func.isRequired,
  removeSelectedModel: PropTypes.func.isRequired,
  duplicateSelectedModel: PropTypes.func.isRequired,
  onModelTransform: PropTypes.func.isRequired,
  onModelAfterTransform: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const { size } = state.machine;

  const { background } = state.laser;
  // call canvas.updateTransformControl2D() when transformation changed or model selected changed
  const {
    page,
    selectedModelID,
    modelGroup,
    svgModelGroup,
    toolPathModelGroup,
    hasModel,
    renderingTimestamp,
    stage,
    progress,
    canUndo,
    canRedo,
    gcodeFile,
  } = state.laser;

  return {
    canUndo,
    canRedo,
    page,
    size,
    hasModel,
    selectedModelID,
    svgModelGroup,
    modelGroup,
    toolPathModelGroup,
    // model,
    backgroundGroup: background.group,
    renderingTimestamp,
    stage,
    progress,
    gcodeFile,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    undo: () => dispatch(editorActions.undo('laser')),
    redo: () => dispatch(editorActions.redo('laser')),
    setAutoPreview: (value) =>
      dispatch(editorActions.setAutoPreview('laser', value)),
    uploadImage: (file, mode, onFailure) =>
      dispatch(editorActions.uploadImage('laser', file, mode, onFailure)),
    togglePage: (page) => dispatch(editorActions.togglePage('laser', page)),
    getEstimatedTime: (type) =>
      dispatch(editorActions.getEstimatedTime('laser', type)),
    getSelectedModel: () => dispatch(editorActions.getSelectedModel('laser')),
    bringSelectedModelToFront: () =>
      dispatch(editorActions.bringSelectedModelToFront('laser')),
    sendSelectedModelToBack: () =>
      dispatch(editorActions.sendSelectedModelToBack('laser')),
    insertDefaultTextVector: () =>
      dispatch(editorActions.insertDefaultTextVector('laser')),
    genQrcode: (text) => dispatch(editorActions.genQrcode('laser', text)),
    genQrcodeModel: (qrcodeInfo) =>
      dispatch(editorActions.genQrcodeModel('laser', qrcodeInfo)),
    onSetSelectedModelPosition: (position) =>
      dispatch(editorActions.onSetSelectedModelPosition('laser', position)),
    onFlipSelectedModel: (flip) =>
      dispatch(editorActions.onFlipSelectedModel('laser', flip)),
    selectModel: (model) => dispatch(editorActions.selectModel('laser', model)),
    unselectAllModels: () => dispatch(editorActions.unselectAllModels('laser')),
    removeSelectedModel: () =>
      dispatch(editorActions.removeSelectedModel('laser')),
    duplicateSelectedModel: () =>
      dispatch(editorActions.duplicateSelectedModel('laser')),
    onModelTransform: () => dispatch(editorActions.onModelTransform('laser')),
    onModelAfterTransform: () =>
      dispatch(editorActions.onModelAfterTransform('laser')),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Visualizer);
