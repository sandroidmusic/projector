# Projector

Projector is a foundation to create 3D Scenes that can be used for Projection Mapping or just to visualize audio and/or midi in the browser. It does this by using [Three.js](https://threejs.org/) , [Webmidi.js](https://webmidijs.org/) and the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API). I'm not sure if this could be considered a framework or just a bunch of helpers :laughing: , let's say it's a framework to keep it simple.

Check out these videos, to see it in action:

* https://www.youtube.com/watch?v=J2pfZ2ajXEs
* https://www.youtube.com/watch?v=XNAvY6RsBBA

All this is wrapped in [Vue 3](https://vuejs.org/) Environment, for easy Hot Reloading during development and for ease of UI development.

It has everything you need, to start creating your own scenes in 3D and to analyze/visualize audio. At its heart it has a SceneController that can be either controlled programmatically or via midi to change scenes. It includes a bunch of example scenes, so you can get a feel of how things work.

Some code is documented, some isn't. You are using this at your own peril :laughing:

Future improvements will be made available, when i keep improving and using this for my own projects.

You can find the source for projects shown in the videos above in their respective branch.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

or

```sh
npm run serve
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
