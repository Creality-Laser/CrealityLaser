import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { Modal, Popover } from 'antd';
import { withTranslation } from 'react-i18next';

import styles from './index.module.scss';
import { actions as editorActions } from '../../flux/editor';
import Thumbnail from '../CncLaserShared/Thumbnail';
import { actions as widgetActions } from '../../flux/widget';
// import { TextInput as Input } from '../../components/Input';

class ObjectListBox extends PureComponent {
  // state = {
  //     selectedModelID: ''
  // };

  currentLanguage = '';

  thumbnail = React.createRef();

  contextMenuRef = React.createRef();

  actions = {
    onClickModelNameBox: (model) => {
      this.props.selectModelByID(model.modelID);
    },

    onClickModelHideBox: (model) => {
      const hideFlag = model.hideFlag;
      this.props.selectModelByID(model.modelID);
      if (!hideFlag) {
        this.props.hideSelectedModel(model);
      } else {
        this.props.showSelectedModel(model);
      }
      this.props.selectModelByID(model.modelID);
    },
  };

  constructor(props) {
    super(props);
    const { t } = this.props;
    this.props.setTitle(t('Object List'));
  }

  componentDidMount() {}

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.previewFailed && !this.props.previewFailed) {
      const { t } = nextProps;
      Modal.error({
        title: t('Failed to preview'),
        content: t(
          'Failed to preview, please modify parameters and try again.'
        ),
      });
    }

    const {
      t,
      i18n: { language: nextLanguage },
    } = nextProps;
    if (!this.currentLanguage || this.currentLanguage !== nextLanguage) {
      this.props.setTitle(t('Object List'));
      this.currentLanguage = nextLanguage;
    }
  }

  render() {
    const { modelGroup, modelGroupSelectedModel, t } = this.props;
    const selectedModel = modelGroupSelectedModel;

    return (
      <>
        <div className={classNames(styles.object_list_box)}>
          {modelGroup.models && modelGroup.models.length === 0 && (
            <div className={styles.no_content}>
              <EmptyIcon />
              <span className={styles.no_content_text}>
                {t('Please add File')}
              </span>
            </div>
          )}
          {modelGroup.models.map((model) => {
            const taskInfo = model.getTaskInfo();
            const modelName = taskInfo.modelName;
            const modelIcon = () => {
              if (taskInfo.sourceType === 'text') {
                return styles.icon_text;
              }
              if (taskInfo.mode !== 'vector') {
                return styles.icon_pic;
              }
              return styles.icon_shape;
            };
            return (
              <Popover
                key={model.modelName}
                title={t('object item')}
                content={model.modelName}
                placement="left"
              >
                <div onContextMenu={this.showContextMenu}>
                  <div
                    className={classNames(
                      styles.bgr,
                      selectedModel && selectedModel.modelID === model.modelID
                        ? styles.selected
                        : null
                    )}
                  >
                    <span className={classNames(styles.icon, modelIcon())} />
                    <button
                      type="button"
                      className={classNames(styles.name, styles.bt)}
                      onClick={() => this.actions.onClickModelNameBox(model)}
                    >
                      {modelName}
                    </button>
                    <button
                      type="button"
                      className={classNames(
                        styles.icon,
                        taskInfo.hideFlag
                          ? styles.icon_hide_close
                          : styles.icon_hide_open,
                        styles.bt
                      )}
                      onClick={() => this.actions.onClickModelHideBox(model)}
                    />
                  </div>
                </div>
              </Popover>
            );
          })}
        </div>
        <Thumbnail
          ref={this.thumbnail}
          modelGroup={this.props.modelGroup}
          toolPathModelGroup={this.props.toolPathModelGroup}
          minimized={this.props.minimized}
        />
      </>
    );
  }
}

