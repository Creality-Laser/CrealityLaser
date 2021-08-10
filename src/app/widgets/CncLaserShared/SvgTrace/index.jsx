import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styles from '../index.module.scss';
import TracePreview from './TracePreview';

class SvgTrace extends PureComponent {
  render() {
    return (
      <div>
        <div className="clearfix" />
        <div className={styles['trace-title']}>Image Trace</div>
        <TracePreview
          state={this.props.state}
          from={this.props.from}
          traceFilenames={this.props.traceFilenames}
          status={this.props.status}
          actions={this.props.actions}
        />
      </div>
    );
  }
}

SvgTrace.propTypes = {
  state: PropTypes.shape({
    mode: PropTypes.string.isRequired,
    options: PropTypes.object.isRequired,
    modalSetting: PropTypes.object.isRequired,
    showModal: PropTypes.bool.isRequired,
  }),
  from: PropTypes.string.isRequired,
  traceFilenames: PropTypes.array.isRequired,
  status: PropTypes.string.isRequired,
  actions: PropTypes.shape({
    hideModal: PropTypes.func.isRequired,
    updateModalSetting: PropTypes.func.isRequired,
    processTrace: PropTypes.func.isRequired,
    updateOptions: PropTypes.func.isRequired,
  }),
};

export default SvgTrace;
