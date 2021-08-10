import React from 'react';
import PropTypes from 'prop-types';
import LaserParamsWidget from './LaserParams';
import LaserOutputWidget from './LaserOutput';
// import LaserSetBackground from './LaserSetBackground';
import CncLaserObjectList from './CncLaserObjectList';

const getWidgetByName = (name) => {
  const Widget = {
    'laser-params': LaserParamsWidget,
    'laser-output': LaserOutputWidget,
    // 'laser-set-background': LaserSetBackground,
    'cnc-laser-object-list': CncLaserObjectList,
  }[name];
  if (!Widget) {
    throw new Error(`Unknown Widget ${name}`);
  }
  return Widget;
};

/**
 * Widget Wrapper for getting Widget from widget id.
 */
const Widget = (props) => {
  const { widgetId } = props;

  if (typeof widgetId !== 'string') {
    return null;
  }

  const name = widgetId.split(':')[0];
  const Component = getWidgetByName(name);

  return <Component {...props} />;
};

Widget.propTypes = {
  widgetId: PropTypes.string.isRequired,
  headType: PropTypes.string,
};

export default Widget;
