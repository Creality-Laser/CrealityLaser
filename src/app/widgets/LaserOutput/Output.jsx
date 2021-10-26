import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import FileSaver from 'file-saver';
import request from 'superagent';
import { connect } from 'react-redux';
import { Modal, Button, Checkbox, message } from 'antd';
import { withTranslation } from 'react-i18next';

import { actions as workspaceActions } from '../../flux/workspace';
import { actions as editorActions } from '../../flux/editor';
import { DATA_PREFIX, PAGE_EDITOR, PAGE_PROCESS } from '../../constants';

import Thumbnail from '../CncLaserShared/Thumbnail';
import { actions as widgetActions } from '../../flux/widget';
import WrapPopover from '../components/params/WrapPopover';

class Output extends PureComponent {
  currentLanguage = '';

  thumbnail = React.createRef();

  actions = {
    onGenerateGcode: () => {
      if (!this.props.isAllModelsPreviewed) {
        Modal.warning({
          title: 'Warning',
          content: 'Please wait for automatic preview to complete.',
        });
        return;
      }
      const thumbnail = this.thumbnail.current.getThumbnail();
      this.props.generateGcode(thumbnail);
    },
    onLoadGcode: () => {
      const { gcodeFile } = this.props;
      if (gcodeFile === null) {
        return;
      }
      this.props.renderGcodeFile(gcodeFile);

      document.location.href = '/#/workspace';
      window.scrollTo(0, 0);
    },
    onExport: () => {
      const { gcodeFile } = this.props;
      if (gcodeFile === null) {
        return;
      }

      const gcodePath = `${DATA_PREFIX}/${gcodeFile.uploadName}`;
      request.get(gcodePath).end((err, res) => {
        const gcodeStr = res.text;
        const blob = new Blob([gcodeStr], { type: 'text/plain;charset=utf-8' });
        FileSaver.saveAs(blob, gcodeFile.name, true);
      });
    },
    onToggleAutoPreview: (value) => {
      this.props.setAutoPreview(value);
      this.props.updateWidgetState({
        autoPreview: value,
      });
    },
    onProcess: () => {
      const { t, isAnyModelOverstepped } = this.props;
      // if (this.props.page === PAGE_EDITOR) {
      //   this.props.togglePage(PAGE_PROCESS);
      // } else {
      //   this.props.togglePage(PAGE_EDITOR);
      // this.props.manualPreview();
      // }
      if (isAnyModelOverstepped) {
        message.warning(
          t('The model is out of bounds. Make sure the model is in bounds.')
        );
        return;
      }
      this.props.togglePage(PAGE_PROCESS);
      this.props.manualPreview();
    },
  };

  constructor(props) {
    super(props);
    const { t } = props;
    this.props.setTitle(t('Actions'));
  }

