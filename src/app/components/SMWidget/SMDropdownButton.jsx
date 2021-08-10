import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Widget from '../Widget';

// Widget dropdown button (with fullscreen button)
const SMDropdownButton = React.memo(({ state, actions }) => {
  const { fullscreen, needRemove } = state;
  const { onToggleFullscreen, onRemove } = actions;

  return (
    <Widget.DropdownButton
      title="fullscreen"
      toggle={<i className="fa fa-ellipsis-v" />}
      onSelect={(eventKey) => {
        if (eventKey === 'fullscreen') {
          onToggleFullscreen();
        } else if (needRemove && eventKey === 'remove') {
          onRemove && onRemove();
        }
      }}
    >
      <Widget.DropdownMenuItem eventKey="fullscreen">
        <i
          className={classNames(
            'fa',
            'fa-fw',
            { 'fa-expand': !fullscreen },
            { 'fa-compress': fullscreen }
          )}
        />
        <span className="space space-sm" />
        {!fullscreen ? 'Enter Full Screen' : 'Exit Full Screen'}
      </Widget.DropdownMenuItem>
      {needRemove && onRemove && (
        <Widget.DropdownMenuItem eventKey="remove">
          <i className="fa fa-fw fa-times" />
          <span className="space space-sm" />
          <span>Remove Widget</span>
        </Widget.DropdownMenuItem>
      )}
    </Widget.DropdownButton>
  );
});

SMDropdownButton.displayName = 'SMDropdownButton';

SMDropdownButton.propTypes = {
  state: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
};

export default SMDropdownButton;
