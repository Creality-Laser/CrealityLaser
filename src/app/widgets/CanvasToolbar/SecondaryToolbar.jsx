import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import styles from './secondary-toolbar.module.scss';

function SecondaryToolbar(props) {
  const { zoomIn, zoomOut, autoFocus } = props;

  return (
    <div className="pull-right">
      <div className="btn-toolbar">
        <div className="btn-group">
          <button
            type="button"
            className={styles.btnIcon}
            onClick={autoFocus}
            title="Reset Position"
          >
            <i className={classNames(styles.icon, styles.iconFocusCenter)} />
          </button>
          <button
            type="button"
            className={styles.btnIcon}
            onClick={zoomIn}
            title="Zoom In"
          >
            <i className={classNames(styles.icon, styles.iconZoomIn)} />
          </button>
          <button
            type="button"
            className={styles.btnIcon}
            onClick={zoomOut}
            title="Zoom Out"
          >
            <i className={classNames(styles.icon, styles.iconZoomOut)} />
          </button>
        </div>
      </div>
    </div>
  );
}

SecondaryToolbar.propTypes = {
  zoomIn: PropTypes.func,
  zoomOut: PropTypes.func,
  autoFocus: PropTypes.func,
};

export default SecondaryToolbar;