  componentDidMount() {
    this.props.setAutoPreview(this.props.autoPreview === true);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.previewFailed && !this.props.previewFailed) {
      const { t } = this.props;
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
      this.props.setTitle(t('Actions'));
      this.currentLanguage = nextLanguage;
    }
  }

  render() {
    const actions = this.actions;
    const {
      t,
      workflowState,
      isAllModelsPreviewed,
      isGcodeGenerating,
      autoPreviewEnabled,
      gcodeFile,
      hasModel,
    } = this.props;
    const isEditor = this.props.page === PAGE_EDITOR;
    const isProcess = this.props.page === PAGE_PROCESS;

    return (
      <div>
        <div>
          <Button
            disabled={!hasModel || (isProcess && autoPreviewEnabled)}
            onClick={this.actions.onProcess}
            style={{ display: 'block', width: '100%' }}
          >
            {t('Preview')}
          </Button>
          {/* {isProcess && ( */}
          {true && (
            <div>
              <WrapPopover
                popoverTitle={t('Auto Preview')}
                popoverContent={t(
                  `When enabled, the software will show the preview automatically after the settings are changed. You can disable it if Auto Preview takes too much time.`
                )}
              >
                <div className="sm-parameter-row">
                  <span className="sm-parameter-row__label">
                    {t('Auto Preview')}
                  </span>
                  <Checkbox
                    className="sm-parameter-row__checkbox"
                    disabled={isEditor}
                    checked={autoPreviewEnabled}
                    onChange={(event) => {
                      actions.onToggleAutoPreview(event.target.checked);
                    }}
                  />
                </div>
              </WrapPopover>
              <Button
                type="primary"
                style={{ display: 'block', width: '100%', marginTop: '10px' }}
                onClick={actions.onGenerateGcode}
                disabled={
                  !hasModel || !isAllModelsPreviewed || isGcodeGenerating
                }
              >
                {t('Generate G-code')}
              </Button>
              {/* <button
                type="button"
                className="sm-btn-large sm-btn-default"
                onClick={actions.onLoadGcode}
                disabled={
                  !hasModel ||
                  workflowState === 'running' ||
                  isGcodeGenerating ||
                  gcodeFile === null
                }
                style={{ display: 'block', width: '100%', marginTop: '10px' }}
              >
                {t('Load G-code to Workspace')}
              </button> */}
              <Button
                onClick={actions.onExport}
                disabled={
                  !hasModel ||
                  workflowState === 'running' ||
                  isGcodeGenerating ||
                  !isAllModelsPreviewed ||
                  gcodeFile === null
                }
                style={{ display: 'block', width: '100%', marginTop: '10px' }}
              >
                {t('Export G-code to file')}
              </Button>
              {/* <Button
                onClick={this.props.handleSendGcoreToMachine}
                disabled={
                  !hasModel ||
                  workflowState === 'running' ||
                  !isAllModelsPreviewed
                }
                style={{ display: 'block', width: '100%', marginTop: '10px' }}
              >
                {t('Send G-core to Machine')}
              </Button> */}
            </div>
          )}
        </div>
        <Thumbnail
          ref={this.thumbnail}
          modelGroup={this.props.modelGroup}
          toolPathModelGroup={this.props.toolPathModelGroup}
          minimized={this.props.minimized}
        />
      </div>
    );
  }
}

Output.propTypes = {
  i18n: PropTypes.object,
  t: PropTypes.func,
  setTitle: PropTypes.func.isRequired,
  minimized: PropTypes.bool.isRequired,

  page: PropTypes.string.isRequired,

  modelGroup: PropTypes.object.isRequired,
  hasModel: PropTypes.bool,
  toolPathModelGroup: PropTypes.object.isRequired,
  previewFailed: PropTypes.bool.isRequired,
  autoPreviewEnabled: PropTypes.bool.isRequired,
  autoPreview: PropTypes.bool,
  isAllModelsPreviewed: PropTypes.bool.isRequired,
  isGcodeGenerating: PropTypes.bool.isRequired,
  workflowState: PropTypes.string.isRequired,
  gcodeFile: PropTypes.object,
  generateGcode: PropTypes.func.isRequired,
  renderGcodeFile: PropTypes.func.isRequired,
  manualPreview: PropTypes.func.isRequired,
  setAutoPreview: PropTypes.func.isRequired,
  updateWidgetState: PropTypes.func.isRequired,
  togglePage: PropTypes.func.isRequired,
  isAnyModelOverstepped: PropTypes.bool,
  // handleSendGcoreToMachine: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  // const { workflowState } = state.machine;
  const workflowState = 'idle';
  const { widgets } = state.widget;
  const { widgetId } = ownProps;
  const {
    page,
    isGcodeGenerating,
    isAllModelsPreviewed,
    previewFailed,
    autoPreviewEnabled,
    modelGroup,
    hasModel,
    toolPathModelGroup,
    gcodeFile,
    isAnyModelOverstepped,
  } = state.laser;

  return {
    isAnyModelOverstepped,
    page,
    modelGroup,
    hasModel,
    toolPathModelGroup,
    isGcodeGenerating,
    workflowState,
    isAllModelsPreviewed,
    previewFailed,
    autoPreviewEnabled,
    gcodeFile,
    autoPreview: widgets[widgetId].autoPreview,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleSendGcoreToMachine: () =>
      dispatch(editorActions.handleSendGcoreToMachine('laser')),
    togglePage: (page) => dispatch(editorActions.togglePage('laser', page)),
    generateGcode: (thumbnail) =>
      dispatch(editorActions.generateGcode('laser', thumbnail)),
    renderGcodeFile: (fileName) =>
      dispatch(workspaceActions.renderGcodeFile(fileName)),
    manualPreview: () => dispatch(editorActions.manualPreview('laser', true)),
    setAutoPreview: (value) =>
      dispatch(editorActions.setAutoPreview('laser', value)),
    updateWidgetState: (state) =>
      dispatch(widgetActions.updateWidgetState(ownProps.widgetId, '', state)),
  };
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(Output)
);
