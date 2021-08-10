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
import { ABSENT_VALUE } from '../../../constants';

class GcodeConfigGreyscale extends PureComponent {
  state = {
    expanded: true,
  };

  actions = {
    onToggleExpand: () => {
      this.setState((state) => ({ expanded: !state.expanded }));
    },
    onChangeMovementMode: (value) => {
      if (value === 'greyscale-line') {
        this.props.updateSelectedModelGcodeConfig({
          dwellTime: ABSENT_VALUE,
          jogSpeed: 1500,
          workSpeed: 500,
        });
      } else if (value === 'greyscale-dot') {
        this.props.updateSelectedModelGcodeConfig({
          dwellTime: 42,
          jogSpeed: ABSENT_VALUE,
          workSpeed: 1500,
        });
      }
      this.props.updateSelectedModelGcodeConfig({
        movementMode: value,
      });
    },
    onChangeDensity: (density) => {
      this.props.updateSelectedModelGcodeConfig({ density });
    },
  };

  render() {
    const { density, movementMode, disabled } = this.props;

    return (
      <div>
        <ParametersHead
          title="Greyscale"
          expanded={this.state.expanded}
          onToggleExpand={this.actions.onToggleExpand}
        />
        {this.state.expanded && (
          <>
            <div>
              <ParameterItem>
                <ParameterItemLabel>Movement Mode</ParameterItemLabel>
                <ParameterItemValue>
                  <StyledSelect
                    disabled={disabled}
                    style={{ zIndex: 5, width: '160px' }}
                    name="Movement"
                    placeholder="Choose movement mode"
                    value={movementMode}
                    onChange={(value) =>
                      this.actions.onChangeMovementMode(value)
                    }
                  >
                    <Option value="greyscale-line">
                      Line (Normal Quality)
                    </Option>
                    <Option value="greyscale-dot">Dot (High Quality)</Option>
                  </StyledSelect>
                </ParameterItemValue>
              </ParameterItem>
              <ParameterItem
                popover={{
                  title: 'Density',
                  content:
                    'Determines how fine and smooth the engraved picture will be. The bigger this value is, the better quality you will get. The range is 1-10 dot/mm and 10 is recommended.',
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
            </div>
          </>
        )}
      </div>
    );
  }
}

GcodeConfigGreyscale.propTypes = {
  density: PropTypes.number.isRequired,
  movementMode: PropTypes.string.isRequired,
  disabled: PropTypes.bool,

  updateSelectedModelGcodeConfig: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const { gcodeConfig } = state.laser;
  const { density, movementMode } = gcodeConfig;
  return {
    density,
    movementMode,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateSelectedModelGcodeConfig: (params) =>
      dispatch(actions.updateSelectedModelGcodeConfig('laser', params)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GcodeConfigGreyscale);
