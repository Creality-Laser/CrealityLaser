import React from 'react';
import PropTypes from 'prop-types';

function DropdownMenuItem(props) {
  const { eventKey, children } = props;

  return <div key={eventKey}>{children}</div>;
}

DropdownMenuItem.propTypes = {
  eventKey: PropTypes.string,
  children: PropTypes.node,
};

export default DropdownMenuItem;
