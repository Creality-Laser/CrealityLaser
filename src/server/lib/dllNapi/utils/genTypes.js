import ref from 'ref-napi';
import RefArray from 'ref-array-napi';
import struct from 'ref-struct-napi';
import iconv from 'iconv-lite';

/**
 * generate String references
 * @param {string} str - the string to convert to string ref.
 * @param {number} strLen - The length of the string.
 * @param {string} strEncoding - The encoding of the string.
 * @returns Buffer
 */
export function genStrRef(str = '', strLen = 1024, strEncoding = 'gbk') {
  const CString1024 = RefArray(ref.types.char, strLen);
  const image_path = new CString1024();
  const uCstr = iconv.encode(str, strEncoding);
  for (let i = 0; i < uCstr.length; i++) {
    image_path[i] = uCstr.readInt8(i);
  }
  return image_path.buffer;
}

export function genStruct(obj = {}) {
  return struct(obj);
}
