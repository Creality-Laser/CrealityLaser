import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ParametersHead from '../../components/params/ParametersHead';
import ParameterItem, {
  ParameterItemLabel,
  ParameterItemValue,
} from '../../components/params/ParameterItem';
import StyledSelect, { Option } from '../../components/params/StyledSelect';
import StyledInputNumber from '../../components/params/StyledInputNumber';

import { actions } from '../../../flux/editor';

class GcodeConfigRasterBW extends PureComponent {
  state = {
    expanded: true,
  };

  actions = {
    onToggleExpand: () => {
      this.setState((state) => ({ expanded: !state.expanded }));
    },
    onChangeDirection: (value) => {
      this.props.updateSelectedModelGcodeConfig({ direction: value });
    },
    onChangeDensity: (density) => {
      this.props.updateSelectedModelGcodeConfig({ density });
    },
  };

  render() {
    const { density, direction, disabled } = this.props;

    return (
      <div>
        <ParametersHead
          title="B&W"
          expanded={this.state.expanded}
          onToggleExpand={this.actions.onToggleExpand}
        />
        {this.state.expanded && (
          <>
            <ParameterItem
              popover={{
                title: 'Line Direction',
                content: 'Select the direction of the engraving path.',
              }}
            >
              <ParameterItemLabel>Line Direction</ParameterItemLabel>
              <ParameterItemValue>
                <StyledSelect
                  disabled={disabled}
                  style={{ zIndex: 5 }}
                  name="line_direction"
                  placeholder="Select an direction"
                  value={direction}
                  onChange={(value) => this.actions.onChangeDirection(value)}
                >
                  <Option value="Horizontal">Horizontal</Option>
                  <Option value="Vertical">Vertical</Option>
                  <Option value="Diagonal">Diagonal</Option>
                  <Option value="Diagonal2">Diagonal2</Option>
                </StyledSelect>
              </ParameterItemValue>
            </ParameterItem>
            <ParameterItem
              popover={{
                title: 'Density',
                content:
                  'Determines how fine and smooth the engraved picture will be.The bigger this value is, the better quality you will get. The range is 1-10 dot/mm and 10 is recommended.',
              }}
            >
              <ParameterItemLabel>Density</ParameterItemLabel>
              <ParameterItemValue>
                <StyledInputNumber
                  disabled={disabled}
                  style={{ width: '65px' }}
                  value={density}
                  min={1}
                  max={10}
                  addonAfter="dot/mm"
                  step={1}
                  onChange={this.actions.onChangeDensity}
                />
              </ParameterItemValue>
            </ParameterItem>
          </>
        )}
      </div>
    );
  }
}

GcodeConfigRasterBW.propTypes = {
  density: PropTypes.number,
  direction: PropTypes.string,
  disabled: PropTypes.bool,

  updateSelectedModelGcodeConfig: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const { gcodeConfig } = state.laser;
  const { density, direction } = gcodeConfig;
  return {
    density,
    direction,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateSelectedModelGcodeConfig: (gcodeConfig) =>
      dispatch(actions.updateSelectedModelGcodeConfig('laser', gcodeConfig)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GcodeConfigRasterBW);
