import request from 'superagent';
import Config from '../config';
import uploadFile from './uploadFile';

const { baseUrl } = Config;

const requestGet = async (url) => {
  try {
    const ret = await request.get(url).timeout({
      response: 2000, // Wait 1 seconds for the server to start sending,
      deadline: 2000, // but allow 2 seconds for the file to finish loading.
    });
    const isValidRet = ret && ret.body && ret.body.code === 0;
    if (isValidRet) {
      return ret.body;
    }
    return false;
  } catch (error) {
    console.error(error);
    return false;
  }
};

/**
 * fetchDeviceStatusHeartbeat
 * @param {number} sequenceControlIndex - use to control sequence
 */
export const fetchDeviceStatusHeartbeat = async (sequenceControlIndex = 1) => {
  const url = `${baseUrl}/status/heartbeat`;
  const ret = await requestGet(url);
  return [ret, sequenceControlIndex];
};

export const sendCmd = async (command = '') => {
  const url = `${baseUrl}/gcode/command?commandText=$J=${command}`;
  const ret = await requestGet(url);
  return ret;
};

export const sendPrintCmd = async (command = 'start') => {
  const url = `${baseUrl}/cmd?print=${command}`;
  const ret = await requestGet(url);
  return ret;
};

export const fetchDeviceInfo = async () => {
  const url = `${baseUrl}/status/deviceInfo`;
  const ret = await requestGet(url);
  return ret;
};

/**
 * upload Gcore file
 * @param {string} gcorePath - The path to the gcore file
 * @param {function} onProgress - The callback to call when progress
 * @param {function} onOk - The callback to call when the upload completes
 * @param {function } onError - The callback to call when the upload fails
 * @param {function } onRequestHandler - the request handler callback
 */
export const uploadGcoreFile = (
  gcorePath = '',
  onProgress,
  onOk,
  onError,
  onRequestHandler
) => {
  const url = `${baseUrl}/file/uploadGcore`;

  const fileInfo = {
    path: gcorePath,
    key: 'file',
    name: 'index.gcore',
  };

  uploadFile(url, fileInfo, {}, onProgress, onOk, onError, onRequestHandler);
};

export const postGcodeFile = (
  { path = '', name = '' },
  onProgress,
  onOk,
  onError,
  onRequestHandler
) => {
  const url = `${baseUrl}/file/upload`;

  const fileInfo = {
    path,
    key: 'myfile[]',
    name,
  };

  uploadFile(url, fileInfo, {}, onProgress, onOk, onError, onRequestHandler);
};

export const postOTAFile = (
  filePath = '',
  onProgress,
  onOk,
  onError,
  onRequestHandler
) => {
  const url = `${baseUrl}/file/update`;

  const fileInfo = {
    path: filePath,
    key: 'firmware',
    name: filePath,
  };

  uploadFile(url, fileInfo, {}, onProgress, onOk, onError, onRequestHandler);
};
