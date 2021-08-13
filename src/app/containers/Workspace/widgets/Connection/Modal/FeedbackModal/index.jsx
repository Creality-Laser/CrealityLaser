import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'antd';
import successImg from './assets/success.png';
import warnImg from './assets/warn.png';
import errorImg from './assets/error.png';

class FeedbackModal extends PureComponent {
  render() {
    const { type, visible, content, onCancel } = this.props;

    let img;
    if (type === 'success') {
      img = successImg;
    } else if (type === 'error') {
      img = errorImg;
    } else {
      img = warnImg;
    }

    return (
      <Modal
        visible={visible}
        modalContentWidth="290px"
        minHeight="170px"
        onCancel={onCancel}
      >
        <div style={{ textAlign: 'center' }}>
          <img src={img} alt="img" width="50" height="50" />
          <div style={{ fontSize: '18px', marginTop: '10px' }}>{content}</div>
        </div>
      </Modal>
    );
  }
}

FeedbackModal.propTypes = {
  type: PropTypes.string, // 'success' | 'error' | 'warning'
  visible: PropTypes.bool,
  content: PropTypes.string,
  onCancel: PropTypes.func,
};

export default FeedbackModal;
