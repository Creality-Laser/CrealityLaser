import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Popover } from 'antd';

import { ABSENT_VALUE } from '../../constants';
import ParametersHead from '../components/params/ParametersHead';
import ParameterItem, {
  ParameterItemLabel,
  ParameterItemValue,
} from '../components/params/ParameterItem';
import StyledInputNumber from '../components/params/StyledInputNumber';
import StyledSelect, { Option } from '../components/params/StyledSelect';
import StyledSlider from '../components/params/StyledSlider';
import OptionalDropdownParam from '../components/params/OptionalDropdownParam';

// workSpeed: 1800 - 100%
const materials = [
  {
    id: '',
    name: 'None',
    power: 0,
    workSpeed: 0,
    jogSpeed: 3000,
  },
  {
    id: 'lindenWood_2mm',
    name: '椴木板-2mm',
    power: 30,
    workSpeed: 900,
    jogSpeed: 3000,
  },
  {
    id: 'skewer_2mm',
    name: '竹签-2mm',
    power: 25,
    workSpeed: 720,
    jogSpeed: 3000,
  },
  {
    id: 'leather_1mm',
    name: '皮革-1mm',
    power: 20,
    workSpeed: 720,
    jogSpeed: 3000,
  },
  {
    id: 'kraft paper',
    name: '牛皮纸',
    power: 70,
    workSpeed: 540,
    jogSpeed: 3000,
  },
  {
    id: 'paperboard_green',
    name: '卡纸-绿色',
    power: 80,
    workSpeed: 360,
    jogSpeed: 3000,
  },
  {
    id: 'feltPaper_blue',
    name: '毛毡纸-蓝色',
    power: 95,
    workSpeed: 90,
    jogSpeed: 3000,
  },
  {
    id: 'feltPaper_green',
    name: '毛毡纸-绿色',
    power: 50,
    workSpeed: 180,
    jogSpeed: 3000,
  },
  {
    id: 'feltPaper_yellow',
    name: '毛毡纸-黄色',
    power: 50,
    workSpeed: 180,
    jogSpeed: 3000,
  },
];

class GcodeParameters extends PureComponent {
  state = {
    expanded: true,
    currentMaterialId: '',
  };

  actions = {
    onChangeMaterial: (materialId) => {
      const {
        gcodeConfig: { fixedPowerEnabled },
      } = this.props;

      this.setState(
        {
          currentMaterialId: materialId,
        },
        () => {
          const isSelectedMaterialNone = materialId === '';
          if (isSelectedMaterialNone) {
            return;
          }
          const currentMaterial = materials.find(({ id }) => id === materialId);
          const { power, workSpeed, jogSpeed } = currentMaterial;

          // change power
          if (!fixedPowerEnabled) {
            this.actions.onToggleFixedPowerEnabled();
          }
          this.actions.onChangeFixedPower(power);

          // change workSpeed
          this.actions.onChangeWorkSpeed(workSpeed);

          // change jogSpeed
          this.actions.onChangeJogSpeed(jogSpeed);
        }
      );
    },
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

  componentDidMount() {}

  render() {
    const { printOrder, selectedModelID, selectedModelHideFlag, mode } =
      this.props;
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

    // const isBW = mode === 'bw';
    const isGreyscale = mode === 'greyscale';
    // const isVector = mode === 'vector';

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
                title: 'Material',
                content: 'The material to engrave on',
              }}
            >
              <ParameterItemLabel>Material</ParameterItemLabel>
              <ParameterItemValue>
                <StyledSelect
                  style={{ zIndex: 5, width: 130 }}
                  name="line_direction"
                  placeholder="Select an direction"
                  value={this.state.currentMaterialId}
                  onChange={this.actions.onChangeMaterial}
                >
                  {materials.map(({ id, name, power, workSpeed }) => {
                    return (
                      <Option key={id} value={id}>
                        <Popover
                          placement="leftTop"
                          content={
                            <div>
                              <p>
                                <span>Power: </span>
                                <span style={{ fontWeight: 600 }}>{power}</span>
                                <span>&nbsp;%</span>
                              </p>
                              <p>
                                <span>WorkSpeed: </span>
                                <span style={{ fontWeight: 600 }}>
                                  {workSpeed}
                                </span>
                                <span>&nbsp;mm/min</span>
                              </p>
                            </div>
                          }
                        >
                          <div style={{ width: '100%' }}>{name}</div>
                        </Popover>
                      </Option>
                    );
                  })}
                </StyledSelect>
              </ParameterItemValue>
            </ParameterItem>
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
            {!isGreyscale && jogSpeed !== ABSENT_VALUE && (
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
            {false && dwellTime !== ABSENT_VALUE && (
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
  mode: PropTypes.string, // 'bw' | 'greyscale' | 'vector'
  updateSelectedModelGcodeConfig: PropTypes.func.isRequired,
  updateSelectedModelPrintOrder: PropTypes.func.isRequired,
};

export default GcodeParameters;
