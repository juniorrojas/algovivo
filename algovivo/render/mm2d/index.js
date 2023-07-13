const core = require("./core")

module.exports = {
  math: require("./math"),
  ui: require("./ui"),
  shaders: require("./shaders"),
  background: require("./background"),
  sorted: require("./sorted"),
  core: core,
  Renderer: core.Renderer,
  Camera: core.Camera,
  Scene: core.Scene
}