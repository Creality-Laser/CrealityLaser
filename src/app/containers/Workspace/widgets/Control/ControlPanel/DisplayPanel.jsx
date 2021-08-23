import includes from 'lodash/includes';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { CaretDownFilled } from '@ant-design/icons';

import { MACHINE_HEAD_TYPE, METRIC_UNITS } from '../../../../../constants';
import styles from './index.module.scss';

const i18n = {
  _: (str) => str,
};

class DisplayPanel extends PureComponent {
  actions = {
    onSelect: (eventKey) => {
      const data = eventKey;
      if (data) {
        this.props.executeGcode(data);
      }
    },
  };

  render() {
    const { state, workPosition, originOffset, headType } = this.props;
    const { x, y, z } = originOffset;
    const { units, canClick, axes } = state;
    const lengthUnits = units === METRIC_UNITS ? i18n._('mm') : i18n._('in');
    let machinePositionX = (
      Math.round((parseFloat(workPosition.x) - x) * 1000) / 1000
    ).toFixed(3);
    let machinePositionY = (
      Math.round((parseFloat(workPosition.y) - y) * 1000) / 1000
    ).toFixed(3);
    let machinePositionZ = (
      Math.round((parseFloat(workPosition.z) - z) * 1000) / 1000
    ).toFixed(3);

    const isCurrentWith3DPHead = headType === MACHINE_HEAD_TYPE['3DP'].value;

    if (isCurrentWith3DPHead) {
      machinePositionX = workPosition.x;
      machinePositionY = workPosition.y;
      machinePositionZ = workPosition.z;
    }

    return (
      <div className={styles['display-panel-wrapper']}>
        <table
          className={classNames(
            styles.displayPanelTable,
            !canClick ? styles.displayPanelTableDisabled : ''
          )}
        >
          <thead>
            <tr>
              <th className="nowrap" title={i18n._('Axis')}>
                {i18n._('Axis')}
              </th>
              <th title={i18n._('Machine Coordinates')}>
                {i18n._('Machine Coordinates')}
              </th>
              <th title={i18n._('Work Coordinates')}>
                {i18n._('Work Coordinates')}
              </th>
              <th className="nowrap" title={i18n._('Action')}>
                {i18n._('Action')}
              </th>
            </tr>
          </thead>
          <tbody>
            {includes(axes, 'x') && (
              <tr>
                <td>X</td>
                <td>
                  <span>{machinePositionX}</span>
                  <span>&nbsp;</span>
                  <span>{lengthUnits}</span>
                </td>
                <td>
                  <span>{workPosition.x}</span>
                  <span>&nbsp;</span>
                  <span>{lengthUnits}</span>
                </td>
                <td>
                  <DropdownButton
                    label="X"
                    items={[
                      {
                        label: i18n._('Go To Work Zero On X Axis (G0 X0)'),
                        key: 'G0 X0',
                        onClick: () => this.actions.onSelect('G0 X0'),
                        disabled: !canClick,
                      },
                      {
                        label: i18n._('Zero Out Temporary X Axis (G92 X0)'),
                        key: 'G92 X0',
                        onClick: () => this.actions.onSelect('G92 X0'),
                        disabled: !canClick || isCurrentWith3DPHead,
                      },
                    ]}
                    disabled={!canClick}
                  />
                </td>
              </tr>
            )}
            {includes(axes, 'y') && (
              <tr>
                <td>Y</td>
                <td>
                  <span>{machinePositionY}</span>
                  <span>&nbsp;</span>
                  <span>{lengthUnits}</span>
                </td>
                <td>
                  <span>{workPosition.y}</span>
                  <span>&nbsp;</span>
                  <span>{lengthUnits}</span>
                </td>
                <td>
                  <DropdownButton
                    label="Y"
                    items={[
                      {
                        label: i18n._('Go To Work Zero On Y Axis (G0 Y0)'),
                        key: 'G0 Y0',
                        onClick: () => this.actions.onSelect('G0 Y0'),
                        disabled: !canClick,
                      },
                      {
                        label: i18n._('Zero Out Temporary Y Axis (G92 Y0)'),
                        key: 'G92 Y0',
                        onClick: () => this.actions.onSelect('G92 Y0'),
                        disabled: !canClick || isCurrentWith3DPHead,
                      },
                    ]}
                    disabled={!canClick}
                  />
                </td>
              </tr>
            )}
            {includes(axes, 'z') && (
              <tr>
                <td className={styles.coordinate}>Z</td>
                <td className={styles.workPosition}>
                  <span className={styles.integerPart}>{machinePositionZ}</span>
                  <span>&nbsp;</span>
                  <span className={styles.dimensionUnits}>{lengthUnits}</span>
                </td>
                <td className={styles.workPosition}>
                  <span>{workPosition.z}</span>
                  <span>&nbsp;</span>
                  <span className={styles.dimensionUnits}>{lengthUnits}</span>
                </td>
                <td>
                  <DropdownButton
                    label="Z"
                    items={[
                      {
                        label: i18n._('Go To Work Zero On Z Axis (G0 Z0)'),
                        key: 'G0 Z0',
                        onClick: () => this.actions.onSelect('G0 Z0'),
                        disabled: !canClick,
                      },
                      {
                        label: i18n._('Zero Out Temporary Z Axis (G92 Z0)'),
                        key: 'G92 Z0',
                        onClick: () => this.actions.onSelect('G92 Z0'),
                        disabled: !canClick || isCurrentWith3DPHead,
                      },
                    ]}
                    disabled={!canClick}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
}

DisplayPanel.propTypes = {
  executeGcode: PropTypes.func.isRequired,
  workPosition: PropTypes.object.isRequired,
  headType: PropTypes.string,
  originOffset: PropTypes.object.isRequired,
  state: PropTypes.object,
};

export default DisplayPanel;

class DropdownButton extends PureComponent {
  wrapperRef = React.createRef();

  state = {
    isDropped: false,
  };

  componentDidMount() {
    // detect element outside click
    document.addEventListener('click', this.outsideClickListener);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.outsideClickListener);
  }

  outsideClickListener = (event) => {
    if (
      !this.wrapperRef.current.contains(event.target) &&
      this.state.isDropped
    ) {
      this.setState({
        isDropped: false,
      });
    }
  };

  render() {
    const { label, items, wrapperStyle, disabled } = this.props;

    const { isDropped } = this.state;

    return (
      <div
        className={styles.dropdownWrapper}
        style={wrapperStyle}
        ref={this.wrapperRef}
      >
        <div
          className={classNames(
            styles.dropdownHeader,
            disabled ? styles.dropdownHeaderDisabled : ''
          )}
          onClick={() => {
            if (disabled) {
              return;
            }
            this.setState((prevState) => {
              return {
                isDropped: !prevState.isDropped,
              };
            });
          }}
        >
          <span className={styles.dropdownHeaderLabel}>{label}</span>
          <span>
            <i
              className={classNames(
                'iconfont',
                styles.dropdownIcon,
                isDropped ? styles.dropdownIconUp : ''
              )}
            >
              <CaretDownFilled />
            </i>
          </span>
        </div>
        {isDropped && (
          <div className={styles.dropdownPanelWrapper}>
            {items.map(
              ({
                label: innerLabel,
                key,
                onClick,
                disabled: innerDisabled,
              }) => {
                return (
                  <div
                    className={classNames(
                      styles.dropdownItem,
                      innerDisabled ? styles.dropdownItemDisabled : ''
                    )}
                    key={key}
                    onClick={() => {
                      if (innerDisabled) {
                        return;
                      }
                      onClick();
                    }}
                  >
                    {innerLabel}
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    );
  }
}

DropdownButton.propTypes = {
  label: PropTypes.string,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      key: PropTypes.string,
      onClick: PropTypes.func,
    })
  ),
  wrapperStyle: PropTypes.object,
  disabled: PropTypes.bool,
};
