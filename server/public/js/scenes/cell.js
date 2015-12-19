/* global Scenes, Scene, Actors */

Scenes.cell = function (env, opts) {
  this.env = env
  this.opts = this.genOpts(opts)
  this.attrs = this.genAttrs()
  this.init()
}

Scenes.cell.prototype = Object.create(Scene.prototype)

Scenes.cell.prototype.title = 'Cell'

Scenes.cell.prototype.init = function () {

  this.cell = new Actors.Cell(
    this.env, {
      scene: this
    }, {
    })

  this.cell.addHuman();
  this.cell.addBreeder();
  
}

Scenes.cell.prototype.getCast = function () {
  return {
    Cell: Actors.Cell,
    Human: Actors.Human,
    Zap: Actors.Zap,
    Breeder: Actors.Breeder,
    Rat: Actors.Rat,
    Boom: Actors.Boom,
    Reactor: Actors.Reactor,
  }
}

Scenes.cell.prototype.defaults = [{
  key: 'max_x',
  info: 'Max X',
  value: 480,
  min: 100,
  max: 1600
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 480,
  min: 100,
  max: 1000
}]

Scenes.cell.prototype.genAttrs = function () {
  return {
  }
}

Scenes.cell.prototype.update = function (delta) {
  this.cell.update(delta);
}

//Scenes.cell.prototype.paintOnce = true;

Scenes.cell.prototype.paint = function (fx, gx, sx) {
  this.cell.paint(gx)
}

Scenes.cell.prototype.getHelp = function () {
  return ''
}

Scenes.cell.prototype.frames = [];

Scenes.cell.prototype.frames[0] = {
  text:[
    'What happens in the room',
  ].join("\n"),
};
