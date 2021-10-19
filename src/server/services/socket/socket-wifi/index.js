import uuid from 'uuid';
import DataStorage from '../../../DataStorage';
import genGcore from '../../../lib/dllNapi/gen_gcore';
import {
  uploadGcoreFile,
  postGcodeFile,
  fetchDeviceInfo,
  fetchDeviceStatusHeartbeat,
  sendPrintCmd,
  sendCmd,
  postOTAFile,
} from './utils/api';

//can cancel gcore upload by this handler
let uploadGcoreHandler = null;

//can cancel gcode upload by this handler
let uploadGcodeFileHandler = null;

// can cancel get device status header beat by this handler
let getDeviceStatusHeartbeatIntervalHandler = null;

const uploadGcore = async (socket, config) => {
  try {
    const { sourcePath, ...options } = config;

    const gcorePath = `${DataStorage.tmpDir}/gcore_${uuid
      .v4()
      .substring(0, 8)}.gcore`;

    const ret = await genGcore(sourcePath, gcorePath, options);

    if (ret !== 0) {
      socket.emit('wifi:uploadGcoreErr', {
        ok: 1,
        msg: 'err',
      });
      return;
    }

    // should send file to server;
    uploadGcoreFile(
      gcorePath,
      (progress) => {
        socket.emit('wifi:uploadGcoreProgress', progress);
      },
      (okRet) => {
        socket.emit('wifi:uploadGcoreSucc', okRet);
        uploadGcoreHandler = null;
      },
      (errRet) => {
        socket.emit('wifi:uploadGcoreErr', errRet);
        uploadGcoreHandler = null;
      },
      (handler) => {
        uploadGcoreHandler = handler;
      }
    );
  } catch (error) {
    console.error(`uploadGcore error: ${error.message}`);
    socket.emit('wifi:uploadGcoreErr', {
      ok: 1,
      msg: 'err',
    });
  }
};

const cancelUploadGcore = (socket) => {
  try {
    if (uploadGcoreHandler && uploadGcoreHandler.abort) {
      uploadGcoreHandler.abort();
    }
    socket.emit('wifi:cancelUploadGcoreSucc');
  } catch (error) {
    socket.emit('wifi:cancelUploadGcoreErr');
  }
};

const uploadGcodeFile = async (socket, gcodeFileInfo) => {
  try {
    const { path, name } = gcodeFileInfo;

    postGcodeFile(
      { path, name },
      (progress) => {
        socket.emit('wifi:uploadGcodeFileProgress', progress);
      },
      (okRet) => {
        socket.emit('wifi:uploadGcodeFileSucc', okRet);
        uploadGcodeFileHandler = null;
      },
      (errRet) => {
        socket.emit('wifi:uploadGcodeFileErr', errRet);
        uploadGcodeFileHandler = null;
      },
      (handler) => {
        uploadGcodeFileHandler = handler;
      }
    );
  } catch (error) {
    console.error(`uploadGcode error: ${error.message}`);
    socket.emit('wifi:uploadGcodeFileErr', {
      ok: 1,
      msg: 'err',
    });
  }
};

const cancelUploadGcodeFile = (socket) => {
  try {
    if (uploadGcodeFileHandler && uploadGcodeFileHandler.abort) {
      uploadGcodeFileHandler.abort();
    }
    socket.emit('wifi:cancelUploadGcodeFileSucc');
  } catch (error) {
    socket.emit('wifi:cancelUploadGcodeFileErr');
  }
};

const uploadOTAFile = async (socket, fileInfo) => {
  try {
    const { filePath } = fileInfo;

    postOTAFile(
      filePath,
      (progress) => {
        socket.emit('wifi:uploadOTAFileProgress', progress);
      },
      (okRet) => {
        socket.emit('wifi:uploadOTAFileSucc', okRet);
      },
      (errRet) => {
        socket.emit('wifi:uploadOTAFileErr', errRet);
      }
    );
  } catch (error) {
    console.log(`uploadOTAFile error: ${error.message}`);
    socket.emit('wifi:uploadOTAFileErr', {
      ok: 1,
      msg: 'err',
    });
  }
};

const getDeviceInfo = async (socket) => {
  try {
    const ret = await fetchDeviceInfo();
    if (!ret) {
      socket.emit('wifi:getDeviceInfoErr');
      return false;
    }
    socket.emit('wifi:getDeviceInfoSucc', ret);
    return true;
  } catch (error) {
    socket.emit('wifi:getDeviceInfoErr');
    return false;
  }
};

const sendPrintCommand = async (socket, command) => {
  try {
    const ret = await sendPrintCmd(command);
    if (!ret) {
      socket.emit('wifi:sendPrintCommandErr');
      return false;
    }
    socket.emit('wifi:sendPrintCommandSucc', {
      type: command,
      ok: 0,
      msg: 'ok',
    });
    return true;
  } catch (error) {
    socket.emit('wifi:sendPrintCommandErr');
    return false;
  }
};

const sendCommand = async (socket, command) => {
  try {
    const ret = await sendCmd(command);
    if (!ret) {
      socket.emit('wifi:sendCommandErr');
      return false;
    }
    socket.emit('wifi:sendCommandSucc', {
      command,
      ok: 0,
      msg: 'ok',
    });
    return true;
  } catch (error) {
    socket.emit('wifi:sendCommandErr');
    return false;
  }
};

const getDeviceStatusHeartbeat = async (socket) => {
  try {
    getDeviceStatusHeartbeatIntervalHandler = setInterval(() => {
      const ret = await fetchDeviceStatusHeartbeat();
      if (!ret) {
        socket.emit('wifi:getDeviceStatusHeartbeatErr');
        return false;
      }
      socket.emit('wifi:getDeviceStatusHeartbeatSucc', {
        data: ret,
        ok: 0,
        msg: 'ok',
      });
      return true;
    }, 2000);

    return true;
  } catch (error) {
    socket.emit('wifi:getDeviceStatusHeartbeatErr');
    return false;
  }
};

const cancalGetDeviceStatusHeartbeat = (socket) => {
  try {
    if (getDeviceStatusHeartbeatIntervalHandler) {
      clearInterval(getDeviceStatusHeartbeatIntervalHandler);
      getDeviceStatusHeartbeatIntervalHandler = null;
    }
    socket.emit('wifi:cancalGetDeviceStatusHeartbeatSucc');
  } catch (error) {
    socket.emit('wifi:cancalGetDeviceStatusHeartbeatErr');
  }
};

export default {
  uploadGcore,
  cancelUploadGcore,
  uploadGcodeFile,
  cancelUploadGcodeFile,
  uploadOTAFile,
  getDeviceInfo,
  sendPrintCommand,
  sendCommand,
  getDeviceStatusHeartbeat,
  cancalGetDeviceStatusHeartbeat,
};
