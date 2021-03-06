import {
  MeshBasicMaterial,
  Object3D,
  Group,
  CylinderBufferGeometry,
  LineBasicMaterial,
  BufferGeometry,
  Mesh,
  Line,
  Vector3,
} from 'three';
import each from 'lodash/each';
import colornames from 'colornames';

import { BLACK } from '../../../constants/colors';
import TextSprite from '../../../components/three-extensions/TextSprite';
import TargetPoint from '../../../components/three-extensions/TargetPoint';

import GridLine from './GridLine';
import CoordinateAxes from './CoordinateAxes';

const METRIC_GRID_SPACING = 10; // 10 mm

class PrintablePlate extends Object3D {
  constructor(size) {
    super();
    this.isPrintPlane = true;
    this.type = 'PrintPlane';
    this.targetPoint = null;
    // this.coordinateVisible = true;
    this.coordinateSystem = null;
    this.size = size;
    this._setup();
  }

  updateSize(size) {
    this.size = size;
    this.remove(...this.children);
    this._setup();
  }

  _setup() {
    // Metric
    const gridSpacing = METRIC_GRID_SPACING;
    const axisXLength = Math.ceil(this.size.x / gridSpacing) * gridSpacing;
    const axisYLength = Math.ceil(this.size.y / gridSpacing) * gridSpacing;

    const group = new Group();

    {
      // Coordinate Grid
      const gridLine = new GridLine(
        axisXLength,
        gridSpacing,
        axisYLength,
        gridSpacing,
        colornames('black'), // center line
        colornames('gray 44') // grid
      );
      each(gridLine.children, (o) => {
        o.material.opacity = 0.15;
        o.material.transparent = true;
        o.material.depthWrite = false;
      });
      gridLine.name = 'GridLine';
      group.add(gridLine);
    }

    {
      // Coordinate Control
      const coordinateAxes = new CoordinateAxes(axisXLength, axisYLength);
      coordinateAxes.name = 'CoordinateAxes';
      group.add(coordinateAxes);

      const arrowX = new Mesh(
        new CylinderBufferGeometry(0, 1, 4),
        new MeshBasicMaterial({ color: BLACK })
      );
      arrowX.position.set(axisXLength + 2, 0, 0);
      arrowX.rotation.set(0, 0, -Math.PI / 2);
      // group.add(arrowX);

      const arrowY = new Mesh(
        new CylinderBufferGeometry(0, 1, 4),
        new MeshBasicMaterial({ color: BLACK })
      );
      arrowY.position.set(0, axisYLength + 2, 0);
      // group.add(arrowY);
    }

    {
      //print range
      const material = new LineBasicMaterial({ color: colornames('gray 44') });
      const points = [];
      points.push(new Vector3(0, 0, 0));
      points.push(new Vector3(0, this.size.y, 0));
      points.push(new Vector3(this.size.x, this.size.y, 0));
      points.push(new Vector3(this.size.x, 0, 0));
      points.push(new Vector3(0, 0, 0));
      const geometry = new BufferGeometry().setFromPoints(points);
      const rangeLine = new Line(geometry, material);
      group.add(rangeLine);
    }

    {
      // Axis Labels
      // const axisXLabel = new TextSprite({
      //   x: axisXLength + 10,
      //   y: 0,
      //   z: 0,
      //   size: 10,
      //   text: 'X',
      //   color: BLACK,
      // });
      // const axisYLabel = new TextSprite({
      //   x: 0,
      //   y: axisYLength + 10,
      //   z: 0,
      //   size: 10,
      //   text: 'Y',
      //   color: BLACK,
      // });

      // group.add(axisXLabel);
      // group.add(axisYLabel);

      const largeSize = 150;

      const textSize = 10 / 3;
      const labeXLength = Math.ceil(axisXLength / 10) * 10;
      for (let x = 0; x <= labeXLength; x += gridSpacing) {
        // if (x !== 0) {
        const textLabel = new TextSprite({
          x,
          y: -4,
          z: 0,
          size: textSize,
          text: x,
          textAlign: 'center',
          textBaseline: 'bottom',
          color: BLACK,
          opacity: 0.5,
        });
        group.add(textLabel);
        // }
      }

      // if has large size, then show another x scale
      if (labeXLength >= largeSize) {
        for (let x = labeXLength; x > 0; x -= gridSpacing) {
          const textLabel = new TextSprite({
            x: x + 1,
            y: this.size.y + 8,
            z: 0,
            size: textSize,
            text: labeXLength - x,
            textAlign: 'center',
            textBaseline: 'bottom',
            color: BLACK,
            opacity: 0.5,
          });
          group.add(textLabel);
        }
      }
      const labeYLength = Math.ceil(axisYLength / 10) * 10;
      for (let y = 0; y <= labeYLength; y += gridSpacing) {
        if (y !== 0) {
          const textLabel = new TextSprite({
            x: -4,
            y,
            z: 0,
            size: textSize,
            text: y,
            textAlign: 'center',
            textBaseline: 'bottom',
            color: BLACK,
            opacity: 0.5,
          });
          group.add(textLabel);
        }
      }

      // if has large size, then show another y scale
      if (labeYLength >= largeSize) {
        for (let y = labeYLength; y > 0; y -= gridSpacing) {
          if (labeYLength - y !== 0) {
            const textLabel = new TextSprite({
              x: this.size.x + 8,
              y,
              z: 0,
              size: textSize,
              text: labeYLength - y,
              textAlign: 'center',
              textBaseline: 'bottom',
              color: BLACK,
              opacity: 0.5,
            });
            group.add(textLabel);
          }
        }
      }
    }
    this.coordinateSystem = group;
    group.name = 'MetricCoordinateSystem';
    this.add(group);

    // Target Point
    this.targetPoint = new TargetPoint({
      color: colornames('indianred'),
      radius: 0.5,
    });
    this.targetPoint.name = 'TargetPoint';
    this.targetPoint.visible = true;
    this.add(this.targetPoint);
  }

  changeCoordinateVisibility(value) {
    // this.coordinateVisible = value;
    this.coordinateSystem && (this.coordinateSystem.visible = value);
  }
}

export default PrintablePlate;
