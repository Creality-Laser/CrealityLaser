import request from 'request';
import fs from 'fs';

/**
 * FileInfo type definition
 * @typedef {Object} FileInfo
 * @property {string} [path=''] - The path of the file
 * @property {string} [name='file'] - The name of the file
 * @property {string} [key='file'] - The formdata key of the file
 */

/**
 * upload file by request with form-data
 * @param {string} url - the path to upload;
 * @param {FileInfo} fileInfo - the file info;
 * @param {object} formDataItems - others parameters for formdata
 * @param {function} onProgress - the progress callback
 * @param {function} onOk - the success callback
 * @param {function} onError - the error callback
 * @param {function} onRequestHandler - the request handler callback
 * @returns
 */
export default async function uploadFile(
  url = '',
  fileInfo,
  formDataItems = {},
  onProgress,
  onOk,
  onError,
  onRequestHandler
) {
  // for get upload progress manually
  let progressHandler = null;
  try {
    const { path = '', name = 'file', key = 'file' } = fileInfo;

    const options = {
      method: 'POST',
      url,
      timeout: 60000,
      headers: {
        accept: 'application/json',
      },
      formData: {
        [key]: {
          value: fs.createReadStream(path),
          options: {
            filename: name,
            // contentType: 'application/octet-stream',
            contentType: null,
          },
        },
        ...formDataItems,
      },
    };

    const size = await fs.lstatSync(path).size;

    const requestHandler = request(options, (error, response) => {
      if (progressHandler) {
        clearInterval(progressHandler);
      }

      if (error) {
        console.error(error, '------- uploadFile error ------');
        if (onError) {
          onError(error);
        }
      }

      if (response && response.body) {
        try {
          const { code, msg = 'error' } = JSON.parse(response.body);
          console.log(
            code,
            msg,
            '------------------- uploadFile response ---------'
          );
          if (code === 0) {
            if (onOk) {
              onOk(JSON.parse(response.body));
            }
          } else {
            if (onError) {
              onError({ code: 1, msg });
            }
          }
        } catch (error) {
          console.error(error, '------- uploadFile error ------');
          if (onError) {
            onError(error);
          }
        }
      }
    });

    progressHandler = setInterval(() => {
      // eslint-disable-next-line no-underscore-dangle
      const dispatched = requestHandler.req.connection._bytesDispatched;
      const progress = (
        (dispatched * 100) / size > 100 ? 100 : (dispatched * 100) / size
      ).toFixed(0);
      if (onProgress) {
        onProgress({
          progress,
          total: size,
          send: dispatched,
        });
      }
    }, 250);

    if (onRequestHandler) {
      onRequestHandler(requestHandler, progressHandler);
    }

    return 'ok';
  } catch (error) {
    if (progressHandler) {
      clearInterval(progressHandler);
    }
    if (onError) {
      onError(error);
    }

    return false;
  }
}
