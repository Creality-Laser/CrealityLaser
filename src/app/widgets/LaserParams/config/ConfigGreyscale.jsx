import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Checkbox, Select } from 'antd';
import { withTranslation } from 'react-i18next';

import ParameterItem, {
  ParameterItemLabel,
  ParameterItemValue,
} from '../../components/params/ParameterItem';
import StyledSlider from '../../components/params/StyledSlider';
import StyledInputNumber from '../../components/params/StyledInputNumber';
import StyledSelect from '../../components/params/StyledSelect';

import { actions as editorActions } from '../../../flux/editor';

const { Option } = Select;

class ConfigGreyscale extends PureComponent {
  state = {
    expanded: true,
  };

  actions = {
    onToggleExpand: () => {
      this.setState((state) => ({ expanded: !state.expanded }));
    },
    onInverseBW: () => {
      this.props.updateSelectedModelConfig({ invert: !this.props.invert });
    },
    onChangeContrast: (contrast) => {
      this.props.updateSelectedModelConfig({ contrast });
    },
    onChangeBrightness: (brightness) => {
      this.props.updateSelectedModelConfig({ brightness });
    },
    onChangeWhiteClip: (whiteClip) => {
      this.props.updateSelectedModelConfig({ whiteClip });
    },
    onChangeAlgorithm: (options) => {
      this.props.updateSelectedModelConfig({ algorithm: options.value });
    },
  };

  render() {
    const {
      invert,
      contrast,
      brightness,
      whiteClip,
      algorithm,
      disabled,
      t,
      hideFields = [],
    } = this.props;

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
                    onChange={this.actions.onInverseBW}
                  />
                </ParameterItemValue>
              </ParameterItem>
              <ParameterItem
                popover={{
                  title: t('Contrast'),
                  content: t(
                    'The difference between the lightest color and the darkest color.'
                  ),
                }}
              >
                <ParameterItemLabel>{t('Contrast')}</ParameterItemLabel>
                <ParameterItemValue>
                  <StyledSlider
                    disabled={disabled}
                    value={contrast}
                    min={0}
                    max={100}
                    onChange={this.actions.onChangeContrast}
                  />
                  <StyledInputNumber
                    disabled={disabled}
                    value={contrast}
                    min={0}
                    max={100}
                    onChange={this.actions.onChangeContrast}
                  />
                </ParameterItemValue>
              </ParameterItem>
              <ParameterItem
                popover={{
                  title: t('Brightness'),
                  content: t(
                    'The engraved picture is brighter when this value is bigger.'
                  ),
                }}
              >
                <ParameterItemLabel>{t('Brightness')}</ParameterItemLabel>
                <ParameterItemValue>
                  <StyledSlider
                    disabled={disabled}
                    value={brightness}
                    min={0}
                    max={100}
                    onChange={this.actions.onChangeBrightness}
                  />
                  <StyledInputNumber
                    disabled={disabled}
                    value={brightness}
                    min={0}
                    max={100}
                    onChange={this.actions.onChangeBrightness}
                  />
                </ParameterItemValue>
              </ParameterItem>
              <ParameterItem
                popover={{
                  title: t('White Clip'),
                  content: t(
                    'Set the threshold to turn the color that is not pure white into pure white.'
                  ),
                }}
              >
                <ParameterItemLabel>{t('White Clip')}</ParameterItemLabel>
                <ParameterItemValue>
                  <StyledSlider
                    disabled={disabled}
                    value={whiteClip}
                    min={0}
                    max={255}
                    onChange={this.actions.onChangeWhiteClip}
                  />
                  <StyledInputNumber
                    disabled={disabled}
                    value={whiteClip}
                    min={0}
                    max={255}
                    onChange={this.actions.onChangeWhiteClip}
                  />
                </ParameterItemValue>
              </ParameterItem>
              {!hideFields.includes('algorithm') && (
                <ParameterItem
                  popover={{
                    title: t('Algorithm'),
                    content: 'Choose an algorithm for image processing.',
                  }}
                >
                  <ParameterItemLabel>{t('Algorithm')}</ParameterItemLabel>
                  <ParameterItemValue>
                    <StyledSelect
                      disabled={disabled}
                      style={{
                        zIndex: 5,
                      }}
                      name="algorithm"
                      placeholder="Choose algorithms"
                      value={algorithm}
                      onChange={(value) =>
                        this.actions.onChangeAlgorithm({ value })
                      }
                    >
                      <Option value="FloydSteinburg">Floyd-Steinburg</Option>
                      <Option value="JarvisJudiceNinke">
                        Jarvis-Judice-Ninke
                      </Option>
                      <Option value="Stucki">Stucki</Option>
                      <Option value="Atkinson">Atkinson</Option>
                      <Option value="Burkes">Burkes</Option>
                      <Option value="Sierra2">Sierra2</Option>
                      <Option value="Sierra3">Sierra3</Option>
                      <Option value="SierraLite">SierraLite</Option>
                    </StyledSelect>
                  </ParameterItemValue>
                </ParameterItem>
              )}
            </div>
          </>
        )}
      </div>
    );
  }
}

ConfigGreyscale.propTypes = {
  hideFields: PropTypes.arrayOf(PropTypes.string),
  t: PropTypes.func,
  invert: PropTypes.bool,
  contrast: PropTypes.number.isRequired,
  brightness: PropTypes.number.isRequired,
  whiteClip: PropTypes.number.isRequired,
  algorithm: PropTypes.string.isRequired,
  disabled: PropTypes.bool,

  updateSelectedModelConfig: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const { config } = state.laser;
  const { invert, contrast, brightness, whiteClip, algorithm } = config;
  return {
    invert,
    contrast,
    brightness,
    whiteClip,
    algorithm,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateSelectedModelConfig: (config) =>
      dispatch(editorActions.updateSelectedModelConfig('laser', config)),
  };
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(ConfigGreyscale)
);
