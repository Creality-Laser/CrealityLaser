import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'lodash';
import i18n from '../../../../../lib/i18n';
import Switch from '../../../../../components/Switch';
import Button from '../../../../../components/Button_new';
import styles from './index.styl';

import {
    DISTANCE_MIN,
    DISTANCE_MAX,
    DISTANCE_STEP
} from '../constants';

const jogDistanceItems = [
    {
        label: '10',
        value: 10
    },
    {
        label: '1',
        value: 1
    },
    {
        label: '0.1',
        value: 0.1
    },
    {
        label: "0.05",
        value: 0.05
    }
];


class JogPad extends PureComponent {
    static propTypes = {
        jogSpeedOptions: PropTypes.array,
        jogSpeed: PropTypes.number,
        onChangeJogSpeed: PropTypes.func,
        units: PropTypes.string,
        selectedDistance: PropTypes.string,
        customDistance: PropTypes.number,
        selectDistance: PropTypes.func,
        canClick: PropTypes.bool,
        getJogDistance: PropTypes.func,
        jog: PropTypes.func,
        move: PropTypes.func,
        changeCustomDistance: PropTypes.func,
        decreaseCustomDistance: PropTypes.func,
                    increaseCustomDistance: PropTypes.func
    }

    actions = {
        toJog: (cb) => () => {
            const { canClick, jog, getJogDistance } = this.props;

            if (!canClick) {
                return;
            }

            const distance = getJogDistance();

            jog(cb(distance));
        }
    }


