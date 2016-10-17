/* global Scenes, Scene, Actors */

Scenes.room = function (env, opts) {
  this.env = env
  this.opts = this.genOpts(opts)
  this.attrs = this.genAttrs()
  this.init()
}

Scenes.room.prototype = Object.create(Scene.prototype)

Scenes.room.prototype.title = 'Room'

Scenes.room.prototype.init = function () {

  this.cell = new Actors.Cell(
    this.env, {
      scene: this
    }, {
    })

  //this.cell.addHuman();
  this.cell.addBreeder();
  
}

Scenes.room.prototype.getCast = function () {
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

Scenes.room.prototype.defaults = [{
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

Scenes.room.prototype.genAttrs = function () {
  return {
  }
}

Scenes.room.prototype.update = function (delta) {
  this.cell.update(delta);
  if(!this.env.gameover && this.cell.rats.length === 0){
    this.env.gameover = true;
    setTimeout(this.env.restart, 1500)
  }
  
}

Scenes.room.prototype.paint = function (fx, gx, sx) {

  gx.ctx.save();
  gx.ctx.translate(this.opts.max_x * 0.05, this.opts.max_y * 0.05);
  gx.ctx.scale(0.9, 0.9);

  this.cell.paint(gx)
 
  gx.ctx.restore();

}
