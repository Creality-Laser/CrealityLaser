import ffi from 'ffi-napi';
import ref from 'ref-napi';

import { genImgPathRef, genGcorePathRef, GCoreConfig } from './types';
import getDllFilePath from './utils/getDllFilePath';

/**
 * GcoreConfig type definition
 * @typedef {Object} GcoreConfig
 * @property {Object} offset - 雕刻位置(图像左下角): (x, y) unit: mm
 * @property {number} density - 雕刻密度： 大于0  (0 或 或有效范围之外： 机型默认）
 * @property {number} power_rate - 雕刻功率： 0 - 100 (0 或 超出范围之外： 机型默认)
 * @property {number} speed_rate - 雕刻深度： 0 - 100 (0 或 超出范围之外： 机型默认）
 * @property {number} model - 机器类型: CV_10:0, CV_10_PRO:1, CV_20:2, CV_30:3
 * @property {number} start - 从图像的那个角点开始雕刻：TopLeft：0, TopRight:1, BottomLeft:2, BottomRight:3
 * @property {number} dire - 雕刻路径和方式 StraightRight:0, StraightLeft:1, DiagonalRight:2, DiagonalLeft:3
 * @property {number }gco_style - gCode风格：DefaultStyle = 0, GRBLStyle = 1, MarlinStyle = 2
 * @property {number} total_num - 雕刻次数:0 - 1000
 * @property {number} jog_speed - // 空走速度（G0）
 * @property {number} work_speed - // 工作速度（G1）
 */

/**
 * generate Gcore file
 * @param {string} imgPath - the img path
 * @param {string} generatedGcorePath - the generated gcore path
 * @param {*} gcoreConfig
 * @param {boolean} isGenGcode - if true, will generate a gcode file
 * @returns
 */
export default async function genGcore(
  imgPath = '',
  generatedGcorePath = '',
  gcoreConfig = {},
  isGenGcode = false
) {
  try {
    const {
      offset = { x: 0, y: 0 },
      density = 7,
      power_rate = 100,
      speed_rate = 50,
      model = 1,
      start = 1,
      dire = 1,
      gco_style = 1,
      total_num = 1,
      jog_speed = 2000,
      work_speed = 800,
    } = gcoreConfig;

    const dllPath = getDllFilePath('gcore_full');
    if (!dllPath) {
      return 'err';
    }

    const libm = ffi.Library(dllPath, {
      // success: 0, error: others
      gcore_generate: [
        ref.types.char,
        ['char *', 'char *', ref.refType(GCoreConfig)],
      ],
      gcore_image_to_gcode: [
        ref.types.char,
        [ref.refType(GCoreConfig), 'char *', 'char *'],
      ],
    });

    const offsetMagnification = 10000;

    const gCoreConfigRef = new GCoreConfig({
      offset: {
        x: offset.x * offsetMagnification,
        y: offset.y * offsetMagnification,
      },
      density: density * 10,
      power_rate: power_rate * 10,
      speed_rate: speed_rate * 10,
      model,
      start,
      dire,
      gco_style,
      total_num,
      jog_speed,
      work_speed,
    });

    if (isGenGcode) {
      // success: 0, error: others
      const ret = await libm.gcore_image_to_gcode(
        gCoreConfigRef.ref(),
        genImgPathRef(imgPath),
        genGcorePathRef(generatedGcorePath)
      );

      return ret;
    } else {
      // success: 0, error: others
      const ret = await libm.gcore_generate(
        genImgPathRef(imgPath),
        genGcorePathRef(generatedGcorePath),
        gCoreConfigRef.ref()
      );

      return ret;
    }
  } catch (error) {
    console.log(`genGcore error: ${error.message}`);
    return 'err';
  }
}
