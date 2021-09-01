import Jimp from 'jimp';
import EventEmitter from 'events';
import SVGParser, {
  flip,
  rotate,
  scale,
  sortShapes,
  translate,
} from '../../../shared/lib/SVGParser';
import GcodeParser from './GcodeParser';
import Normalizer from './Normalizer';
import { svgToSegments } from './SVGFill';
import {
  parseDxf,
  dxfToSvg,
  updateDxfBoundingBox,
} from '../../../shared/lib/DXFParser/Parser';

function pointEqual(p1, p2) {
  return p1[0] === p2[0] && p1[1] === p2[1];
}

class LaserToolPathGenerator extends EventEmitter {
  getGcodeHeader() {
    const date = new Date();
    return [
      '; G-code for laser engraving',
      '; Generated by CVLaser',
      `; ${date.toDateString()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
      '\n',
    ];
  }

  /**
   * gen RunBorder Gcode by Path Gcode.
   * @param {string[]} pathGcode the path gcode.
   * @param {number} [repeat=2] RunBorder Gcode should repeat how many times.
   * @returns {string[]}
   **/
  genRunBorder(pathGcode, repeat = 2) {
    const isNoPathGcode =
      !pathGcode || (Array.isArray(pathGcode) && pathGcode.length === 0);
    if (isNoPathGcode) {
      return [];
    }

    const [xMax, xMin, yMax, yMin] = getPathCodeBorderBoxingInfo(pathGcode);

    const XYExtremeCoorPoints = getXYExtremeCoorPoints(xMax, xMin, yMax, yMin);

    return getRunBorderGcode(XYExtremeCoorPoints, repeat);

    function getPathCodeBorderBoxingInfo(pathGcode) {
      let xMax = Number.MIN_VALUE;
      let xMin = Number.MAX_VALUE;
      let yMax = Number.MIN_VALUE;
      let yMin = Number.MAX_VALUE;

      pathGcode.forEach((gcodeLine) => {
        const [XVals, YVals] = parseGcodeLineXY(gcodeLine);
        if (XVals) {
          XVals.forEach((x) => {
            if (xMax < x) {
              xMax = x;
            }
            if (x < xMin) {
              xMin = x;
            }
          });
        }

        if (YVals) {
          YVals.forEach((y) => {
            if (yMax < y) {
              yMax = y;
            }
            if (y < yMin) {
              yMin = y;
            }
          });
        }
      });

      return [xMax, xMin, yMax, yMin];

      function parseGcodeLineXY(gcodeLine = '') {
        const regX = /[x|X][ ]*(-?[\d*|\d*.\d*])*/g;
        const regY = /[y|Y][ ]*(-?[\d*|\d*.\d*])*/g;
        const XVals = parseCoorValue(gcodeLine, regX);
        const YVals = parseCoorValue(gcodeLine, regY);
        return [XVals, YVals];
      }

      function parseCoorValue(gcodeLine = '', regX = new RegExp()) {
        let found = gcodeLine.match(regX);
        if (!found) {
          return null;
        }
        if (found) {
          // 'x2.3' -> Number(2.3)
          found = found.map((c) => Number(c.substr(1)));
        }
        return found;
      }
    }

    function getXYExtremeCoorPoints(xMax, xMin, yMax, yMin) {
      return [
        [xMin, yMin],
        [xMin, yMax],
        [xMax, yMax],
        [xMax, yMin],
      ];
    }

    function getRunBorderGcode(points, repeat) {
      const [pointA, pointB, pointC, pointD] = points;

      const cycleGcodes = [
        `G1 X${pointB[0]} Y${pointB[1]}`,
        `G1 X${pointC[0]} Y${pointC[1]}`,
        `G1 X${pointD[0]} Y${pointD[1]}`,
        `G1 X${pointA[0]} Y${pointA[1]}`,
      ];

      const header = ['G0 F7200', `G0 X${pointA[0]} Y${pointA[1]}`, 'M4 S5'];
      const footer = ['M0'];

      return [
        ...header,
        ...Array.from({ length: repeat }, () => cycleGcodes).reduce(
          (acc, curr) => [...acc, ...curr],
          []
        ),
        ...footer,
      ];
    }
  }

  async generateToolPathObj(modelInfo, modelPath) {
    const { mode, gcodeConfig, sourceType, transformation } = modelInfo;
    const { movementMode, appendMode } = gcodeConfig;

    // let fakeGcodes = this.getGcodeHeader();

    let fakeGcodes = [];

    // fakeGcodes = fakeGcodes.concat(this.genRunBorder(transformation));

    // fakeGcodes.push('G90');
    // fakeGcodes.push('G21');
    let workingGcode = '';

    if (
      mode === 'bw' ||
      (mode === 'greyscale' &&
        movementMode === 'greyscale-line' &&
        appendMode !== 'lineToLine')
    ) {
      workingGcode = await this.generateGcodeBW(modelInfo, modelPath);
    } else if (
      mode === 'greyscale' &&
      movementMode === 'greyscale-dot' &&
      appendMode !== 'lineToLine'
    ) {
      workingGcode = await this.generateGcodeGreyscale_origin(
        modelInfo,
        modelPath
      );
      // workingGcode = await this.generateGcodeGreyscale(modelInfo, modelPath);
    } else if (appendMode === 'lineToLine') {
      workingGcode = await this.generateGcodeGreyscale_new(
        modelInfo,
        modelPath
      );
    } else if (mode === 'vector' && sourceType === 'dxf') {
      workingGcode = await this.generateGcodeDxf(modelInfo, modelPath);
    } else if (mode === 'vector' || mode === 'trace') {
      workingGcode = await this.generateGcodeVector(modelInfo, modelPath);
    } else {
      return Promise.reject(new Error(`Unsupported process mode: ${mode}`));
    }

    // fakeGcodes.push('; G-code START <<<');
    // fakeGcodes.push('M106 P0 S255');

    // gen runBorder Gcode
    // fakeGcodes = fakeGcodes.concat(this.genRunBorder(workingGcode));

    fakeGcodes = fakeGcodes.concat(workingGcode);

    fakeGcodes.push('G28');
    // fakeGcodes.push('M107 P0');
    // fakeGcodes.push('; G-code END <<<');

    const toolPathObject = new GcodeParser().parseGcodeToToolPathObj(
      fakeGcodes,
      modelInfo
    );
    return toolPathObject;
  }

  async generateGcodeGreyscale_new(modelInfo, modelPath) {
    const { gcodeConfigPlaceholder, gcodeConfig } = modelInfo;
    const { fixedPowerEnabled, fixedPower } = gcodeConfig;
    const { workSpeed } = gcodeConfigPlaceholder;

    const powerMin = 0;
    const powerMax = fixedPowerEnabled ? fixedPower : 100;

    const img = await Jimp.read(modelPath);
    img.mirror(false, true);

    const width = img.bitmap.width;
    const height = img.bitmap.height;

    const normalizer = new Normalizer('Center', 0, width, 0, height, {
      x: 1 / gcodeConfig.density,
      y: 1 / gcodeConfig.density,
    });

    let progress = 0;
    const content = [];

    content.push(`G1 F${workSpeed}`);
    content.push(`M4 S0`);

    let isNewRow = false;
    let power;
    let lastPower = -1;

    for (let j = height - 1; j >= 0; j--) {
      // promise first row must not reverse.
      const isReverse = (height - j) % 2 === 0;
      isNewRow = true;

      for (
        let i = isReverse ? width - 1 : 0;
        isReverse ? i >= 0 : i < width;
        isReverse ? i-- : i++
      ) {
        const idx = i * 4 + j * width * 4;
        power = grayToPower(img.bitmap.data[idx], powerMin, powerMax);

        if (isNewRow) {
          content.push(`G0 X${normalizer.x(i)} Y${normalizer.y(j)} S0`);
          content.push(`G1 X${normalizer.x(i)} S${power}`);
          isNewRow = false;
        } else {
          if (i === 0 || i === width - 1 || power !== lastPower) {
            content.push(`X${normalizer.x(i)} S${power}`);
          }
        }
        lastPower = power;
      }

      content.push('S0');

      const p = j / height;
      if (p - progress > 0.05) {
        progress = p;
        this.emit('progress', progress);
      }
    }

    content.push('M5');
    content.push('G0 X0 Y0 Z0');

    return content;

    function grayToPower(gray, powerMin, powerMax) {
      if (typeof gray !== 'number') {
        gray = 0;
      }
      return Math.floor(((255 - gray) / 255) * (powerMax - powerMin) * 10);
    }
  }

  async generateGcodeGreyscale_origin(modelInfo, modelPath) {
    const { gcodeConfigPlaceholder, config, gcodeConfig } = modelInfo;
    const { fixedPower, dwellTime, direction = 'Horizontal' } = gcodeConfig;
    const { workSpeed } = gcodeConfigPlaceholder;
    const { bwThreshold } = config;

    const img = await Jimp.read(modelPath);
    img.mirror(false, true);

    const width = img.bitmap.width;
    const height = img.bitmap.height;

    const normalizer = new Normalizer('Center', 0, width, 0, height, {
      x: 1 / gcodeConfig.density,
      y: 1 / gcodeConfig.density,
    });

    let progress = 0;

    let firstTurnOn = true;
    function turnOnLaser() {
      if (firstTurnOn) {
        firstTurnOn = false;
        const powerStrength = Math.floor((fixedPower * 1000) / 100);
        return `M3 S${powerStrength}`;
      }
      return 'M3';
    }

    const content = [];
    content.push(`G1 F${workSpeed}`);
    const dTime = dwellTime / 1000;

    if (direction === 'Horizontal') {
      for (let j = height - 1; j >= 0; j--) {
        // promise first row must not reverse.
        const isReverse = (height - j) % 2 === 0;
        for (
          let i = isReverse ? width : 0;
          isReverse ? i >= 0 : i < width;
          isReverse ? i-- : i++
        ) {
          const idx = i * 4 + j * width * 4;

          if (img.bitmap.data[idx] < bwThreshold) {
            content.push(`G1 X${normalizer.x(i)} Y${normalizer.y(j)}`);
            content.push(turnOnLaser());
            content.push(`G4 P${dTime}`);
            content.push('M05');
          }
        }

        const p = j / height;
        if (p - progress > 0.05) {
          progress = p;
          this.emit('progress', progress);
        }
      }
    } else if (direction === 'Vertical') {
      for (let i = 0; i < width; ++i) {
        const isReverse = (i + 1) % 2 === 0;
        for (
          let j = isReverse ? height : 0;
          isReverse ? j >= 0 : j < height;
          isReverse ? j-- : j++
        ) {
          const idx = j * width * 4 + i * 4;
          if (img.bitmap.data[idx] < bwThreshold) {
            content.push(`G1 X${normalizer.x(i)} Y${normalizer.y(j)}`);
            content.push(turnOnLaser());
            content.push(`G4 P${dTime}`);
            content.push('M05');
          }
        }
        const p = i / width;
        if (p - progress > 0.05) {
          progress = p;
          this.emit('progress', progress);
        }
      }
    }

    content.push('G0 X0 Y0');

    return content;
  }

  async generateGcodeGreyscale(modelInfo, modelPath) {
    const { gcodeConfigPlaceholder, config, gcodeConfig } = modelInfo;
    const { fixedPowerEnabled, fixedPower } = gcodeConfig;
    const { workSpeed, dwellTime, jogSpeed = 3000 } = gcodeConfigPlaceholder;
    const { bwThreshold } = config;

    function bitEqual(a, b) {
      return (
        (a <= bwThreshold && b <= bwThreshold) ||
        (a > bwThreshold && b > bwThreshold)
      );
    }

    function extractSegment(data, start, box, direction, sign) {
      let len = 1;

      function idx(pos) {
        return pos.x * 4 + pos.y * box.width * 4;
      }

      for (;;) {
        const cur = {
          x: start.x + direction.x * len * sign,
          y: start.y + direction.y * len * sign,
        };
        if (
          !bitEqual(data[idx(cur)], data[idx(start)]) ||
          cur.x < 0 ||
          cur.x >= box.width ||
          cur.y < 0 ||
          cur.y >= box.height
        ) {
          break;
        }
        len += 2;
      }
      return len;
    }

    // let firstTurnOn = true;
    function turnOnLaser(currentPower) {
      // if (firstTurnOn && fixedPowerEnabled) {
      //   firstTurnOn = false;
      const powerStrength = Math.floor(
        ((fixedPowerEnabled ? fixedPower : 100) * (255 - currentPower)) / 100
      );
      //   return `M3 P${fixedPower} S${powerStrength}`;
      // }
      return `M4 S${powerStrength}`;
    }

    function genMovement(
      normalizer,
      start,
      end,
      currentPointLayer = 0,
      currentPower
    ) {
      const currentPointLayerZ = (currentPointLayer * 0.001).toFixed(3);

      return [
        `G0 F${jogSpeed}`,
        `G0 X${normalizer.x(start.x)} Y${normalizer.y(
          start.y
        )}} Z${currentPointLayerZ}`,
        turnOnLaser(currentPower),
        `G1 F${workSpeed}`,
        `G1 X${normalizer.x(end.x)} Y${normalizer.y(
          end.y
        )} Z${currentPointLayerZ}`,
        'M5',
      ];
    }

    const img = await Jimp.read(modelPath);
    img.mirror(false, true);

    const width = img.bitmap.width;
    const height = img.bitmap.height;

    const normalizer = new Normalizer('Center', 0, width, 0, height, {
      x: 1 / gcodeConfig.density,
      y: 1 / gcodeConfig.density,
    });

    let progress = 0;

    const content = [];
    content.push(`G1 F${workSpeed}`);

    const direction = {
      x: 1,
      y: 0,
    };

    for (let i = 0; i < width; ++i) {
      let len = 0;
      const isReverse = i % 2 === 0;
      const sign = isReverse ? -1 : 1;
      for (
        let j = isReverse ? height : 0;
        isReverse ? j >= 0 : j < height;
        isReverse ? j-- : j++
      ) {
        const idx = j * width * 4 + i * 4;
        // 255 白色， 0 黑色
        if (img.bitmap.data[idx] < bwThreshold) {
          // content.push(`G1 X${normalizer.x(i)} Y${normalizer.y(j)}`);
          // content.push(turnOnLaser());
          // content.push(`G4 P${dwellTime}`);
          // content.push('M05');
          const start = {
            x: i,
            y: j,
          };
          len = extractSegment(
            img.bitmap.data,
            start,
            img.bitmap,
            direction,
            sign
          );
          const end = {
            x: start.x + direction.x * len * sign,
            y: start.y + direction.y * len * sign,
          };
          content.push(
            ...genMovement(normalizer, start, end, j, img.bitmap.data[idx])
          );
        } else {
          len = 1;
        }
      }
      const p = i / width;
      if (p - progress > 0.05) {
        progress = p;
        this.emit('progress', progress);
      }
    }
    // content.push('G0 X0 Y0');

    return content;
  }

  async generateGcodeBW(modelInfo, modelPath) {
    const { gcodeConfigPlaceholder, config, gcodeConfig } = modelInfo;
    const { fixedPowerEnabled, fixedPower } = gcodeConfig;
    const { workSpeed, jogSpeed } = gcodeConfigPlaceholder;
    const { bwThreshold } = config;

    function bitEqual(a, b) {
      return (
        (a <= bwThreshold && b <= bwThreshold) ||
        (a > bwThreshold && b > bwThreshold)
      );
    }

    function extractSegment(data, start, box, direction, sign) {
      let len = 1;

      function idx(pos) {
        return pos.x * 4 + pos.y * box.width * 4;
      }

      for (;;) {
        const cur = {
          x: start.x + direction.x * len * sign,
          y: start.y + direction.y * len * sign,
        };
        if (
          !bitEqual(data[idx(cur)], data[idx(start)]) ||
          cur.x < 0 ||
          cur.x >= box.width ||
          cur.y < 0 ||
          cur.y >= box.height
        ) {
          break;
        }
        len += 1;
      }
      return len;
    }

    const powerStrength = Math.floor(
      ((fixedPowerEnabled ? fixedPower : 100) * 1000) / 100
    );

    function genMovement(normalizer, start, end) {
      return [
        `G0 X${normalizer.x(start.x)} Y${normalizer.y(start.y)}} S0`,
        `G1 X${normalizer.x(end.x)} Y${normalizer.y(end.y)} S${powerStrength}`,
      ];
    }

    const img = await Jimp.read(modelPath);
    img.mirror(false, true);

    const width = img.bitmap.width;
    const height = img.bitmap.height;

    const normalizer = new Normalizer('Center', 0, width, 0, height, {
      x: 1 / gcodeConfig.density,
      y: 1 / gcodeConfig.density,
    });

    let progress = 0;
    const content = [];
    content.push(`G0 F${jogSpeed}`);
    content.push(`G1 F${workSpeed}`);
    content.push(`M4 S0`);

    // fix many continuous bare 'S0' in gcode.
    // if prev row has no content, then no another 'S0'
    let prevWhichRowHasContent = 0;

    if (!gcodeConfig.direction || gcodeConfig.direction === 'Horizontal') {
      const direction = {
        x: 1,
        y: 0,
      };
      for (let j = height - 1; j >= 0; j--) {
        let len = 0;
        // promise first row must not reverse.
        const isReverse = (height - j) % 2 === 0;

        const sign = isReverse ? -1 : 1;
        for (
          let i = isReverse ? width - 1 : 0;
          isReverse ? i >= 0 : i < width;
          i += len * sign
        ) {
          const isNewRow =
            (isReverse && i === width - 1) || (!isReverse && i === 0);
          const isPrevRowHasContent = prevWhichRowHasContent + 1 === j;
          if (isNewRow && isPrevRowHasContent) {
            content.push(`S0`);
          }

          const idx = i * 4 + j * width * 4;
          if (img.bitmap.data[idx] <= bwThreshold) {
            prevWhichRowHasContent = j;
            const start = {
              x: i,
              y: j,
            };
            len = extractSegment(
              img.bitmap.data,
              start,
              img.bitmap,
              direction,
              sign
            );
            const end = {
              x: start.x + direction.x * len * sign,
              y: start.y + direction.y * len * sign,
            };
            content.push(...genMovement(normalizer, start, end, j));
          } else {
            len = 1;
          }
        }

        const p = j / height;
        if (p - progress > 0.05) {
          progress = p;
          this.emit('progress', progress);
        }
      }
    } else if (gcodeConfig.direction === 'Vertical') {
      const direction = {
        x: 0,
        y: 1,
      };
      for (let i = 0; i < width; ++i) {
        let len = 0;
        const isReverse = i % 2 !== 0;
        const sign = isReverse ? -1 : 1;
        for (
          let j = isReverse ? height - 1 : 0;
          isReverse ? j >= 0 : j < height;
          j += len * sign
        ) {
          const isNewRow =
            (isReverse && j === height - 1) || (!isReverse && j === 0);
          const isPrevRowHasContent = prevWhichRowHasContent + 1 === i;
          if (isNewRow && isPrevRowHasContent) {
            content.push(`S0`);
          }

          const idx = i * 4 + j * width * 4;
          if (img.bitmap.data[idx] <= bwThreshold) {
            prevWhichRowHasContent = i;
            const start = {
              x: i,
              y: j,
            };
            len = extractSegment(
              img.bitmap.data,
              start,
              img.bitmap,
              direction,
              sign
            );
            const end = {
              x: start.x + direction.x * len * sign,
              y: start.y + direction.y * len * sign,
            };
            content.push(...genMovement(normalizer, start, end, i));
          } else {
            len = 1;
          }
        }
        const p = i / width;
        if (p - progress > 0.05) {
          progress = p;
          this.emit('progress', progress);
        }
      }
    } else if (gcodeConfig.direction === 'Diagonal') {
      const direction = {
        x: 1,
        y: -1,
      };
      for (let k = 0; k < width + height - 1; k++) {
        let len = 0;
        const isReverse = k % 2 !== 0;
        const sign = isReverse ? -1 : 1;
        for (
          let i = isReverse ? width - 1 : 0;
          isReverse ? i >= 0 : i < width;
          i += len * sign
        ) {
          const j = k - i;
          if (j < 0 || j > height) {
            len = 1; // FIXME: optimize
          } else {
            const idx = i * 4 + j * width * 4;
            if (img.bitmap.data[idx] <= bwThreshold) {
              const start = {
                x: i,
                y: j,
              };
              len = extractSegment(
                img.bitmap.data,
                start,
                img.bitmap,
                direction,
                sign
              );
              const end = {
                x: start.x + direction.x * len * sign,
                y: start.y + direction.y * len * sign,
              };
              content.push(...genMovement(normalizer, start, end, j));
            } else {
              len = 1;
            }
          }
        }
        const p = k / (width + height);
        if (p - progress > 0.05) {
          progress = p;
          this.emit('progress', progress);
        }
      }
    } else if (gcodeConfig.direction === 'Diagonal2') {
      const direction = {
        x: 1,
        y: 1,
      };
      for (let k = -height; k <= width; k++) {
        const isReverse = k % 2 !== 0;
        const sign = isReverse ? -1 : 1;
        let len = 0;
        for (
          let i = isReverse ? width - 1 : 0;
          isReverse ? i >= 0 : i < width;
          i += len * sign
        ) {
          const j = i - k;
          if (j < 0 || j > height) {
            len = 1;
          } else {
            const idx = i * 4 + j * width * 4;
            if (img.bitmap.data[idx] <= bwThreshold) {
              const start = {
                x: i,
                y: j,
              };
              len = extractSegment(
                img.bitmap.data,
                start,
                img.bitmap,
                direction,
                sign
              );
              const end = {
                x: start.x + direction.x * len * sign,
                y: start.y + direction.y * len * sign,
              };
              content.push(...genMovement(normalizer, start, end, j));
            } else {
              len = 1;
            }
          }
        }
        const p = k / (width + height);
        if (p - progress > 0.05) {
          progress = p;
          this.emit('progress', progress);
        }
      }
    }

    content.push('M5');
    // content.push('G0 X0 Y0');

    return content;
  }

  async generateGcodeDxf(modelInfo, modelPath) {
    const { transformation, gcodeConfigPlaceholder, gcodeConfig } = modelInfo;
    const { fillEnabled, fillDensity, optimizePath } = gcodeConfig;
    const { fixedPowerEnabled, fixedPower } = gcodeConfig;
    const { workSpeed, jogSpeed } = gcodeConfigPlaceholder;
    const originWidth = modelInfo.sourceWidth;
    const originHeight = modelInfo.sourceHeight;
    const targetWidth = transformation.width;
    const targetHeight = transformation.height;
    // rotation: degree and counter-clockwise
    const rotationZ = transformation.rotationZ;
    const flipFlag = transformation.flip;
    let { svg } = await parseDxf(modelPath);
    svg = dxfToSvg(svg);
    updateDxfBoundingBox(svg);
    // flip(svg, 1);
    flip(svg, flipFlag);
    scale(svg, {
      x: targetWidth / originWidth,
      y: targetHeight / originHeight,
    });
    if (optimizePath) {
      sortShapes(svg);
    }
    rotate(svg, rotationZ); // rotate: unit is radians and counter-clockwise
    translate(svg, -svg.viewBox[0], -svg.viewBox[1]);

    const normalizer = new Normalizer(
      'Center',
      svg.viewBox[0],
      svg.viewBox[0] + svg.viewBox[2],
      svg.viewBox[1],
      svg.viewBox[1] + svg.viewBox[3],
      {
        x: 1,
        y: 1,
      }
    );

    const segments = svgToSegments(svg, {
      width: svg.viewBox[2],
      height: svg.viewBox[3],
      fillEnabled,
      fillDensity,
    });

    let firstTurnOn = true;
    const powerStrength = Math.floor(
      ((fixedPowerEnabled ? fixedPower : 100) * 1000) / 100
    );
    function turnOnLaser() {
      if (firstTurnOn) {
        firstTurnOn = false;
        return `M4 S${powerStrength}`;
      }
      return 'M4';
    }

    // second pass generate gcode
    let progress = 0;
    const content = [];
    content.push(`G0 F${jogSpeed}`);
    content.push(`G1 F${workSpeed}`);

    let current = null;

    for (const segment of segments) {
      // G0 move to start
      if (!current || (current && !pointEqual(current, segment.start))) {
        if (current) {
          content.push('M5');
        }

        // Move to start point
        content.push(
          `G0 X${normalizer.x(segment.start[0])} Y${normalizer.y(
            segment.start[1]
          )}`
        );
        content.push(turnOnLaser());
      }

      // G0 move to end
      content.push(
        `G1 X${normalizer.x(segment.end[0])} Y${normalizer.y(segment.end[1])}`
      );

      current = segment.end;

      progress += 1;
    }
    if (segments.length !== 0) {
      progress /= segments.length;
    }
    this.emit('progress', progress);
    // turn off
    if (current) {
      content.push('M5');
    }

    // move to work zero
    content.push('G0 X0 Y0');

    // return `${content.join('\n')}\n`;
    return content;
  }

  async generateGcodeVector(modelInfo, modelPath) {
    const { transformation, gcodeConfigPlaceholder, gcodeConfig } = modelInfo;
    const { fillEnabled, fillDensity, optimizePath } = gcodeConfig;
    const { fixedPowerEnabled, fixedPower } = gcodeConfig;
    const { workSpeed, jogSpeed } = gcodeConfigPlaceholder;
    const originWidth = modelInfo.sourceWidth;
    const originHeight = modelInfo.sourceHeight;
    const targetWidth = transformation.width;
    const targetHeight = transformation.height;

    // rotation: degree and counter-clockwise
    const rotationZ = transformation.rotationZ;
    const flipFlag = transformation.flip;

    const svgParser = new SVGParser();

    const svg = await svgParser.parseFile(modelPath);

    flip(svg, 1);
    flip(svg, flipFlag);
    scale(svg, {
      x: targetWidth / originWidth,
      y: targetHeight / originHeight,
    });

    // For performance reason, we only optimize SVG with number of shapes less than 2000
    if (optimizePath && svg.shapes.length < 2000) {
      sortShapes(svg);
    }
    rotate(svg, rotationZ); // rotate: unit is radians and counter-clockwise
    translate(svg, -svg.viewBox[0], -svg.viewBox[1]);

    const normalizer = new Normalizer(
      'Center',
      svg.viewBox[0],
      svg.viewBox[0] + svg.viewBox[2],
      svg.viewBox[1],
      svg.viewBox[1] + svg.viewBox[3],
      {
        x: 1,
        y: 1,
      }
    );

    const segments = svgToSegments(svg, {
      width: svg.viewBox[2],
      height: svg.viewBox[3],
      fillEnabled,
      fillDensity,
    });

    let firstTurnOn = true;
    const powerStrength = Math.floor(
      ((fixedPowerEnabled ? fixedPower : 100) * 1000) / 100
    );
    function turnOnLaser() {
      if (firstTurnOn) {
        firstTurnOn = false;
        return `M4 S${powerStrength}`;
      }
      return 'M4';
    }

    // second pass generate gcode
    let progress = 0;
    const content = [];
    content.push(`G0 F${jogSpeed}`);
    content.push(`G1 F${workSpeed}`);

    let current = null;
    for (const segment of segments) {
      // G0 move to start
      if (!current || (current && !pointEqual(current, segment.start))) {
        if (current) {
          content.push('M5');
        }

        // Move to start point
        content.push(
          `G0 X${normalizer.x(segment.start[0])} Y${normalizer.y(
            segment.start[1]
          )}`
        );
        content.push(turnOnLaser());
      }

      // G0 move to end
      content.push(
        `G1 X${normalizer.x(segment.end[0])} Y${normalizer.y(segment.end[1])}`
      );

      current = segment.end;

      progress += 1;
    }
    if (segments.length !== 0) {
      progress /= segments.length;
    }
    this.emit('progress', progress);
    // turn off
    if (current) {
      content.push('M5');
    }

    // move to work zero
    content.push('G0 X0 Y0');
    return content;
  }
}

export default LaserToolPathGenerator;
