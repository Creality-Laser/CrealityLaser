import isEqual from 'lodash/isEqual';
import get from 'lodash/get';
import set from 'lodash/set';
import events from 'events';
import semver from 'semver';
// import PacketManager from '../PacketManager';

// http://stackoverflow.com/questions/10454518/javascript-how-to-retrieve-the-number-of-decimals-of-a-string-number
function decimalPlaces(num) {
  const match = String(num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
  if (!match) {
    return 0;
  }
  return Math.max(
    0,
    // Number of digits right of decimal point.
    (match[1] ? match[1].length : 0) -
      // Adjust for scientific notation.
      (match[2] ? +match[2] : 0)
  );
}

function mapSerialStatus(num) {
  const statusMap = [
    'SYSTAT_INIT',
    'SYSTAT_IDLE',
    'SYSTAT_WORK',
    'SYSTAT_PAUSE_TRIG',
    'SYSTAT_PAUSE_STOPPED',
    'SYSTAT_PAUSE_FINISH',
    'SYSTAT_RESUME_TRIG',
    'SYSTAT_RESUME_MOVING',
    'SYSTAT_RESUME_WAITING',
  ];

  return statusMap[num] || 'Unknown';
}

/**
 * Generate Print Warning info
 */
function genPrintWarningObj(opts = {}) {
  const defaultOpts = {
    stage: 'start', // The print stage, when warning appear
    errCode: 0,
    msg: 'Unknown error',
    blockGcodeSend: false, // if should block gcode send,
    shouldPause: false, // if sould pause,
    showWarningModal: false, // if frontend should show warning modal
    canUserClose: true, // if user can close the modal
    sendCommands: [], // should sended commands when execute puase command
  };

  return { ...defaultOpts, ...opts };
}

/**
 * Reply parser for Firmware Version (M2005)
 *
 * For details see [Snapmaker-GD32Base](https://snapmaker2.atlassian.net/wiki/spaces/SNAP/pages/3440681/Snapmaker-GD32Base).
 * Examples:
 *  'Firmware Version:V1.0.2-alpha'
 */
class MarlinReplyParserFirmwareVersion {
  static parse(line) {
    const r = line.match(/^Firmware Version:V([0-9.]+(-(alpha|beta)[1-9]?)?)$/);
    if (!r) {
      return null;
    }
    return {
      type: MarlinReplyParserFirmwareVersion,
      payload: {
        version: semver.coerce(r[1]),
      },
    };
  }
}

/**
 * Marlin SM2-1.2.1.0
 */
class MarlinReplyParserSeries {
  static parse(line) {
    const r = line.match(/^Marlin (.*)-([0-9.]+)$/);
    if (!r) {
      return null;
    }
    return {
      type: MarlinReplyParserSeries,
      payload: {
        series: r[1],
        version: semver.coerce(r[2]).version,
      },
    };
  }
}

/**
 * Machine Size: L
 */
class MarlinReplyParserSeriesSize {
  static parse(line) {
    const r = line.match(/^Machine Size: (.*)$/);
    if (!r) {
      return null;
    }
    return {
      type: MarlinReplyParserSeriesSize,
      payload: {
        seriesSize: r[1].trim(),
      },
    };
  }
}

class MarlinReplyParserHeadStatus {
  static parse(line) {
    const r = line.match(/^Current Status: (.*)$/);
    if (!r) {
      return null;
    }
    return {
      type: MarlinReplyParserHeadStatus,
      payload: {
        headStatus: r[1] === 'ON',
      },
    };
  }
}

class MarlinReplyParserHeadPower {
  static parse(line) {
    const r = line.match(/^Current Power: (.*)$/);
    if (!r) {
      return null;
    }
    return {
      type: MarlinReplyParserHeadPower,
      payload: {
        headPower: parseFloat(r[1]),
      },
    };
  }
}

class MarlinReplyParserFocusHeight {
  static parse(line) {
    const r = line.match(/^Focus Height: (.*)$/);
    if (!r) {
      return null;
    }
    return {
      type: MarlinReplyParserFocusHeight,
      payload: {
        zFocus: parseFloat(r[1]),
      },
    };
  }
}

class MarlinReplyParserEmergencyStop {
  static parse(line) {
    const r = line.match(/;Locked UART/);
    if (!r) {
      return null;
    }
    return {
      type: MarlinReplyParserEmergencyStop,
      payload: {
        releaseDate: r[2],
      },
    };
  }
}

class MarlinReplyParserReleaseDate {
  static parse(line) {
    const r = line.match(/^Release Date: (.*)$/);
    if (!r) {
      return null;
    }
    return {
      type: MarlinReplyParserReleaseDate,
      payload: {
        releaseDate: r[2],
      },
    };
  }
}

class MarlinReplyParserToolHead {
  static parse(line) {
    const r = line.match(/^info:Head (.*)$/);
    if (!r) {
      return null;
    }
    return {
      type: MarlinReplyParserToolHead,
      payload: {
        headType: r[1],
      },
    };
  }
}

class MarlinReplyParserEnclosure {
  static parse(line) {
    const r = line.match(/^Door check (on|off)$/);
    if (!r) {
      return null;
    }

    return {
      type: MarlinReplyParserEnclosure,
      payload: {
        enclosure: r[1] === 'on',
      },
    };
  }
}

class MarlinReplyParserEnclosureDoor {
  static parse(line) {
    const r = line.match(/^warning:Door (Openned|Closed)$/);
    if (!r) {
      return null;
    }

    return {
      type: MarlinReplyParserEnclosureDoor,
      payload: {
        enclosure: r[1] === 'Openned',
      },
    };
  }
}

class MarlinLineParserResultStart {
  // start
  static parse(line) {
    const r = line.match(/^start$/);
    if (!r) {
      return null;
    }

    const payload = {};

    return {
      type: MarlinLineParserResultStart,
      payload,
    };
  }
}

class MarlinLineParserResultPosition {
  // X:0.00 Y:0.00 Z:0.00 E:0.00 Count X:0 Y:0 Z:0
  static parse(line) {
    const r = line.match(/^(?:(?:X|Y|Z|E):[0-9.-]+\s+)+/i);
    if (!r) {
      return null;
    }

    const payload = {
      pos: {},
    };
    const pattern = /((X|Y|Z|E):[0-9.-]+)+/gi;
    const params = r[0].match(pattern);

    for (const param of params) {
      const nv = param.match(/^(.+):(.+)/);
      if (nv) {
        const axis = nv[1].toLowerCase();
        const pos = nv[2];
        const digits = decimalPlaces(pos);
        payload.pos[axis] = Number(pos).toFixed(digits);
      }
    }

    return {
      type: MarlinLineParserResultPosition,
      payload,
    };
  }
}

class MarlinLineParserResultOk {
  // ok
  static parse(line) {
    const r = line.match(/^ok($| [0-9]+$)/);
    if (!r) {
      return null;
    }

    const payload = {};

    return {
      type: MarlinLineParserResultOk,
      payload,
    };
  }
}

class MarlinLineParserResultEcho {
  // echo:
  static parse(line) {
    const r = line.match(/^echo:\s*(.+)$/i);
    if (!r) {
      return null;
    }

    const payload = {
      message: r[1],
    };

    return {
      type: MarlinLineParserResultEcho,
      payload,
    };
  }
}

class MarlinLineParserResultError {
  // Error:Printer halted. kill() called!
  static parse(line) {
    const r = line.match(/^Error:\s*(.+)$/i);
    if (!r) {
      return null;
    }

    const payload = {
      message: r[1],
    };

    return {
      type: MarlinLineParserResultError,
      payload,
    };
  }
}

class MarlinLineParserResultOkTemperature {
  static parse(line) {
    const re = /ok (T):([0-9.-]+) *\/([0-9.-]+).*(B):([0-9.-]+) *\/([0-9.-]+)/g;
    const r = re.exec(line);
    if (!r) {
      return null;
    }
    const payload = {
      temperature: {},
    };

    const params = [
      [r[1], r[2], r[3]],
      [r[4], r[5], r[6]],
    ];
    for (const param of params) {
      // const nv = param.match(/^(.+):(.+)/);
      // if (nv) {
      const axis = param[0].toLowerCase();
      const pos = param[1];
      const posTarget = param[2];
      const digits = decimalPlaces(pos);
      const digitsTarget = decimalPlaces(posTarget);
      payload.temperature[axis] = Number(pos).toFixed(digits);
      payload.temperature[`${axis}Target`] =
        Number(posTarget).toFixed(digitsTarget);
    }
    return {
      type: MarlinLineParserResultOkTemperature,
      payload,
    };
  }
}

class MarlinLineParserResultTemperature {
  static parse(line) {
    const re = /(T):([0-9.-]+) *\/([0-9.-]+).*(B):([0-9.-]+) *\/([0-9.-]+)/g;
    const r = re.exec(line);
    if (!r) {
      return null;
    }
    const payload = {
      temperature: {},
    };

    const params = [
      [r[1], r[2], r[3]],
      [r[4], r[5], r[6]],
    ];
    for (const param of params) {
      // const nv = param.match(/^(.+):(.+)/);
      // if (nv) {
      const axis = param[0].toLowerCase();
      const pos = param[1];
      const posTarget = param[2];
      const digits = decimalPlaces(pos);
      const digitsTarget = decimalPlaces(posTarget);
      payload.temperature[axis] = Number(pos).toFixed(digits);
      payload.temperature[`${axis}Target`] =
        Number(posTarget).toFixed(digitsTarget);
    }
    return {
      type: MarlinLineParserResultTemperature,
      payload,
    };
  }
}

class MarlinParserSelectedOrigin {
  static parse(line) {
    const r = line.match(/^Selected origin num: (.*)$/);
    if (!r) {
      return null;
    }
    const payload = {
      message: r[1],
    };

    return {
      type: MarlinParserSelectedOrigin,
      payload,
    };
  }
}

class MarlinParserSelectedCurrent {
  static parse(line) {
    const r = line.match(/^Selected == Current: (.*)$/);
    if (!r) {
      return null;
    }
    const payload = {
      message: r[1],
    };

    return {
      type: MarlinParserSelectedCurrent,
      payload,
    };
  }
}

class MarlinParserOriginOffset {
  static parse(line) {
    const r = line.match(/^Origin offset ([XYZ]): (.*)$/);
    if (!r) {
      return null;
    }

    const key = r[1].toLowerCase();
    const data = parseFloat(r[2]);
    const originOffset = {};
    originOffset[key] = data;

    return {
      type: MarlinParserOriginOffset,
      payload: {
        originOffset,
      },
    };
  }
}

class MarlinParserHomeState {
  static parse(line) {
    const r = line.match(/^Homed: (.*)$/);
    if (!r) {
      return null;
    }
    let isHomed = null;
    if (r[1] === 'YES') {
      isHomed = true;
    } else if (r[1] === 'NO') {
      isHomed = false;
    }

    return {
      type: MarlinParserHomeState,
      payload: {
        isHomed,
      },
    };
  }
}

class MarlinParserWorkingStatus {
  static parse(line) {
    const r = line.match(/^Working Status: (.*)$/);
    if (!r) {
      return null;
    }
    const workingStatus = r[1];

    return {
      type: MarlinParserWorkingStatus,
      payload: {
        workingStatus,
      },
    };
  }
}

// class MarlinParserResumeOver {
//     static parse(line) {
//         const r = line.match(/^Resume complete$/);
//         if (!r) {
//             return null;
//         }

//         const payload = {};

//         return {
//             type: MarlinParserResumeOver,
//             payload: payload
//         };
//     }
// }

class MarlinParserPrintWarningTubeAbnormal {
  static parse(line) {
    const r = line.match(/^warning:Tube Abnormal$/);
    if (!r) {
      return null;
    }

    return {
      type: MarlinParserPrintWarningTubeAbnormal,
      payload: genPrintWarningObj({
        stage: 'start',
        errCode: 1, // an arbitrary error code.
        msg: 'Filament ran out, please change filament and then resume printing.',
        blockGcodeSend: true,
        shouldPause: true,
        showWarningModal: true,
        canUserClose: true,
      }),
    };
  }
}

class MarlinParserPrintWarningRotorLock {
  static parse(line) {
    const r = line.match(/^warning:Drive(.*) locked rotor$/);
    if (!r) {
      return null;
    }

    return {
      type: MarlinParserPrintWarningRotorLock,
      payload: genPrintWarningObj({
        stage: 'start',
        errCode: 2, // an arbitrary error code.
        msg: 'Machine Drive rotor locked!',
        blockGcodeSend: true,
        shouldPause: true,
        showWarningModal: true,
        canUserClose: true,
      }),
    };
  }
}

class MarlinParserPrintWarningDoorOpened {
  static parse(line) {
    const r = line.match(/^warning:Door opened$/);

    if (!r) {
      return null;
    }

    return {
      type: MarlinParserPrintWarningDoorOpened,
      payload: genPrintWarningObj({
        stage: 'start',
        errCode: 3, // an arbitrary error code.
        msg: 'Door Opened!',
        blockGcodeSend: true,
        shouldPause: true,
        showWarningModal: true,
        canUserClose: true,
      }),
    };
  }
}

class MarlinParserPrintWarningDoorClosed {
  static parse(line) {
    const r = line.match(/^warning:Door closed$/);

    if (!r) {
      return null;
    }

    return {
      type: MarlinParserPrintWarningDoorClosed,
      payload: {},
    };
  }
}

class MarlinParserTriggerTypeConfirmStart {
  static parse(line) {
    const r = line.match(/^(.*) start work/);
    if (!r) {
      return null;
    }
    return {
      type: MarlinParserTriggerTypeConfirmStart,
      payload: {
        stage: 'start',
        type: r[1],
      },
    };
  }
}

class MarlinParserTriggerTypeConfirmPause {
  static parse(line) {
    const r = line.match(/^(.*) trigger pause/);
    if (!r) {
      return null;
    }
    return {
      type: MarlinParserTriggerTypeConfirmPause,
      payload: {
        stage: 'pause',
        type: r[1],
      },
    };
  }
}

class MarlinParserTriggerTypeConfirmResume {
  static parse(line) {
    const r = line.match(/^(.*) trigger resume/);
    if (!r) {
      return null;
    }
    return {
      type: MarlinParserTriggerTypeConfirmResume,
      payload: {
        stage: 'resume',
        type: r[1],
      },
    };
  }
}

class MarlinParserTriggerTypeConfirmStop {
  static parse(line) {
    const r = line.match(/^(.*) trigger stop/);
    if (!r) {
      return null;
    }
    return {
      type: MarlinParserTriggerTypeConfirmStop,
      payload: {
        stage: 'stop',
        type: r[1],
      },
    };
  }
}

class MarlinParserTriggerOkStart {
  static parse(line) {
    const r = line.match(/^trigger work: ok/);
    if (!r) {
      return null;
    }
    return {
      type: MarlinParserTriggerOkStart,
      payload: {
        stage: 'start',
      },
    };
  }
}

class MarlinParserTriggerOkPause {
  static parse(line) {
    const r = line.match(/^trigger pause: ok/);
    if (!r) {
      return null;
    }
    return {
      type: MarlinParserTriggerOkPause,
      payload: {
        stage: 'pause',
      },
    };
  }
}

class MarlinParserTriggerOkResume {
  static parse(line) {
    const r = line.match(/^trigger resume: ok/);
    if (!r) {
      return null;
    }
    return {
      type: MarlinParserTriggerOkResume,
      payload: {
        stage: 'resume',
      },
    };
  }
}

class MarlinParserTriggerOkStop {
  static parse(line) {
    const r = line.match(/^trigger stop: ok/);
    if (!r) {
      return null;
    }
    return {
      type: MarlinParserTriggerOkStop,
      payload: {
        stage: 'stop',
      },
    };
  }
}

class MarlinParsrExecuteOkPause {
  static parse(line) {
    const r = line.match(/^Finish pause/);
    if (!r) {
      return null;
    }
    return {
      type: MarlinParsrExecuteOkPause,
      payload: {
        stage: 'pause',
      },
    };
  }
}

class MarlinParsrExecuteOkResume {
  static parse(line) {
    const r = line.match(/^Resume complete/);
    if (!r) {
      return null;
    }
    return {
      type: MarlinParsrExecuteOkResume,
      payload: {
        stage: 'resume',
      },
    };
  }
}

class MarlinParsrExecuteOkStop {
  static parse(line) {
    const r = line.match(/^Finish stop/);
    if (!r) {
      return null;
    }
    return {
      type: MarlinParsrExecuteOkStop,
      payload: {
        stage: 'stop',
      },
    };
  }
}

class MarlinParserSerialPrintStartErr {
  static parse(line) {
    const mainStartErr = line.match(/^start work failed: err=(.*)/);

    if (mainStartErr) {
      return {
        type: MarlinParserSerialPrintStartErr,
        payload: genPrintWarningObj({
          stage: 'start',
          errCode: Number(mainStartErr[1]),
          msg: "Can't print repeatedly",
        }),
      };
    }

    const startErries = line.match(
      /^Can't trigger resume in current status:(.*)$/
    );

    if (!startErries) {
      return null;
    }
    return {
      type: MarlinParserSerialPrintStartErr,
      payload: genPrintWarningObj({
        stage: 'start',
        errCode: Number(startErries[1]),
        msg: mapSerialStatus(startErries[1]),
      }),
    };
  }
}

class MarlinParserSerialPrintPauseErr {
  static parse(line) {
    const mainStartErr = line.match(/^trigger pause failed: err=(.*)/);

    if (mainStartErr) {
      return {
        type: MarlinParserSerialPrintPauseErr,
        payload: genPrintWarningObj({
          stage: 'pause',
          errCode: Number(mainStartErr[1]),
          msg: 'Can not pause while not printing',
        }),
      };
    }

    const startErries = line.match(/^Can't pause in current status:(.*)$/);

    if (!startErries) {
      return null;
    }
    return {
      type: MarlinParserSerialPrintPauseErr,
      payload: genPrintWarningObj({
        stage: 'pause',
        errCode: Number(startErries[1]),
        msg: mapSerialStatus(startErries[1]),
      }),
    };
  }
}

class MarlinParserSerialPrintResumeErr {
  static parse(line) {
    const mainStartErr = line.match(/^trigger resume failed: err=(.*)/);

    if (mainStartErr) {
      return {
        type: MarlinParserSerialPrintResumeErr,
        payload: genPrintWarningObj({
          stage: 'resume',
          errCode: Number(mainStartErr[1]),
          msg: 'Can not resume while current state is not pause',
        }),
      };
    }

    const startErries = line.match(
      /^Can't trigger resume in current status:(.*)$/
    );

    if (!startErries) {
      return null;
    }
    return {
      type: MarlinParserSerialPrintResumeErr,
      payload: genPrintWarningObj({
        stage: 'resume',
        errCode: Number(startErries[1]),
        msg: mapSerialStatus(startErries[1]),
      }),
    };
  }
}

class MarlinParserSerialPrintStopErr {
  static parse(line) {
    const mainStartErr = line.match(/^trigger stop failed: err=(.*)/);

    if (mainStartErr) {
      return {
        type: MarlinParserSerialPrintStopErr,
        payload: genPrintWarningObj({
          stage: 'stop',
          errCode: Number(mainStartErr[1]),
          msg: 'Can not stop while current state is not print or pause',
        }),
      };
    }

    const startErries = line.match(
      /^Can't trigger stop in current status:(.*)$/
    );

    if (!startErries) {
      return null;
    }
    return {
      type: MarlinParserSerialPrintStopErr,
      payload: genPrintWarningObj({
        stage: 'stop',
        errCode: Number(startErries[1]),
        msg: mapSerialStatus(startErries[1]),
      }),
    };
  }
}

class MarlinLineParser {
  parse(line) {
    const parsers = [
      // ok
      MarlinLineParserResultOk,

      // cnc emergency stop when enclosure open
      MarlinReplyParserEmergencyStop,

      // New Parsers (follow headType `MarlinReplyParserXXX`)
      // M2005
      MarlinReplyParserFirmwareVersion,

      // Marlin SM2-1.2.1.0
      MarlinReplyParserSeries,

      // Machine Size: L
      MarlinReplyParserSeriesSize,

      MarlinReplyParserReleaseDate,
      // M1006
      MarlinReplyParserToolHead,
      // M1010
      MarlinReplyParserEnclosure,
      MarlinReplyParserEnclosureDoor,

      // start
      MarlinLineParserResultStart,

      // X:0.00 Y:0.00 Z:0.00 E:0.00 Count X:0 Y:0 Z:0
      MarlinLineParserResultPosition,

      // echo:
      MarlinLineParserResultEcho,

      // Error:Printer halted. kill() called!
      MarlinLineParserResultError,

      MarlinLineParserResultOkTemperature,
      // ok T:293.0 /0.0 B:25.9 /0.0 B@:0 @:0
      MarlinLineParserResultTemperature,
      // Homed: YES
      MarlinParserHomeState,

      MarlinParserOriginOffset,

      MarlinParserSelectedCurrent,

      MarlinParserSelectedOrigin,

      MarlinReplyParserFocusHeight,

      MarlinReplyParserHeadPower,

      MarlinReplyParserHeadStatus,

      MarlinParserPrintWarningRotorLock,
      MarlinParserPrintWarningDoorOpened,
      MarlinParserPrintWarningDoorClosed,

      // Resume over
      // MarlinParserResumeOver,
      MarlinParserPrintWarningTubeAbnormal,

      // parse serial printing info
      // start work
      MarlinParserTriggerTypeConfirmStart,
      MarlinParserTriggerOkStart,
      MarlinParserSerialPrintStartErr,
      // pause
      MarlinParserTriggerTypeConfirmPause,
      MarlinParserTriggerOkPause,
      MarlinParserSerialPrintPauseErr,
      MarlinParsrExecuteOkPause,
      // resume
      MarlinParserTriggerTypeConfirmResume,
      MarlinParserTriggerOkResume,
      MarlinParserSerialPrintResumeErr,
      MarlinParsrExecuteOkResume,
      // stop
      MarlinParserTriggerTypeConfirmStop,
      MarlinParserTriggerOkStop,
      MarlinParserSerialPrintStopErr,
      MarlinParsrExecuteOkStop,

      MarlinParserWorkingStatus,
    ];

    for (const parser of parsers) {
      const result = parser.parse(line);
      if (result) {
        set(result, 'payload.raw', line);
        return result;
      }
    }

    return {
      type: null,
      payload: {
        raw: line,
      },
    };
  }
}

class Marlin extends events.EventEmitter {
  state = {
    series: '',
    seriesSize: '',
    // firmware version
    version: '1.0.0',
    // tool head type
    headType: '',
    pos: {
      x: '0.000',
      y: '0.000',
      z: '0.000',
      e: '0.000',
    },
    modal: {
      motion: 'G0', // G0, G1, G2, G3, G38.2, G38.3, G38.4, G38.5, G80
      units: 'G21', // G20: Inches, G21: Millimeters
      distance: 'G90', // G90: Absolute, G91: Relative
      feedrate: 'G94', // G93: Inverse time mode, G94: Units per minute
      spindle: 'M5', // M3: Spindle (cw), M4: Spindle (ccw), M5: Spindle off
    },
    speedFactor: 100,
    extruderFactor: 100,
    temperature: {
      b: '0.0',
      bTarget: '0.0',
      t: '0.0',
      tTarget: '0.0',
    },
    spindle: 0, // Related to M3, M4, M5
    jogSpeed: 0, // G0
    workSpeed: 0, // G1
    headStatus: false,
    workingStatus: 'UNKONWN', // indicate print current status: 'IDLE' | 'WORKING_PC' | 'WORKING_SCREEN' | 'ERROR'
    // Head Power (in percentage, an integer between 0~100)
    headPower: 0,
    gcodeFile: null,
    updateFile: null,
    calibrationMargin: 0,
    updateProgress: 0,
    updateCount: 0,
    firmwareVersion: '',
    moduleID: 0,
    moduleVersion: '',
    machineSetting: {},
    zFocus: 0,
    gcodeHeader: 0,
    isHomed: null,
    originOffset: {
      x: 0,
      y: 0,
      z: 0,
    },
    hexModeEnabled: false,
    isScreenProtocol: false,
  };

  settings = {
    // whether enclosure is turned on
    enclosure: false,
    enclosureDoor: false,
  };

  parser = new MarlinLineParser();

  // packetManager = new PacketManager();

  setState(state) {
    const nextState = { ...this.state, ...state };

    if (!isEqual(this.state, nextState)) {
      this.state = nextState;
    }
  }

  set(settings) {
    const nextSettings = { ...this.settings, ...settings };

    if (!isEqual(this.settings, nextSettings)) {
      this.settings = nextSettings;
    }
  }

  parse(data) {
    data = String(data).replace(/\s+$/, '');
    if (!data) {
      return;
    }

    this.emit('raw', { raw: data });

    const result = this.parser.parse(data) || {};
    const { type, payload } = result;

    if (type === MarlinReplyParserFirmwareVersion) {
      this.setState({ version: payload.version });
      this.emit('firmware', payload);
    } else if (type === MarlinReplyParserSeries) {
      this.setState({ series: payload.series, version: payload.version });
      this.emit('series', payload);
    } else if (type === MarlinReplyParserSeriesSize) {
      this.setState({ seriesSize: payload.seriesSize });
      this.emit('series', payload);
    } else if (type === MarlinReplyParserReleaseDate) {
      this.emit('firmware', payload);
    } else if (type === MarlinReplyParserToolHead) {
      if (this.state.headType !== payload.headType) {
        this.setState({ headType: payload.headType });
      }
      this.emit('headType', payload);
    } else if (type === MarlinReplyParserFocusHeight) {
      if (this.state.zFocus !== payload.zFocus) {
        this.setState({ zFocus: payload.zFocus });
      }
      this.emit('focusHeight', payload);
    } else if (type === MarlinReplyParserHeadPower) {
      if (this.state.headPower !== payload.headPower) {
        this.setState({ headPower: payload.headPower });
      }
      this.emit('headPower', payload);
    } else if (type === MarlinReplyParserHeadStatus) {
      if (this.state.headStatus !== payload.headStatus) {
        this.setState({ headStatus: payload.headStatus });
      }
      this.emit('headStatus', payload);
    } else if (type === MarlinReplyParserEnclosure) {
      if (this.settings.enclosure !== payload.enclosure) {
        this.set({ enclosure: payload.enclosure });
      }
      this.emit('enclosure', payload);
    } else if (type === MarlinReplyParserEnclosureDoor) {
      if (this.settings.enclosureDoor !== payload.enclosureDoor) {
        this.set({ enclosureDoor: payload.enclosureDoor });
      }
      this.emit('enclosure', payload);
    } else if (type === MarlinLineParserResultStart) {
      this.emit('start', payload);
    } else if (type === MarlinReplyParserEmergencyStop) {
      this.emit('cnc:stop', payload);
    } else if (type === MarlinParserOriginOffset) {
      this.setState({
        originOffset: {
          ...this.state.originOffset,
          ...payload.originOffset,
        },
      });
      this.emit('originOffset', payload);
    } else if (type === MarlinLineParserResultPosition) {
      const nextState = {
        ...this.state,
        pos: {
          ...this.state.pos,
          ...payload.pos,
        },
      };

      if (!isEqual(this.state.pos, nextState.pos)) {
        this.state = nextState; // enforce change
      }
      this.emit('pos', payload);
    } else if (type === MarlinLineParserResultOk) {
      this.emit('ok', payload);
    } else if (type === MarlinLineParserResultError) {
      this.emit('error', payload);
    } else if (type === MarlinLineParserResultEcho) {
      this.emit('echo', payload);
    } else if (type === MarlinLineParserResultTemperature) {
      // For firmware version < 2.4, we use temperature to determine head type
      this.setState({ temperature: payload.temperature });
      this.emit('temperature', payload);
    } else if (type === MarlinLineParserResultOkTemperature) {
      this.setState({ temperature: payload.temperature });
      this.emit('temperature', payload);
      this.emit('ok');
    } else if (type === MarlinParserHomeState) {
      this.setState({ isHomed: payload.isHomed });
      this.emit('home', payload);
    } else if (type === MarlinParserSelectedOrigin) {
      this.emit('selected', payload);
    } else if (type === MarlinParserSelectedCurrent) {
      this.emit('selected', payload);
    } else if (type === MarlinParserPrintWarningTubeAbnormal) {
      this.emit('serial:print:error', payload);
    } else if (type === MarlinParserPrintWarningRotorLock) {
      this.emit('serial:print:error', payload);
    } else if (type === MarlinParserPrintWarningDoorOpened) {
      this.emit('serial:print:error', payload);
    } else if (type === MarlinParserPrintWarningDoorClosed) {
      this.emit('serial:print:door:closed', payload);
    } else if (type === MarlinParserTriggerTypeConfirmStart) {
      this.emit('serial:print:trigger:type:confirm', payload);
    } else if (type === MarlinParserTriggerOkStart) {
      this.emit('serial:print:trigger:ok', payload);
    } else if (type === MarlinParserSerialPrintStartErr) {
      this.emit('serial:print:error', payload);
    } else if (type === MarlinParserTriggerTypeConfirmPause) {
      this.emit('serial:print:trigger:type:confirm', payload);
    } else if (type === MarlinParserTriggerOkPause) {
      this.emit('serial:print:trigger:ok', payload);
    } else if (type === MarlinParserSerialPrintPauseErr) {
      this.emit('serial:print:error', payload);
    } else if (type === MarlinParsrExecuteOkPause) {
      this.emit('serial:print:execute:ok', payload);
    } else if (type === MarlinParserTriggerTypeConfirmResume) {
      this.emit('serial:print:trigger:type:confirm', payload);
    } else if (type === MarlinParserTriggerOkResume) {
      this.emit('serial:print:trigger:ok', payload);
    } else if (type === MarlinParserSerialPrintResumeErr) {
      this.emit('serial:print:error', payload);
    } else if (type === MarlinParsrExecuteOkResume) {
      this.emit('serial:print:execute:ok', payload);
    } else if (type === MarlinParserTriggerTypeConfirmStop) {
      this.emit('serial:print:trigger:type:confirm', payload);
    } else if (type === MarlinParserTriggerOkStop) {
      this.emit('serial:print:trigger:ok', payload);
    } else if (type === MarlinParserSerialPrintStopErr) {
      this.emit('serial:print:error', payload);
    } else if (type === MarlinParsrExecuteOkStop) {
      this.emit('serial:print:execute:ok', payload);
    } else if (type === MarlinParserWorkingStatus) {
      const workingStatus = payload.workingStatus;
      if (workingStatus) {
        this.setState({ workingStatus });
        // working status conflicted, should disconnect
        // const isPrintOccupied = workingStatus === 'WORKING_SCREEN';
        // if (isPrintOccupied) {
        // this.emit('serial:print:conflicted');
        // }
      }
    } else if (data.length > 0) {
      this.emit('others', payload);
    }
  }

  getPosition(state = this.state) {
    return get(state, 'pos', {});
  }

  getModal(state = this.state) {
    return get(state, 'modal', {});
  }
}

export {
  MarlinLineParser,
  MarlinLineParserResultStart,
  MarlinLineParserResultPosition,
  MarlinLineParserResultOk,
  MarlinLineParserResultEcho,
  MarlinLineParserResultError,
  MarlinLineParserResultTemperature,
  MarlinLineParserResultOkTemperature,
  MarlinParserHomeState,
  // MarlinParserResumeOver,
  MarlinParserPrintWarningTubeAbnormal as MarlinParserTubeAbnormal,
  MarlinParserTriggerTypeConfirmStart,
  MarlinParserSerialPrintStartErr,
  MarlinParserTriggerOkStart,
  MarlinParserTriggerTypeConfirmPause,
  MarlinParserTriggerOkPause,
  MarlinParsrExecuteOkPause,
  MarlinParserTriggerTypeConfirmResume,
  MarlinParserTriggerOkResume,
  MarlinParserTriggerTypeConfirmStop,
  MarlinParserWorkingStatus,
};
export default Marlin;
