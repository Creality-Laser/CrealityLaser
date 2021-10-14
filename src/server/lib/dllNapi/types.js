import ref from 'ref-napi';
import { genStrRef, genStruct } from './utils/genTypes';

export const genImgPathRef = (imgPathStr = '') => genStrRef(imgPathStr);

export const genGcorePathRef = (gcorePathStr = '') => genStrRef(gcorePathStr);

// 雕刻位置(图像左上角): (x, y) unit: mm
export const GcoPoint = genStruct({
  x: ref.types.float,
  y: ref.types.float,
});

export const GCoreConfig = genStruct({
  offset: GcoPoint,
  density: ref.types.float, // 雕刻密度： 大于0  (0 或 或有效范围之外： 机型默认）
  power_rate: ref.types.float, // 雕刻功率： 0 - 100 (0 或 超出范围之外： 机型默认)
  speed_rate: ref.types.float, // 雕刻深度： 0 - 100 (0 或 超出范围之外： 机型默认）
  total_num: ref.types.uint16, // 雕刻次数:0 - 1000
  model: ref.types.char, // 机器类型: CV_10:0, CV_10_PRO:1, CV_20:2, CV_30:3
  start: ref.types.char, // 从图像的那个角点开始雕刻：TopLeft：0, TopRight:1, BottomLeft:2, BottomRight:3
  dire: ref.types.char, // 雕刻路径和方式 StraightRight:0, StraightLeft:1, DiagonalRight:2, DiagonalLeft:3
});
