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
import Config from './config';

const { deviceStatusHeartbeatIntervalTime } = Config;

//can cancel gcore upload by this handler
let uploadGcoreHandler = null;

//can cancel gcode upload by this handler
let uploadGcodeFileHandler = null;

// can cancel get device status header beat by this handler
let getDeviceStatusHeartbeatIntervalHandler = null;

// can cancel OTA file upload by this handler
let uploadOTAFileHandler = null;

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
      (handler, progressHandler) => {
        uploadGcoreHandler = handler;
        if (progressHandler) {
          uploadGcoreHandler.progressHandler = progressHandler;
        }
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
    if (uploadGcoreHandler && uploadGcoreHandler.progressHandler) {
      clearInterval(uploadGcoreHandler.progressHandler);
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
      (handler, progressHandler) => {
        uploadGcodeFileHandler = handler;
        if (progressHandler) {
          uploadGcodeFileHandler.progressHandler = progressHandler;
        }
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
    if (uploadGcodeFileHandler && uploadGcodeFileHandler.progressHandler) {
      clearInterval(uploadGcodeFileHandler.progressHandler);
    }
    socket.emit('wifi:cancelUploadGcodeFileSucc');
  } catch (error) {
    console.log(error.message, '--------- cancelUploadGcodeFile---------');
    socket.emit('wifi:cancelUploadGcodeFileErr');
  }
};

const uploadOTAFile = async (socket, fileInfo) => {
  try {
    const { path } = fileInfo;

    postOTAFile(
      path,
      (progress) => {
        socket.emit('wifi:uploadOTAFileProgress', progress);
      },
      (okRet) => {
        socket.emit('wifi:uploadOTAFileSucc', okRet);
      },
      (errRet) => {
        socket.emit('wifi:uploadOTAFileErr', errRet);
      },
      (handler, progressHandler) => {
        uploadOTAFileHandler = handler;
        if (progressHandler) {
          uploadOTAFileHandler.progressHandler = progressHandler;
        }
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

const cancelUploadOTAFile = (socket) => {
  try {
    if (uploadOTAFileHandler && uploadOTAFileHandler.abort) {
      uploadOTAFileHandler.abort();
    }
    if (uploadOTAFileHandler.progressHandler) {
      clearInterval(uploadOTAFileHandler.progressHandler);
    }
    socket.emit('wifi:cancelUploadOTAFileSucc');
  } catch (error) {
    socket.emit('wifi:cancelUploadOTAFileErr');
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
  let sequenceControlIndex = 1;
  try {
    // clear prev setInterval first
    if (getDeviceStatusHeartbeatIntervalHandler) {
      clearInterval(getDeviceStatusHeartbeatIntervalHandler);
    }

    getDeviceStatusHeartbeatIntervalHandler = setInterval(async () => {
      const [ret, retIndex] = await fetchDeviceStatusHeartbeat(
        sequenceControlIndex
      );

      const isLatestResponse = retIndex === sequenceControlIndex;

      sequenceControlIndex++;

      if (!ret) {
        socket.emit('wifi:getDeviceStatusHeartbeatErr');
        return false;
      }

      if (!isLatestResponse) {
        return false;
      }

      socket.emit('wifi:getDeviceStatusHeartbeatSucc', {
        data: ret,
        ok: 0,
        msg: 'ok',
      });
      return true;
    }, deviceStatusHeartbeatIntervalTime);

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

const genGcodeByGcoreConfig = async (socket, config) => {
  try {
    const { sourcePath, ...options } = config;

    const gcodePath = `${DataStorage.tmpDir}/gcode_${uuid
      .v4()
      .substring(0, 8)}.gcode`;

    const ret = await genGcore(sourcePath, gcodePath, options, true);

    if (ret !== 0) {
      socket.emit('wifi:genGcodeByGcoreConfigErr', {
        ok: 1,
        msg: 'err',
      });
      return;
    }

    socket.emit('wifi:genGcodeByGcoreConfigSucc', {
      gcodePath,
    });
  } catch (error) {
    console.error(`gen gcode by gcore config error: ${error.message}`);
    socket.emit('wifi:genGcodeByGcoreConfigErr');
  }
};

export default {
  uploadGcore,
  cancelUploadGcore,
  uploadGcodeFile,
  cancelUploadGcodeFile,
  uploadOTAFile,
  cancelUploadOTAFile,
  getDeviceInfo,
  sendPrintCommand,
  sendCommand,
  getDeviceStatusHeartbeat,
  cancalGetDeviceStatusHeartbeat,
  genGcodeByGcoreConfig,
};
