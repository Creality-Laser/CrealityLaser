import Jimp from 'jimp';
import fs from 'fs';
import path from 'path';
import { pathWithRandomSuffix } from './random-utils';
import { convertRasterToSvg } from './svg-convert';
import DataStorage from '../DataStorage';
import {
  dxfToSvg,
  parseDxf,
  updateDxfBoundingBox,
} from '../../shared/lib/DXFParser/Parser';
import {
  svgInverse,
  svgToString,
} from '../../shared/lib/SVGParser/SvgToString';

function bit(x) {
  // if (x >= 128) {
  //   return 255;
  // } else {
  //   return 0;
  // }
  const step = 60;
  if (x < step) {
    return 0;
  } else if (255 - x <= step) {
    return 255;
  }

  return x - (x % step);
}

function normalize(x) {
  if (x < 0) {
    return 0;
  } else if (x > 255) {
    return 255;
  }
  return Math.round(x);
}

const algorithms = {
  Atkinson: [
    [0, 0, 1 / 8, 1 / 8],
    [1 / 8, 1 / 8, 1 / 8, 0],
    [0, 1 / 8, 0, 0],
  ],
  Burkes: [
    [0, 0, 0, 8 / 32, 4 / 32],
    [2 / 32, 4 / 32, 8 / 32, 4 / 32, 2 / 32],
  ],
  FloydSteinburg: [
    [0, 0, 7 / 16],
    [3 / 16, 5 / 16, 1 / 16],
  ],
  JarvisJudiceNinke: [
    [0, 0, 0, 7 / 48, 5 / 48],
    [3 / 48, 5 / 48, 7 / 48, 5 / 48, 3 / 48],
    [1 / 48, 3 / 48, 5 / 48, 3 / 48, 1 / 48],
  ],
  Sierra2: [
    [0, 0, 0, 4 / 16, 3 / 16],
    [1 / 16, 2 / 16, 3 / 16, 2 / 16, 1 / 16],
  ],
  Sierra3: [
    [0, 0, 0, 5 / 32, 3 / 32],
    [2 / 32, 4 / 32, 5 / 32, 4 / 32, 2 / 32],
    [0, 2 / 32, 3 / 32, 2 / 32, 0],
  ],
  SierraLite: [
    [0, 0, 2 / 4],
    [1 / 4, 1 / 4, 0],
  ],
  Stucki: [
    [0, 0, 0, 8 / 42, 4 / 42],
    [2 / 42, 4 / 42, 8 / 42, 4 / 42, 2 / 42],
    [1 / 42, 2 / 42, 4 / 42, 2 / 42, 1 / 42],
  ],
};

