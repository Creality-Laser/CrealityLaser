import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import Slider from '../../../../../../widgets/SilderNew';
import i18n from '../../../../../../lib/i18n';
import Modal from '../../../../../../components/Modal';
import Input from '../../../../../../components/Input/NumberInputNew';
import Space from '../../../../../../components/Space/Space';
import TipTrigger from '../../../../../../components/TipTrigger';
import Button from '../../../../../../components/Button_new';
import { controller } from '../../../../../../lib/controller';
import generateLaserFocusGcode from '../../../../../../lib/generateLaserFocusGcode';
import { actions as workspaceActions } from '../../../../../../flux/workspace';
import { WORKFLOW_STATE_IDLE } from '../../../../../../constants';
import styles from '../index.styl';
import innerStyles from './index.styl';

const Z_VALUES_1 = [0, -0.5, -1, -1.5, -2, -2.5];
const Z_VALUES_2 = [0, +0.5, +1, +1.5, +2, +2.5];

class TestFocus extends PureComponent {
    static propTypes = {
        isConnected: PropTypes.bool,
        workflowState: PropTypes.string,
        actions: PropTypes.shape({
            hideInstructions: PropTypes.func
        }),

        renderGcode: PropTypes.func.isRequired,
        clearGcode: PropTypes.func.isRequired
    };

    state = {
        z: 0,
        workSpeed: 500,
        power: 50,
        showInstructions: false
    };

    actions = {
        onChangeWorkSpeed: (workSpeed) => {
            this.setState({ workSpeed });
        },
        onChangePower: (power) => {
            this.setState({ power });
        },
        onChangeZ: (z) => {
            this.setState({ z });
        },
        generateAndLoadGcode: () => {
            const { power, workSpeed } = this.state;
            const jogSpeed = 1500;
            const gcode = generateLaserFocusGcode(power, workSpeed, jogSpeed);
            this.props.clearGcode();
            this.props.renderGcode('Laser_Fine_Tune.nc', gcode);
        },
        setLaserFocusZ: () => {
            const z = this.state.z;
            const gcodes = [
                `G0 Z${z} F100`,
                'G92 X0 Y0 Z0'
            ];
            controller.command('gcode', gcodes.join('\n'));
        },
        showInstructions: () => {
            this.setState({ showInstructions: true });
        },
        hideInstructions: () => {
            this.setState({ showInstructions: false });
        }
    };

