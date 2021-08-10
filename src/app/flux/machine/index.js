const INITIAL_STATE = {
  size: {
    x: 125,
    y: 125,
    z: 125,
  },
};

export const actions = {};

export default function reducer(state = INITIAL_STATE, action) {
  console.log(action);
  return state;
}
