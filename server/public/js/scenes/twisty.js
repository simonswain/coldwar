/* global Scenes, Scene, Actors */

Scenes.twisty = function (env, opts) {
  this.env = env
  this.opts = this.genOpts(opts)
  this.attrs = this.genAttrs()
  this.init()
}

Scenes.twisty.prototype = Object.create(Scene.prototype)

Scenes.twisty.prototype.title = 'Twisty'

Scenes.twisty.prototype.genAttrs = function () {
  return {
  }
}

Scenes.twisty.prototype.init = function () {
  this.maze = new Actors.TwistyMaze(
    this.env, {
      scene: this
    }, {
    }, {
      // rows: 3,
      // cols: 4
      rows: 4,
      cols: 6
    })
}

Scenes.twisty.prototype.getCast = function () {
  return {
    Maze: Actors.TwistyMaze,
    Cell: Actors.TwistyCell,
    Human: Actors.TwistyHuman,
    Zap: Actors.Zap,
    Boom: Actors.Boom
  }
}

Scenes.twisty.prototype.defaults = [{
  key: 'max_x',
  info: 'Max X',
  value: 640,
  min: 100,
  max: 1600
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 480,
  min: 100,
  max: 1000
}]

Scenes.twisty.prototype.update = function (delta) {
  this.maze.update(delta);
}

Scenes.twisty.prototype.paint = function (fx, gx, sx) { 
  gx.ctx.save();
  gx.ctx.translate(this.opts.max_x * 0.05, this.opts.max_y * 0.05);
  gx.ctx.scale(0.9, 0.9);
  this.maze.paint(gx, fx)
  gx.ctx.restore();
}