    render() {
        const actions = {
            ...this.props.actions,
            ...this.actions
        };
        const { isConnected } = this.props;
        const isIdle = this.props.workflowState === WORKFLOW_STATE_IDLE;

        return (
            <React.Fragment>
                {this.state.showInstructions && (
                    <Modal style={{ width: '960px' }} size="lg" onClose={actions.hideInstructions}>
                        <Modal.Header>
                            <Modal.Title>
                                {i18n._('How Fine Tune Work Origin Works')}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className={innerStyles['test-laser-instruction-content']}>
                            <p>{i18n._('Setting work origin is essentially finding the best place for the engraved image \
in the X and Y directions and determining the distance (Z Offset) between the Engraving & Carving Platform and the \
Laser Module to acquire the smallest laser dot on the material for the most efficient use of the laser power and the \
best result. For the 200mW Laser Engraving Module, the Z Offset can be set by judging the size of the laser dot by eyes \
with low power. However, for the 1600mW Laser Cutting Module, this method is less accurate as the laser dot is too \
strong and less interpretable. To set the Z Offset more accurately, we can move the module to the position that is \
close to the optimal Z Offset (Offset A). The software will test the results from a few positions next to Offset A \
on the same material. The best result determines the best Z Offset.')}
                            </p>
                            <div className={innerStyles['test-laser-instruction-step-wrapper']}>
                                <div className={innerStyles['test-laser-instruction-step']}>
                                    <span className={innerStyles['test-laser-instruction-step-indicator']}>1</span>
                                    <img
                                        src="images/laser/laser-instructions-01.png"
                                        role="presentation"
                                        alt="x"
                                        width="280"
                                        height="300"
                                    />
                                    <p className={innerStyles['test-laser-instruction-step-text']}>
                                        <span>{i18n._('Click')}</span>
                                        <span style={{ color: '#193BDE', padding: '0 4px' }}>{i18n._('Focus')}</span>
                                        <span>{i18n._('and use')}</span>
                                        <span style={{ color: '#193BDE', padding: '0 4px' }}>{i18n._('Jog Pad')}</span>
                                        <span>{i18n._('in the Axes section to move the Laser Cutting Module to the position \
that is close to the optimal Z Offset (just like how you do with the 200mW Laser Engraving Module).')}
                                        </span>
                                    </p>
                                </div>
                                <div className={innerStyles['test-laser-instruction-step']}>
                                    <span className={innerStyles['test-laser-instruction-step-indicator']}>2</span>
                                    <img
                                        src="images/laser/laser-instructions-02.png"
                                        role="presentation"
                                        alt="x"
                                        width="280"
                                        height="300"
                                    />
                                    <p className={innerStyles['test-laser-instruction-step-text']}>
                                        <span>{i18n._('Set Work Speed and Power based on the material you are using. If you are using \
a piece of 1.5 mm wood sheet, it’s recommended to set the Work Speed to a value between 80 mm/s and 120 mm/s and set the Power to 100%.')}
                                        </span>
                                        <Space width={4} />
                                        <span>{i18n._('Click')}</span>
                                        <span style={{ color: '#193BDE', padding: '0 4px' }}>{i18n._('Generate and Load G-code')}</span>
                                        <span>{i18n._('and the G-code is automatically generated and loaded.')}</span>
                                    </p>
                                </div>
                                <div className={innerStyles['test-laser-instruction-step']}>
                                    <span className={innerStyles['test-laser-instruction-step-indicator']}>3</span>
                                    <img
                                        src="images/laser/laser-instructions-03.png"
                                        role="presentation"
                                        alt="x"
                                        width="280"
                                        height="300"
                                    />
                                    <p className={innerStyles['test-laser-instruction-step-text']}>
                                        <span>{i18n._('Click')}</span>
                                        <span className="fa fa-play" style={{ padding: '0 4px', color: '#193BDE' }} />
                                        <span>{i18n._('to start laser cutting.')}</span>
                                        <Space width={4} />
                                        <span>{i18n._('Choose the position that can cut the material the most smoothly or \
engrave the thinnest line and the software will set it as Z Offset. In this example, -2.0 should be the Z Offset.')}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </Modal.Body>
                    </Modal>
                )}

                <div className={styles.contentWrapper}>
                    <hr className={styles.divider} />
                    <div className={innerStyles.labelWrapper}>
                        <span
                            className={innerStyles.labelIconWrapper}
                            onClick={event => {
                        event.stopPropagation();
                        actions.showInstructions();
                        }}
                        >
                            <i className={classNames("iconfont", innerStyles.labelIcon)}>&#xe6b2;</i>
                        </span>
                        <span>{i18n._('Fine Tune Work Origin')}</span>
                    </div>
                    <TipTrigger
                        placement="left"
                        title={i18n._('Work Speed')}
                        content={i18n._('Determines how fast the machine moves when it’s working.')}
                    >
                        <div className={styles.contentItem} style={{ marginTop: '10px' }}>
                            <span className={styles.contentItemLabel}>{i18n._('Work Speed')}</span>

                            <span className={styles.contentItemContent}>
                                <Input
                                    className="sm-parameter-row__input"
                                    style={{ width: '120px' }}
                                    max={6000}
                                    min={1}
                                    value={this.state.workSpeed}
                                    onChange={actions.onChangeWorkSpeed}
                                    unit="mm/min"
                                />
                            </span>

                        </div>
                    </TipTrigger>
                    <TipTrigger
                        placement="left"
                        title={i18n._('Power')}
                        content={i18n._('Power to use when laser is working.')}
                    >
                        <div className={styles.contentItem} style={{ marginTop: '10px' }}>
                            <span className={styles.contentItemLabel}>{i18n._('Power (%)')}</span>
                            <span style={{ display: 'flex', alignItems: "center" }}>
                                <Slider
                                    className="sm-parameter-row__slider"
                                    value={this.state.power}
                                    min={0}
                                    max={100}
                                    step={0.5}
                                    onChange={actions.onChangePower}
                                />

                                <Input
                                    className="sm-parameter-row__slider-input"
                                    min={1}
                                    max={100}
                                    style={{ width: '60px', marginLeft: '12px' }}
                                    value={this.state.power}
                                    onChange={actions.onChangePower}
                                />
                            </span>
                        </div>
                    </TipTrigger>
                </div>
                <Button
                    wrapperStyle={{ display: 'block', width: '100%', height: '30px', marginTop: '10px' }}
                    disabled={!isIdle}
                    onClick={actions.generateAndLoadGcode}
                >
                    {i18n._('Generate and Load G-code')}
                </Button>
                <hr style={{ marginTop: '12px', marginBottom: '10px' }} />
                <div className={innerStyles.zBlockWrapper}>
                    <div className={innerStyles.zBlockRow}>
                        {Z_VALUES_1.map((zValue) => {
                                return (
                                    <span className={innerStyles.zBlockItem} key={zValue}>
                                        <span
                                            className={classNames(innerStyles.zBlockItemText, this.state.z === zValue ? innerStyles.zBlockItemTextActived : "")}

                                        >
                                            {zValue.toFixed(1)}
                                        </span>
                                        <button
                                            type="button"
                                            id={zValue}
                                            onClick={() => actions.onChangeZ(zValue)}
                                            className={classNames(innerStyles.zBlockItemCube, this.state.z === zValue ? innerStyles.zBlockItemCubeActived : "")}
                                        />
                                    </span>
                                );
                            })}
                    </div>
                    <div className={innerStyles.zBlockRow} style={{ paddingLeft: '80px' }}>
                        {Z_VALUES_2.map((zValue) => {
                                if (zValue === 0) {
                                    return null;
                                }
                                return (
                                    <span
                                        className={innerStyles.zBlockItem}
                                        key={zValue}
                                        style={{ textAlign: 'center' }}
                                    >
                                        <button
                                            type="button"
                                            id={zValue}
                                            onClick={() => actions.onChangeZ(zValue)}
                                            className={classNames(innerStyles.zBlockItemCube, this.state.z === zValue ? innerStyles.zBlockItemCubeActived : "")}
                                        />
                                        <span
                                            className={classNames(innerStyles.zBlockItemText, this.state.z === zValue ? innerStyles.zBlockItemTextActived : "")}
                                        >
                                            +{zValue.toFixed(1)}
                                        </span>
                                    </span>
                                );
                            })}
                    </div>
                </div>
                <Button
                    type="primary"
                    onClick={actions.setLaserFocusZ}
                    disabled={!isIdle || !isConnected}
                    wrapperStyle={{ height: '30px', marginTop: '10px' }}
                >
                    {i18n._('Set Work Origin')}
                </Button>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    const { headType, isConnected, workflowState } = state.machine;
    return {
        headType: headType,
        isConnected,
        workflowState
    };
};

const mapDispatchToProps = (dispatch) => ({
    renderGcode: (name, gcode) => dispatch(workspaceActions.renderGcode(name, gcode)),
    clearGcode: () => dispatch(workspaceActions.clearGcode())
});

export default connect(mapStateToProps, mapDispatchToProps)(TestFocus);
