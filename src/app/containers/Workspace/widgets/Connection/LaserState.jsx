import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import styles from './index.module.scss';

const i18n = {
  _: (str) => str,
};

class LaserState extends PureComponent {
  render() {
    const { laserFocalLength, nozzleTemperature } = this.props;
    return (
      <div>
        <div
          style={{
            width: '40%',
          }}
        />
        <div className="row">
          <div className="col-xs-6">
            <div className={styles['color-grey-color']}>
              {i18n._('Laser Focus')}
            </div>
            <div>{laserFocalLength} mm</div>
            <div
              style={{
                position: 'absolute',
                width: '1px',
                height: '30px',
                backgroundColor: '#BFD2FF',
                right: '20px',
                top: '5px',
              }}
            />
          </div>
          <div className="col-xs-6">
            <div className={styles['color-grey-color']}>
              {i18n._('Laser Temp')}
            </div>
            <div>{nozzleTemperature}°C</div>
          </div>
        </div>
      </div>
    );
  }
}

LaserState.propTypes = {
  laserFocalLength: PropTypes.number,
  nozzleTemperature: PropTypes.number,
};

const mapStateToProps = (state) => {
  const machine = state.machine;

  const { laserFocalLength, nozzleTemperature } = machine;

  return {
    laserFocalLength,
    nozzleTemperature,
  };
};

export default connect(mapStateToProps)(LaserState);
