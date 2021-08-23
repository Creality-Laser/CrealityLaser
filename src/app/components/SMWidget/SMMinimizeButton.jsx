import React from 'react';
import PropTypes from 'prop-types';

import Widget from '../Widget';

// Widget minimize button
const SMMinimizeButton = React.memo(({ state, actions }) => {
  const { fullscreen, minimized } = state;
  const { onToggleMinimized } = actions;

  return (
    <Widget.Button
      disabled={fullscreen}
      title={minimized ? 'Expand' : 'Collapse'}
      onClick={onToggleMinimized}
    >
      {minimized ? <DownIcon /> : <UpIcon />}
    </Widget.Button>
  );
});

SMMinimizeButton.displayName = 'SMMinimizeButton';

SMMinimizeButton.propTypes = {
  state: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
};

export default SMMinimizeButton;

const UpIcon = () => (
  <svg
    t="1626233712926"
    className="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="1552"
    width="200"
    height="200"
  >
    <path
      d="M562.3 233.8c-26.2-28-70-29.3-98-3.2-1.1 1.1-2.2 2.1-3.2 3.2L31.9 684.5c-13.5 14.4-21 33.4-20.9 53.2-1 40.5 31 74 71.5 75.1 19-0.3 37.1-8.2 50.1-22l379.7-397.6 378.6 397.6c13.1 13.9 31.5 21.9 50.7 22 40.5-1.1 72.5-34.6 71.5-75.1 0.1-19.8-7.4-38.8-20.9-53.2L562.3 233.8z"
      p-id="1553"
      fill="currentColor"
    ></path>
  </svg>
);

const DownIcon = () => (
  <svg
    t="1626233766957"
    className="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="1787"
    width="200"
    height="200"
  >
    <path
      d="M461.7 790.9c26.2 28 70 29.3 98 3.2 1.1-1.1 2.2-2.1 3.2-3.2L992 340.2c13.5-14.4 21-33.4 20.9-53.2 1-40.5-31-74-71.5-75.1-19 0.3-37.1 8.2-50.1 22L511.8 631.5 133.2 233.9c-13.1-13.9-31.5-21.9-50.7-22C42 213 10 246.5 11 287c-0.1 19.8 7.4 38.8 20.9 53.2l429.8 450.7z"
      p-id="1788"
      fill="currentColor"
    ></path>
  </svg>
);