async function processLaserGreyscale(modelInfo) {
  const { uploadName } = modelInfo;
  const { width, height, rotationZ = 0, flip = 0 } = modelInfo.transformation;

  const { invert, contrast, brightness, whiteClip, algorithm } =
    modelInfo.config;
  const { density = 4 } = modelInfo.gcodeConfig || {};

  const outputFilename = pathWithRandomSuffix(uploadName);

  const matrix = algorithms[algorithm];
  const matrixHeight = matrix.length;
  const matrixWidth = matrix[0].length;

  let matrixOffset = 0;
  for (let k = 1; k < matrixWidth; k++) {
    if (matrix[0][k] > 0) {
      matrixOffset = k - 1;
      break;
    }
  }

  const img = await Jimp.read(`${DataStorage.tmpDir}/${uploadName}`);

  img
    .background(0xffffffff)
    .brightness((brightness - 50.0) / 50)
    .quality(100)
    .contrast((contrast - 50.0) / 50)
    .greyscale()
    .flip(!!Math.floor(flip / 2), !!(flip % 2))
    .resize(width * density, height * density)
    .rotate((-rotationZ * 180) / Math.PI)
    .scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, idx) => {
      const data = img.bitmap.data;

      if (data[idx + 3] === 0) {
        data[idx] = 255;
      } else {
        if (invert) {
          data[idx] = 255 - data[idx];
          if (data[idx] < 255 - whiteClip) {
            data[idx] = 0;
          }
        } else {
          if (data[idx] >= whiteClip) {
            data[idx] = 255;
          }
        }
      }
    });

  // serpentine path
  for (let y = 0; y < img.bitmap.height; y++) {
    const reverse = (y & 1) === 1;

    for (
      let x = reverse ? img.bitmap.width - 1 : 0;
      reverse ? x >= 0 : x < img.bitmap.width;
      reverse ? x-- : x++
    ) {
      const index = (y * img.bitmap.width + x) << 2;
      const origin = img.bitmap.data[index];

      img.bitmap.data[index] = bit(origin);
      img.bitmap.data[index + 1] = img.bitmap.data[index];
      img.bitmap.data[index + 2] = img.bitmap.data[index];
      const err = origin - img.bitmap.data[index];

      for (let i = 0; i < matrixWidth; i++) {
        for (let j = 0; j < matrixHeight; j++) {
          if (matrix[j][i] > 0) {
            const x2 = reverse
              ? x - (i - matrixOffset)
              : x + (i - matrixOffset);
            const y2 = y + j;
            if (x2 >= 0 && x2 < img.bitmap.width && y2 < img.bitmap.height) {
              const idx2 =
                index + (x2 - x) * 4 + (y2 - y) * img.bitmap.width * 4;
              img.bitmap.data[idx2] = normalize(
                img.bitmap.data[idx2] + matrix[j][i] * err
              );
            }
          }
        }
      }
    }
  }

  return new Promise((resolve) => {
    img.write(`${DataStorage.tmpDir}/${outputFilename}`, () => {
      resolve({
        filename: outputFilename,
      });
    });
  });
}

async function processLaserGreyscale_new(modelInfo) {
  const { uploadName } = modelInfo;
  const imgPath = getImgPath(uploadName);

  let img = await Jimp.read(imgPath);

  img = await imgPreproccess(img, getImgConfig(modelInfo));

  // because grayscale image preview in threejs texture has bad effect.
  // so generate a preview image.
  const previewImg = img.clone().greyscale();

  img = await grayscaleImg(img);

  const outputFilename = pathWithRandomSuffix(uploadName);

  const previewOutputFilename = `preview_${outputFilename}`;

  await saveImg(previewImg, genOutputImgPath(previewOutputFilename));

  await saveImg(img, genOutputImgPath(outputFilename));

  return {
    filename: outputFilename,
    previewFileName: previewOutputFilename,
  };
}

/**
 * save image
 * @param { Object } img - The instance of the Jimp Object.
 * @param { string } path - The path image should been saved.
 **/
function saveImg(img, path) {
  return new Promise((resolve, reject) => {
    try {
      img.write(path, () => {
        resolve(path);
      });
    } catch (error) {
      reject(new Error(`save image error: ${error.message}`));
    }
  });
}

/**
 * greyscale the image.
 * @param { Object } img - The instance of the Jimp Object.
 * @return { Object } - The instance of the Jimp Object.
 **/
