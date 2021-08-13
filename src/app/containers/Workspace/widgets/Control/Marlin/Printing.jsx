import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import Anchor from '../../../../../components/Anchor';
import i18n from '../../../../../lib/i18n';
import { NumberInput as Input } from '../../../../../components/Input';
import Button from '../../../../../components/Button_new';
import { actions as machineActions } from '../../../../../flux/machine';
import { CONNECTION_TYPE_WIFI, WORKFLOW_STATUS_PAUSED, WORKFLOW_STATUS_RUNNING } from '../../../../../constants';
import JogDistance from './JogDistance';
import styles from './index.styl';


class Printing extends PureComponent {
    static propTypes = {
        isConnected: PropTypes.bool,
        connectionType: PropTypes.string,
        server: PropTypes.object,
        nozzleTargetTemperature: PropTypes.number.isRequired,
        heatedBedTargetTemperature: PropTypes.number.isRequired,
        workflowStatus: PropTypes.string.isRequired,

        executeGcode: PropTypes.func.isRequired,
        addConsoleLogs: PropTypes.func.isRequired
    };

    state = {
        workSpeed: 100,
        workSpeedValue: 100,
        nozzleTemperatureValue: this.props.nozzleTargetTemperature,
        heatedBedTemperatureValue: this.props.heatedBedTargetTemperature,
        zOffsetValue: 0.05,
        zOffsetMarks: [0.05, 0.1, 0.2],
        filamentDistance: 100,
        filamentSpeed: 100,
        finetuneScaleValue: 0.05
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
        onChangeNozzleTemperatureValue: (value) => {
            this.setState({
                nozzleTemperatureValue: value
            });
        },
        onClickNozzleTemperature: () => {
            if (this.actions.isWifiPrinting()) {
                this.props.server.updateNozzleTemperature(this.state.nozzleTemperatureValue);
            } else {
                this.props.executeGcode(`M104 S${this.state.nozzleTemperatureValue}`);
                setTimeout(() => {
                    this.props.executeGcode(`M105`);
                }, 600);
            }
        },
        onChangeHeatedBedTemperatureValue: (value) => {
            this.setState({
                heatedBedTemperatureValue: value
            });
        },
        onClickHeatedBedTemperature: () => {
            if (this.actions.isWifiPrinting()) {
                this.props.server.updateBedTemperature(this.state.heatedBedTemperatureValue);
            } else {
                this.props.executeGcode(`M140 S${this.state.heatedBedTemperatureValue}`);
                setTimeout(() => {
                    this.props.executeGcode(`M105`);
                }, 600);
            }
        },
        onClickCooldown: () => {
            if (this.actions.isWifiPrinting()) {
                this.props.server.updateBedTemperature(this.state.heatedBedTemperatureValue);
            } else {
                this.props.executeGcode(`M140 S0;\nM104 S0;`);
                setTimeout(() => {
                    this.props.executeGcode(`M105`);
                }, 1000);
            }
        },
        onChangeZOffset: (value) => {
            this.setState({
                zOffsetValue: value
            });
        },
        onClickPlusZOffset: () => {
            const value = this.state.zOffsetValue;
            if (this.actions.isWifiPrinting()) {
                this.props.server.updateZOffset(value, (err) => {
                    if (err) {
                        return;
                    }
                    this.props.addConsoleLogs([`Z Offset ${value} ok`]);
                });
            }
        },
        onClickMinusZOffset: () => {
            const value = this.state.zOffsetValue;
            if (this.actions.isWifiPrinting()) {
                this.props.server.updateZOffset(-value, (err) => {
                    if (err) {
                        return;
                    }
                    this.props.addConsoleLogs([`Z Offset ${-value} ok`]);
                });
            }
        },
        onClickLoad: () => {
            if (this.actions.isWifiPrinting()) {
                this.props.server.loadFilament();
            } else {
                this.props.executeGcode(`G91;\nG0 E${this.state.filamentDistance} F${this.state.filamentSpeed};\nG90;`);
            }
        },
        onClickUnload: () => {
            if (this.actions.isWifiPrinting()) {
                this.props.server.unloadFilament();
            } else {
                this.props.executeGcode(`G91;\nG0 E5 F100;\nG0 E-${this.state.filamentDistance} F${this.state.filamentSpeed};\nG90;`);
            }
        },
        onHandleFinetune: (dir) => {
            const { finetuneScaleValue } = this.state;
            this.props.executeGcode(`M290 Z${dir}${finetuneScaleValue}`);
        }
    };

