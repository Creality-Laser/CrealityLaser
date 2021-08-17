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

class ConfigRasterBW extends PureComponent {
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
    onChangeBWThreshold: (bwThreshold) => {
      this.props.updateSelectedModelConfig({ bwThreshold });
    },
  };

  render() {
    const { invert, bwThreshold, disabled, t } = this.props;

    return (
      <div>
        {this.state.expanded && (
          <>
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
                title: t('B&W threshold'),
                content: t(
                  `Set the proportion of the black color based on the original color of the image.`
                ),
              }}
            >
              <ParameterItemLabel>{t('B&W threshold')}</ParameterItemLabel>
              <ParameterItemValue>
                <StyledSlider
                  disabled={disabled}
                  value={bwThreshold}
                  min={0}
                  max={255}
                  onChange={this.actions.onChangeBWThreshold}
                />
                <StyledInputNumber
                  disabled={disabled}
                  value={bwThreshold}
                  min={0}
                  max={255}
                  onChange={this.actions.onChangeBWThreshold}
                />
              </ParameterItemValue>
            </ParameterItem>
          </>
        )}
      </div>
    );
  }
}

ConfigRasterBW.propTypes = {
  t: PropTypes.func,
  invert: PropTypes.bool,
  bwThreshold: PropTypes.number,
  disabled: PropTypes.bool,

  updateSelectedModelConfig: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const { config } = state.laser;
  const { invert, bwThreshold } = config;
  return {
    invert,
    bwThreshold,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateSelectedModelConfig: (config) =>
      dispatch(editorActions.updateSelectedModelConfig('laser', config)),
  };
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(ConfigRasterBW)
);
