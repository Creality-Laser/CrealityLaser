import path from 'path';
import os from 'os';
import fs from 'fs';
import { app } from 'electron';

export const getAssetPath = (...paths) => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../../../../assets');

  return path.join(RESOURCES_PATH, ...paths);
};

/**
 * get dll file path
 * @param {string} dllName - dll file's name, not need ".dll" suffix
 * @returns string | boolean
 */
export default function getDllFilePath(dllName = '') {
  const platform = os.platform();
  const arch = os.arch();

  const dllPath = getAssetPath(`dll/${platform}_${arch}/${dllName}`);

  const isDllExists = fs.existsSync(`${dllPath}.dll`);

  if (!isDllExists) {
    return false;
  }

  return dllPath;
}
