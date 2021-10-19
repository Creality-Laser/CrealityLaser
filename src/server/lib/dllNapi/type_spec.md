# type specific

```c
// type.h
#ifndef _GCORE_TYPE_H_
#define _GCORE_TYPE_H_

#include <stdint.h>
#include "../pro_conf.h"

;
#pragma pack(push, 1)

typedef struct ImgPoint {
    int16_t x;  // unit: Pixel
    int16_t y;  // unit: Pixel
} ImgPoint;

typedef struct GcoPoint {
    float x;    // unit: mm
    float y;    // unit: mm
} GcoPoint;

typedef int8_t CarveStartPosition;
enum CarveStartPosition {
    DefaultPosition = 0,
    TopLeft = 1,
    TopRight = 2,
    BottomLeft = 3,
    BottomRight = 4
};

typedef int8_t CarveDirection;
enum CarveDirection {
    DefaultDirection = 0,
    StraightRight = 1,
    StraightLeft = 2,
    DiagonalRight = 3,
    DiagonalLeft = 4
};

typedef int8_t MachineModel;
enum MachineModel {
    UndefinedModel = 0,
    CV_01 = 1,
    CV_01_Pro = 2,
    CV_20 = 20,
    CV_20_Pro = 21,
    CV_30 = 30,
    CV_30_Pro = 31,
    CV_Laser_Module = 101,
    CV_Laser_Module_Pro = 102,
};

typedef int8_t GCodeStyle;
enum GCodeStyle {
    DefaultStyle = 0,
    GRBLStyle = 1,
    MarlinStyle = 2
};

typedef struct GCoreConfig {
    GcoPoint            offset;     // 雕刻位置(x, y) unit: mm (图像左上角)
    float               density;    // 雕刻密度： 大于0  (0 或 或有效范围之外： 机型默认）
    float               power_rate; // 雕刻功率： 0 - 100 (百分比)(0 或 超出范围之外： 机型默认), 通过改变G1 主轴功率(S)实现
    float               speed_rate; // 雕刻深度： 0 - 100 (0 或 超出范围之外： 机型默认), 通过改变G1 主轴速度(F)实现
    // 设备信息
    MachineModel        model;      // 机型
    // 雕刻信息
    CarveStartPosition  start;      // 从图像的那个角点开始雕刻
    CarveDirection      dire;       // 雕刻路径和方式
    GCodeStyle          gco_style;  // 生成GCode风格
    uint16_t            total_num;  // 雕刻次数(0 - 1000)
    int                 jog_speed;  // 空走速度（G0）
    int                 work_speed; // 工作速度（G1）

} GCoreConfig;

#pragma pack(pop)

#endif // GCORE_TYPE_H

```
