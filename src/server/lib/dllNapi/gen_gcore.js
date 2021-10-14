import ffi from 'ffi-napi';
import ref from 'ref-napi';

import { genImgPathRef, genGcorePathRef, GCoreConfig } from './types';
import getDllFilePath from './utils/getDllFilePath';

/**
 * GcoreConfig type definition
 * @typedef {Object} GcoreConfig
 * @property {number} model - 机器类型: CV_10:0, CV_10_PRO:1, CV_20:2, CV_30:3
 * @property {number} start - 从图像的那个角点开始雕刻：TopLeft：0, TopRight:1, BottomLeft:2, BottomRight:3
 * @property {number} dire - 雕刻路径和方式 StraightRight:0, StraightLeft:1, DiagonalRight:2, DiagonalLeft:3
 * @property {number} total_num - 雕刻次数:0 - 1000
 * @property {Object} offset - 雕刻位置(图像左上角): (x, y) unit: mm
 * @property {number} density - 雕刻密度： 大于0  (0 或 或有效范围之外： 机型默认）
 * @property {number} power_rate - 雕刻功率： 0 - 100 (0 或 超出范围之外： 机型默认)
 * @property {number} speed_rate - 雕刻深度： 0 - 100 (0 或 超出范围之外： 机型默认）
 */

/**
 * generate Gcore file
 * @param {string} imgPath - the img path
 * @param {string} generatedGcorePath - the generated gcore path
 * @param {*} gcoreConfig
 * @returns
 */
export default async function genGcore(
  imgPath = '',
  generatedGcorePath = '',
  gcoreConfig = {}
) {
  try {
    const {
      model = 1,
      start = 2,
      dire = 0,
      total_num = 1,
      offset = { x: 0, y: 0 },
      density = 2,
      power_rate = 100,
      speed_rate = 50,
    } = gcoreConfig;

    const dllPath = getDllFilePath('gcore_gen');
    if (!dllPath) {
      return 'err';
    }
    const libm = ffi.Library(dllPath, {
      // success: 0, error: others
      gcore_generate: [
        ref.types.char,
        ['char *', 'char *', ref.refType(GCoreConfig)],
      ],
    });

    const gCoreConfig = new GCoreConfig({
      model,
      start,
      dire,
      total_num,
      offset,
      density,
      power_rate,
      speed_rate,
    });

    // success: 0, error: others
    const ret = await libm.gcore_generate(
      genImgPathRef(imgPath),
      genGcorePathRef(generatedGcorePath),
      gCoreConfig.ref()
    );

    return ret;
  } catch (error) {
    console.log(`genGcore error: ${error.message}`);
    return 'err';
  }
}
