# CrealityLaser

Laser Desktop App for Creality, inspired by [Luban](https://github.com/Snapmaker/Luban).

## 框架相关

[Electron React Boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate) uses [Electron](https://electron.atom.io/), [React](https://facebook.github.io/react/),[React Router](https://github.com/reactjs/react-router),[Webpack](https://webpack.js.org/),[React Fast Refresh](https://www.npmjs.com/package/react-refresh)

### Install

- **If you have installation or compilation issues with this project, please see [our debugging guide](https://github.com/electron-react-boilerplate/electron-react-boilerplate/issues/400)**

First, clone the repo via git and install dependencies:
[note, install dependencies in windows 10 require admin permissions.](https://github.com/electron-react-boilerplate/electron-react-boilerplate/issues/2986)

```bash
git clone --depth 1 --single-branch https://github.com/electron-react-boilerplate/electron-react-boilerplate.git your-project-name
cd your-project-name
yarn
```

### Starting Development

Start the app in the `dev` environment:

```bash
yarn start
```

### Packaging for Production

To package apps for the local platform:

```bash
yarn package
```

### Docs

See our [docs and guides here](https://electron-react-boilerplate.js.org/docs/installation)

## 项目架构

./.erb --------------------> 项目脚手架文件；  
./src/main.dev.ts ---------> Electron 入口文件；  
./src/app/\* --------------> 前端代码文件夹；  
./src/electron-app/\* -----> Electron 相关代码文件夹；  
./src/server/\* -----------> Server 相关代码文件夹；

## Wiki

- [i18n](https://phrase.com/blog/posts/building-an-electron-app-with-internationalization-i18n/)
- [ipc](https://www.electronjs.org/docs/api/ipc-main)

## tips

### 安装库文件特定大版本的依赖

`yarn add <package...> [--tilde/-T]`
Using `--tilde` or `-T` installs **the most recent release** of the packages that have **the same minor version**. The default is to use the most recent release with the same major version. For example, `yarn add foo@1.2.3 --tilde` would accept 1.2.9 but not 1.3.0.
