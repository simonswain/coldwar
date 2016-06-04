/* global Scenes, Scene, Actors */

Scenes.stepmaze = function (env, opts) {
  this.env = env
  this.opts = this.genOpts(opts)
  this.attrs = this.genAttrs()
  this.init()
}

Scenes.stepmaze.prototype = Object.create(Scene.prototype)

Scenes.stepmaze.prototype.title = 'Maze'

Scenes.stepmaze.prototype.init = function () {

  this.maze = new Actors.Maze(
    this.env, {
      scene: this
    }, {
      rows: 4,
      cols: 4,
      mode: 2,
    }, {
    })

}

Scenes.stepmaze.prototype.getCast = function () {
  return {
    Maze: Actors.Maze,
    Cell: Actors.Cell,
  }
}

Scenes.stepmaze.prototype.defaults = [{
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

Scenes.stepmaze.prototype.genAttrs = function () {
  return {
  }
}

Scenes.stepmaze.prototype.update = function (delta) {

  this.maze.update(delta);

}

//Scenes.stepmaze.prototype.paintOnce = true;

Scenes.stepmaze.prototype.paint = function (fx, gx, sx) {

  this.maze.paint(gx)
}

Scenes.stepmaze.prototype.getHelp = function () {
  return ''
}
