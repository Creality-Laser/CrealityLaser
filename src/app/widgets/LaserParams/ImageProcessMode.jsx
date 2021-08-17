import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Checkbox } from 'antd';
import { withTranslation } from 'react-i18next';

import ParametersHead from '../components/params/ParametersHead';
import ParameterItem, {
  ParameterItemLabel,
  ParameterItemValue,
} from '../components/params/ParameterItem';
import ConfigRasterBW from './config/ConfigRasterBW';
import ConfigGreyscale from './config/ConfigGreyscale';
import ConfigRasterVector from './config/ConfigRasterVector';
import styles from './index.module.scss';

import bwBgImg from './images/laser-mode-bw-88x88.png';
import greyscaleBgImg from './images/laser-mode-greyscale-88x88.png';
import vectorBgImg from './images/laser-mode-vector-88x88.png';

class ImageProcessMode extends PureComponent {
  state = {
    expanded: true,
  };

  actions = {
    onToggleExpand: () => {
      this.setState((state) => ({ expanded: !state.expanded }));
    },
    changeSelectedModelMode: (mode) => {
      const { sourceType } = this.props;
      this.props.changeSelectedModelMode(sourceType, mode);
    },
  };

  render() {
    const { sourceType, mode, showOrigin, disabled, t } = this.props;
    const actions = this.actions;
    const isBW = sourceType === 'raster' && mode === 'bw';
    const isGreyscale = sourceType === 'raster' && mode === 'greyscale';
    const isRasterVector = sourceType === 'raster' && mode === 'vector';

    return (
      <>
        <ParametersHead
          title={t('Process Mode')}
          expanded={this.state.expanded}
          onToggleExpand={this.actions.onToggleExpand}
        />

        {this.state.expanded && (
          <>
            <div className={styles.mode_select_items_wrapper}>
              <ProcessModeSelectItem
                label={t('B&W')}
                disabled={disabled}
                modeBgImage={bwBgImg}
                isSelected={this.props.mode === 'bw'}
                onClick={() => actions.changeSelectedModelMode('bw')}
              />
              <ProcessModeSelectItem
                label={t('GREYSCALE')}
                disabled={disabled}
                modeBgImage={greyscaleBgImg}
                isSelected={this.props.mode === 'greyscale'}
                onClick={() => actions.changeSelectedModelMode('greyscale')}
              />
              <ProcessModeSelectItem
                label={t('VECTOR')}
                disabled={disabled}
                modeBgImage={vectorBgImg}
                isSelected={this.props.mode === 'vector'}
                onClick={() => actions.changeSelectedModelMode('vector')}
              />
            </div>
            <ParameterItem>
              <ParameterItemLabel>
                {t('Show Original Image')}
              </ParameterItemLabel>
              <ParameterItemValue>
                <Checkbox
                  checked={showOrigin}
                  onChange={this.props.changeSelectedModelShowOrigin}
                />
              </ParameterItemValue>
            </ParameterItem>
            {isBW && <ConfigRasterBW disabled={disabled} />}
            {isGreyscale && <ConfigGreyscale disabled={disabled} />}
            {isRasterVector && <ConfigRasterVector disabled={disabled} />}
          </>
        )}
      </>
    );
  }
}

ImageProcessMode.propTypes = {
  t: PropTypes.func,
  sourceType: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
  showOrigin: PropTypes.bool,
  disabled: PropTypes.bool,

  changeSelectedModelMode: PropTypes.func.isRequired,
  changeSelectedModelShowOrigin: PropTypes.func.isRequired,
};

export default withTranslation()(ImageProcessMode);

function ProcessModeSelectItem({
  label,
  modeBgImage,
  isSelected,
  disabled,
  onClick,
}) {
  return (
    <div
      className={classNames(styles.mode_select_item_wrapper, {
        [styles.mode_select_item_wrapper_selected]: isSelected,
      })}
    >
      <button
        type="button"
        disabled={disabled}
        className={styles.mode_select_item_img_wrapper}
        onClick={onClick}
      >
        <img
          src={modeBgImage}
          alt={label}
          className={styles.mode_select_item_img}
        />
      </button>
      <span className={styles.mode_select_item_label}>{label}</span>
    </div>
  );
}

ProcessModeSelectItem.propTypes = {
  label: PropTypes.string,
  modeBgImage: PropTypes.string,
  isSelected: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
};
