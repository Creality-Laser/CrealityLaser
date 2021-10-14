import path from 'path';
import { app } from 'electron';
import ffi from 'ffi-napi';
import ref from 'ref-napi';
import struct from 'ref-struct-napi';
import RefArray from 'ref-array-napi';
import iconv from 'iconv-lite';

const getAssetPath = (...paths: string[]): string => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../assets');

  return path.join(RESOURCES_PATH, ...paths);
};

export default async function genGcore() {
  try {
    const GcoPoint = struct({
      x: ref.types.float,
      y: ref.types.float,
    });

    const GCoreConfig = struct({
      offset: GcoPoint,
      density: ref.types.float,
      power_rate: ref.types.float,
      speed_rate: ref.types.float,
      total_num: ref.types.uint16,
      model: ref.types.char,
      start: ref.types.char,
      dire: ref.types.char,
    });

    const libm = ffi.Library(getAssetPath('dll/win32_x64/gcore_gen'), {
      gcore_generate: [
        ref.types.char,
        ['char *', 'char *', ref.refType(GCoreConfig)],
      ],
    });

    const test = new GCoreConfig({
      model: 1,
      start: 0,
      dire: 0,
      total_num: 1,
      offset: {
        x: 10.0,
        y: 10.0,
      },
      density: 2,

      power_rate: 1.0,
      speed_rate: 0.3,
    });

    const CString1024 = RefArray(ref.types.char, 1024);
    const image_path = new CString1024();
    const gcore_path = new CString1024();
    const uCstr = iconv.encode(getAssetPath('img-vertical.png'), 'gbk');
    for (let i = 0; i < uCstr.length; i++) {
      image_path[i] = uCstr.readInt8(i);
    }
    const uCstrr = iconv.encode('test.gcore', 'gbk');
    for (let i = 0; i < uCstrr.length; i++) {
      gcore_path[i] = uCstrr.readInt8(i);
    }

    const ret = libm.gcore_generate(
      image_path.buffer,
      gcore_path.buffer,
      test.ref()
    );
    return 'ok';
  } catch (error) {
    console.log(error);
    return 'err';
  }
}
