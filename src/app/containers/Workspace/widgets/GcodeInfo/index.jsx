import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import classNames from 'classnames';
import { connect } from 'react-redux';
import includes from 'lodash/includes';
import { controller } from '../../../../lib/controller';
import { mm2in } from '../../../../lib/units';
import {
  // Units
  PROTOCOL_TEXT,
  IMPERIAL_UNITS,
  METRIC_UNITS,
  WORKFLOW_STATE_IDLE,
  WORKFLOW_STATUS_IDLE,
  WORKFLOW_STATUS_UNKNOWN,
} from '../../../../constants';
import styles from './index.module.scss';

const i18n = {
  _: (str) => str,
};

const toFixedUnits = (units, val) => {
  val = Number(val) || 0;
  if (units === IMPERIAL_UNITS) {
    val = mm2in(val).toFixed(4);
  }
  if (units === METRIC_UNITS) {
    val = val.toFixed(3);
  }
  return val;
};

const formatISODateTime = (time) => {
  return time > 0
    ? moment.unix(time / 1000).format('YYYY-MM-DD HH:mm:ss')
    : '–';
};

const formatElapsedTime = (elapsedTime) => {
  if (!elapsedTime || elapsedTime < 0) {
    return '–';
  }
  const d = moment.duration(elapsedTime, 'ms');
  return moment(d._data).format('HH:mm:ss');
};

const formatRemainingTime = (remainingTime) => {
  if (!remainingTime || remainingTime < 0) {
    return '–';
  }
  const d = moment.duration(remainingTime, 'ms');
  return moment(d._data).format('HH:mm:ss');
};

class GcodeInfo extends PureComponent {
  state = {
    isExpand: true,
    port: controller.port,
    units: METRIC_UNITS,
    workflowState: controller.workflowState,

    // G-code Status (from server)
    total: 0,
    sent: 0,
    received: 0,
    startTime: 0,
    finishTime: 0,
    elapsedTime: 0,
    remainingTime: 0,

    // Bounding box
    bbox: {
      min: {
        x: 0,
        y: 0,
        z: 0,
      },
      max: {
        x: 0,
        y: 0,
        z: 0,
      },
      delta: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
    varValue: {},
  };

  actions = {
    toggleIsExpand: () => {
      this.setState((prevState) => {
        return {
          isExpand: !prevState.isExpand,
        };
      });
    },
  };

  controllerEvents = {
    'serialport:close': (options) => {
      const { dataSource } = options;
      if (dataSource !== PROTOCOL_TEXT) {
        return;
      }
      const initialState = this.getInitialState();
      this.setState({ ...initialState });
    },
    'workflow:state': (options) => {
      const { workflowState, dataSource } = options;
      if (dataSource !== PROTOCOL_TEXT) {
        return;
      }
      if (this.state.workflowState !== workflowState) {
        this.setState({ workflowState });
      }
    },
  };

  getInitialState() {
    return this.state;
  }

  componentDidMount() {
    this.addControllerEvents();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.boundingBox !== this.props.boundingBox) {
      if (nextProps.boundingBox === null) {
        this.setState({
          bbox: {
            min: {
              x: 0,
              y: 0,
              z: 0,
            },
            max: {
              x: 0,
              y: 0,
              z: 0,
            },
            delta: {
              x: 0,
              y: 0,
              z: 0,
            },
          },
        });
      } else {
        const bbox = nextProps.boundingBox;
        const dX = bbox.max.x - bbox.min.x;
        const dY = bbox.max.y - bbox.min.y;
        const dZ = bbox.max.z - bbox.min.z;

        this.setState({
          bbox: {
            min: {
              x: bbox.min.x,
              y: bbox.min.y,
              z: bbox.min.z,
            },
            max: {
              x: bbox.max.x,
              y: bbox.max.y,
              z: bbox.max.z,
            },
            delta: {
              x: dX,
              y: dY,
              z: dZ,
            },
          },
        });
      }
    }
  }

  componentWillUnmount() {
    this.removeControllerEvents();
  }

