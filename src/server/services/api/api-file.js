import path from 'path';
import mv from 'mv';
import fs from 'fs';
import uuid from 'uuid';
import { pathWithRandomSuffix } from '../../lib/random-utils';
import logger from '../../lib/logger';
import DataStorage, { rmDir } from '../../DataStorage';
import store from '../../store';
import { PROTOCOL_TEXT } from '../../controllers/constants';
import parseGcodeHeader from '../../lib/parseGcodeHeader';
import { zipFolder, unzipFile } from '../../lib/archive';

const log = logger('api:file');

const cpFileToTmp = async (file, uploadName) => {
  console.log(file);
  const originalName = path.basename(file.name);
  uploadName = uploadName || originalName;
  const uploadPath = `${DataStorage.tmpDir}/${uploadName}`;
  console.log(file.path, uploadPath);
  return new Promise((resolve) => {
    fs.copyFile(file.path, uploadPath, (err) => {
      if (err) {
        log.error(`Failed to upload file ${originalName}, ${err}`);
      } else {
        resolve({
          originalName,
          uploadName,
        });
      }
    });
  });
};

export const set = async (req, res) => {
  let { uploadName } = req.body;
  const file = req.files.file;

  if (file) {
    // post blob file in web
    const originalName = path.basename(file.name);
    if (!uploadName) {
      uploadName = pathWithRandomSuffix(originalName);
    }
    const uploadPath = `${DataStorage.tmpDir}/${uploadName}`;

    mv(file.path, uploadPath, (err) => {
      if (err) {
        log.error(`Failed to upload file ${originalName}`);
      } else {
        res.send({
          originalName,
          uploadName,
        });
        res.end();
      }
    });
  } else {
    // post file pathname in electron
    const ret = await cpFileToTmp(JSON.parse(req.body.file));
    res.send(ret);
    res.end();
  }
};

export const uploadCaseFile = (req, res) => {
  const { name, casePath } = req.body;
  const originalName = path.basename(name);
  const originalPath = `${DataStorage.userCaseDir}/${casePath}/${originalName}`;
  const uploadName = pathWithRandomSuffix(originalName);
  const uploadPath = `${DataStorage.tmpDir}/${uploadName}`;
  fs.copyFile(originalPath, uploadPath, (err) => {
    if (err) {
      log.error(`Failed to upload file ${originalName}`);
    } else {
      res.send({
        originalName,
        uploadName,
      });
      res.end();
    }
  });
};

export const uploadGcodeFile = (req, res) => {
  const file = req.files.file;
  const port = req.body.port;
  const dataSource = req.body.dataSource || PROTOCOL_TEXT;
  const originalName = path.basename(file.name);
  const uploadName = pathWithRandomSuffix(originalName);
  const uploadPath = `${DataStorage.tmpDir}/${uploadName}`;

  mv(file.path, uploadPath, (err) => {
    if (err) {
      log.error(`Failed to upload file ${originalName}`);
    } else {
      const gcodeHeader = parseGcodeHeader(uploadPath);
      res.send({
        originalName,
        uploadName,
        gcodeHeader,
      });
      res.end();
    }
  });
  const controller = store.get(`controllers["${port}/${dataSource}"]`);
  if (!controller) {
    return;
  }
  controller.command(null, 'gcode:loadfile', uploadPath, (err) => {
    if (err) {
      log.error(`Failed to upload file ${uploadPath}`);
    }
  });
};

export const uploadUpdateFile = (req, res) => {
  const file = req.files.file;
  const port = req.body.port;
  const dataSource = req.body.dataSource || PROTOCOL_TEXT;
  const originalName = path.basename(file.name);
  const uploadName = pathWithRandomSuffix(originalName);
  const uploadPath = `${DataStorage.tmpDir}/${uploadName}`;
  mv(file.path, uploadPath, (err) => {
    if (err) {
      log.error(`Failed to upload file ${originalName}`);
    } else {
      res.send({
        originalName,
        uploadName,
      });
      res.end();
    }
  });
  const controller = store.get(`controllers["${port}/${dataSource}"]`);
  if (!controller) {
    return;
  }
  controller.command(null, 'updatefile', uploadPath, (err) => {
    if (err) {
      log.error(`Failed to upload file ${uploadPath}`);
    }
  });
};

/**
 * remove editor saved environment files
 */
export const removeEnv = async (req, res) => {
  const { headType } = req.body;
  const envDir = `${DataStorage.envDir}/${headType}`;
  rmDir(envDir, false);
  res.send(true);
  res.end();
};

/**
 * save editor enviroment as files, and copy related resource files
 */