    render() {
        const {
            jogSpeedOptions,
            jogSpeed,
            onChangeJogSpeed,
            units,
            selectedDistance,
            customDistance,
            selectDistance,
            canClick,
            move,
            changeCustomDistance,
            decreaseCustomDistance,
            increaseCustomDistance
        } = this.props;
        const { toJog } = this.actions;


        const isCustomDistanceSelected = !(_.includes(['10', '1', '0.1', '0.05'], selectedDistance));

        return (
            <div>
                <div className={styles.jogpadWrapper}>
                    <div className={classNames(styles.jogpadCol, styles.jogpadCol1)}>
                        <span className={classNames(styles.jogpadColLabel)}>
                            {i18n._('Jog Speed')}
                        </span>
                        <div className={classNames(styles.jogpadScaleWrapper)}>
                            {jogSpeedOptions.map(({ label, value }) => {
                       return (
                           <span
                               key={label}
                               onClick={() => {
                           const isCurrentSpeed = value === jogSpeed;
                           if (isCurrentSpeed) {
                               return;
                           }
                           onChangeJogSpeed({ label, value });
                       }}
                               className={classNames(styles.jogpadScaleItem, jogSpeed === value ? styles.jogpadScaleItemActived : "")}
                           >{label}
                           </span>
                        );
                   })}
                        </div>
                    </div>
                    <div className={classNames(styles.jogpadCol, styles.jogpadCol2)}>
                        <span className={classNames(styles.jogpadColLabel)}>
                            {i18n._('Jog Distance')}
                        </span>
                        <div className={classNames(styles.jogpadScaleWrapper)}>
                            {jogDistanceItems.map(({ label, value }) => {
                        return (
                            <span
                                title={value + units}
                                className={classNames(styles.jogpadScaleItem, Number(selectedDistance) === Number(value) ? styles.jogpadScaleItemActived : "")}
                                key={label}
                                onClick={() => {
                                    if (Number(selectedDistance) === Number(value)) {
                                        return;
                                    }

                                     selectDistance(String(value));
                                }}
                            >{label}
                            </span>
);
                        })}
                        </div>
                    </div>
                    <div className={classNames(styles.jogpadCol, styles.jogpadCol3)}>
                        <div className={classNames(styles.jogpadBtnsWrapper)}>
                            <span
                                onClick={toJog(distance => ({ X: -distance, Y: distance }))}
                                className={classNames(styles.jogpadBtn, styles.jogpadBtnCircle, !canClick ? styles.jogpadBtnDisabled : "")}
                                title={i18n._('Move X- Y+')}
                            >
                                <span className={classNames("iconfont", styles.jogpadBtnIcon, styles.jogpadBtnIconLeftTop)}>&#xe6cc;</span>
                            </span>
                            <span
                                onClick={toJog(distance => ({ Y: distance }))}
                                className={classNames(styles.jogpadBtn, styles.jogpadBtnTriangle, !canClick ? styles.jogpadBtnDisabled : "")}
                                title={i18n._('Move Y+')}
                            >
                                <span className={classNames(styles.jogpadBtnTriangleBackground)}>
                                    <RoundedTriangleBtn />
                                </span>
                                <span className={classNames(styles.jogpadBtnTriangleLabel)}>Y+</span>
                            </span>
                            <span
                                title={i18n._('Move X+ Y+')}
                                onClick={toJog(distance => ({ X: distance, Y: distance }))}
                                className={classNames(styles.jogpadBtn, styles.jogpadBtnCircle, !canClick ? styles.jogpadBtnDisabled : "")}
                            >
                                <span className={classNames("iconfont", styles.jogpadBtnIcon, styles.jogpadBtnIconRightTop)}>&#xe6cc;</span>
                            </span>
                            <span
                                title={i18n._('Move Z+')}
                                onClick={toJog(distance => ({ Z: distance }))}
                                className={classNames(styles.jogpadBtn, styles.jogpadBtnCircleBigger, !canClick ? styles.jogpadBtnDisabled : "")}
                            >Z+
                            </span>
                        </div>
                        <div className={classNames(styles.jogpadBtnsWrapper)}>
                            <span
                                onClick={toJog(distance => ({ X: -distance }))}
                                title={i18n._('Move X-')}
                                className={classNames(styles.jogpadBtn, styles.jogpadBtnTriangle, !canClick ? styles.jogpadBtnDisabled : "")}
                                style={{ marginLeft: '7px' }}
                            >
                                <span className={classNames(styles.jogpadBtnTriangleBackground, styles.jogpadBtnTriangleBackgroundLeft)}>
                                    <RoundedTriangleBtn />
                                </span>
                                <span className={classNames(styles.jogpadBtnTriangleLabel)}>X-</span>
                            </span>
                            <span
                                onClick={() => move({ X: 0, Y: 0 })}
                                title={i18n._('Move To XY Zero (G0 X0 Y0)')}
                                className={classNames(styles.jogpadBtn, styles.jogpadBtnCircleBiggest, !canClick ? styles.jogpadBtnDisabled : "")}
                                style={{ marginLeft: '-7px' }}
                            >X/Y
                            </span>
                            <span
                                onClick={toJog(distance => ({ X: distance }))}
                                title={i18n._('Move X+')}
                                className={classNames(styles.jogpadBtn, styles.jogpadBtnTriangle, !canClick ? styles.jogpadBtnDisabled : "")}
                                style={{ marginLeft: '-7px' }}
                            >
                                <span className={classNames(styles.jogpadBtnTriangleBackground, styles.jogpadBtnTriangleBackgroundRight)}>
                                    <RoundedTriangleBtn />
                                </span>
                                <span className={classNames(styles.jogpadBtnTriangleLabel)}>X+</span>
                            </span>
                            <span
                                title={i18n._('Move To Z Zero (G0 Z0)')}
                                onClick={() => move({ Z: 0 })}
                                className={classNames(styles.jogpadBtn, styles.jogpadBtnCircleBigger, !canClick ? styles.jogpadBtnDisabled : "")}
                            >Z
                            </span>
                        </div>
                        <div className={classNames(styles.jogpadBtnsWrapper)}>
                            <span
                                onClick={toJog(distance => ({ X: -distance, Y: -distance }))}
                                title={i18n._('Move X- Y-')}
                                className={classNames(styles.jogpadBtn, styles.jogpadBtnCircle, !canClick ? styles.jogpadBtnDisabled : "")}
                            >
                                <span className={classNames("iconfont", styles.jogpadBtnIcon, styles.jogpadBtnIconLeftBottom)}>&#xe6cc;</span>
                            </span>
                            <span
                                onClick={toJog(distance => ({ Y: -distance }))}
                                title={i18n._('Move Y-')}
                                className={classNames(styles.jogpadBtn, styles.jogpadBtnTriangle, !canClick ? styles.jogpadBtnDisabled : "")}
                            >
                                <span className={classNames(styles.jogpadBtnTriangleBackground, styles.jogpadBtnTriangleBackgroundBottom)}>
                                    <RoundedTriangleBtn />
                                </span>
                                <span className={classNames(styles.jogpadBtnTriangleLabel)}>Y-</span>
                            </span>
                            <span
                                onClick={toJog(distance => ({ X: distance, Y: -distance }))}
                                title={i18n._('Move X+ Y-')}
                                className={classNames(styles.jogpadBtn, styles.jogpadBtnCircle, !canClick ? styles.jogpadBtnDisabled : "")}
                            >
                                <span className={classNames("iconfont", styles.jogpadBtnIcon, styles.jogpadBtnIconRightBottom)}>&#xe6cc;</span>
                            </span>

                            <span
                                onClick={toJog(distance => ({ Z: -distance }))}
                                title={i18n._('Move Z-')}
                                className={classNames(styles.jogpadBtn, styles.jogpadBtnCircleBigger, !canClick ? styles.jogpadBtnDisabled : "")}
                            >Z-
                            </span>
                        </div>
                    </div>
                </div>
                <div className={styles.customDistanceRow}>
                    <Switch
                        checked={isCustomDistanceSelected}
                        onClick={() => {
                                if (isCustomDistanceSelected) {
                                    selectDistance('0.05');
                                } else {
                                    selectDistance();
                                }
                            }
                            }
                    />
                    <span className={styles.customDistanceRowLabel}>
                        {i18n._('Custom Distance')}
                    </span>
                    <span className={styles.customDistanceRowInputGroup}>
                        <Button
                            type="primary"
                            wrapperStyle={{ width: '20px', height: '20px', fontSize: "16px", lineHeight: '16px', borderRadius: '50%' }}
                            disabled={!isCustomDistanceSelected}
                            onClick={decreaseCustomDistance}
                        >-
                        </Button>
                        <input
                            type="number"
                            min={DISTANCE_MIN}
                            max={DISTANCE_MAX}
                            step={DISTANCE_STEP}
                            className={classNames(styles.customDistanceRowInput, !isCustomDistanceSelected ? styles.customDistanceRowInputDisabled : "")}
                            disabled={!isCustomDistanceSelected}
                            title={i18n._('Custom distance for every move operation')}
                            value={customDistance}
                            onChange={(event) => {
                                const value = event.target.value;
                                changeCustomDistance(value);
                            }}
                        />
                        <Button
                            type="primary"
                            wrapperStyle={{ width: '20px', height: '20px', fontSize: "16px", lineHeight: '18px', borderRadius: '50%' }}
                            disabled={!isCustomDistanceSelected}
                            onClick={increaseCustomDistance}
                        >+
                        </Button>
                    </span>
                </div>
            </div>
);
    }
}

function RoundedTriangleBtn() {
    return (
        <svg
            t="1587203881302"
            viewBox="0 0 1445 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="2071"
            width="48"
            height="34"
        ><path
            d="M1012.163765 158.870588l356.382117 449.355294c132.668235 141.914353 92.641882 314.488471-106.917647 385.445647-57.825882 19.937882-123.964235 30.328471-192.63247 30.328471H377.374118C133.12 1024-33.310118 895.367529 5.662118 736.677647c10.932706-44.574118 35.84-88.576 72.192-128.481882L434.236235 158.870588c92.461176-141.914353 275.124706-199.439059 425.532236-128.481882 61.530353 27.798588 115.019294 72.884706 152.395294 128.481882z"
            p-id="2072"
            fill="#E8F0FF"
            data-spm-anchor-id="a313x.7781069.0.i3"
        />
        </svg>
);
}


export default JogPad;