  addControllerEvents() {
    Object.keys(this.controllerEvents).forEach((eventName) => {
      const callback = this.controllerEvents[eventName];
      controller.on(eventName, callback);
    });
  }

  removeControllerEvents() {
    Object.keys(this.controllerEvents).forEach((eventName) => {
      const callback = this.controllerEvents[eventName];
      controller.off(eventName, callback);
    });
  }

  render() {
    const {
      gcodePrintingInfo,
      gcodePrintingInfo: { total, sent, received },
      isConnected,
      workflowState,
      workflowStatus,
    } = this.props;

    const state = {
      ...this.state,
      bbox: _.mapValues(this.state.bbox, (position) => {
        position = _.mapValues(position, (val) =>
          toFixedUnits(this.state.units, val)
        );
        return position;
      }),
    };

    const { isExpand, units, bbox } = state;

    const isConnectedPrinter =
      isConnected &&
      includes([WORKFLOW_STATE_IDLE], workflowState) &&
      includes([WORKFLOW_STATUS_IDLE, WORKFLOW_STATUS_UNKNOWN], workflowStatus);

    const displayUnits = units === METRIC_UNITS ? i18n._('mm') : i18n._('in');
    const startTime = formatISODateTime(gcodePrintingInfo.startTime);
    const finishTime = formatISODateTime(gcodePrintingInfo.finishTime);
    const elapsedTime = formatElapsedTime(gcodePrintingInfo.elapsedTime);
    const remainingTime = formatRemainingTime(gcodePrintingInfo.remainingTime);

    return (
      <div className={styles.wrapper}>
        {!isExpand && (
          <span
            title="Show gcode info"
            className={styles.iconWrapper}
            onClick={this.actions.toggleIsExpand}
          >
            <i className={classNames('iconfont', styles.icon)}>&#xe6ce;</i>
          </span>
        )}
        {isExpand && (
          <div className={styles.contentWrapper}>
            <div className={styles.contentHeader}>
              <span className={styles.contentHeaderLabel}>
                {i18n._('G-code')}
              </span>
              <span
                onClick={this.actions.toggleIsExpand}
                className={styles.contentHeaderCloseBtn}
                title={i18n._('Collapse')}
              >
                <i className={classNames('iconfont', styles.strikethroughIcon)}>
                  &#xe6d7;
                </i>
              </span>
            </div>
            <div className={styles.content}>
              <div className={styles.contentAxisTable}>
                <div className={styles.contentAxisTableHeader}>
                  <span
                    className={classNames(
                      styles.contentAxisTableHeaderCell,
                      styles.contentAxisTableHeaderCol1,
                      isConnectedPrinter &&
                        styles.contentAxisTableHeaderCellActive
                    )}
                  >
                    {i18n._('Axis')}
                  </span>
                  <span
                    className={classNames(
                      styles.contentAxisTableHeaderCell,
                      isConnectedPrinter &&
                        styles.contentAxisTableHeaderCellActive
                    )}
                  >
                    {i18n._('Min')}
                  </span>
                  <span
                    className={classNames(
                      styles.contentAxisTableHeaderCell,
                      isConnectedPrinter &&
                        styles.contentAxisTableHeaderCellActive
                    )}
                  >
                    {i18n._('Max')}
                  </span>
                  <span
                    className={classNames(
                      styles.contentAxisTableHeaderCell,
                      isConnectedPrinter &&
                        styles.contentAxisTableHeaderCellActive
                    )}
                  >
                    {i18n._('Dimension')}
                  </span>
                </div>
                <div className={styles.contentAxisTableContent}>
                  <div className={styles.contentAxisTableContentRow}>
                    <span
                      className={classNames(
                        styles.contentAxisTableContentCell,
                        styles.contentAxisTableContentCol1
                      )}
                    >
                      X
                    </span>
                    <span className={styles.contentAxisTableContentCell}>
                      {bbox.min.x} {displayUnits}
                    </span>
                    <span className={styles.contentAxisTableContentCell}>
                      {bbox.max.x} {displayUnits}
                    </span>
                    <span className={styles.contentAxisTableContentCell}>
                      {bbox.delta.x} {displayUnits}
                    </span>
                  </div>
                  <div className={styles.contentAxisTableContentRow}>
                    <span
                      className={classNames(
                        styles.contentAxisTableContentCell,
                        styles.contentAxisTableContentCol1
                      )}
                    >
                      Y
                    </span>
                    <span className={styles.contentAxisTableContentCell}>
                      {bbox.min.y} {displayUnits}
                    </span>
                    <span className={styles.contentAxisTableContentCell}>
                      {bbox.max.y} {displayUnits}
                    </span>
                    <span className={styles.contentAxisTableContentCell}>
                      {bbox.delta.y} {displayUnits}
                    </span>
                  </div>
                  <div className={styles.contentAxisTableContentRow}>
                    <span
                      className={classNames(
                        styles.contentAxisTableContentCell,
                        styles.contentAxisTableContentCol1
                      )}
                    >
                      Z
                    </span>
                    <span className={styles.contentAxisTableContentCell}>
                      {bbox.min.z} {displayUnits}
                    </span>
                    <span className={styles.contentAxisTableContentCell}>
                      {bbox.max.z} {displayUnits}
                    </span>
                    <span className={styles.contentAxisTableContentCell}>
                      {bbox.delta.z} {displayUnits}
                    </span>
                  </div>
                </div>
              </div>
              <div
                className={`${styles.otherInfo} ${
                  isConnectedPrinter && styles.otherInfoActive
                }`}
              >
                <div className={styles.otherInfoCol1}>
                  <div className={styles.otherInfoCell}>
                    <span className={styles.otherInfoCellLabel}>
                      {i18n._('Sent')}
                    </span>
                    <span className={styles.otherInfoCellValue}>
                      {total > 0 ? `${sent} / ${total}` : '–'}
                    </span>
                  </div>
                  <div className={styles.otherInfoCell}>
                    <span className={styles.otherInfoCellLabel}>
                      {i18n._('Received')}
                    </span>
                    <span className={styles.otherInfoCellValue}>
                      {total > 0 ? `${received} / ${total}` : '–'}
                    </span>
                  </div>
                </div>
                <div className={styles.otherInfoCol2}>
                  <div className={styles.otherInfoCell}>
                    <span className={styles.otherInfoCellLabel}>
                      {i18n._('Start Time')}
                    </span>
                    <span className={styles.otherInfoCellValue}>
                      {startTime}
                    </span>
                  </div>
                  <div className={styles.otherInfoCell}>
                    <span className={styles.otherInfoCellLabel}>
                      {i18n._('Elapsed Time')}
                    </span>
                    <span className={styles.otherInfoCellValue}>
                      {elapsedTime}
                    </span>
                  </div>
                </div>
                <div className={styles.otherInfoCol3}>
                  <div className={styles.otherInfoCell}>
                    <span className={styles.otherInfoCellLabel}>
                      {i18n._('Finish Time')}
                    </span>
                    <span className={styles.otherInfoCellValue}>
                      {finishTime}
                    </span>
                  </div>
                  <div className={styles.otherInfoCell}>
                    <span className={styles.otherInfoCellLabel}>
                      {i18n._('Remaining Time')}
                    </span>
                    <span className={styles.otherInfoCellValue}>
                      {remainingTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

GcodeInfo.propTypes = {
  boundingBox: PropTypes.object,
  gcodePrintingInfo: PropTypes.shape({
    sent: PropTypes.number,
    received: PropTypes.number,
    total: PropTypes.number,
    startTime: PropTypes.number,
    finishTime: PropTypes.number,
    elapsedTime: PropTypes.number,
    remainingTime: PropTypes.number,
  }),
  isConnected: PropTypes.bool.isRequired,
  workflowState: PropTypes.string.isRequired,
  workflowStatus: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => {
  const { boundingBox } = state.workspace;
  const { gcodePrintingInfo, isConnected, workflowState, workflowStatus } =
    state.machine;

  return {
    gcodePrintingInfo,
    boundingBox,
    isConnected,
    workflowState,
    workflowStatus,
  };
};

export default connect(mapStateToProps)(GcodeInfo);
