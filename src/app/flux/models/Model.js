import uuid from 'uuid';
import * as THREE from 'three';
import ThreeDxfLoader from '../../lib/threejs/ThreeDxfLoader';

import { DATA_PREFIX } from '../../constants';

import ThreeUtils from '../../components/three-extensions/ThreeUtils';

const EVENTS = {
  UPDATE: { type: 'update' },
};

// const materialSelected = new THREE.MeshPhongMaterial({ color: 0xf0f0f0, specular: 0xb0b0b0, shininess: 30 });
// const materialNormal = new THREE.MeshPhongMaterial({
//   color: 0xa0a0a0,
//   specular: 0xb0b0b0,
//   shininess: 30,
// });

// const materialBasic = new THREE.MeshBasicMaterial({
//   color: 0xffffff,
//   transparent: true,
//   opacity: 1,
//   side: THREE.DoubleSide,
// });

// const materialOverstepped = new THREE.MeshPhongMaterial({
//   color: 0xff0000,
//   specular: 0xb0b0b0,
//   shininess: 30,
// });

const DEFAULT_TRANSFORMATION = {
  positionX: 0,
  positionY: 0,
  positionZ: 0,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  scaleX: 1,
  scaleY: 1,
  scaleZ: 1,
  uniformScalingState: true,
  flip: 0,
};

// class Model extends THREE.Mesh {
class Model {
  modeConfigs = {};

  constructor(modelInfo, machineSize = { x: 0, y: 0 }) {
    const {
      modelID = uuid.v4(),
      limitSize,
      headType,
      sourceType,
      sourceHeight,
      height,
      sourceWidth,
      width,
      originalName,
      uploadName,
      config,
      mode,
      transformation,
      processImageName,
    } = modelInfo;

    this.limitSize = limitSize;

    const geometry =
      modelInfo.geometry || new THREE.PlaneGeometry(width, height);
    const material =
      modelInfo.material ||
      new THREE.MeshBasicMaterial({ color: 0xe0e0e0, visible: false });

    this.meshObject = new THREE.Mesh(geometry, material);

    this.modelID = modelID;
    this.modelName = '';

    this.headType = headType;
    this.sourceType = sourceType; // 3d, raster, svg, text
    this.sourceHeight = sourceHeight;
    this.height = height;
    this.sourceWidth = sourceWidth;
    this.width = width;
    this.originalName = originalName;
    this.uploadName = uploadName;
    this.config = config;
    this.mode = mode;

    this.hideFlag = false; // hided in canvas

    this.processImageName = processImageName;

    this.transformation = {
      ...DEFAULT_TRANSFORMATION,
      ...transformation,
    };
    if (!this.transformation.width && !this.transformation.height) {
      this.transformation.width = width;
      this.transformation.height = height;
    }

    this.transformation.positionX = Math.ceil(width / 2);
    this.transformation.positionY = machineSize.y - Math.ceil(height / 2);
    this.modelObject3D = null;
    this.processObject3D = null;

    this.estimatedTime = 0;

    this.boundingBox = null;
    this.overstepped = false;
    this.convexGeometry = null;
    this.showOrigin = this.sourceType !== 'raster';
  }

  updateModelName(newName) {
    this.modelName = newName;
  }

  getTaskInfo() {
    return {
      modelID: this.modelID,
      modelName: this.modelName,
      headType: this.headType,
      sourceType: this.sourceType,
      mode: this.mode,

      hideFlag: this.hideFlag,

      sourceHeight: this.sourceHeight,
      sourceWidth: this.sourceWidth,
      originalName: this.originalName,
      uploadName: this.uploadName,

      transformation: {
        ...this.transformation,
      },
      config: {
        ...this.config,
      },
    };
  }

  generateModelObject3D() {
    if (this.sourceType === 'dxf') {
      if (this.modelObject3D) {
        this.meshObject.remove(this.modelObject3D);
        this.modelObject3D = null;
      }

      const path = `${DATA_PREFIX}/${this.uploadName}`;
      new ThreeDxfLoader({ width: this.transformation.width }).load(
        path,
        (group) => {
          this.modelObject3D = group;
          this.meshObject.add(this.modelObject3D);
          this.meshObject.dispatchEvent(EVENTS.UPDATE);
        }
      );
    } else if (this.sourceType !== '3d') {
      const uploadPath = `${DATA_PREFIX}/${this.uploadName}`;
      // const texture = new THREE.TextureLoader().load(uploadPath);
      const texture = new THREE.TextureLoader().load(uploadPath, () => {
        this.meshObject.dispatchEvent(EVENTS.UPDATE);
      });
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1,
        map: texture,
        side: THREE.DoubleSide,
      });
      if (this.modelObject3D) {
        this.meshObject.remove(this.modelObject3D);
        this.modelObject3D = null;
      }
      this.meshObject.geometry = new THREE.PlaneGeometry(
        this.width,
        this.height
      );
      this.modelObject3D = new THREE.Mesh(this.meshObject.geometry, material);

