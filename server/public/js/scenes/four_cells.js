/* global Scenes, Scene, Actors */

Scenes.four_cells = function (env, opts) {
  this.env = env
  this.opts = this.genOpts(opts)
  this.attrs = this.genAttrs()
  this.init()
}

Scenes.four_cells.prototype = Object.create(Scene.prototype)

Scenes.four_cells.prototype.title = 'Four_Cells'

Scenes.four_cells.prototype.init = function () {


  this.cell1 = new Actors.Cell(
    this.env, {
      scene: this
    }, {
    });

  this.cell2 = new Actors.Cell(
    this.env, {
      scene: this
    }, {
    });

  this.cell3 = new Actors.Cell(
    this.env, {
      scene: this
    }, {
    });

  this.cell4 = new Actors.Cell(
    this.env, {
      scene: this
    }, {
    });

}

Scenes.four_cells.prototype.getCast = function () {
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

Scenes.four_cells.prototype.defaults = [{
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

Scenes.four_cells.prototype.genAttrs = function () {
  return {
  }
}

Scenes.four_cells.prototype.update = function (delta) {
  if(!this.cell1.snake) {
    this.cell1.addSnake();
  }
  this.cell1.update(delta);

  if(this.cell2.humans.length === 0) {
    this.cell2.addHuman();
  }
  this.cell2.update(delta);

  if(this.cell3.breeders.length === 0) {
    this.cell3.addBreeder();
  }
  this.cell3.update(delta);

  if(!this.cell4.pong) {
    this.cell4.addPong();
  }
  this.cell4.update(delta);

}

Scenes.four_cells.prototype.paint = function (fx, gx, sx) {

  fx.ctx.save();
  fx.ctx.translate(this.opts.max_x * 0.1, this.opts.max_y * 0.1);
  fx.ctx.scale(0.3, 0.3);

  gx.ctx.save();
  gx.ctx.translate(this.opts.max_x * 0.1, this.opts.max_y * 0.1);
  gx.ctx.scale(0.3, 0.3);
  this.cell1.paint(gx, fx)
  gx.ctx.restore();
  fx.ctx.restore();

  fx.ctx.save();
  fx.ctx.translate(this.opts.max_x * 0.1, this.opts.max_y * 0.6);
  fx.ctx.scale(0.3, 0.3);

  gx.ctx.save();
  gx.ctx.translate(this.opts.max_x * 0.1, this.opts.max_y * 0.6);
  gx.ctx.scale(0.3, 0.3);
  this.cell2.paint(gx, fx)
  gx.ctx.restore();
  fx.ctx.restore();

  fx.ctx.save();
  fx.ctx.translate(this.opts.max_x * 0.6, this.opts.max_y * 0.1);
  fx.ctx.scale(0.3, 0.3);
  gx.ctx.save();
  gx.ctx.translate(this.opts.max_x * 0.6, this.opts.max_y * 0.1);
  gx.ctx.scale(0.3, 0.3);
  this.cell3.paint(gx, fx)
  gx.ctx.restore();
  fx.ctx.restore();

  gx.ctx.save();
  gx.ctx.translate(this.opts.max_x * 0.6, this.opts.max_y * 0.6);
  gx.ctx.scale(0.3, 0.3);

  fx.ctx.save();
  fx.ctx.translate(this.opts.max_x * 0.6, this.opts.max_y * 0.6);
  fx.ctx.scale(0.3, 0.3);
  this.cell4.paint(gx, fx)
  gx.ctx.restore();
  fx.ctx.restore();

}
