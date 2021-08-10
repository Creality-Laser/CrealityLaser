import React, { PureComponent } from 'react';
import { Menu, Submenu, Item, Separator, contextMenu } from 'react-contexify';
import PropTypes from 'prop-types';

// ref: https://fkhadra.github.io/react-contexify/api/context-menu
class ContextMenu extends PureComponent {
  static hide() {
    contextMenu.hideAll();
  }

  show(e) {
    e.preventDefault();
    contextMenu.show({
      id: this.props.id,
      props: {
        key: this.props.id,
      },
      event: e,
    });
  }

  render() {
    const { id, menuItems = [] } = this.props;
    let key = 0;
    return (
      <Menu id={id}>
        {menuItems.map((menuItem) => {
          if (!menuItem) {
            return null;
          }
          const { type, label, disabled = false, onClick, items } = menuItem;
          switch (type) {
            case 'separator':
              return <Separator key={key++} />;
            case 'item':
              return (
                <Item key={key++} onClick={onClick} disabled={disabled}>
                  {label}
                </Item>
              );
            case 'subMenu':
              return (
                <Submenu key={key++} label={label} disabled={disabled}>
                  {items.map((item) => {
                    switch (item.type) {
                      case 'separator':
                        return <Separator key={key++} />;
                      case 'item':
                        return (
                          <Item key={key++} onClick={item.onClick}>
                            {item.label}
                          </Item>
                        );
                      default:
                        return null;
                    }
                  })}
                </Submenu>
              );
            default:
              return null;
          }
        })}
      </Menu>
    );
  }
}

ContextMenu.propTypes = {
  id: PropTypes.string.isRequired,
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      label: PropTypes.string,
      onClick: PropTypes.func,
      disabled: PropTypes.bool,
      items: PropTypes.array,
    })
  ).isRequired,
};

export default ContextMenu;
