import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import DataStorage from '../../../DataStorage';
import { GcodeGenerator } from '../../lib/GcodeGenerator';
import logger from '../../lib/logger';
import { pathWithRandomSuffix } from '../../../shared/lib/random-utils';

const log = logger('service:TaskManager');

const addHeaderToFile = (
  header,
  name,
  tmpFilePath,
  filePath,
  thumbnail,
  //runBorderGcode,
  estimatedTime,
  fileTotalLines,
  gcodeStyle
) => {
  const useG92 = 'G92 X0 Y0 Z0\n';
  const useG90 = 'G90 (use absolute coordinates)\n';

  return new Promise((resolve, reject) => {
    const rs = fs.createReadStream(tmpFilePath, 'utf-8');
    const ws = fs.createWriteStream(filePath, 'utf-8');
    //  The event indicates that no more events will be emitted, and no further computation will occur.
    rs.on('close', () => {
      fs.unlinkSync(tmpFilePath);
    });
    rs.on('open', () => {
      ws.write(header);
      if (gcodeStyle === 'marlin') {
        ws.write(useG92);
      }
      ws.write(useG90);
      //ws.write(runBorderGcode);
      rs.pipe(ws);
    });
    rs.on('error', (err) => {
      ws.end();
      log.error(err);
      reject(err);
    });
    ws.on('error', (err) => {
      ws.end();
      log.error(err);
      reject(err);
    });
    ws.on('close', () => {
      resolve({
        gcodeFile: {
          name,
          uploadName: name,
          size: ws.bytesWritten,
          lastModifiedDate: new Date().getTime(),
          thumbnail,
          printTime: estimatedTime,
          lines: fileTotalLines,
        },
      });
    });
  });
};

export const generateGcode = (modelInfos, onProgress) => {
  if (!modelInfos && !_.isArray(modelInfos) && modelInfos.length === 0) {
    return Promise.reject(new Error('modelInfo is empty.'));
  }

  const { headType } = modelInfos[0];
  if (!_.includes(['laser', 'cnc'], headType)) {
    return Promise.reject(new Error(`Unsupported type: ${headType}`));
  }

  // const suffix = headType === 'laser' ? '.nc' : '.cnc';
  const suffix = '.gcode';

  let fileTotalLines = 0;
  let estimatedTime = 0;

  let boundingBox = null;

  const { uploadName } = modelInfos[0];
  const outputFilename =
    pathWithRandomSuffix(path.parse(uploadName).name) + suffix;
  const outputFilePath = `${DataStorage.tmpDir}/${outputFilename}`;
  const outputFilePathTmp = `${outputFilePath}.tmp`;

  const writeStream = fs.createWriteStream(outputFilePathTmp, 'utf-8');
  const gcodeStyle = modelInfos[0].gcodeConfig.style;

  for (let i = 0; i < modelInfos.length; i++) {
    const modelInfo = modelInfos[i];
    const { toolPathFilename, gcodeConfig, mode } = modelInfo;
    const toolPathFilePath = `${DataStorage.tmpDir}/${toolPathFilename}`;
    const data = fs.readFileSync(toolPathFilePath, 'utf8');
    const toolPathObj = JSON.parse(data);

    const gcodeGenerator = new GcodeGenerator();
    let gcodeLines;
    if (headType === 'laser') {
      if (gcodeConfig.style === 'marlin') {
        gcodeLines = gcodeGenerator.parseAsMarlinLaser(
          toolPathObj,
          gcodeConfig
        );
      } else {
        gcodeLines = gcodeGenerator.parseAsLaser(toolPathObj, gcodeConfig);
      }
    } else {
      gcodeLines = gcodeGenerator.parseAsCNC(toolPathObj, gcodeConfig);
    }

    // const renderMethod =
    //   mode === 'greyscale' && gcodeConfig.movementMode === 'greyscale-dot'
    //     ? 'point'
    //     : 'line';

    // if (i > 0) {
    //   const header =
    //     '\n' +
    //     ';Header Start\n' +
    //     `;renderMethod: ${renderMethod}\n` +
    //     ';Header End' +
    //     '\n';
    //   writeStream.write(header);
    //   fileTotalLines += header.split('\n').length;
    // }
    fileTotalLines += gcodeLines.length;

    writeStream.write(gcodeLines.join('\n'));

    estimatedTime += toolPathObj.estimatedTime;
    if (gcodeConfig.multiPassEnabled) {
      estimatedTime *= gcodeConfig.multiPasses;
    }

    if (boundingBox === null) {
      boundingBox = toolPathObj.boundingBox;
    } else {
      boundingBox.max.x = Math.max(
        boundingBox.max.x,
        toolPathObj.boundingBox.max.x
      );
      boundingBox.max.y = Math.max(
        boundingBox.max.y,
        toolPathObj.boundingBox.max.y
      );
      boundingBox.min.x = Math.min(
        boundingBox.min.x,
        toolPathObj.boundingBox.min.x
      );
      boundingBox.min.y = Math.min(
        boundingBox.min.y,
        toolPathObj.boundingBox.min.y
      );
    }

    onProgress((i + 1) / modelInfos.length);
  }
  if (gcodeStyle === 'marlin') {
    writeStream.write('\nG0 X0 Y0\n');
  } else {
    writeStream.write('\nG28\n');
  }

  const { gcodeConfig, thumbnail, mode } = modelInfos[0];
  const renderMethod =
    mode === 'greyscale' && gcodeConfig.movementMode === 'greyscale-dot'
      ? 'point'
      : 'line';

  const power = gcodeConfig.fixedPowerEnabled ? gcodeConfig.fixedPower : 1000;

  if (boundingBox.min.x < 0) {
    boundingBox.min.x = 0;
  }

  if (boundingBox.min.y < 0) {
    boundingBox.min.y = 0;
  }

  let headerStart =
    ';Header Start\n' +
    // `;header_type: ${headType}\n` +
    // `;thumbnail: ${thumbnail}\n` +
    `;renderMethod: ${renderMethod}\n` +
    ';file_total_lines: fileTotalLines\n' +
    `;estimated_time(s): ${estimatedTime && estimatedTime.toFixed(2)}\n` +
    `;MAXX: ${boundingBox.max.x.toFixed(2)}\n` +
    `;MAXY: ${boundingBox.max.y.toFixed(2)}\n` +
    `;MAXZ: ${boundingBox.max.z.toFixed(2)}\n` +
    `;MINX: ${boundingBox.min.x.toFixed(2)}\n` +
    `;MINY: ${boundingBox.min.y.toFixed(2)}\n` +
    `;MINZ: ${boundingBox.min.z.toFixed(2)}\n` +
    // `;max_x(mm): ${boundingBox.max.x}\n` +
    // `;max_y(mm): ${boundingBox.max.y}\n` +
    // `;max_z(mm): ${boundingBox.max.z}\n` +
    // `;min_x(mm): ${boundingBox.min.x}\n` +
    // `;min_y(mm): ${boundingBox.min.y}\n` +
    // `;min_z(mm): ${boundingBox.min.z}\n` +
    `;work_speed(mm/minute): ${gcodeConfig.workSpeed}\n` +
    `;jog_speed(mm/minute): ${gcodeConfig.jogSpeed}\n` +
    `;power: ${power}\n` +
    ';Header End\n' +
    '\n';
  headerStart = headerStart.replace(/fileTotalLines/g, fileTotalLines);

  //const runBorderGcode = genRunBorderGcode(boundingBox);

  writeStream.end();

  // eslint-disable-next-line no-unused-vars
  return new Promise((resolve, reject) => {
    writeStream.on('close', async () => {
      const res = await addHeaderToFile(
        headerStart,
        outputFilename,
        outputFilePathTmp,
        outputFilePath,
        thumbnail,
        //runBorderGcode,
        estimatedTime,
        fileTotalLines,
        gcodeConfig.style
      );
      resolve(res);
    });
    writeStream.on('error', (err) => {
      reject(err);
    });
  });
};

