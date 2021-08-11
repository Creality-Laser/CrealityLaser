import Store from 'electron-store';

// current schema of store:
// const schema = {
// winBounds: {
//   x: 440,
//   y: 225,
//   width: 100,
//   height: 100,
// },
// backendInfo: {
//   address: '127.0.0.1',
//   port: 8999
// },
// machine: {
//   series: CV20,
//   size: {
//       x: 100,
//       y: 100,
//       z: 100,
//   },
//   laserSize: {
//       x: 100,
//       y: 100,
//       z: 100,
//   },
// }
//};

const store = new Store();

export default store;