function grayscaleImg(img) {
  const {
    bitmap: { width: img_width, height: img_height },
  } = img;
  const channel_len = 4;

  img.greyscale();

  const data = img.bitmap.data;

  for (let y = 0; y < img_height - 2; y++) {
    for (let x = 0; x < img_width; x++) {
      const index = (x + y * img_width) * channel_len;
      // pixel has been greyscale, so each channel has equal value;
      const currentPixelGrayValue = data[index];
      const extremum = currentPixelGrayValue >= 127 ? 255 : 0;
      const error = Math.floor((currentPixelGrayValue - extremum) / 8);

      // red
      data[index] = extremum;
      // green
      data[index + 1] = extremum;
      // blue
      data[index + 2] = extremum;

      const mixedPixels = [];

      const nextPixel = index + (1 + 0 * img_width) * channel_len;
      mixedPixels.push(nextPixel);
      const nNextPixel = index + (2 + 0 * img_width) * channel_len;
      mixedPixels.push(nNextPixel);
      const nextRowPrevPixel = index + (-1 + 1 * img_width) * channel_len;
      mixedPixels.push(nextRowPrevPixel);
      const nextRowPixel = index + (0 + 1 * img_width) * channel_len;
      mixedPixels.push(nextRowPixel);
      const nextRowNextPixel = index + (1 + 1 * img_width) * channel_len;
      mixedPixels.push(nextRowNextPixel);
      const nNextRowPixel = index + (0 + 2 * img_width) * channel_len;
      mixedPixels.push(nNextRowPixel);

      for (let i = 0; i < mixedPixels.length; ++i) {
        // greyscale has same red, green, blue value;
        data[mixedPixels[i]] = data[mixedPixels[i]] + error;
        data[mixedPixels[i] + 1] = data[mixedPixels[i]] + error;
        data[mixedPixels[i] + 2] = data[mixedPixels[i]] + error;
      }
    }
  }

  return img;
}

/**
 * Preproccess the image
 * @param { Object } img - The instance of the Jimp Object.
 * @param { Object } config - The config object to the img instance
 * @param { Object } - The instance of the Jimp Object.
 */
function imgPreproccess(img, config) {
  const {
    width,
    height,
    rotationZ,
    flip,
    invert,
    contrast,
    brightness,
    // whiteClip,
    // algorithm,
    density,
  } = config;

  img = img
    .background(0xffffffff)
    .quality(100)
    .brightness((brightness - 50.0) / 50)
    .contrast((contrast - 50.0) / 50)
    .flip(!!Math.floor(flip / 2), !!(flip % 2))
    .resize(width * density, height * density)
    .rotate((-rotationZ * 180) / Math.PI);

  if (invert) {
    img = img.invert();
  }

  return img;
}

/**
 * get the image config info.
 * @param { Object } modelInfo - The info of the image.
 * @param { Object } modelInfo.transformation - The transformation of the image.
 * @param { Object } modelInfo.config - The configuration of the image.
 * @param { Object } modelInfo.gcodeConfig - The GcodeConfig of the image.
 * @return { Object } The config of the image.
 **/
function getImgConfig(modelInfo) {
  try {
    const {
      transformation: { width, height, rotationZ = 0, flip = 0 },
      config: { invert, contrast, brightness, whiteClip, algorithm },
      gcodeConfig: { density = 4 } = {},
    } = modelInfo;

    return {
      width,
      height,
      rotationZ,
      flip,
      invert,
      contrast,
      brightness,
      whiteClip,
      algorithm,
      density,
    };
  } catch (error) {
    console.err(`getImgConfig error: ${error}`);
    return {};
  }
}

/**
 * getImgPath by imgName
 * @param { string } imgName - The Name of img
 * @return {string} - The path to the img
 **/
function getImgPath(imgName = '') {
  return `${DataStorage.tmpDir}/${imgName}`;
}

/**
 * generate the output path for the Image.
 * @param { string } imgName - The name of the image
 * @return { string } - The path of the output file
 **/
function genOutputImgPath(imgName) {
  return `${DataStorage.tmpDir}/${imgName}`;
}

async function processCNCGreyscale(modelInfo) {
  const { uploadName } = modelInfo;
  const { width, height, rotationZ = 0, flip = 0 } = modelInfo.transformation;

  const { invert } = modelInfo.config;
  const { density = 4 } = modelInfo.gcodeConfig || {};

  const outputFilename = pathWithRandomSuffix(uploadName);

  const img = await Jimp.read(`${DataStorage.tmpDir}/${uploadName}`);
  if (invert) {
    img.invert();
  }

  img
    .greyscale()
    .flip(!!Math.floor(flip / 2), !!(flip % 2))
    .resize(width * density, height * density)
    .rotate((-rotationZ * 180) / Math.PI)
    .background(0xffffffff);

  return new Promise((resolve) => {
    img.write(`${DataStorage.tmpDir}/${outputFilename}`, () => {
      resolve({
        filename: outputFilename,
      });
    });
  });
}

