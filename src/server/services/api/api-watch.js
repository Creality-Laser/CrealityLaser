import monitor from '../monitor';
import { ERR_NOT_FOUND, ERR_INTERNAL_SERVER_ERROR } from '../../constants';

export const getFiles = (req, res) => {
  const path = req.body.path || req.query.path || '';
  const files = monitor.getFiles(path);

  res.send({ path, files });
};

export const readFile = (req, res) => {
  const file = req.body.file || req.query.file || '';

  monitor.readFile(file, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.status(ERR_NOT_FOUND).send({
          msg: 'File not found',
        });
      } else {
        res.status(ERR_INTERNAL_SERVER_ERROR).send({
          msg: 'Failed reading file',
        });
      }
      return;
    }

    res.send({ file, data });
  });
};