/**
 * generate RunBorder Gcode
 * @param {Object} modelsBoundingBox - all models boundingbox.
 * @param {Object} modelsBoundingBox.max - The max of the modelsBoundingBox.
 * @param {number} modelsBoundingBox.max.x - The x of the max of the modelsBoundingBox.
 * @param {number} modelsBoundingBox.max.y - The y of the max of the modelsBoundingBox.
 * @param {number} modelsBoundingBox.max.z - The z of the max of the modelsBoundingBox.
 * @param {number} modelsBoundingBox.min - The max of the modelsBoundingBox.
 * @param {number} modelsBoundingBox.min.x - The x of the min of the modelsBoundingBox.
 * @param {number} modelsBoundingBox.min.y - The y of the min of the modelsBoundingBox.
 * @param {number} modelsBoundingBox.min.z - The z of the min of the modelsBoundingBox.
 * @param {number} [repeatTimes=2] - The repeat times of the run boder gcode.
 * @param {number} [G0speed=7200] - The speed of the G0.
 * @param {number} [G1power=5] - The power of the G1.
 **/
function genRunBorderGcode(
  modelsBoundingBox,
  repeatTimes = 2,
  G0speed = 7200,
  G1power = 5
) {
  try {
    const {
      max: { x: xMax, y: yMax },
      min: { x: xMin, y: yMin },
    } = modelsBoundingBox;

    const XYExtremeCoorPoints = getXYExtremeCoorPoints(
      xMax.toFixed(2),
      xMin.toFixed(2),
      yMax.toFixed(2),
      yMin.toFixed(2)
    );

    return getRunBorderGcode(
      XYExtremeCoorPoints,
      repeatTimes,
      G0speed,
      G1power
    );
  } catch (error) {
    log.error(error);
    return '';
  }

  function getXYExtremeCoorPoints(xMax, xMin, yMax, yMin) {
    return [
      [xMin, yMin],
      [xMin, yMax],
      [xMax, yMax],
      [xMax, yMin],
    ];
  }

  function getRunBorderGcode(points, repeat, G0speed, G1power) {
    const [pointA, pointB, pointC, pointD] = points;

    const cycleGcodes = [
      `G1 X${pointB[0]} Y${pointB[1]}`,
      `G1 X${pointC[0]} Y${pointC[1]}`,
      `G1 X${pointD[0]} Y${pointD[1]}`,
      `G1 X${pointA[0]} Y${pointA[1]}`,
    ];

    const header = [
      `G0 F${G0speed}`,
      `G0 X${pointA[0]} Y${pointA[1]}`,
      `M4 S${G1power}`,
    ];
    const footer = ['M0'];

    return [
      ...header,
      ...Array.from({ length: repeat }, () => cycleGcodes).reduce(
        (acc, curr) => [...acc, ...curr],
        []
      ),
      ...footer,
    ]
      .join(`\n`)
      .concat('\n');
  }
}

// G0 F7200
// G0 X-58.214 Y-50.817
// M4 S5
// G1 X-58.214 Y73.933
// G1 X67.036 Y73.933
// G1 X67.036 Y-50.817
// G1 X-58.214 Y-50.817
// G1 X-58.214 Y73.933
// G1 X67.036 Y73.933
// G1 X67.036 Y-50.817
// G1 X-58.214 Y-50.817
// M0
