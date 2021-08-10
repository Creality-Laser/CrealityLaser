import React from 'react';
import Detector from 'three/examples/js/Detector';
import PropTypes from 'prop-types';
import styles from './primary-toolbar.module.scss';

function PrimaryToolbar(props) {
  const { switchCoordinateVisibility } = {
    ...props.actions,
    ...props.state,
  };

  return (
    <div>
      <div className={styles.dropdownGroup}>
        <button
          style={{ fontSize: '10px', padding: '3px' }}
          type="button"
          className="btn btn-outline-secondary pull-right"
          onClick={switchCoordinateVisibility}
          title={!Detector.webgl ? 'Enable 3D View' : 'Disable 3D View'}
        />
      </div>
    </div>
  );
}

PrimaryToolbar.propTypes = {
  actions: PropTypes.object.isRequired,
  state: PropTypes.object.isRequired,
};

export default PrimaryToolbar;
