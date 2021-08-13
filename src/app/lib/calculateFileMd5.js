import SparkMD5 from 'spark-md5';

export function calculateFileChunkMD5(file, start, end) {
  return new Promise((resolve, reject) => {
    const spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();
    if (file.size < start) {
      reject(new Error('getFileChunkMD5 failed: get error start index'));
    }
    function loadFile(e) {
      spark.append(e.target.result);
      resolve(spark.end());
    }
    fileReader.addEventListener('load', loadFile);
    fileReader.readAsArrayBuffer(file.slice(start, end));
  });
}

export async function calculateFileMD5(file, opts = {}) {
  opts = {
    ...{
      withChunks: true,
      chunkSize: 2 * 1024 * 1024, // Read in chunks of 2MB
    },
    ...(opts || {}),
  };

  const { withChunks, chunkSize } = opts;

  const totalFileMD5 = await calculateFileChunkMD5(file, 0, file.size).catch(
    console.error
  );

  const totalFileInfo = {
    name: file.name,
    size: file.size,
    md5: totalFileMD5,
  };

  if (!withChunks) {
    return totalFileInfo;
  }

  const chunks = Math.ceil(file.size / chunkSize);

  return Promise.all(
    Array.from({ length: chunks }).map((_, ind) =>
      calculateFileChunkMD5(
        file,
        ind * chunkSize,
        ind * chunkSize + chunkSize >= file.size
          ? file.size
          : ind * chunkSize + chunkSize
      )
    )
  )
    .then((md5s) => {
      return md5s.map((md5, ind) => ({
        index: ind,
        start: ind * chunkSize,
        end:
          ind * chunkSize + chunkSize >= file.size
            ? file.size
            : ind * chunkSize + chunkSize,
        total: chunks,
        md5,
      }));
    })
    .then((chunks_) => ({
      chunks: chunks_,
      ...totalFileInfo,
    }))
    .catch(console.error);
}

export async function batchcalculateFileMD5(files) {
  return Promise.all(Array.from(files).map(calculateFileMD5));
}
