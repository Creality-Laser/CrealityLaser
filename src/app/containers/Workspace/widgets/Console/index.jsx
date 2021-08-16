import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button } from 'antd';

import Console from './Console';
import { actions as widgetActions } from '../../../../flux/widget';
import styles from './index.module.scss';

const i18n = {
  _: (str) => str,
};

class ConsoleWidget extends PureComponent {
  state = {
    // trigger termininal render
    clearRenderStamp: 0,
    minimized: this.props.minimized,
    isMaximized: false,
  };

  actions = {
    toNormalSize: () => {
      this.setState({
        minimized: false,
        isMaximized: false,
      });
    },
    toggleMinimized: () => {
      const { minimized } = this.state;
      this.setState(() => ({
        minimized: !minimized,
        isMaximized: false,
      }));
      this.props.updateWidgetState({ minimized: !minimized });
    },
    clearAll: () => {
      this.setState((state) => {
        return {
          clearRenderStamp: state.clearRenderStamp + 1,
        };
      });
    },
    toggleWorkspaceWidgetToDefault: () => {
      this.props.toggleWorkspaceWidgetToDefault();
    },
  };

  render() {
    const { clearRenderStamp, minimized, isMaximized } = this.state;
    const { widgetId, isDefault, isShowWorkspace } = this.props;

    const isNormalSize = !minimized && !isMaximized;

    return (
      <>
        {minimized && (
          <div className={styles.minimizedWrapper} title={i18n._('Console')}>
            <Button
              type="primary"
              wrapperStyle={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
              }}
              onClick={this.actions.toggleMinimized}
            >
              <i className={classNames('iconfont', styles.minimizedIcon)}>
                &#xe6cd;
              </i>
            </Button>
          </div>
        )}
        {isShowWorkspace && (
          <div
            className={classNames(
              minimized ? styles.hide : '',
              isNormalSize ? styles.normalWrapper : '',
              isMaximized ? styles.maxWrapper : ''
            )}
          >
            <div className={styles.normalHeader}>
              <span className={styles.normalHeaderLabel}>
                {i18n._('Console')}
              </span>
              <span className={styles.normalHeaderBtns}>
                <span
                  className={classNames('iconfont', styles.normalHeaderBtnItem)}
                  onClick={this.actions.clearAll}
                  title={i18n._('Clear All')}
                >
                  <i
                    className={classNames(
                      'iconfont',
                      styles.normalHeaderBtnItemIcon
                    )}
                  >
                    &#xe6d4;
                  </i>
                </span>
                {isNormalSize && (
                  <span
                    className={styles.normalHeaderBtnItem}
                    onClick={this.actions.toggleMinimized}
                    title={i18n._('Collapse')}
                  >
                    <i
                      className={classNames(
                        'iconfont',
                        styles.strikethroughIcon
                      )}
                    >
                      &#xe6d7;
                    </i>
                  </span>
                )}
                {isNormalSize && (
                  <span
                    className={classNames(
                      'iconfont',
                      styles.normalHeaderBtnItem
                    )}
                    onClick={() => {
                      this.setState({ isMaximized: true });
                    }}
                    title={i18n._('fullscreen')}
                  >
                    <i
                      className={classNames(
                        'iconfont',
                        styles.normalHeaderBtnItemIcon
                      )}
                    >
                      &#xe6d0;
                    </i>
                  </span>
                )}
                {isMaximized && (
                  <span
                    className={classNames(
                      'iconfont',
                      styles.normalHeaderBtnItem
                    )}
                    onClick={this.actions.toNormalSize}
                    title={i18n._('Collapse')}
                  >
                    <i
                      className={classNames(
                        'iconfont',
                        styles.normalHeaderBtnItemIcon
                      )}
                    >
                      &#xe6cf;
                    </i>
                  </span>
                )}
              </span>
            </div>
            <div
              className={classNames(
                isNormalSize ? styles.normalContent : '',
                isMaximized ? styles.maxContent : ''
              )}
            >
              <Console
                minimized={minimized}
                isMaximized={isMaximized}
                isDefault={isDefault}
                widgetId={widgetId}
                clearRenderStamp={clearRenderStamp}
              />
            </div>
          </div>
        )}
      </>
    );
  }
}

ConsoleWidget.propTypes = {
  minimized: PropTypes.bool.isRequired,
  widgetId: PropTypes.string.isRequired,
  isDefault: PropTypes.bool.isRequired,

  updateWidgetState: PropTypes.func.isRequired,
  toggleWorkspaceWidgetToDefault: PropTypes.func.isRequired,
  isShowWorkspace: PropTypes.bool,
};

const mapStateToProps = (state, ownProps) => {
  const widget = state.widget;
  const { minimized = false } = widget.widgets[ownProps.widgetId];

  const defaultWidgets = widget.workspace.default.widgets;
  const isDefault = defaultWidgets.indexOf(ownProps.widgetId) !== -1;

  return {
    minimized,
    isDefault,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateWidgetState: (value) =>
    dispatch(widgetActions.updateWidgetState(ownProps.widgetId, '', value)),
  toggleWorkspaceWidgetToDefault: () =>
    dispatch(widgetActions.toggleWorkspaceWidgetToDefault(ownProps.widgetId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ConsoleWidget);
