/* global Scenes, Scene, Actors */

Scenes.boom = function (env, opts) {
  this.env = env
  this.opts = this.genOpts(opts)
  this.attrs = this.genAttrs()
  this.init()
}

Scenes.boom.prototype = Object.create(Scene.prototype)

Scenes.boom.prototype.title = 'Maze 1'

Scenes.boom.prototype.init = function () {
}

Scenes.boom.prototype.getCast = function () {
  return {
    Boom: Actors.Boom,
  }
}

Scenes.boom.prototype.defaults = [{
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

Scenes.boom.prototype.genAttrs = function () {
  return {
  }
}

Scenes.boom.prototype.update = function (delta) {
  if(!this.boom || this.boom.attrs.dead){
    this.boom = new Actors.Boom(
      this.env, {
      }, {
        style: 'nuke',
        radius: 240,
        x: this.opts.max_x * 0.5,
        y: this.opts.max_y * 0.5,
        color: '255,0,255'
      }
    ); 
  }

  this.boom.update(delta);
  
}


Scenes.boom.prototype.paint = function (fx, gx, sx) { 
  gx.ctx.save();
  gx.ctx.translate(this.opts.max_x * 0.5, this.opts.max_y * 0.5);
  this.boom.paint(gx)
  gx.ctx.restore();
}
