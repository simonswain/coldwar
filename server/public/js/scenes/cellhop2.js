/* global Scenes, Scene, Actors */

Scenes.cellhop2 = function (env, opts) {
  this.env = env
  this.opts = this.genOpts(opts)
  this.attrs = this.genAttrs()
  this.init()
}

Scenes.cellhop2.prototype = Object.create(Scene.prototype)

Scenes.cellhop2.prototype.title = 'Cell Hopping'

Scenes.cellhop2.prototype.init = function () {
  this.env.mute = true;
  this.maze = new Actors.Hoppingmaze(
    this.env, {
      scene: this
    }, {
      human: true,
    }, {
      breeders: 0,
      rows: 1,
      cols: 2
    })
}

Scenes.cellhop2.prototype.getCast = function () {
  return {
    Maze: Actors.Maze,
    Cell: Actors.Cell,
    Human: Actors.Human,
    Zap: Actors.Zap,
    Breeder: Actors.Breeder,
    Rat: Actors.Rat,
    Boom: Actors.Boom,
    Reactor: Actors.Reactor,
  }
}

Scenes.cellhop2.prototype.defaults = [{
  key: 'max_x',
  info: 'Max X',
  value: 640,
  min: 100,
  max: 1600
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 640,
  min: 100,
  max: 1000
}]

Scenes.cellhop2.prototype.genAttrs = function () {
  return {
    cell: 0,
  }
}

Scenes.cellhop2.prototype.update = function (delta) {
  this.maze.update(delta);
}


Scenes.cellhop2.prototype.flash = function(fx, gx, sx){
  if(this.maze.attrs.boom && this.maze.attrs.boomCountdown <= 0){
    if(Math.random() < 0.5){
      gx.ctx.fillStyle = '#ffffff'
      gx.ctx.fillRect(0, 0, gx.w, gx.h)
    }
    if(Math.random() < 0.15){
      fx.ctx.fillStyle = '#f00'
      fx.ctx.fillRect(0, 0, fx.w, fx.h)
    }
    if(Math.random() < 0.15){
      fx.ctx.fillStyle = '#ff0'
      fx.ctx.fillRect(0, 0, fx.w, fx.h)
    }
  }
}

Scenes.cellhop2.prototype.paint = function (fx, gx, sx) { 
  gx.ctx.save();
  gx.ctx.translate(this.opts.max_x * 0.05, this.opts.max_y * 0.05);
  gx.ctx.scale(0.9, 0.9);
  fx.ctx.save();
  fx.ctx.translate(this.opts.max_x * 0.05, this.opts.max_y * 0.05);
  fx.ctx.scale(0.9, 0.9);

  this.maze.paint(gx, fx)

  gx.ctx.restore();
  fx.ctx.restore();

  var h = (Date.now()%360 * 0.22) - 10;

  
  if(this.maze.human){
    gx.ctx.fillStyle = 'hsl(' + h + ', 100%, 50%)';
    
    if(Math.random() < 0.025){
      gx.ctx.fillStyle = 'rgba(255,255,0,0.5)';
    }

    if(Math.random() < 0.025){
      gx.ctx.fillStyle = 'rgba(255,255,255,1)';
    }

    if(Date.now() % 1000 > 950){
      gx.ctx.fillStyle = 'rgba(255,255,255,1)';
    }     

    gx.ctx.font = '36pt robotron';
    gx.ctx.textAlign='center'
    gx.ctx.textBaseline='middle'

    gx.ctx.save();
    if(this.maze.cells[0].humans.length>0)	{
      gx.ctx.translate(this.opts.max_x * 0.3, this.opts.max_y * 0.2);
    } else {
      gx.ctx.translate(this.opts.max_x * 0.7, this.opts.max_y * 0.2);
    }
    gx.ctx.fillText(this.maze.human.pos.x.toFixed(0), 0, 0)
    gx.ctx.restore();

    gx.ctx.save();
    if(this.maze.cells[0].humans.length>0)	{
      gx.ctx.translate(this.opts.max_x * -0.1, this.opts.max_y * 0.5);
    } else {
      gx.ctx.translate(this.opts.max_x * 1.1, this.opts.max_y * 0.5);
    }
    gx.ctx.fillText(this.maze.human.pos.y.toFixed(0), 0, 0)
    gx.ctx.restore();
  }
}
