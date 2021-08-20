import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import {
  WORKFLOW_STATE_IDLE,
  LASER_GCODE_SUFFIX,
  CNC_GCODE_SUFFIX,
  PRINTING_GCODE_SUFFIX,
  CONNECTION_TYPE_WIFI,
} from '../../constants';
import { actions as workspaceActions } from '../../flux/workspace';
import { actions as widgetActions } from '../../flux/widget';
import Connection from './widgets/Connection';
import Console from './widgets/Console';
import styles from './index_new.module.scss';

function Workspace(props) {
  const { style } = props;

  const { isShowWorkspace } = props;

  return (
    <div className={styles.wrapper} style={style}>
      <div className={styles.left_row_wrapper}>
        <Connection widgetId="connection" />
        <Console
          minimized
          widgetId="console"
          isDefault
          isShowWorkspace={isShowWorkspace}
        />
      </div>
      <div className={styles.center_content_wrapper}>second col</div>
      <div className={styles.right_row_wrapper}>third col</div>
    </div>
  );
}

Workspace.propTypes = {
  style: PropTypes.object,
};

Workspace.propTypes = {
  ...withRouter.propTypes,
  // showPrimaryContainer: PropTypes.bool.isRequired,
  // showSecondaryContainer: PropTypes.bool.isRequired,
  // defaultWidgets: PropTypes.array.isRequired,
  // primaryWidgets: PropTypes.array.isRequired,
  // secondaryWidgets: PropTypes.array.isRequired,
  // updateTabContainer: PropTypes.func.isRequired,
  // uploadGcodeFile: PropTypes.func.isRequired,
  isShowWorkspace: PropTypes.bool,
  // isConnected: PropTypes.bool,
  // connectionType: PropTypes.string,
};

const mapStateToProps = (state) => {
  const widget = state.widget;
  const showPrimaryContainer = widget.workspace.primary.show;
  const primaryWidgets = widget.workspace.primary.widgets;
  const showSecondaryContainer = widget.workspace.secondary.show;
  const secondaryWidgets = widget.workspace.secondary.widgets;
  const defaultWidgets = widget.workspace.default.widgets;

  const { isConnected, connectionType } = state.machine;

  return {
    showPrimaryContainer,
    showSecondaryContainer,
    defaultWidgets,
    primaryWidgets,
    secondaryWidgets,
    isConnected,
    connectionType,
  };
};
const mapDispatchToProps = (dispatch) => ({
  uploadGcodeFile: (file) => dispatch(workspaceActions.uploadGcodeFile(file)),
  updateTabContainer: (container, value) =>
    dispatch(widgetActions.updateTabContainer('workspace', container, value)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Workspace));
