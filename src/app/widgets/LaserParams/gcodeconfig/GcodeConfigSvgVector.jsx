import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Checkbox } from 'antd';
import { withTranslation } from 'react-i18next';

import ParametersHead from '../../components/params/ParametersHead';
import ParameterItem, {
  ParameterItemLabel,
  ParameterItemValue,
} from '../../components/params/ParameterItem';
import StyledInputNumber from '../../components/params/StyledInputNumber';
import StyledSlider from '../../components/params/StyledSlider';
import OptionalDropdownParam from '../../components/params/OptionalDropdownParam';

import { actions } from '../../../flux/editor';

class GcodeConfigSvgVector extends PureComponent {
  state = {
    expanded: true,
  };

  actions = {
    onToggleExpand: () => {
      this.setState((state) => ({ expanded: !state.expanded }));
    },
    onToggleFill: () => {
      this.props.updateSelectedModelGcodeConfig({
        fillEnabled: !this.props.fillEnabled,
      });
    },
    onChangeFillDensity: (fillDensity) => {
      this.props.updateSelectedModelGcodeConfig({ fillDensity });
    },
    onToggleOptimizePath: (event) => {
      this.props.updateSelectedModelGcodeConfig({
        optimizePath: event.target.checked,
      });
    },
  };

  render() {
    const { optimizePath, fillEnabled, fillDensity, disabled, t } = this.props;

    return (
      <div>
        <ParametersHead
          title={t('Vector')}
          expanded={this.state.expanded}
          onToggleExpand={this.actions.onToggleExpand}
        />
        {this.state.expanded && (
          <>
            <ParameterItem
              popover={{
                title: t('Optimize Path'),
                content: t(
                  'Optimizes the path based on the proximity of the lines in the image.'
                ),
              }}
            >
              <ParameterItemLabel>{t('Optimize Path')}</ParameterItemLabel>
              <ParameterItemValue>
                <Checkbox
                  disabled={disabled}
                  checked={optimizePath}
                  onChange={this.actions.onToggleOptimizePath}
                />
              </ParameterItemValue>
            </ParameterItem>
            <OptionalDropdownParam
              label={t('Fill')}
              isDropdown={fillEnabled}
              onDropdownChange={this.actions.onToggleFill}
              disabled={disabled}
            >
              <ParameterItem
                popover={{
                  title: t('Fill Density'),
                  content: t(
                    `Set the degree to which an area is filled with laser dots. The highest density is 20 dot/mm. When it is set to 0, the SVG image will be engraved without fill.`
                  ),
                }}
              >
                <ParameterItemLabel>{t('Fill Density')}</ParameterItemLabel>
                <ParameterItemValue>
                  <StyledSlider
                    disabled={disabled}
                    className="sm-parameter-row__slider"
                    value={fillDensity}
                    min={0}
                    max={20}
                    onChange={this.actions.onChangeFillDensity}
                  />
                  <StyledInputNumber
                    disabled={disabled}
                    value={fillDensity}
                    min={0}
                    max={20}
                    onChange={this.actions.onChangeFillDensity}
                  />
                </ParameterItemValue>
              </ParameterItem>
            </OptionalDropdownParam>
          </>
        )}
      </div>
    );
  }
}

GcodeConfigSvgVector.propTypes = {
  t: PropTypes.func,
  optimizePath: PropTypes.bool,
  fillEnabled: PropTypes.bool.isRequired,
  fillDensity: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
  updateSelectedModelGcodeConfig: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const { gcodeConfig } = state.laser;
  const { optimizePath, fillEnabled, fillDensity } = gcodeConfig;
  return {
    optimizePath,
    fillEnabled,
    fillDensity,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateSelectedModelGcodeConfig: (params) =>
      dispatch(actions.updateSelectedModelGcodeConfig('laser', params)),
  };
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(GcodeConfigSvgVector)
);
