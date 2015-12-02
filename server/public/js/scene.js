function Scene () {
}

Scene.prototype.title = 'Default Scene'

Scene.prototype.init = function () {
  this.attrs = this.genAttrs()
}

Scene.prototype.getCast = function () {
  return {}
}

Scene.prototype.defaults = [{
  key: 'max_x',
  info: 'Max X',
  value: 100,
  min: 100,
  max: 1600
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 100,
  min: 100,
  max: 1000
}, {
  key: 'max_z',
  info: 'Max Z',
  value: 100,
  min: 50,
  max: 500
}]

Scene.prototype.genOpts = function (args) {
  var opts = {}
  this.defaults.forEach(function (param) {
    if (args && args.hasOwnProperty(param.key)) {
      opts[param.key] = Number(args[param.key])
    } else {
      opts[param.key] = param.value
    }
  }, this)
  return opts
}

Scene.prototype.genAttrs = function () {
  return {
  }
}

Scene.prototype.update = function (delta) {
}

Scene.prototype.paint = function (view) {
}

Scene.prototype.elevation = function (view) {
}

Scene.prototype.getHelp = function () {
  return ''
}