ObjectListBox.propTypes = {
  i18n: PropTypes.object,
  t: PropTypes.func,
  setTitle: PropTypes.func.isRequired,
  selectModelByID: PropTypes.func.isRequired,
  minimized: PropTypes.bool.isRequired,
  hideSelectedModel: PropTypes.func.isRequired,
  showSelectedModel: PropTypes.func.isRequired,

  modelGroupSelectedModel: PropTypes.object,
  modelGroup: PropTypes.object.isRequired,
  toolPathModelGroup: PropTypes.object.isRequired,
  previewFailed: PropTypes.bool.isRequired,
  // selectedModelHideFlag: PropTypes.bool
};

const mapStateToProps = (state, ownProps) => {
  // const { workflowState } = state.machine;

  const workflowState = 'idle';

  const {
    page,
    previewFailed,
    modelGroup,
    toolPathModelGroup,
    svgModelGroup,
    selectedModelHideFlag,
  } = state[ownProps.headType];
  const { headType } = ownProps;
  return {
    headType,
    page,
    modelGroup,
    toolPathModelGroup,
    svgModelGroup,
    workflowState,
    previewFailed,
    // will change better methods next version
    modelGroupLength: modelGroup.models.length,
    modelGroupSelectedModel:
      modelGroup.getSelectedModel() && modelGroup.getSelectedModel(),
    modelHideFlag:
      modelGroup.getSelectedModel() && modelGroup.getSelectedModel().hideFlag,
    selectedModelHideFlag,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    togglePage: (page) =>
      dispatch(editorActions.togglePage(ownProps.headType, page)),
    updateWidgetState: (state) =>
      dispatch(widgetActions.updateWidgetState(ownProps.widgetId, '', state)),
    selectModelByID: (modelID) =>
      dispatch(editorActions.selectModelByID(ownProps.headType, modelID)),
    hideSelectedModel: () =>
      dispatch(editorActions.hideSelectedModel(ownProps.headType)),
    showSelectedModel: () =>
      dispatch(editorActions.showSelectedModel(ownProps.headType)),
  };
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(ObjectListBox)
);

const EmptyIcon = () => (
  <svg
    t="1626752117131"
    className="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="5665"
    width="200"
    height="200"
  >
    <path
      d="M855.6 427.2H168.5c-12.7 0-24.4 6.9-30.6 18L4.4 684.7C1.5 689.9 0 695.8 0 701.8v287.1c0 19.4 15.7 35.1 35.1 35.1H989c19.4 0 35.1-15.7 35.1-35.1V701.8c0-6-1.5-11.8-4.4-17.1L886.2 445.2c-6.2-11.1-17.9-18-30.6-18zM673.4 695.6c-16.5 0-30.8 11.5-34.3 27.7-12.7 58.5-64.8 102.3-127.2 102.3s-114.5-43.8-127.2-102.3c-3.5-16.1-17.8-27.7-34.3-27.7H119c-26.4 0-43.3-28-31.1-51.4l81.7-155.8c6.1-11.6 18-18.8 31.1-18.8h622.4c13 0 25 7.2 31.1 18.8l81.7 155.8c12.2 23.4-4.7 51.4-31.1 51.4H673.4zM819.9 209.5c-1-1.8-2.1-3.7-3.2-5.5-9.8-16.6-31.1-22.2-47.8-12.6L648.5 261c-17 9.8-22.7 31.6-12.6 48.4 0.9 1.4 1.7 2.9 2.5 4.4 9.5 17 31.2 22.8 48 13L807 257.3c16.7-9.7 22.4-31 12.9-47.8zM375.4 261.1L255 191.6c-16.7-9.6-38-4-47.8 12.6-1.1 1.8-2.1 3.6-3.2 5.5-9.5 16.8-3.8 38.1 12.9 47.8L337.3 327c16.9 9.7 38.6 4 48-13.1 0.8-1.5 1.7-2.9 2.5-4.4 10.2-16.8 4.5-38.6-12.4-48.4zM512 239.3h2.5c19.5 0.3 35.5-15.5 35.5-35.1v-139c0-19.3-15.6-34.9-34.8-35.1h-6.4C489.6 30.3 474 46 474 65.2v139c0 19.5 15.9 35.4 35.5 35.1h2.5z"
      p-id="5666"
      fill="#dbdbdb"
    ></path>
  </svg>
);
