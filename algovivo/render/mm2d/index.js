const core = require("./core")

module.exports = {
  math: require("./math"),
  ui: require("./ui"),
  shaders: require("./shaders"),
  core: core,
  custom: require("./custom"),
  background: require("./background"),
  sorted: require("./sorted"),
  Renderer: core.Renderer,
  Camera: core.Camera,
  Scene: core.Scene
}