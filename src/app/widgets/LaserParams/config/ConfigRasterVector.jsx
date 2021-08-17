import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Checkbox } from 'antd';
import { withTranslation } from 'react-i18next';

import ParameterItem, {
  ParameterItemLabel,
  ParameterItemValue,
} from '../../components/params/ParameterItem';
import StyledSlider from '../../components/params/StyledSlider';
import StyledInputNumber from '../../components/params/StyledInputNumber';

import { actions as editorActions } from '../../../flux/editor';

class ConfigRasterVector extends PureComponent {
  state = {
    expanded: true,
  };

  actions = {
    onToggleExpand: () => {
      this.setState((state) => ({ expanded: !state.expanded }));
    },
    changeVectorThreshold: (vectorThreshold) => {
      this.props.updateSelectedModelConfig({ vectorThreshold });
    },
    onChangeTurdSize: (turdSize) => {
      this.props.updateSelectedModelConfig({ turdSize });
    },
    onToggleInvert: (event) => {
      this.props.updateSelectedModelConfig({ invert: event.target.checked });
    },
  };

  render() {
    const { vectorThreshold, invert, turdSize, disabled, t } = this.props;

    return (
      <div>
        {this.state.expanded && (
          <>
            <div>
              <ParameterItem
                popover={{
                  title: t('Invert'),
                  content: t('Inverts black to white and vise versa.'),
                }}
              >
                <ParameterItemLabel>{t('Invert')}</ParameterItemLabel>
                <ParameterItemValue>
                  <Checkbox
                    disabled={disabled}
                    checked={invert}
                    onChange={this.actions.onToggleInvert}
                  />
                </ParameterItemValue>
              </ParameterItem>
              <ParameterItem
                popover={{
                  title: t('B&W'),
                  content: t(
                    'Set the proportion of the black color based on the original color of the image.'
                  ),
                }}
              >
                <ParameterItemLabel>{t('B&W')}</ParameterItemLabel>
                <ParameterItemValue>
                  <StyledSlider
                    disabled={disabled}
                    defaultValue={vectorThreshold}
                    min={0}
                    value={vectorThreshold}
                    max={255}
                    step={1}
                    onChange={this.actions.changeVectorThreshold}
                  />
                  <StyledInputNumber
                    disabled={disabled}
                    value={vectorThreshold}
                    min={0}
                    max={255}
                    step={1}
                    onChange={this.actions.changeVectorThreshold}
                  />
                </ParameterItemValue>
              </ParameterItem>
              <ParameterItem
                popover={{
                  title: t('Impurity Size'),
                  content: t(
                    'Determines the minimum size of impurity which allows to be showed.'
                  ),
                }}
              >
                <ParameterItemLabel>{t('Impurity Size')}</ParameterItemLabel>
                <StyledInputNumber
                  disabled={disabled}
                  value={turdSize}
                  style={{ width: '90px' }}
                  min={0}
                  max={10000}
                  onChange={this.actions.onChangeTurdSize}
                />
              </ParameterItem>
            </div>
          </>
        )}
      </div>
    );
  }
}

ConfigRasterVector.propTypes = {
  t: PropTypes.func,
  vectorThreshold: PropTypes.number,
  invert: PropTypes.bool,
  turdSize: PropTypes.number,
  disabled: PropTypes.bool,

  updateSelectedModelConfig: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const { config } = state.laser;
  const { vectorThreshold, invert, turdSize } = config;
  return {
    vectorThreshold,
    invert,
    turdSize,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateSelectedModelConfig: (config) =>
      dispatch(editorActions.updateSelectedModelConfig('laser', config)),
  };
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(ConfigRasterVector)
);
