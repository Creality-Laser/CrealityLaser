/* eslint-disable prefer-promise-reject-errors */
import isEmpty from 'lodash/isEmpty';
import GcodeToBufferGeometryWorkspace from './GcodeToBufferGeometry/GcodeToBufferGeometryWorkspace';

export default function GcodeToArraybufferGeometry(data, onProgress) {
  return new Promise((resolve, reject) => {
    if (isEmpty(data)) {
      reject({ status: 'err', value: 'Data is empty' });
    }

    const { func, gcodeFilename, gcode } = data;
    if (!['WORKSPACE'].includes(func.toUpperCase())) {
      reject({ status: 'err', value: `Unsupported func: ${func}` });
    }
    if (isEmpty(gcodeFilename) && isEmpty(gcode)) {
      reject({
        status: 'err',
        value: 'Gcode filename and gcode is empty',
      });
    }

    // eslint-disable-next-line promise/valid-params
    new GcodeToBufferGeometryWorkspace()
      .parse(
        gcodeFilename,
        gcode,
        (result) => {
          const { bufferGeometry, renderMethod, isDone, boundingBox } = result;
          const positions = bufferGeometry.getAttribute('position').array;
          const colors = bufferGeometry.getAttribute('a_color').array;
          const index = bufferGeometry.getAttribute('a_index').array;
          const indexColors =
            bufferGeometry.getAttribute('a_index_color').array;

          const data = {
            status: 'succeed',
            isDone,
            boundingBox,
            renderMethod,
            value: {
              positions,
              colors,
              index,
              indexColors,
            },
          };
          resolve(data, [
            positions.buffer,
            colors.buffer,
            index.buffer,
            indexColors.buffer,
          ]);
        },
        (progress) => {
          onProgress({ status: 'progress', value: progress });
        },
        (err) => {
          reject({ status: 'err', value: err });
        }
      )
      .then();
  });
}
