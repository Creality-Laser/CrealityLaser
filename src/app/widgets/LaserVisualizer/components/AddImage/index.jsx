import React, { useRef, useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Input, message } from 'antd';
import path from 'path';
import { useTranslation } from 'react-i18next';
// import { PAGE_EDITOR } from '../../../../constants';
import styles from './index.module.scss';

const { TextArea } = Input;

export default function AddImage(props) {
  const {
    // togglePage,
    uploadImage,
    setAutoPreview,
    insertDefaultTextVector,
    genQrcode,
    genQrcodeModel,
  } = props;

  const { t } = useTranslation();

  const [showQrcodeModal, setShowQrcodeModal] = useState(false);
  const [qrcodeText, setQrcodeText] = useState('');
  const [genQrcodeModalOkLoading, setGenQrcodeModalOkLoading] = useState(false);
  const [currentQrcode, setCurrentQrcode] = useState(null);

  const inputRef = useRef(null);
  const grcodeModalTextAreaRef = useRef(null);

  const onClickToUpload = () => {
    if (inputRef) {
      inputRef.current.value = null;
      inputRef.current.click();
    }
  };

  const onChangeFile = useCallback(
    (event) => {
      const file = event.target.files[0];
      const extname = path.extname(file.name).toLowerCase();
      let uploadMode;
      if (extname === '.svg') {
        uploadMode = 'vector';
      } else if (extname === '.dxf') {
        uploadMode = 'vector';
      } else {
        uploadMode = 'bw';
      }

      // togglePage(PAGE_EDITOR);

      if (uploadMode === 'greyscale') {
        setAutoPreview(false);
      }
      uploadImage(file, uploadMode, () => {
        Modal.error({
          title: t('Parse Error'),
          content: t(`Failed to parse image file,`, { fileName: file.name }),
        });
      });
    },
    [uploadImage, setAutoPreview, t]
    // [(togglePage, uploadImage, setAutoPreview)]
  );

  // Focus Qrcode Modal TextArea
  useEffect(() => {
    if (showQrcodeModal && grcodeModalTextAreaRef.current) {
      grcodeModalTextAreaRef.current.focus();
    }
  }, [showQrcodeModal]);

  const resetQrcodeText = () => {
    setQrcodeText('');
  };

  const resetCurrentQrcode = () => {
    setCurrentQrcode(null);
  };

  const handleGenQrcodeModel = async () => {
    setGenQrcodeModalOkLoading(true);

    const qrcodeInfo = await genQrcode(qrcodeText);

    await genQrcodeModel(qrcodeInfo)
      .catch(() => {
        message.error(t('Generate Qrcode Model Error'));
      })
      .finally(() => {
        setGenQrcodeModalOkLoading(false);
        setShowQrcodeModal(false);
      });
  };

  const handlePreviewQrcode = async () => {
    return genQrcode(qrcodeText)
      .then((qrcodeInfo) => {
        setCurrentQrcode(qrcodeInfo);
      })
      .catch(() => {
        message.error(t('Generate Qrcode Error'));
      });
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".svg, .png, .jpg, .jpeg, .bmp, .dxf"
        style={{ display: 'none' }}
        multiple={false}
        onChange={onChangeFile}
      />
      <Button
        type="primary"
        shape="round"
        style={{ float: 'left', marginRight: '20px' }}
        title="Add image file to workspace"
        onClick={onClickToUpload}
      >
        {t('Add File', 'Add File')}
      </Button>
      <Button
        shape="round"
        style={{ float: 'left', marginRight: '20px' }}
        title="Add image file to workspace"
        onClick={() => {
          insertDefaultTextVector();
        }}
      >
        {t('Add Text', 'Add Text')}
      </Button>
      <Button
        shape="round"
        style={{ float: 'left' }}
        title="Add text to Qrcode"
        onClick={() => {
          resetQrcodeText();
          resetCurrentQrcode();
          setShowQrcodeModal(true);
        }}
      >
        {t('Qrcode', 'Qrcode')}
      </Button>
      <Modal
        visible={showQrcodeModal}
        title={t('Generate Qrcode', 'Generate Qrcode')}
        onCancel={() => setShowQrcodeModal(false)}
        onOk={handleGenQrcodeModel}
        destroyOnClose
        okText={t('OK')}
        cancelText={t('Cancel')}
        okButtonProps={{
          disabled: !qrcodeText,
        }}
        confirmLoading={genQrcodeModalOkLoading}
      >
        <div className={styles.qrcode_modal_content_wrapper}>
          <TextArea
            className={styles.qrcode_modal_content_preview_textarea}
            ref={grcodeModalTextAreaRef}
            value={qrcodeText}
            onChange={({ target: { value } }) => {
              setQrcodeText(() => value);
            }}
            autoFocus
            placeholder={t('Please input some text', 'Please input some text')}
            autoSize={{ minRows: 10 }}
          />
          <div className={styles.qrcode_modal_content_preview_wrapper}>
            <div className={styles.qrcode_modal_content_preview}>
              {qrcodeText && currentQrcode && (
                <img
                  className={styles.qrcode_modal_content_preview_img}
                  src={currentQrcode.path}
                  alt={t('qrcode img', 'qrcode img')}
                />
              )}
              {!currentQrcode && (
                <span
                  className={styles.qrcode_modal_content_preview_placeholder}
                >
                  {t('Preview Area', 'Preview Area')}
                </span>
              )}
            </div>
            <Button
              disabled={!qrcodeText}
              style={{ width: '100%' }}
              onClick={handlePreviewQrcode}
            >
              {t('Preview', 'Preview')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

AddImage.propTypes = {
  // togglePage: PropTypes.func.isRequired,
  uploadImage: PropTypes.func.isRequired,
  setAutoPreview: PropTypes.func.isRequired,
  insertDefaultTextVector: PropTypes.func,
  genQrcode: PropTypes.func,
  genQrcodeModel: PropTypes.func,
};