      this.meshObject.add(this.modelObject3D);
      this.modelObject3D.visible = this.showOrigin;
    }

    this.updateTransformation(this.transformation);
  }

  generateProcessObject3D() {
    if (this.sourceType !== 'raster') {
      return;
    }
    if (!this.processImageName) {
      return;
    }
    if (this.sourceType === 'raster') {
      const uploadPath = `${DATA_PREFIX}/${this.processImageName}`;
      // const texture = new THREE.TextureLoader().load(uploadPath);
      const texture = new THREE.TextureLoader().load(uploadPath, () => {
        this.meshObject.dispatchEvent(EVENTS.UPDATE);
      });
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1,
        map: texture,
        side: THREE.DoubleSide,
      });
      if (this.processObject3D) {
        this.meshObject.remove(this.processObject3D);
        this.processObject3D = null;
      }
      this.meshObject.geometry = new THREE.PlaneGeometry(
        this.width,
        this.height
      );
      this.processObject3D = new THREE.Mesh(this.meshObject.geometry, material);

      this.meshObject.add(this.processObject3D);
      this.processObject3D.visible = !this.showOrigin;
    }

    this.updateTransformation(this.transformation);
  }

  changeShowOrigin() {
    this.showOrigin = !this.showOrigin;
    this.modelObject3D.visible = this.showOrigin;
    this.processObject3D.visible = !this.showOrigin;
    return {
      showOrigin: this.showOrigin,
      showImageName: this.showOrigin ? this.uploadName : this.processImageName,
    };
  }

  updateVisible(param) {
    if (param === false) {
      this.modelObject3D && (this.modelObject3D.visible = param);
      this.processObject3D && (this.processObject3D.visible = param);
    } else {
      this.modelObject3D && (this.modelObject3D.visible = this.showOrigin);
      this.processObject3D && (this.processObject3D.visible = !this.showOrigin);
    }
  }

  getModeConfig(mode) {
    if (this.sourceType !== 'raster') {
      return null;
    }
    return this.modeConfigs[mode];
  }

  processMode(mode, config, processImageName) {
    if (processImageName) {
      this.processImageName = processImageName;
    }
    if (this.mode !== mode) {
      this.modeConfigs[this.mode] = {
        config: {
          ...this.config,
        },
      };
      if (this.modeConfigs[mode]) {
        this.config = {
          ...this.modeConfigs[mode].config,
        };
      } else {
        this.config = {
          ...config,
        };
      }
      this.mode = mode;
    } else {
      this.modeConfigs[this.mode] = {
        config: {
          ...config,
        },
      };
      this.config = {
        ...config,
      };
    }

    this.generateProcessObject3D();

    // const res = await api.processImage({
    //     headType: this.headType,
    //     uploadName: this.uploadName,
    //     config: {
    //         ...this.config,
    //         density: 4
    //     },
    //     sourceType: this.sourceType,
    //     mode: mode,
    //     transformation: {
    //         width: this.width,
    //         height: this.height,
    //         rotationZ: 0
    //     }
    // });
    //
    // this.processImageName = res.body.filename;
  }

  onTransform() {
    const geometrySize = ThreeUtils.getGeometrySize(
      this.meshObject.geometry,
      true
    );
    const { position, rotation, scale } = this.meshObject;
    const transformation = {
      positionX: position.x,
      positionY: position.y,
      positionZ: position.z,
      rotationX: rotation.x,
      rotationY: rotation.y,
      rotationZ: rotation.z,
      scaleX: scale.x,
      scaleY: scale.y,
      scaleZ: scale.z,
      width: geometrySize.x * scale.x,
      height: geometrySize.y * scale.y,
    };
    this.transformation = {
      ...this.transformation,
      ...transformation,
    };
    const isModelOverstepped = checkIsModelOverstepped(
      this.transformation,
      this.limitSize
    );
    this.setOverstepped(isModelOverstepped);
    return this.transformation;
  }

  updateTransformation(transformation) {
    const {
      positionX,
      positionY,
      positionZ,
      rotationX,
      rotationY,
      rotationZ,
      scaleX,
      scaleY,
      scaleZ,
      flip,
      uniformScalingState,
    } = transformation;
    let { width, height } = transformation;
    if (uniformScalingState !== undefined) {
      this.meshObject.uniformScalingState = uniformScalingState;
      this.transformation.uniformScalingState = uniformScalingState;
    }

    if (positionX !== undefined) {
      this.meshObject.position.x = positionX;
      this.transformation.positionX = positionX;
    }
    if (positionY !== undefined) {
      this.meshObject.position.y = positionY;
      this.transformation.positionY = positionY;
    }
    if (positionZ !== undefined) {
      this.meshObject.position.z = positionZ;
      this.transformation.positionZ = positionZ;
    }
    if (rotationX !== undefined) {
      this.meshObject.rotation.x = rotationX;
      this.transformation.rotationX = rotationX;
    }
    if (rotationY !== undefined) {
      this.meshObject.rotation.y = rotationY;
      this.transformation.rotationY = rotationY;
    }
    if (rotationZ !== undefined) {
      this.meshObject.rotation.z = rotationZ;
      this.transformation.rotationZ = rotationZ;
    }
    if (scaleX !== undefined) {
      this.meshObject.scale.x = scaleX;
      this.transformation.scaleX = scaleX;
    }
    if (scaleY !== undefined) {
      this.meshObject.scale.y = scaleY;
      this.transformation.scaleY = scaleY;
    }
    if (scaleZ !== undefined) {
      this.meshObject.scale.z = scaleZ;
      this.transformation.scaleZ = scaleZ;
    }
    if (flip !== undefined) {
      this.transformation.flip = flip;
      if (this.modelObject3D) {
        if (flip === 0) {
          this.modelObject3D.rotation.x = 0;
          this.modelObject3D.rotation.y = 0;
        }
        if (flip === 1) {
          this.modelObject3D.rotation.x = Math.PI;
          this.modelObject3D.rotation.y = 0;
        }
        if (flip === 2) {
          this.modelObject3D.rotation.x = 0;
          this.modelObject3D.rotation.y = Math.PI;
        }
        if (flip === 3) {
          this.modelObject3D.rotation.x = Math.PI;
          this.modelObject3D.rotation.y = Math.PI;
        }
      }
      if (this.processObject3D) {
        if (flip === 0) {
          this.processObject3D.rotation.x = 0;
          this.processObject3D.rotation.y = 0;
        }
        if (flip === 1) {
          this.processObject3D.rotation.x = Math.PI;
          this.processObject3D.rotation.y = 0;
        }
        if (flip === 2) {
          this.processObject3D.rotation.x = 0;
          this.processObject3D.rotation.y = Math.PI;
        }
        if (flip === 3) {
          this.processObject3D.rotation.x = Math.PI;
          this.processObject3D.rotation.y = Math.PI;
        }
      }
    }

    if (width || height) {
      const geometrySize = ThreeUtils.getGeometrySize(
        this.meshObject.geometry,
        true
      );
      width = width || (height * this.sourceWidth) / this.sourceHeight;
      height = height || (width * this.sourceHeight) / this.sourceWidth;

      const scaleX_ = width / geometrySize.x;
      const scaleY_ = height / geometrySize.y;

      this.meshObject.scale.set(scaleX_, scaleY_, 1);
      this.transformation.width = width;
      this.transformation.height = height;
    }

    const isModelOverstepped = checkIsModelOverstepped(
      this.transformation,
      this.limitSize
    );
    this.setOverstepped(isModelOverstepped);

    // if (width) {
    //   const geometrySize = ThreeUtils.getGeometrySize(
    //     this.meshObject.geometry,
    //     true
    //   );

    //   this.meshObject.scale.x = width / geometrySize.x;
    //   this.transformation.width = width;
    // }
    // if (height) {
    //   const geometrySize = ThreeUtils.getGeometrySize(
    //     this.meshObject.geometry,
    //     true
    //   );

    //   this.meshObject.scale.y = height / geometrySize.y;
    //   this.transformation.height = height;
    // }
    return this.transformation;
  }

  // Update source
  updateSource(source) {
    const {
      sourceType,
      sourceHeight,
      sourceWidth,
      originalName,
      uploadName,
      width,
      height,
    } = source;
    this.sourceType = sourceType || this.sourceType;
    this.sourceHeight = sourceHeight || this.sourceHeight;
    this.sourceWidth = sourceWidth || this.sourceWidth;
    this.width = width || this.width;
    this.height = height || this.height;
    this.originalName = originalName || this.originalName;
    this.uploadName = uploadName || this.uploadName;

    // this.displayModelObject3D(uploadName, sourceWidth, sourceHeight);
    // const width = this.transformation.width;
    // const height = sourceHeight / sourceWidth * width;
    this.generateModelObject3D();
    this.generateProcessObject3D();
  }

  updateConfig(config, processImageName) {
    this.config = {
      ...this.config,
      ...config,
    };
    this.processMode(this.mode, this.config, processImageName);
  }

  computeBoundingBox() {
    if (this.sourceType === '3d') {
      // after operated(move/scale/rotate), model.geometry is not changed
      // so need to call: geometry.applyMatrix(matrixLocal);
      // then call: geometry.computeBoundingBox(); to get operated modelMesh BoundingBox
      // clone this.convexGeometry then clone.computeBoundingBox() is faster.
      if (this.convexGeometry) {
        const clone = this.convexGeometry.clone();
        this.meshObject.updateMatrix();
        clone.applyMatrix(this.meshObject.matrix);
        clone.computeBoundingBox();
        this.boundingBox = clone.boundingBox;
      } else {
        const clone = this.meshObject.geometry.clone();
        this.meshObject.updateMatrix();
        clone.applyMatrix(this.meshObject.matrix);
        clone.computeBoundingBox();
        this.boundingBox = clone.boundingBox;
      }
    } else {
      const { width, height, rotationZ } = this.transformation;
      const bboxWidth =
        Math.abs(width * Math.cos(rotationZ)) +
        Math.abs(height * Math.sin(rotationZ));
      const bboxHeight =
        Math.abs(width * Math.sin(rotationZ)) +
        Math.abs(height * Math.cos(rotationZ));
      const { x, y } = this.meshObject.position;
      this.boundingBox = new THREE.Box2(
        new THREE.Vector2(x - bboxWidth / 2, y - bboxHeight / 2),
        new THREE.Vector2(x + bboxWidth / 2, y + bboxHeight / 2)
      );
    }
  }

  // 3D
  setConvexGeometry(convexGeometry) {
    if (convexGeometry instanceof THREE.BufferGeometry) {
      this.convexGeometry = new THREE.Geometry().fromBufferGeometry(
        convexGeometry
      );
      this.convexGeometry.mergeVertices();
    } else {
      this.convexGeometry = convexGeometry;
    }
  }

  stickToPlate() {
    if (this.sourceType !== '3d') {
      return;
    }
    this.computeBoundingBox();
    this.meshObject.position.z =
      this.meshObject.position.z - this.boundingBox.min.z;
    this.onTransform();
  }

  // 3D
  setMatrix(matrix) {
    this.meshObject.updateMatrix();
    this.meshObject.applyMatrix(
      new THREE.Matrix4().getInverse(this.meshObject.matrix)
    );
    this.meshObject.applyMatrix(matrix);
    // attention: do not use Object3D.applyMatrix(matrix : Matrix4)
    // because applyMatrix is accumulated
    // anther way: decompose Matrix and reset position/rotation/scale
    // let position = new THREE.Vector3();
    // let quaternion = new THREE.Quaternion();
    // let scale = new THREE.Vector3();
    // matrix.decompose(position, quaternion, scale);
    // this.position.copy(position);
    // this.quaternion.copy(quaternion);
    // this.scale.copy(scale);
  }

  setOverstepped(overstepped) {
    if (this.overstepped === overstepped) {
      return;
    }
    this.overstepped = overstepped;
    if (this.overstepped) {
      if (this.processObject3D && this.processObject3D.material) {
        this.processObject3D.material.opacity = 0.3;
      } else if (this.modelObject3D && this.modelObject3D.material) {
        // text
        this.modelObject3D.material.opacity = 0.3;
      } else if (this.meshObject) {
        // TODO dxf
        // for (const group of this.meshObject.children) {
        //   if (group && group.children) {
        //     for (const gChild of group.children) {
        //       if (gChild && gChild.material) {
        //         // gChild.material.opacity = 0.1;
        //       }
        //     }
        //   }
        // }
      }
    } else {
      if (this.processObject3D && this.processObject3D.material) {
        this.processObject3D.material.opacity = 1;
      } else if (this.modelObject3D && this.modelObject3D.material) {
        // text
        this.modelObject3D.material.opacity = 1;
      } else if (this.meshObject) {
        // dxf
        this.meshObject.visible = true;
      }
    }
  }

  clone() {
    const clone = new Model({
      ...this,
      geometry: this.meshObject.geometry.clone(),
      material: this.meshObject.material.clone(),
    });
    clone.modelID = this.modelID;
    clone.generateModelObject3D();
    clone.generateProcessObject3D();
    // this.updateMatrix();
    // clone.setMatrix(this.mesh.Object.matrix);
    this.meshObject.updateMatrix();
    clone.setMatrix(this.meshObject.matrix);
    return clone;
  }

  layFlat() {
    if (this.sourceType !== '3d') {
      return;
    }
    const epsilon = 1e-6;
    const positionX = this.meshObject.position.x;
    const positionY = this.meshObject.position.y;

    if (!this.convexGeometry) {
      return;
    }

    // Attention: the minY-vertex and min-angle-vertex must be in the same face
    // transform convexGeometry clone
    let convexGeometryClone = this.convexGeometry.clone();

    // this.updateMatrix();
    this.meshObject.updateMatrix();
    convexGeometryClone.applyMatrix(this.meshObject.matrix);
    let faces = convexGeometryClone.faces;
    const vertices = convexGeometryClone.vertices;

    // find out the following params:
    let minZ = Number.MAX_VALUE;
    let minZVertexIndex = -1;
    let minAngleVertexIndex = -1; // The angle between the vector(minY-vertex -> min-angle-vertex) and the x-z plane is minimal
    let minAngleFace = null;

    // find minZ and minZVertexIndex
    for (let i = 0; i < vertices.length; i++) {
      if (vertices[i].z < minZ) {
        minZ = vertices[i].z;
        minZVertexIndex = i;
      }
    }

    // get minZ vertices count
    let minZVerticesCount = 0;
    for (let i = 0; i < vertices.length; i++) {
      if (vertices[i].z - minZ < epsilon) {
        ++minZVerticesCount;
      }
    }

    if (minZVerticesCount >= 3) {
      // already lay flat
      return;
    }

    // find minAngleVertexIndex
    if (minZVerticesCount === 2) {
      for (let i = 0; i < vertices.length; i++) {
        if (vertices[i].z - minZ < epsilon && i !== minZVertexIndex) {
          minAngleVertexIndex = i;
        }
      }
    } else if (minZVerticesCount === 1) {
      let sinValue = Number.MAX_VALUE; // sin value of the angle between directionVector3 and x-z plane
      for (let i = 1; i < vertices.length; i++) {
        if (i !== minZVertexIndex) {
          const directionVector3 = new THREE.Vector3().subVectors(
            vertices[i],
            vertices[minZVertexIndex]
          );
          const length = directionVector3.length();
          // min sinValue corresponds minAngleVertexIndex
          if (directionVector3.z / length < sinValue) {
            sinValue = directionVector3.z / length;
            minAngleVertexIndex = i;
          }
        }
      }
      // transform model to make min-angle-vertex y equal to minY
      const vb1 = new THREE.Vector3().subVectors(
        vertices[minAngleVertexIndex],
        vertices[minZVertexIndex]
      );
      const va1 = new THREE.Vector3(vb1.x, vb1.y, 0);
      const matrix1 = this._getRotateMatrix(va1, vb1);
      this.meshObject.applyMatrix(matrix1);
      this.stickToPlate();

      // update geometry
      convexGeometryClone = this.convexGeometry.clone();
      convexGeometryClone.applyMatrix(this.meshObject.matrix);
      faces = convexGeometryClone.faces;
    }

    // now there must be 2 minY vertices
    // find minAngleFace
    const candidateFaces = [];
    for (let i = 0; i < faces.length; i++) {
      const face = faces[i];
      if (
        [face.a, face.b, face.c].includes(minZVertexIndex) &&
        [face.a, face.b, face.c].includes(minAngleVertexIndex)
      ) {
        candidateFaces.push(face);
      }
    }

    // max cos value corresponds min angle
    convexGeometryClone.computeFaceNormals();
    let cosValue = Number.MIN_VALUE;
    for (let i = 0; i < candidateFaces.length; i++) {
      // faceNormal points model outer surface
      const faceNormal = candidateFaces[i].normal;
      if (faceNormal.z < 0) {
        const cos = -faceNormal.z / faceNormal.length();
        if (cos > cosValue) {
          cosValue = cos;
          minAngleFace = candidateFaces[i];
        }
      }
    }

    const xyPlaneNormal = new THREE.Vector3(0, 0, -1);
    const vb2 = minAngleFace.normal;
    const matrix2 = this._getRotateMatrix(xyPlaneNormal, vb2);
    this.meshObject.applyMatrix(matrix2);
    this.stickToPlate();
    this.meshObject.position.x = positionX;
    this.meshObject.position.y = positionY;

    this.onTransform();
  }

  // get matrix for rotating v2 to v1. Applying matrix to v2 can make v2 to parallels v1.
  _getRotateMatrix(v1, v2) {
    // https://stackoverflow.com/questions/1171849/finding-quaternion-representing-the-rotation-from-one-vector-to-another
    const cross = new THREE.Vector3();
    cross.crossVectors(v2, v1);
    const dot = v1.dot(v2);

    const l1 = v1.length();
    const l2 = v2.length();
    const w = l1 * l2 + dot;
    const x = cross.x;
    const y = cross.y;
    const z = cross.z;

    const q = new THREE.Quaternion(x, y, z, w);
    q.normalize();

    const matrix4 = new THREE.Matrix4();
    matrix4.makeRotationFromQuaternion(q);
    return matrix4;
  }

  getSerializableConfig() {
    const {
      modelID,
      limitSize,
      headType,
      sourceType,
      sourceHeight,
      sourceWidth,
      originalName,
      uploadName,
      config,
      mode,
      geometry,
      material,
      transformation,
      processImageName,
    } = this;
    return {
      modelID,
      limitSize,
      headType,
      sourceType,
      sourceHeight,
      sourceWidth,
      originalName,
      uploadName,
      config,
      mode,
      geometry,
      material,
      transformation,
      processImageName,
    };
  }
}

