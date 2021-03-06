import { remote } from 'electron';

const app = remote.app;

const userDataDir = app.getPath('userData');

// Metric and Imperial units
export const IMPERIAL_UNITS = 'in';
export const METRIC_UNITS = 'mm';

export const EPSILON = 1e-6;

// Controller
export const MARLIN = 'Marlin';

// Workflow State
export const WORKFLOW_STATE_RUNNING = 'running';
export const WORKFLOW_STATE_PAUSED = 'paused';
export const WORKFLOW_STATE_IDLE = 'idle';

// Workflow status
export const WORKFLOW_STATUS_UNKNOWN = 'unknown';
export const WORKFLOW_STATUS_IDLE = 'idle';
export const WORKFLOW_STATUS_RUNNING = 'running';
export const WORKFLOW_STATUS_PAUSED = 'paused';

// Head Type
export const HEAD_TYPE_UNKNOWN = 'UNKNOWN';
export const HEAD_TYPE_3DP = '3DP';
export const HEAD_TYPE_LASER = 'LASER';
export const HEAD_TYPE_CNC = 'CNC';
// Workflow State

// Connection Status
export const CONNECTION_STATUS_IDLE = 'idle';
export const CONNECTION_STATUS_CONNECTING = 'connecting';
export const CONNECTION_STATUS_CONNECTED = 'connected';

// G-code Macro
export const MODAL_NONE = 'none';
export const MODAL_ADD_MACRO = 'add';
export const MODAL_EDIT_MACRO = 'edit';
export const MODAL_RUN_MACRO = 'run';

// Stages for Laser and CNC Carving
export const STAGE_IDLE = 0;
export const STAGE_IMAGE_LOADED = 1;
export const STAGE_PREVIEWING = 2;
export const STAGE_PREVIEWED = 3;
export const STAGE_GENERATED = 4;

export const PAGE_EDITOR = 'editor';
export const PAGE_PROCESS = 'process';

// Stages for 3d print
export const STAGES_3DP = {
  noModel: 10,
  modelLoaded: 11,
  gcodeRendered: 12,
};

// const publicPath = '';
// export const DATA_PATH = `${publicPath}/data`;

// export const DATA_PREFIX = `${publicPath}/data/Tmp`;

// const publicPath = 'C:Users\\106695\\AppData\\Roaming\\Electron';
export const DATA_PATH = `${userDataDir}/data`;
export const DATA_PREFIX = `${userDataDir}/Tmp`;

export const CNC_TOOL_SNAP_V_BIT = 'snap.v-bit';
export const CNC_TOOL_SNAP_V_BIT_CONFIG = { diameter: 3.175, angle: 30 };
export const CNC_TOOL_SNAP_FLAT_END_MILL = 'snap.flat-end-mill';
export const CNC_TOOL_SNAP_FLAT_END_MILL_CONFIG = {
  diameter: 3.175,
  angle: 180,
};
export const CNC_TOOL_SNAP_BALL_END_MILL = 'snap.ball-end-mill';
export const CNC_TOOL_SNAP_BALL_END_MILL_CONFIG = {
  diameter: 3.175,
  angle: 180,
};
export const CNC_TOOL_CUSTOM = 'custom';
export const CNC_TOOL_CUSTOM_CONFIG = { diameter: 3.175, angle: 180 };

export const LASER_GCODE_SUFFIX = '.nc';
export const CNC_GCODE_SUFFIX = '.cnc';
export const PRINTING_GCODE_SUFFIX = '.gcode';

// Replacements for null value
export const ABSENT_VALUE = 896745231;
export const ABSENT_OBJECT = Object.freeze({});

// Experimental features
export const EXPERIMENTAL_WIFI_CONTROL = true;
export const EXPERIMENTAL_LASER_CAMERA = false;
export const EXPERIMENTAL_IMAGE_TRACING = false;
export const EXPERIMENTAL_IMAGE_TRACING_CNC = false;
export const EXPERIMENTAL_PROFILE = true;

export const PROTOCOL_TEXT = 'text';
export const PROTOCOL_SCREEN = 'screen';

export const MAX_LINE_POINTS = 300;
export const TEMPERATURE_MIN = 0;
export const TEMPERATURE_MAX = 300;
export const SPEED_FACTOR_MIN = 0;
export const SPEED_FACTOR_MAX = 500;

