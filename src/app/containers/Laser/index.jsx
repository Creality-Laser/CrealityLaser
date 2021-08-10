import React, { Component } from 'react';
import path from 'path';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Sortable from 'react-sortablejs';
import { Modal } from 'antd';
import LaserVisualizer from '../../widgets/LaserVisualizer';
import Widget from '../../widgets';
import Dropzone from '../../components/Dropzone';
import { actions as editorActions } from '../../flux/editor';
import { actions as widgetActions } from '../../flux/widget';
import styles from './index.module.scss';

const ACCEPT = '.svg, .png, .jpg, .jpeg, .bmp, .dxf';

class Laser extends Component {
  state = {
    isDraggingWidget: false,
  };

  actions = {
    // todo: show UI then select process mode
    onDropAccepted: (file) => {
      let mode = 'bw';
      if (
        path.extname(file.name).toLowerCase() === '.svg' ||
        path.extname(file.name).toLowerCase() === '.dxf'
      ) {
        mode = 'vector';
      }
      this.props.uploadImage(file, mode, () => {
        Modal.error({
          title: 'Parse Error',
          body: 'Failed to parse image file',
        });
      });
    },
    onDropRejected: () => {
      Modal.warning({
        title: 'Warning',
        body: 'Only {{accept}} files are supported.',
      });
    },
    onDragWidgetStart: () => {
      this.setState({ isDraggingWidget: true });
    },
    onDragWidgetEnd: () => {
      this.setState({ isDraggingWidget: false });
    },
  };

  onChangeWidgetOrder = (widgets) => {
    this.props.updateTabContainer({ widgets });
  };

  render() {
    const style = this.props.style;
    const state = this.state;
    const widgets = this.props.widgets;

    return (
      <Dropzone
        disabled={state.isDraggingWidget}
        accept={ACCEPT}
        dragEnterMsg="Drop an image file here."
        onDropAccepted={this.actions.onDropAccepted}
        onDropRejected={this.actions.onDropRejected}
      >
        <div className={styles.wrapper} style={style}>
          <div className={styles.visualizer_wrapper}>
            <LaserVisualizer widgetId="laserVisualizer" />
          </div>
          <div className={styles.widgets_wrapper}>
            <Sortable
              options={{
                animation: 150,
                delay: 0,
                group: {
                  name: 'laser-control',
                },
                handle: '.sortable-handle',
                filter: '.sortable-filter',
                chosenClass: 'sortable-chosen',
                ghostClass: 'sortable-ghost',
                dataIdAttr: 'data-widget-id',
                onStart: this.actions.onDragWidgetStart,
                onEnd: this.actions.onDragWidgetEnd,
              }}
              onChange={this.onChangeWidgetOrder}
            >
              {widgets.map((widget) => {
                return (
                  <div data-widget-id={widget} key={widget}>
                    <Widget widgetId={widget} headType="laser" />
                  </div>
                );
              })}
            </Sortable>
          </div>
        </div>
      </Dropzone>
    );
  }
}

Laser.propTypes = {
  widgets: PropTypes.array.isRequired,
  style: PropTypes.object,
  uploadImage: PropTypes.func.isRequired,
  updateTabContainer: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const widget = state.widget;
  const widgets = widget.laser.default.widgets;
  return {
    widgets,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    uploadImage: (file, mode, onFailure) =>
      dispatch(editorActions.uploadImage('laser', file, mode, onFailure)),
    updateTabContainer: (widgets) =>
      dispatch(widgetActions.updateTabContainer('laser', 'default', widgets)),
  };
};

// https://stackoverflow.com/questions/47657365/can-i-mapdispatchtoprops-without-mapstatetoprops-in-redux
export default connect(mapStateToProps, mapDispatchToProps)(Laser);
