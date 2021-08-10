import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
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

  return (
    <>
      <ContextMenu
        ref={ref}
        id="laser"
        menuItems={[
          {
            type: 'item',
            label: 'Duplicate Selected Model',
            disabled: !isModelSelected,
            onClick: duplicateSelectedModel,
          },
          {
            type: 'item',
            label: 'Bring to Front',
            disabled: !isModelSelected,
            onClick: bringSelectedModelToFront,
          },
          {
            type: 'item',
            label: 'Send to Back',
            disabled: !isModelSelected,
            onClick: sendSelectedModelToBack,
          },
          {
            type: 'subMenu',
            label: 'Reference Position',
            disabled: !isModelSelected,
            items: [
              {
                type: 'item',
                label: 'Top Left',
                onClick: () => onSetSelectedModelPosition('Top Left'),
              },
              {
                type: 'item',
                label: 'Top Middle',
                onClick: () => onSetSelectedModelPosition('Top Middle'),
              },
              {
                type: 'item',
                label: 'Top Right',
                onClick: () => onSetSelectedModelPosition('Top Right'),
              },
              {
                type: 'item',
                label: 'Center Left',
                onClick: () => onSetSelectedModelPosition('Center Left'),
              },
              {
                type: 'item',
                label: 'Center',
                onClick: () => onSetSelectedModelPosition('Center'),
              },
              {
                type: 'item',
                label: 'Center Right',
                onClick: () => onSetSelectedModelPosition('Center Right'),
              },
              {
                type: 'item',
                label: 'Bottom Left',
                onClick: () => onSetSelectedModelPosition('Bottom Left'),
              },
              {
                type: 'item',
                label: 'Bottom Middle',
                onClick: () => onSetSelectedModelPosition('Bottom Middle'),
              },
              {
                type: 'item',
                label: 'Bottom Right',
                onClick: () => onSetSelectedModelPosition('Bottom Right'),
              },
            ],
          },
          {
            type: 'subMenu',
            label: 'Flip',
            disabled: !isModelSelected,
            items: [
              {
                type: 'item',
                label: 'Vertical',
                onClick: () => onFlipSelectedModel('Vertical'),
              },
              {
                type: 'item',
                label: 'Horizontal',
                onClick: () => onFlipSelectedModel('Horizontal'),
              },
              {
                type: 'item',
                label: 'Reset',
                onClick: () => onFlipSelectedModel('Reset'),
              },
            ],
          },
          {
            type: 'separator',
          },
          {
            type: 'item',
            label: 'Delete Selected Model',
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
