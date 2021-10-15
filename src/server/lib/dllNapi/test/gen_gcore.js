import { app } from 'electron';

import genGcore from '../gen_gcore';
import { getAssetPath } from '../utils/getDllFilePath';

export default async function genGcoreTest() {
  const imgPath = getAssetPath('img-vertical.png');
  const gcorePath = `${app.getPath('userData')}/gcore_new.gcore`;
  const genGcoreResult = await genGcore(imgPath, gcorePath);
  console.log(`get gen gcore result: ${genGcoreResult}`);
}