    render() {
        const { isConnected, nozzleTargetTemperature, heatedBedTargetTemperature, workflowStatus } = this.props;
        const { nozzleTemperatureValue, heatedBedTemperatureValue, zOffsetMarks, zOffsetValue, workSpeed, workSpeedValue, finetuneScaleValue } = this.state;
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
                <div className={styles.contentItem} style={{ marginTop: '20px' }}>
                    <span className={styles.contentItemLabel} style={{ fontWeight: 'bold' }}>{i18n._('Temp')}.</span>
                </div>
                <div className={styles.contentItem}>
                    <span className={styles.contentItemLabel}>{i18n._('Nozzle Temp.')}</span>
                    <span className={styles.contentItemContent}>
                        <span>{nozzleTargetTemperature}/ </span>
                        <span className={styles.inputWrapper}>
                            <Input
                                value={nozzleTemperatureValue}
                                max={280}
                                min={0}
                                onChange={actions.onChangeNozzleTemperatureValue}
                                unit="°C"
                            />
                            <span className={styles.inputUnit}>°C</span>
                        </span>
                        <Button
                            onClick={actions.onClickNozzleTemperature}
                            type="primary"
                            wrapperStyle={{ width: '24px', height: '24px', borderRadius: '50%' }}
                        ><span className="iconfont" style={{ fontSize: '12px' }}>&#xe69c;</span>
                        </Button>
                    </span>
                </div>
                <div className={styles.contentItem}>
                    <span className={styles.contentItemLabel}>{i18n._('Heated Bed Temp.')}</span>
                    <span className={styles.contentItemContent}>
                        <span>{heatedBedTargetTemperature}/ </span>
                        <span className={styles.inputWrapper}>
                            <Input
                                value={heatedBedTemperatureValue}
                                max={130}
                                min={0}
                                onChange={actions.onChangeHeatedBedTemperatureValue}
                            />
                            <span className={styles.inputUnit}>°C</span>
                        </span>
                        <Button
                            onClick={actions.onClickHeatedBedTemperature}
                            type="primary"
                            wrapperStyle={{ width: '24px', height: '24px', borderRadius: '50%' }}
                        ><span className="iconfont" style={{ fontSize: '12px' }}>&#xe69c;</span>
                        </Button>
                    </span>

                </div>
                <div className={styles.contentItem}>
                    <span className={styles.contentItemLabel}>{i18n._('Rapid Cooldown')}</span>
                    <span className={styles.contentItemContent}>
                        <Button
                            type="primary"
                            onClick={actions.onClickCooldown}
                            wrapperStyle={{ width: '80px', height: '24px' }}
                        >{i18n._('Cooldown')}
                        </Button>
                    </span>
                </div>
                <div className={styles.contentItem} style={{ marginTop: '20px' }}>
                    <span className={styles.contentItemLabel} style={{ fontWeight: 'bold' }}>{i18n._('Filament')}</span>
                </div>
                <div className={styles.contentItem}>
                    <span className={styles.contentItemLabel}>{i18n._('Filament Distance')}</span>
                    <span className={styles.inputWrapper} style={{ width: '120px' }}>
                        <Input
                            value={this.state.filamentDistance}
                            min={0}
                            max={200}
                            onChange={v => this.setState({ filamentDistance: v })}
                        />
                        <span className={styles.inputUnit}>mm</span>
                    </span>
                </div>
                <div className={styles.contentItem}>
                    <span className={styles.contentItemLabel}>{i18n._('Filament Speed')}</span>
                    <span className={styles.inputWrapper} style={{ width: '120px' }}>
                        <Input
                            value={this.state.filamentSpeed}
                            min={0}
                            max={1000}
                            onChange={v => this.setState({ filamentSpeed: v })}
                        />
                        <span className={styles.inputUnit}>mm/m</span>
                    </span>
                </div>
                <div className={styles.contentItem}>
                    <span className={styles.contentItemLabel}>{i18n._('Filament Load & Unload')}</span>
                    <span className={styles.contentItemContent}>
                        <Button
                            type="primary"
                            onClick={actions.onClickLoad}
                            wrapperStyle={{ width: '80px', height: '24px', marginRight: '10px' }}
                        >{i18n._('load')}
                        </Button>
                        <Button
                            type="primary"
                            onClick={actions.onClickUnload}
                            wrapperStyle={{ width: '80px', height: '24px' }}
                        >{i18n._('Unload')}
                        </Button>
                    </span>
                </div>
                <div className={styles.contentItem} style={{ marginTop: '20px' }}>
                    <span className={styles.contentItemLabel} style={{ fontWeight: 'bold' }}>{i18n._('Z Offset')}</span>
                </div>
                <div className={styles.contentItem}>
                    <span>
                        <button
                            type="button"
                            className={`${styles.contentItemFinetuneValueBtn} ${finetuneScaleValue === 0.05 && styles.contentItemFinetuneValueBtnActive}`}
                            onClick={() => this.setState({ finetuneScaleValue: 0.05 })}
                        >0.05
                        </button>
                        <button
                            type="button"
                            className={`${styles.contentItemFinetuneValueBtn} ${finetuneScaleValue === 0.1 && styles.contentItemFinetuneValueBtnActive}`}
                            onClick={() => this.setState({ finetuneScaleValue: 0.1 })}
                        >0.1
                        </button>
                        <button
                            type="button"
                            className={`${styles.contentItemFinetuneValueBtn} ${finetuneScaleValue === 0.2 && styles.contentItemFinetuneValueBtnActive}`}
                            onClick={() => this.setState({ finetuneScaleValue: 0.2 })}
                        >0.2
                        </button>
                    </span>
                    <button
                        type="button"
                        className={styles.contentItemFinetuneBtn}
                        onClick={() => actions.onHandleFinetune('-')}
                    ><span className="iconfont" style={{ display: 'inline-block', fontSize: '12px', marginRight: '5px', transform: 'rotate(180deg) scale(0.7)' }}>&#xe606;</span>
                        <span>z-</span>
                    </button>
                    <button
                        type="button"
                        className={styles.contentItemFinetuneBtn}
                        onClick={() => actions.onHandleFinetune('+')}
                    ><span style={{ marginRight: '5px' }}>z+</span><span className="iconfont" style={{ display: 'inline-block', fontSize: '12px', transform: 'scale(0.7)' }}>&#xe606;</span>
                    </button>
                </div>
                <div className={styles.contentItem} />
                {isConnected && _.includes([WORKFLOW_STATUS_RUNNING, WORKFLOW_STATUS_PAUSED], workflowStatus) && (
                <div className={styles.contentItem}>
                    <span className={styles.contentItemLabel}>{i18n._('Z Offset')}</span>
                    <Anchor
                        className="sm-parameter-row__input2"
                        style={{
                                    marginRight: '84px'
                                }}
                    >
                        <JogDistance
                            marks={zOffsetMarks}
                            onChange={actions.onChangeZOffset}
                            defaultValue={zOffsetValue}
                        />
                    </Anchor>
                    <Button
                        type="primary"
                        wrapperStyle={{ width: '20px', height: '20px', fontSize: "16px", lineHeight: '18px', borderRadius: '50%' }}
                        onClick={actions.onClickPlusZOffset}
                    >+
                    </Button>
                    <Button
                        type="primary"
                        wrapperStyle={{ width: '20px', height: '20px', fontSize: "16px", lineHeight: '16px', borderRadius: '50%' }}
                        onClick={actions.onClickMinusZOffset}
                    >-
                    </Button>
                </div>
)}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const machine = state.machine;
    const { isConnected,
        connectionType,
        nozzleTemperature,
        server,
        nozzleTargetTemperature,
        heatedBedTemperature,
        heatedBedTargetTemperature,
        workflowStatus } = machine;

    return {
        isConnected,
        connectionType,
        server,
        nozzleTemperature,
        nozzleTargetTemperature,
        heatedBedTemperature,
        heatedBedTargetTemperature,
        workflowStatus
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        executeGcode: (gcode, context) => dispatch(machineActions.executeGcode(gcode, context)),
        addConsoleLogs: (gcode, context) => dispatch(machineActions.addConsoleLogs(gcode, context))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Printing);
