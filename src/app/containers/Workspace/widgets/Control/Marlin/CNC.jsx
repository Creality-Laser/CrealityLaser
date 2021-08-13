import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { actions as machineActions } from '../../../../../flux/machine';
import { NumberInput as Input } from '../../../../../components/Input';
import Button from '../../../../../components/Button_new';
import Switch from '../../../../../components/Switch';
import i18n from '../../../../../lib/i18n';
import { CONNECTION_TYPE_WIFI, WORKFLOW_STATUS_PAUSED, WORKFLOW_STATUS_RUNNING } from '../../../../../constants';
import styles from './index.styl';


class CNC extends PureComponent {
    static propTypes = {
        headStatus: PropTypes.bool,
        workflowStatus: PropTypes.string,
        connectionType: PropTypes.string,
        server: PropTypes.object,
        executeGcode: PropTypes.func.isRequired
    };

    state = {
        workSpeed: 100,
        workSpeedValue: 100,
        headStatus: this.props.headStatus
    };

    actions = {
        isWifiPrinting: () => {
            const { workflowStatus, connectionType } = this.props;
            return _.includes([WORKFLOW_STATUS_RUNNING, WORKFLOW_STATUS_PAUSED], workflowStatus)
                && connectionType === CONNECTION_TYPE_WIFI;
        },
        onChangeWorkSpeedValue: (value) => {
            this.setState({
                workSpeedValue: value
            });
        },
        onClickWorkSpeed: () => {
            const workSpeedValue = this.state.workSpeedValue;
            this.setState({
                workSpeed: workSpeedValue
            });
            if (this.actions.isWifiPrinting()) {
                this.props.server.updateWorkSpeedFactor(workSpeedValue);
            } else {
                this.props.executeGcode(`M220 S${workSpeedValue}`);
            }
        },
        onClickToolHead: () => {
            if (this.state.headStatus) {
                this.props.executeGcode('M5');
            } else {
                this.props.executeGcode('M3 S100');
            }
            this.setState({
                headStatus: !this.state.headStatus
            });
        }
    };

    render() {
        const { headStatus, workSpeed, workSpeedValue } = this.state;
        const actions = this.actions;
        return (
            <div className={styles.contentBlock}>
                <div className={styles.contentItem}>
                    <span className={styles.contentItemLabel}>{i18n._('Work Speed')}</span>
                    <span className={styles.contentItemContent}>
                        <span>{workSpeed}/</span>
                        <span className={styles.inputWrapper}>
                            <Input
                                value={workSpeedValue}
                                max={500}
                                min={0}
                                onChange={actions.onChangeWorkSpeedValue}
                            />
                            <span className={styles.inputUnit}>%</span>
                        </span>
                        <Button
                            onClick={actions.onClickWorkSpeed}
                            type="primary"
                            wrapperStyle={{ width: '24px', height: '24px', borderRadius: '50%' }}
                        ><span className="iconfont" style={{ fontSize: '12px' }}>&#xe69c;</span>
                        </Button>
                    </span>
                </div>
                <div className={styles.contentItem}>
                    <span className={styles.contentItemLabel}>{i18n._('Tool Head')}</span>
                    <span className={styles.contentItemContent}>
                        <Switch
                            checked={headStatus}
                            onClick={this.actions.onClickToolHead}
                        />
                    </span>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const machine = state.machine;

    const { workflowStatus, connectionType, server } = machine;

    return {
        workflowStatus,
        connectionType,
        server
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        executeGcode: (gcode) => dispatch(machineActions.executeGcode(gcode))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(CNC);