function processBW(modelInfo) {
  const { uploadName } = modelInfo;
  // rotation: degree and counter-clockwise
  const { width, height, rotationZ = 0, flip = 0 } = modelInfo.transformation;

  const { invert, bwThreshold } = modelInfo.config;
  const { density = 4 } = modelInfo.gcodeConfig || {};

  const outputFilename = pathWithRandomSuffix(uploadName);
  return Jimp.read(`${DataStorage.tmpDir}/${uploadName}`).then(
    (img) =>
      new Promise((resolve) => {
        img
          .greyscale()
          .flip(!!Math.floor(flip / 2), !!(flip % 2))
          .resize(width * density, height * density)
          .rotate((-rotationZ * 180) / Math.PI) // rotate: unit is degree and clockwise
          .scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, idx) => {
            if (img.bitmap.data[idx + 3] === 0) {
              // transparent
              for (let k = 0; k < 3; ++k) {
                img.bitmap.data[idx + k] = 255;
              }
            } else {
              const value = img.bitmap.data[idx];
              if (invert) {
                if (value <= bwThreshold) {
                  for (let k = 0; k < 3; ++k) {
                    img.bitmap.data[idx + k] = 255;
                  }
                } else {
                  for (let k = 0; k < 3; ++k) {
                    img.bitmap.data[idx + k] = 0;
                  }
                }
              } else {
                if (value <= bwThreshold) {
                  for (let k = 0; k < 3; ++k) {
                    img.bitmap.data[idx + k] = 0;
                  }
                } else {
                  for (let k = 0; k < 3; ++k) {
                    img.bitmap.data[idx + k] = 255;
                  }
                }
              }
            }
          })
          .background(0xffffffff)
          .write(`${DataStorage.tmpDir}/${outputFilename}`, () => {
            resolve({
              filename: outputFilename,
            });
          });
      })
  );
}

function processVector(modelInfo) {
  // options: { filename, vectorThreshold, invert, turdSize }
  const { vectorThreshold, invert, turdSize } = modelInfo.config;
  const { flip = 0 } = modelInfo.transformation;
  const options = {
    uploadName: modelInfo.uploadName,
    vectorThreshold,
    invert,
    turdSize,
    flip,
  };
  return convertRasterToSvg(options);
}

function processDxf(modelInfo) {
  return new Promise(async (resolve) => {
    const { uploadName } = modelInfo;

    let outputFilename = pathWithRandomSuffix(uploadName);
    outputFilename = `${path.basename(outputFilename, '.dxf')}.svg`;

    const result = await parseDxf(`${DataStorage.tmpDir}/${uploadName}`);
    const svg = dxfToSvg(result.svg);
    updateDxfBoundingBox(svg);
    svgInverse(svg, 2);

    fs.writeFile(
      `${DataStorage.tmpDir}/${outputFilename}`,
      svgToString(svg),
      'utf8',
      () => {
        resolve({
          filename: outputFilename,
        });
      }
    );
  });
}

function process(modelInfo) {
  const { headType, sourceType, mode } = modelInfo;
  if (sourceType === 'raster') {
    if (mode === 'greyscale') {
      if (headType === 'laser') {
        // return processLaserGreyscale_new(modelInfo);
        return processLaserGreyscale(modelInfo);
      } else {
        return processCNCGreyscale(modelInfo);
      }
    } else if (mode === 'bw') {
      return processBW(modelInfo);
    } else if (mode === 'vector') {
      return processVector(modelInfo);
    } else {
      return Promise.resolve({
        filename: '',
      });
    }
  } else if (sourceType === 'dxf') {
    return processDxf(modelInfo);
  } else {
    return Promise.resolve({
      filename: '',
    });
  }
}

export default process;
