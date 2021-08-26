import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { ipcRenderer } from 'electron';
import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';

import pkg from '../../package.json';

function GlobalInfoModal() {
  const { t } = useTranslation();
  // show about modal;
  useEffect(() => {
    ipcRenderer.on('show_panel', (_, panelType) => {
      if (panelType === 'about') {
        Modal.info({
          title: pkg.productName,
          content: <AboutPanelContent t={t} />,
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export default GlobalInfoModal;

const AboutPanelContent = ({ t }) => {
  return (
    <div>
      <p style={{ marginBottom: 0 }}>
        <span>{t('Version')}: </span>
        <span>{pkg.version}</span>
      </p>
      <p style={{ marginBottom: 0 }}>
        <span>{t('License')}: </span>
        <span>{pkg.license}</span>
      </p>
    </div>
  );
};

AboutPanelContent.propTypes = {
  t: PropTypes.func,
};
