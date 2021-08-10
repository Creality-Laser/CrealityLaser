import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { actions as editorActions } from '../../flux/editor';
import UndoRedoBtns from './components/UndoRedoBtns';
import AddImage from './components/AddImage';

class VisualizerTopLeft extends PureComponent {
  render() {
    const {
      canUndo,
      canRedo,
      undo,
      redo,
      togglePage,
      uploadImage,
      setAutoPreview,
    } = this.props;

    return (
      <>
        <UndoRedoBtns
          canUndo={canUndo}
          canRedo={canRedo}
          undo={undo}
          redo={redo}
        />
        <AddImage
          togglePage={togglePage}
          uploadImage={uploadImage}
          setAutoPreview={setAutoPreview}
        />
      </>
    );
  }
}

VisualizerTopLeft.propTypes = {
  canUndo: PropTypes.bool.isRequired,
  canRedo: PropTypes.bool.isRequired,
  undo: PropTypes.func.isRequired,
  redo: PropTypes.func.isRequired,
  uploadImage: PropTypes.func.isRequired,
  setAutoPreview: PropTypes.func.isRequired,
  togglePage: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const { canUndo, canRedo } = state.laser;

  return {
    canUndo,
    canRedo,
  };
};

const mapDispatchToProps = (dispatch) => ({
  undo: () => dispatch(editorActions.undo('laser')),
  redo: () => dispatch(editorActions.redo('laser')),
  setAutoPreview: (value) =>
    dispatch(editorActions.setAutoPreview('laser', value)),
  uploadImage: (file, mode, onFailure) =>
    dispatch(editorActions.uploadImage('laser', file, mode, onFailure)),
  togglePage: (page) => dispatch(editorActions.togglePage('laser', page)),
});

export default connect(mapStateToProps, mapDispatchToProps)(VisualizerTopLeft);
