import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { ABSENT_VALUE } from '../../constants';
import ParametersHead from '../components/params/ParametersHead';
import ParameterItem, {
  ParameterItemLabel,
  ParameterItemValue,
} from '../components/params/ParameterItem';
import StyledInputNumber from '../components/params/StyledInputNumber';
import StyledSlider from '../components/params/StyledSlider';
import OptionalDropdownParam from '../components/params/OptionalDropdownParam';

class GcodeParameters extends PureComponent {
  state = {
    expanded: true,
  };

  actions = {
    onToggleExpand: () => {
      this.setState((state) => ({ expanded: !state.expanded }));
    },
    onChangePrintOrder: (printOrder) => {
      this.props.updateSelectedModelPrintOrder(printOrder);
    },
    onChangeJogSpeed: (jogSpeed) => {
      this.props.updateSelectedModelGcodeConfig({ jogSpeed });
    },
    onChangeWorkSpeed: (workSpeed) => {
      this.props.updateSelectedModelGcodeConfig({ workSpeed });
    },
    onChangePlungeSpeed: (plungeSpeed) => {
      this.props.updateSelectedModelGcodeConfig({ plungeSpeed });
    },
    onChangeDwellTime: (dwellTime) => {
      this.props.updateSelectedModelGcodeConfig({ dwellTime });
    },
    // multi-pass
    onToggleMultiPassEnabled: () => {
      this.props.updateSelectedModelGcodeConfig({
        multiPassEnabled: !this.props.gcodeConfig.multiPassEnabled,
      });
    },
    onChangeMultiDepth: (multiPassDepth) => {
      this.props.updateSelectedModelGcodeConfig({ multiPassDepth });
    },
    onChangeMultiPasses: (multiPasses) => {
      this.props.updateSelectedModelGcodeConfig({ multiPasses });
    },
    // fixed power
    onToggleFixedPowerEnabled: () => {
      this.props.updateSelectedModelGcodeConfig({
        fixedPowerEnabled: !this.props.gcodeConfig.fixedPowerEnabled,
      });
    },
    onChangeFixedPower: (fixedPower) => {
      this.props.updateSelectedModelGcodeConfig({ fixedPower });
    },
  };

