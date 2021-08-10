import React from 'react';
import PropTypes from 'prop-types';
import { Popover } from 'antd';

export default function WrapperPopover(props) {
  const { popoverTitle, popoverContent, children } = props;
  return (
    <Popover
      title={popoverTitle}
      placement="leftTop"
      content={<p style={{ maxWidth: '230px' }}>{popoverContent}</p>}
    >
      {children}
    </Popover>
  );
}

WrapperPopover.propTypes = {
  popoverTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  popoverContent: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  children: PropTypes.element,
};