export default Model;

function checkIsModelOverstepped(
  { width, height, positionX, positionY, rotationZ },
  { x: limitX, y: limitY }
) {
  // get the vertex coords
  const [xMin, xMax, yMin, yMax] = [
    positionX - width / 2,
    positionX + width / 2,
    positionY - height / 2,
    positionY + height / 2,
  ];

  // get the verte pointers before rotate
  const [xMinYMin, xMaxYMin, xMinYMax, xMaxYMax] = [
    [xMin, yMin],
    [xMax, yMin],
    [xMin, yMax],
    [xMax, yMax],
  ];

  // ??????????????????????????????P(x1,y1)?????????????????????Q(x2,y2)?????????????????,??????????????????(x, y)??????????????????
  // x= (x1 - x2)* cos(??) - (y1 - y2)* sin(??) + x2 ;
  // y= (x1 - x2)* sin(??) + (y1 - y2)* cos(??) + y2 ;

  function getRotatedPointer([x, y], [centerX, centerY], angle) {
    const rotatedX =
      (x - centerX) * Math.cos(angle) -
      (y - centerY) * Math.sin(angle) +
      centerX;
    const rotatedY =
      (x - centerX) * Math.sin(angle) +
      (y - centerY) * Math.cos(angle) +
      centerY;

    return [rotatedX, rotatedY];
  }

  const [x1, y1] = getRotatedPointer(
    xMinYMin,
    [positionX, positionY],
    rotationZ
  );
  const [x2, y2] = getRotatedPointer(
    xMaxYMin,
    [positionX, positionY],
    rotationZ
  );
  const [x3, y3] = getRotatedPointer(
    xMinYMax,
    [positionX, positionY],
    rotationZ
  );
  const [x4, y4] = getRotatedPointer(
    xMaxYMax,
    [positionX, positionY],
    rotationZ
  );

  const xs = [x1, x2, x3, x4];
  const ys = [y1, y2, y3, y4];

  // const error = 0.1

  return (
    xs.some((x) => x < 0 || x > limitX) || ys.some((y) => y < 0 || y > limitY)
  );
}
