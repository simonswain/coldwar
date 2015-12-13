/* global Scenes, Scene, Actors */

Scenes.maze = function (env, opts) {
  this.env = env
  this.opts = this.genOpts(opts)
  this.attrs = this.genAttrs()
  this.init()
}

Scenes.maze.prototype = Object.create(Scene.prototype)

Scenes.maze.prototype.title = 'Maze'

Scenes.maze.prototype.init = function () {

  this.maze = new Actors.Maze(
    this.env, {
      scene: this
    }, {
    })

}

Scenes.maze.prototype.getCast = function () {
  return {
    Maze: Actors.Maze
  }
}

Scenes.maze.prototype.defaults = [{
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

Scenes.maze.prototype.genAttrs = function () {
  return {
  }
}

Scenes.maze.prototype.update = function (delta) {
  this.maze.update(delta);
}

//Scenes.maze.prototype.paintOnce = true;

Scenes.maze.prototype.paint = function (fx, gx, sx) {
  this.maze.paint(gx)
}

Scenes.maze.prototype.getHelp = function () {
  return ''
}
