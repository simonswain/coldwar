/* global Scenes, Scene, Actors */

Scenes.simcell = function (env, opts) {
  this.env = env
  this.opts = this.genOpts(opts)
  this.attrs = this.genAttrs()
  this.init()
}

Scenes.simcell.prototype = Object.create(Scene.prototype)

Scenes.simcell.prototype.title = 'Simcell'

Scenes.simcell.prototype.init = function () {

  this.cell = new Actors.Cell(
    this.env, {
      scene: this
    }, {
    });

}

Scenes.simcell.prototype.getCast = function () {
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

Scenes.simcell.prototype.defaults = [{
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

Scenes.simcell.prototype.genAttrs = function () {
  return {
  }
}

Scenes.simcell.prototype.update = function (delta) {
  if(!this.cell.snake) {
    this.cell.addSnake();
  }
  this.cell.update(delta);
}

Scenes.simcell.prototype.paint = function (fx, gx, sx) {

  gx.ctx.save();
  gx.ctx.translate(this.opts.max_x * 0.05, this.opts.max_y * 0.05);
  gx.ctx.scale(0.9, 0.9);

  fx.ctx.save();
  fx.ctx.translate(this.opts.max_x * 0.05, this.opts.max_y * 0.05);
  fx.ctx.scale(0.9, 0.9);

  this.cell.paint(gx, fx)
   
  fx.ctx.restore();
  gx.ctx.restore();

}
