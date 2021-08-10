import { remote } from 'electron';
import path from 'path';

const app = remote.app;

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../assets');

const getAssetPath = (...paths) => {
  return path.join(RESOURCES_PATH, ...paths);
};

export default getAssetPath;
