import * as THREE from 'three';

const UNIFORMS = {
  // rgba
  u_g1_color: new THREE.Uniform(new THREE.Vector4(0, 0, 0, 1)),
};

const CNC_LASER_VERT_SHADER = [
  'varying float v_g_code;',
  'attribute float a_g_code;',
  'attribute vec3 custom_color;',
  'varying vec3 vColor;',
  'void main(){',
  '    v_g_code = a_g_code;',
  '    vColor = custom_color;',
  '    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
  '}',
].join('');

const CNC_LASER_FRAG_SHADER = [
  'uniform vec4 u_g1_color;',
  'varying float v_g_code;',
  'varying vec3 vColor;',
  'void main(){',
  '    if(v_g_code == 0.0){',
  '        discard;',
  '    }',
  '    gl_FragColor = vec4(vColor.xyz, 1);',
  '}',
].join('');

// const motionColor = {
//   G0: new THREE.Color(0xc8c8c8),
//   G1: new THREE.Color(0x000000),
//   unknown: new THREE.Color(0x000000),
// };

class MotionColor {
  G0() {
    return new THREE.Color(0xc8c8c8);
  }

  G1(sPower = 0) {
    const depth = 1 - parseFloat(sPower / 1000);
    return new THREE.Color(depth, depth, depth);
  }

  unknown() {
    return new THREE.Color(0x000000);
  }

  gcodeGetColor(stateG, sPower) {
    if (stateG === 0) {
      return [this.G0().r, this.G0().g, this.G0().b];
    } else if (stateG === 1) {
      return [this.G1(sPower).r, this.G1(sPower).g, this.G1(sPower).b];
    } else {
      return [this.unknown().r, this.unknown().g, this.unknown().b];
    }
  }
}
const motionColor = new MotionColor();

class ToolPathRenderer {
  render(toolPath, gcodeConfig) {
    console.log(gcodeConfig);
    const { appendMode } = gcodeConfig;
    const { headType, mode, movementMode, data } = toolPath;
    // now only support cnc&laser
    if (!['cnc', 'laser'].includes(headType)) {
      return null;
    }
    if (headType === 'laser') {
      if (
        mode === 'greyscale' &&
        movementMode === 'greyscale-dot' &&
        appendMode !== 'lineToLine'
      ) {
        return this.parseToPoints(data);
      } else {
        return this.parseToLine(data);
      }
    } else {
      return this.parseToLine(data);
    }
  }

  parseToLine(data) {
    const positions = [];
    const gCodes = [];
    const colors = [];

    let state = {
      G: 0,
      X: 0,
      Y: 0,
      Z: 0,
      S: 0,
    };
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const newState = { ...state };
      item.G !== undefined && (newState.G = item.G);
      item.X !== undefined && (newState.X = item.X);
      item.Y !== undefined && (newState.Y = item.Y);
      item.Z !== undefined && (newState.Z = item.Z);
      item.S !== undefined && (newState.S = item.S);

      positions.push(state.X);
      positions.push(state.Y);
      positions.push(state.Z);
      positions.push(newState.X);
      positions.push(newState.Y);
      positions.push(newState.Z);
      gCodes.push(newState.G);
      gCodes.push(newState.G);
      for (let i = 0; i <= 2; i++) {
        colors.push(motionColor.gcodeGetColor(newState.G, newState.S)[i]);
      }
      for (let i = 0; i <= 2; i++) {
        colors.push(motionColor.gcodeGetColor(newState.G, newState.S)[i]);
      }
      state = newState;
    }

    const bufferGeometry = new THREE.BufferGeometry();
    const positionAttribute = new THREE.Float32BufferAttribute(positions, 3);
    const gCodeAttribute = new THREE.Float32BufferAttribute(gCodes, 1);
    const colorsAttribute = new THREE.Float32BufferAttribute(colors, 3);
    bufferGeometry.addAttribute('position', positionAttribute);
    bufferGeometry.addAttribute('a_g_code', gCodeAttribute);
    bufferGeometry.addAttribute('custom_color', colorsAttribute);
    const material = new THREE.ShaderMaterial({
      uniforms: UNIFORMS,
      vertexShader: CNC_LASER_VERT_SHADER,
      fragmentShader: CNC_LASER_FRAG_SHADER,
      side: THREE.DoubleSide,
      transparent: true,
      linewidth: 1,
    });
    return new THREE.Line(bufferGeometry, material);
  }

  parseToPoints(data) {
    const geometry = new THREE.Geometry();
    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: THREE.VertexColors,
      opacity: 0.9,
      transparent: true,
    });
    let state = {
      G: 0,
      X: 0,
      Y: 0,
      Z: 0,
    };
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const newState = { ...state };
      item.G !== undefined && (newState.G = item.G);
      item.X !== undefined && (newState.X = item.X);
      item.Y !== undefined && (newState.Y = item.Y);
      item.Z !== undefined && (newState.Z = item.Z);
      item.S !== undefined && (newState.S = item.S);

      if (
        state.G !== newState.G ||
        state.X !== newState.X ||
        state.Y !== newState.Y ||
        state.Z !== newState.Z ||
        state.S !== newState.S
      ) {
        state = { ...state, ...newState };
        geometry.vertices.push(new THREE.Vector3(state.X, state.Y, state.Z));
        if (state.G === 0) {
          geometry.colors.push(motionColor.G0());
        } else if (state.G === 1) {
          geometry.colors.push(motionColor.G1(state.S));
        } else {
          geometry.colors.push(motionColor.unknown());
        }
      }
    }
    return new THREE.Points(geometry, material);
  }
}

export default ToolPathRenderer;
