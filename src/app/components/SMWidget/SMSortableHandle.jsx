import React from 'react';
import Widget from '../Widget';

// Widget sortable handle
const SMSortableHandle = React.memo(() => (
  <Widget.Sortable className="sortable-handle">
    <span>
      <HamburgerIcon />
      <span style={{ marginRight: '5px' }} />
    </span>
  </Widget.Sortable>
));

SMSortableHandle.displayName = 'SMSortableHandle';

export default SMSortableHandle;

const HamburgerIcon = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    data-prefix="fas"
    data-icon="bars"
    className="icon"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 448 512"
  >
    <path
      fill="currentColor"
      d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"
    ></path>
  </svg>
);
