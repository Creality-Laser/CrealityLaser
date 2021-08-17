import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import ContextMenu from '../../../../components/ContextMenu';

const CanvasContextMenu = forwardRef((props, ref) => {
  const {
    isModelSelected,
    duplicateSelectedModel,
    bringSelectedModelToFront,
    sendSelectedModelToBack,
    onSetSelectedModelPosition,
    onFlipSelectedModel,
    removeSelectedModel,
  } = props;

  const { t } = useTranslation();

  return (
    <>
      <ContextMenu
        ref={ref}
        id="laser"
        menuItems={[
          {
            type: 'item',
            label: t('Duplicate Selected Model'),
            disabled: !isModelSelected,
            onClick: duplicateSelectedModel,
          },
          {
            type: 'item',
            label: t('Bring to Front'),
            disabled: !isModelSelected,
            onClick: bringSelectedModelToFront,
          },
          {
            type: 'item',
            label: t('Send to Back'),
            disabled: !isModelSelected,
            onClick: sendSelectedModelToBack,
          },
          {
            type: 'subMenu',
            label: t('Reference Position'),
            disabled: !isModelSelected,
            items: [
              {
                type: 'item',
                label: t('Top Left'),
                onClick: () => onSetSelectedModelPosition('Top Left'),
              },
              {
                type: 'item',
                label: t('Top Middle'),
                onClick: () => onSetSelectedModelPosition('Top Middle'),
              },
              {
                type: 'item',
                label: t('Top Right'),
                onClick: () => onSetSelectedModelPosition('Top Right'),
              },
              {
                type: 'item',
                label: t('Center Left'),
                onClick: () => onSetSelectedModelPosition('Center Left'),
              },
              {
                type: 'item',
                label: t('Center'),
                onClick: () => onSetSelectedModelPosition('Center'),
              },
              {
                type: 'item',
                label: t('Center Right'),
                onClick: () => onSetSelectedModelPosition('Center Right'),
              },
              {
                type: 'item',
                label: t('Bottom Left'),
                onClick: () => onSetSelectedModelPosition('Bottom Left'),
              },
              {
                type: 'item',
                label: t('Bottom Middle'),
                onClick: () => onSetSelectedModelPosition('Bottom Middle'),
              },
              {
                type: 'item',
                label: t('Bottom Right'),
                onClick: () => onSetSelectedModelPosition('Bottom Right'),
              },
            ],
          },
          {
            type: 'subMenu',
            label: t('Flip'),
            disabled: !isModelSelected,
            items: [
              {
                type: 'item',
                label: t('Vertical'),
                onClick: () => onFlipSelectedModel('Vertical'),
              },
              {
                type: 'item',
                label: t('Horizontal'),
                onClick: () => onFlipSelectedModel('Horizontal'),
              },
              {
                type: 'item',
                label: t('Reset'),
                onClick: () => onFlipSelectedModel('Reset'),
              },
            ],
          },
          {
            type: 'separator',
          },
          {
            type: 'item',
            label: t('Delete Selected Model'),
            disabled: !isModelSelected,
            onClick: removeSelectedModel,
          },
          // {
          //     type: 'item',
          //     label: i18n._('Arrange All Models'),
          //     disabled: !hasModel,
          //     onClick: this.actions.arrangeAllModels
          // }
        ]}
      />
    </>
  );
});

CanvasContextMenu.displayName = 'CanvasContextMenu';

CanvasContextMenu.propTypes = {
  isModelSelected: PropTypes.bool.isRequired,
  duplicateSelectedModel: PropTypes.func.isRequired,
  bringSelectedModelToFront: PropTypes.func.isRequired,
  sendSelectedModelToBack: PropTypes.func.isRequired,
  onSetSelectedModelPosition: PropTypes.func.isRequired,
  onFlipSelectedModel: PropTypes.func.isRequired,
  removeSelectedModel: PropTypes.func.isRequired,
};

export default CanvasContextMenu;
