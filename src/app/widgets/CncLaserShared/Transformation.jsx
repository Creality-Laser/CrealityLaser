import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Select } from 'antd';
import { withTranslation } from 'react-i18next';

import { toFixed } from '../../lib/numeric-utils';
import ParametersHead from '../components/params/ParametersHead';
import ParameterItem, {
  ParameterItemLabel,
  ParameterItemValue,
} from '../components/params/ParameterItem';
import StyledSlider from '../components/params/StyledSlider';
import StyledInputNumber from '../components/params/StyledInputNumber';
import StyledSelect from '../components/params/StyledSelect';
import styles from './index.module.scss';

const { Option } = Select;

class Transformation extends PureComponent {
  state = {
    expanded: true,
  };

  actions = {
    onToggleExpand: () => {
      this.setState((state) => ({ expanded: !state.expanded }));
    },
    onChangeWidth: (width) => {
      this.props.updateSelectedModelTransformation({ width });
    },
    onChangeHeight: (height) => {
      this.props.updateSelectedModelTransformation({ height });
    },
    onChangeRotationZ: (degree) => {
      const rotationZ = (degree * Math.PI) / 180;
      this.props.updateSelectedModelTransformation({ rotationZ });
    },
    onChangePositionX: (positionX) => {
      this.props.updateSelectedModelTransformation({ positionX });
    },
    onChangePositionY: (positionY) => {
      this.props.updateSelectedModelTransformation({ positionY });
    },
    onChangeFlip: (value) => {
      this.props.updateSelectedModelFlip({ flip: value });
    },
    onModelAfterTransform: () => {
      this.props.onModelAfterTransform();
    },
  };

