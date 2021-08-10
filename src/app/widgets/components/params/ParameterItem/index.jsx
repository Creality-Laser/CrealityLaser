import React from 'react';
import PropTypes from 'prop-types';
import WrapPopover from '../WrapPopover';
import styles from './index.module.scss';

function ParameterItem(props) {
  const { popover, wrapperStyle, children } = props;

  const ItemContent = (
    <div className={styles.wrapper} style={wrapperStyle}>
      {children}
    </div>
  );

  if (popover) {
    const { title, content } = popover;
    return (
      <WrapPopover popoverTitle={title} popoverContent={content}>
        {ItemContent}
      </WrapPopover>
    );
  }
  return ItemContent;
}

ParameterItem.propTypes = {
  children: PropTypes.any,
  popover: PropTypes.shape({
    title: PropTypes.string,
    content: PropTypes.string,
  }),
  wrapperStyle: PropTypes.object,
};

export default ParameterItem;

export function ParameterItemLabel({ children }) {
  return <span className={styles.item_label}>{children}</span>;
}

ParameterItemLabel.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.node]),
};

export function ParameterItemValue({ children }) {
  return <div className={styles.item_value}>{children}</div>;
}

ParameterItemValue.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.node]),
};
