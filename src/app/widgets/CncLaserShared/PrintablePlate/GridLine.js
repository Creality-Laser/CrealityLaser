import * as THREE from 'three';

class GridLine {
  group = new THREE.Object3D();

  colorCenterLine = new THREE.Color(0x444444);

  colorGrid = new THREE.Color(0x888888);

  constructor(sizeX, stepX, sizeY, stepY, colorCenterLine, colorGrid) {
    colorCenterLine = new THREE.Color(colorCenterLine) || this.colorCenterLine;
    colorGrid = new THREE.Color(colorGrid) || this.colorGrid;

    sizeY = typeof sizeY === 'undefined' ? sizeX : sizeY;
    stepY = typeof stepY === 'undefined' ? stepX : stepY;

    for (let x = 0; x <= sizeX; x += stepX) {
      const geometry = new THREE.Geometry();
      const material = new THREE.LineBasicMaterial({
        vertexColors: THREE.VertexColors,
      });
      const color = x === 0 ? colorCenterLine : colorGrid;

      geometry.vertices.push(
        //new THREE.Vector3(x, -sizeY, 0),
        new THREE.Vector3(x, 0, 0),
        new THREE.Vector3(x, sizeY, 0)
      );
      geometry.colors.push(color, color);

      this.group.add(new THREE.Line(geometry, material));
    }

    for (let y = 0; y <= sizeY; y += stepY) {
      const geometry = new THREE.Geometry();
      const material = new THREE.LineBasicMaterial({
        vertexColors: THREE.VertexColors,
      });
      const color = y === 0 ? colorCenterLine : colorGrid;

      geometry.vertices.push(
        //new THREE.Vector3(-sizeX, y, 0),
        new THREE.Vector3(0, y, 0),
        new THREE.Vector3(sizeX, y, 0)
      );
      geometry.colors.push(color, color);

      this.group.add(new THREE.Line(geometry, material));
    }

    return this.group;
  }
}

export default GridLine;