  render() {
    const { size, selectedModelID, selectedModelHideFlag, sourceType, t } =
      this.props;
    const {
      rotationZ = 0,
      width = 125,
      height = 125,
      positionX = 0,
      positionY = 0,
      flip = 0,
    } = this.props.transformation;
    const canResize = sourceType !== 'text';
    const selectedNotHide = selectedModelID && !selectedModelHideFlag;
    const actions = this.actions;

    return (
      <>
        <ParametersHead
          title={t('Transformation')}
          expanded={this.state.expanded}
          onToggleExpand={this.actions.onToggleExpand}
        />
        {this.state.expanded && (
          <>
            <ParameterItem
              popover={{
                title: t('Size'),
                content: t(
                  `Enter the size of the engraved picture. The size cannot be larger than size.x x size.y mm or the size of your material.`,
                  { sizeX: size.x, sizeY: size.y }
                ),
              }}
            >
              <ParameterItemLabel>{t('Size (mm)')}</ParameterItemLabel>
              <ParameterItemValue>
                <StyledInputNumber
                  style={{ width: '90px' }}
                  disabled={!selectedNotHide || canResize === false}
                  value={toFixed(width, 1)}
                  min={1}
                  max={size.x}
                  onChange={(value) => {
                    actions.onChangeWidth(value);
                    actions.onModelAfterTransform();
                  }}
                />
                <span
                  className={styles['description-text']}
                  style={{
                    width: '22px',
                    textAlign: 'center',
                    display: 'inline-block',
                  }}
                >
                  X
                </span>
                <StyledInputNumber
                  style={{ width: '90px' }}
                  disabled={!selectedNotHide || canResize === false}
                  value={toFixed(height, 1)}
                  min={1}
                  max={size.y}
                  onChange={(value) => {
                    actions.onChangeHeight(value);
                    actions.onModelAfterTransform();
                  }}
                />
              </ParameterItemValue>
            </ParameterItem>
            <ParameterItem
              popover={{
                title: t('Rotate'),
                content: t('Rotate the image to the angle you need.'),
              }}
            >
              <ParameterItemLabel>{t('Rotate')}</ParameterItemLabel>
              <ParameterItemValue>
                <StyledSlider
                  disabled={!selectedNotHide}
                  value={(rotationZ * 180) / Math.PI}
                  min={-180}
                  max={180}
                  onChange={actions.onChangeRotationZ}
                  onAfterChange={actions.onModelAfterTransform}
                />
                <StyledInputNumber
                  disabled={!selectedNotHide}
                  value={toFixed((rotationZ * 180) / Math.PI, 1)}
                  min={-180}
                  max={180}
                  onChange={(value) => {
                    actions.onChangeRotationZ(value);
                    actions.onModelAfterTransform();
                  }}
                />
              </ParameterItemValue>
            </ParameterItem>
            <ParameterItem
              popover={{
                title: t('Move X (mm)'),
                content: t(
                  `Set the coordinate of the selected image or text in the X direction. You can also drag the image directly.`
                ),
              }}
            >
              <ParameterItemLabel>{t('Move X (mm)')}</ParameterItemLabel>
              <ParameterItemValue>
                <StyledSlider
                  disabled={!selectedNotHide}
                  value={positionX}
                  min={Math.floor(width / 2)}
                  max={Math.ceil(size.x - width / 2)}
                  onChange={actions.onChangePositionX}
                  onAfterChange={actions.onModelAfterTransform}
                />
                <StyledInputNumber
                  disabled={!selectedNotHide}
                  value={toFixed(positionX, 1)}
                  min={Math.floor(width / 2)}
                  max={Math.ceil(size.x - width / 2)}
                  onChange={(value) => {
                    if (typeof value !== 'number') {
                      return;
                    }
                    actions.onChangePositionX(value);
                    actions.onModelAfterTransform();
                  }}
                />
              </ParameterItemValue>
            </ParameterItem>
            <ParameterItem
              popover={{
                title: t('Move Y (mm)'),
                content: t(
                  `Set the coordinate of the selected image or text in the Y direction. You can also drag the image directly.`
                ),
              }}
            >
              <ParameterItemLabel>{t('Move Y (mm)')}</ParameterItemLabel>
              <ParameterItemValue>
                <StyledSlider
                  disabled={!selectedNotHide}
                  value={positionY}
                  min={Math.floor(height / 2)}
                  max={Math.ceil(size.y - height / 2)}
                  onChange={actions.onChangePositionY}
                  onAfterChange={actions.onModelAfterTransform}
                />
                <StyledInputNumber
                  disabled={!selectedNotHide}
                  value={toFixed(positionY, 1)}
                  min={Math.floor(height / 2)}
                  max={Math.ceil(size.y - height / 2)}
                  onChange={(value) => {
                    if (typeof value !== 'number') {
                      return;
                    }
                    actions.onChangePositionY(value);
                    actions.onModelAfterTransform();
                  }}
                />
              </ParameterItemValue>
            </ParameterItem>
            {sourceType === 'raster' && (
              <ParameterItem
                popover={{
                  title: t('Flip Model'),
                  content: t(
                    `Flip the selected Model vertically, horizontally or in both directions.`
                  ),
                }}
              >
                <ParameterItemLabel>{t('Flip Model')}</ParameterItemLabel>
                <ParameterItemValue>
                  <StyledSelect
                    disabled={!selectedNotHide}
                    value={flip}
                    onChange={(value) => {
                      actions.onChangeFlip(value);
                      actions.onModelAfterTransform();
                    }}
                  >
                    <Option value={0}>{t('None Flip')}</Option>
                    <Option value={1}>{t('Vertical')}</Option>
                    <Option value={2}>{t('Horizontal')}</Option>
                    <Option value={3}>{t('Both')}</Option>
                  </StyledSelect>
                  {/* <Select
                    disabled={!selectedNotHide}
                    clearable="false"
                    value={flip}
                    size="small"
                    style={{ width: '100px' }}
                    seachable="false"
                    onChange={(value) => {
                      actions.onChangeFlip(value);
                      actions.onModelAfterTransform();
                    }}
                  >
                    <Option value={0}>None</Option>
                    <Option value={1}>Vertical</Option>
                    <Option value={2}>Horizontal</Option>
                    <Option value={3}>Both</Option>
                  </Select> */}
                </ParameterItemValue>
              </ParameterItem>
            )}
          </>
        )}
      </>
    );
  }
}

Transformation.propTypes = {
  t: PropTypes.func,
  selectedModelID: PropTypes.string,
  selectedModelHideFlag: PropTypes.bool,
  sourceType: PropTypes.string.isRequired,
  transformation: PropTypes.shape({
    rotationZ: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
    positionX: PropTypes.number,
    positionY: PropTypes.number,
    flip: PropTypes.number,
  }),

  updateSelectedModelTransformation: PropTypes.func.isRequired,
  updateSelectedModelFlip: PropTypes.func.isRequired,
  onModelAfterTransform: PropTypes.func.isRequired,
  // redux
  size: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    z: PropTypes.number,
  }).isRequired,
};

const mapStateToProps = (state) => {
  const { size } = state.machine;

  return {
    size,
  };
};

export default withTranslation()(connect(mapStateToProps)(Transformation));