  render() {
    const { printOrder, selectedModelID, selectedModelHideFlag } = this.props;
    const actions = this.actions;
    const {
      jogSpeed = 0,
      workSpeed = 0,
      dwellTime = 0,
      plungeSpeed = 0,
      fixedPowerEnabled = false,
      fixedPower = 0,
      multiPassEnabled = false,
      multiPasses = 0,
      multiPassDepth = 0,
    } = this.props.gcodeConfig;
    const selectedNotHide = selectedModelID && !selectedModelHideFlag;

    return (
      <>
        <ParametersHead
          title="Working Parameters"
          expanded={this.state.expanded}
          onToggleExpand={this.actions.onToggleExpand}
        />
        {this.state.expanded && (
          <>
            <ParameterItem
              popover={{
                title: 'Print Order',
                content:
                  'When engraving multiple images, this parameter determines the print order of the selected image. When the orders are the same, the image uploaded first will be engraved first.',
              }}
            >
              <ParameterItemLabel>Print Order</ParameterItemLabel>
              <ParameterItemValue>
                <StyledSlider
                  value={printOrder}
                  disabled={!selectedNotHide}
                  min={1}
                  max={10}
                  onChange={actions.onChangePrintOrder}
                />
                <StyledInputNumber
                  value={printOrder}
                  disabled={!selectedNotHide}
                  min={1}
                  max={10}
                  onChange={actions.onChangePrintOrder}
                />
              </ParameterItemValue>
            </ParameterItem>
            {jogSpeed !== ABSENT_VALUE && (
              <ParameterItem
                popover={{
                  title: 'Jog Speed',
                  content: this.props.paramsDescs.jogSpeed,
                }}
              >
                <ParameterItemLabel>Jog Speed</ParameterItemLabel>
                <ParameterItemValue>
                  <StyledInputNumber
                    value={jogSpeed}
                    disabled={!selectedNotHide}
                    style={{ width: '65px' }}
                    min={1}
                    max={6000}
                    step={1}
                    onChange={actions.onChangeJogSpeed}
                    addonAfter="mm/min"
                  />
                </ParameterItemValue>
              </ParameterItem>
            )}
            {workSpeed !== ABSENT_VALUE && (
              <ParameterItem
                popover={{
                  title: 'Work Speed',
                  content: this.props.paramsDescs.workSpeed,
                }}
              >
                <ParameterItemLabel>Work Speed</ParameterItemLabel>
                <ParameterItemValue>
                  <StyledInputNumber
                    value={workSpeed}
                    disabled={!selectedNotHide}
                    style={{ width: '65px' }}
                    min={1}
                    step={1}
                    max={6000}
                    onChange={actions.onChangeWorkSpeed}
                    addonAfter="mm/min"
                  />
                </ParameterItemValue>
              </ParameterItem>
            )}
            {dwellTime !== ABSENT_VALUE && (
              <ParameterItem
                popover={{
                  title: 'Dwell Time',
                  content: this.props.paramsDescs.dwellTime,
                }}
              >
                <ParameterItemLabel>Dwell Time</ParameterItemLabel>
                <ParameterItemValue>
                  <StyledInputNumber
                    value={dwellTime}
                    disabled={!selectedNotHide}
                    min={0.1}
                    max={1000}
                    step={0.1}
                    onChange={actions.onChangeDwellTime}
                    style={{ width: '65px' }}
                    addonAfter="mm/min"
                  />
                </ParameterItemValue>
              </ParameterItem>
            )}
            {plungeSpeed !== ABSENT_VALUE && (
              <ParameterItem
                popover={{
                  title: 'Plunge Speed',
                  content: this.props.paramsDescs.plungeSpeed,
                }}
              >
                <ParameterItemLabel>Plunge Speed</ParameterItemLabel>
                <ParameterItemValue>
                  <StyledInputNumber
                    value={plungeSpeed}
                    disabled={!selectedNotHide}
                    min={0.1}
                    max={1000}
                    step={0.1}
                    onChange={actions.onChangePlungeSpeed}
                    style={{ width: '65px' }}
                    addonAfter="mm/min"
                  />
                </ParameterItemValue>
              </ParameterItem>
            )}
            <OptionalDropdownParam
              label="Multi-pass"
              popover={{
                title: 'Multi-pass',
                content:
                  "When enabled, the printer will run the G-code multiple times automatically according to the below settings. This feature helps you cut materials that can't be cut with only one pass.",
              }}
              isDropdown={multiPassEnabled}
              onDropdownChange={actions.onToggleMultiPassEnabled}
              disabled={!selectedNotHide}
            >
              <ParameterItem
                popover={{
                  title: 'Passes',
                  content:
                    'Determines how many times the printer will run the G-code automatically.',
                }}
              >
                <ParameterItemLabel>Passes</ParameterItemLabel>
                <ParameterItemValue>
                  <StyledInputNumber
                    min={2}
                    max={50}
                    disabled={!selectedNotHide}
                    value={multiPasses}
                    style={{ width: '65px' }}
                    onChange={actions.onChangeMultiPasses}
                  />
                </ParameterItemValue>
              </ParameterItem>
              <ParameterItem
                popover={{
                  title: 'Pass Depth',
                  content:
                    'Determines how much the laser module will be lowered after each pass.',
                }}
              >
                <ParameterItemLabel>Pass Depth</ParameterItemLabel>
                <ParameterItemValue>
                  <StyledInputNumber
                    min={0}
                    max={10}
                    value={multiPassDepth}
                    disabled={!selectedNotHide}
                    onChange={actions.onChangeMultiDepth}
                    addonAfter="mm"
                  />
                </ParameterItemValue>
              </ParameterItem>
            </OptionalDropdownParam>
            <OptionalDropdownParam
              label="Fixed Power"
              popover={{
                title: 'Fixed Power',
                content:
                  'When enabled, the power used to engrave this image will be set in the G-code, so it is not affected by the power you set in Workspace. When engraving multiple images, you can set the power for each image separately.',
              }}
              isDropdown={fixedPowerEnabled}
              onDropdownChange={actions.onToggleFixedPowerEnabled}
              disabled={!selectedNotHide}
            >
              <ParameterItem
                popover={{
                  title: 'Power',
                  content: 'Power to use when laser is working.',
                }}
              >
                <ParameterItemLabel>Power (%)</ParameterItemLabel>
                <ParameterItemValue>
                  <StyledSlider
                    value={fixedPower}
                    min={0}
                    max={100}
                    step={0.5}
                    disabled={!selectedNotHide}
                    onChange={actions.onChangeFixedPower}
                  />
                  <StyledInputNumber
                    min={1}
                    max={100}
                    value={fixedPower}
                    disabled={!selectedNotHide}
                    onChange={actions.onChangeFixedPower}
                  />
                </ParameterItemValue>
              </ParameterItem>
            </OptionalDropdownParam>
          </>
        )}
      </>
    );
  }
}

GcodeParameters.propTypes = {
  selectedModelID: PropTypes.string,
  selectedModelHideFlag: PropTypes.bool,
  printOrder: PropTypes.number.isRequired,
  gcodeConfig: PropTypes.shape({
    // jogSpeed: PropTypes.number.isRequired,
    jogSpeed: PropTypes.number,
    workSpeed: PropTypes.number,
    plungeSpeed: PropTypes.number,
    dwellTime: PropTypes.number,
    multiPassEnabled: PropTypes.bool,
    multiPassDepth: PropTypes.number,
    multiPasses: PropTypes.number,
    fixedPowerEnabled: PropTypes.bool,
    fixedPower: PropTypes.number,
  }),
  paramsDescs: PropTypes.shape({
    jogSpeed: PropTypes.string,
    workSpeed: PropTypes.string,
    plungeSpeed: PropTypes.string,
    dwellTime: PropTypes.string,
  }),

  updateSelectedModelGcodeConfig: PropTypes.func.isRequired,
  updateSelectedModelPrintOrder: PropTypes.func.isRequired,
};

export default GcodeParameters;