export const HEAD_3DP = '3dp';
export const HEAD_LASER = 'laser';
export const HEAD_CNC = 'cnc';
export const HEAD_UNKNOWN = 'unknown';

export const CONNECTION_TYPE_SERIAL = 'serial';
export const CONNECTION_TYPE_WIFI = 'wifi';

export const LASER_PRINT_MODE_AUTO = 'auto';
export const LASER_PRINT_MODE_MANUAL = 'manual';

export const MACHINE_SERIES = {
  CV01PRO: {
    value: 'CV01PRO',
    label: 'CV-01 Pro',
    setting: {
      size: {
        x: 170,
        y: 200,
        z: 200,
      },
      laserSize: {
        x: 170,
        y: 200,
        z: 200,
      },
      style: 'grbl',
    },
  },
  CV20: {
    value: 'CV20',
    label: 'CV-20',
    setting: {
      size: {
        x: 100,
        y: 100,
        z: 100,
      },
      laserSize: {
        x: 100,
        y: 100,
        z: 100,
      },
      style: 'grbl',
    },
  },
  CV30: {
    value: 'CV30',
    label: 'CV-30',
    setting: {
      size: {
        x: 300,
        y: 300,
        z: 300,
      },
      laserSize: {
        x: 300,
        y: 300,
        z: 300,
      },
      style: 'grbl',
    },
  },
  Ender3s: {
    value: 'Ender3s',
    label: 'Ender-3s',
    setting: {
      size: {
        x: 220,
        y: 220,
        z: 220,
      },
      laserSize: {
        x: 220,
        y: 220,
        z: 220,
      },
      style: 'marlin',
    },
  },
  ORIGINAL: {
    value: 'Original',
    label: 'Snapmaker Original',
    setting: {
      size: {
        x: 125,
        y: 125,
        z: 125,
      },
      laserSize: {
        x: 125,
        y: 125,
        z: 125,
      },
    },
  },
  A150: {
    value: 'A150',
    label: 'Snapmaker 2.0 A150',
    setting: {
      size: {
        x: 160,
        y: 160,
        z: 145,
      },
      laserSize: {
        x: 166,
        y: 168,
        z: 150,
      },
    },
    alias: ['SM2-S', 'Snapmaker 2.0 A150'],
  },
  A250: {
    value: 'A250',
    label: 'Snapmaker 2.0 A250',
    setting: {
      size: {
        x: 230,
        y: 250,
        z: 235,
      },
      laserSize: {
        x: 252,
        y: 260,
        z: 235,
      },
    },
    alias: ['SM2-M', 'Snapmaker 2.0 A250'],
  },
  A350: {
    value: 'A350',
    label: 'Snapmaker 2.0 A350',
    setting: {
      size: {
        x: 320,
        y: 350,
        z: 330,
      },
      laserSize: {
        x: 345,
        y: 360,
        z: 334,
      },
    },
    alias: ['SM2-L', 'Snapmaker 2.0 A350'],
  },
  CUSTOM: {
    value: 'Custom',
    label: 'Custom',
    setting: {
      size: {
        x: 125,
        y: 125,
        z: 125,
      },
      laserSize: {
        x: 125,
        y: 125,
        z: 125,
      },
    },
    alias: ['Custom'],
  },
};

export const MACHINE_HEAD_TYPE = {
  WORKSPACE: {
    value: 'workspace',
    label: 'Workspace',
  },
  '3DP': {
    value: '3dp',
    label: '3D Printing',
    alias: ['3DP', '1'],
  },
  LASER: {
    value: 'laser',
    label: 'Laser',
    alias: ['LASER', 'LASER350', 'LASER1600', '3'],
  },
  CNC: {
    value: 'cnc',
    label: 'CNC',
    alias: ['CNC', '2'],
  },
};

// export const IMAGE_WIFI_CONNECTING = '../../images/connection/Screen.png';
// export const IMAGE_WIFI_CONNECT_WAITING =
//   '../../images/connection/ic_waiting-64x64.png';
// export const IMAGE_WIFI_CONNECTED =
//   '../../images/connection/ic_complete_64x64.png';
// export const IMAGE_WIFI_ERROR = '../../images/connection/ic_error_64x64.png';
// export const IMAGE_WIFI_WAITING = '../../images/connection/ic_WI-FI_64x64.png';
// export const IMAGE_WIFI_WARNING = '../../images/ic_warning-64x64.png';

export const LASER_MOCK_PLATE_HEIGHT = 6;