export const saveEnv = async (req, res) => {
  const { content } = req.body;
  const config = JSON.parse(content);
  const envDir = `${DataStorage.envDir}/${config.headType}`;
  rmDir(envDir, false);

  const result = await new Promise((resolve, reject) => {
    const targetPath = `${envDir}/config.json`;
    fs.writeFile(targetPath, content, (err) => {
      if (err) {
        log.error(err);
        reject(err);
      } else {
        resolve({
          targetPath,
        });
      }
    });
  });
  config.models.forEach((model) => {
    const { originalName, uploadName } = model;
    fs.existsSync(`${DataStorage.tmpDir}/${originalName}`) &&
      fs.copyFileSync(
        `${DataStorage.tmpDir}/${originalName}`,
        `${envDir}/${originalName}`
      );

    fs.copyFileSync(
      `${DataStorage.tmpDir}/${uploadName}`,
      `${envDir}/${uploadName}`
    );
  });
  if (
    config.defaultMaterialId &&
    /^material.([0-9_]+)$/.test(config.defaultMaterialId)
  ) {
    fs.copyFileSync(
      `${DataStorage.configDir}/${config.defaultMaterialId}.def.json`,
      `${envDir}/${config.defaultMaterialId}`
    );
  }
  if (
    config.defaultQualityId &&
    /^quality.([0-9_]+)$/.test(config.defaultQualityId)
  ) {
    fs.copyFileSync(
      `${DataStorage.configDir}/${config.defaultQualityId}.def.json`,
      `${envDir}/${config.defaultQualityId}`
    );
  }
  res.send(result);
  res.end();
};

/**
 * get environment data from saved file
 */
export const getEnv = async (req, res) => {
  const { headType } = req.body;
  const envDir = `${DataStorage.envDir}/${headType}`;
  const targetPath = `${envDir}/config.json`;
  const exists = fs.existsSync(targetPath);
  if (exists) {
    const content = fs.readFileSync(targetPath).toString();
    res.send({ result: 1, content });
  } else {
    res.send({ result: 0 });
  }
  res.end();
};
/**
 * recover environment saved resource files to tmp dir.
 */
export const recoverEnv = async (req, res) => {
  const { content } = req.body;
  const config = JSON.parse(content);
  const envDir = `${DataStorage.envDir}/${config.headType}`;
  config.models.forEach((model) => {
    const { originalName, uploadName } = model;
    fs.existsSync(`${envDir}/${originalName}`) &&
      fs.copyFileSync(
        `${envDir}/${originalName}`,
        `${DataStorage.tmpDir}/${originalName}`
      );

    fs.copyFileSync(
      `${envDir}/${uploadName}`,
      `${DataStorage.tmpDir}/${uploadName}`
    );
  });
  res.send({ result: 1 });
  res.end();
};

/**
 * package environment to zip file
 */
export const packageEnv = async (req, res) => {
  const tails = {
    '3dp': '.snap3dp',
    laser: '.snaplzr',
    cnc: '.snapcnc',
  };
  const { headType } = req.body;
  const envDir = `${DataStorage.envDir}/${headType}`;
  // const targetPath = `${envDir}/config.json`;
  // const content = fs.readFileSync(targetPath).toString();
  // const config = JSON.parse(content);

  const targetFile = `${uuid.v4().substring(0, 8)}${tails[headType]}`;
  await zipFolder(envDir, `../../Tmp/${targetFile}`);
  // config.models.forEach((model) => {
  //     const { originalName, uploadName } = model;
  //     fs.existsSync(`${DataStorage.tmpDir}/${originalName}`)
  //      && fs.copyFileSync(`${DataStorage.tmpDir}/${originalName}`, `${envDir}/${originalName}`);

  //     fs.copyFileSync(`${DataStorage.tmpDir}/${uploadName}`, `${envDir}/${uploadName}`);
  // });

  res.send({ targetFile });
  res.end();
};

export const uploadFileToTmp = (req, res) => {
  const { name, casePath } = req.body;
  const originalName = path.basename(name);
  const originalPath = `${DataStorage.userCaseDir}/${casePath}/${originalName}`;
  const uploadName = pathWithRandomSuffix(originalName);
  const uploadPath = `${DataStorage.tmpDir}/${uploadName}`;
  fs.copyFile(originalPath, uploadPath, (err) => {
    if (err) {
      log.error(`Failed to upload file ${originalName}`);
    } else {
      res.send({
        originalName,
        uploadName,
      });
      res.end();
    }
  });
};

export const recoverProjectFile = async (req, res) => {
  console.log(req.body, req.files);
  const file = req.files.file || JSON.parse(req.body.file);
  const { uploadName } = await cpFileToTmp(file);
  console.log(uploadName);

  await unzipFile(`${uploadName}`, `${DataStorage.tmpDir}`);

  let content = fs.readFileSync(`${DataStorage.tmpDir}/config.json`);
  content = content.toString();

  const config = JSON.parse(content);
  if (
    config.defaultMaterialId &&
    /^material.([0-9_]+)$/.test(config.defaultMaterialId)
  ) {
    fs.copyFileSync(
      `${DataStorage.tmpDir}/${config.defaultMaterialId}`,
      `${DataStorage.configDir}/${config.defaultMaterialId}.def.json`
    );
  }
  if (
    config.defaultQualityId &&
    /^quality.([0-9_]+)$/.test(config.defaultQualityId)
  ) {
    fs.copyFileSync(
      `${DataStorage.tmpDir}/${config.defaultQualityId}`,
      `${DataStorage.configDir}/${config.defaultQualityId}.def.json`
    );
  }

  res.send({ content });
  res.end();
};
