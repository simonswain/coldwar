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
  if(!this.env.gameover && this.cell.rats.length === 0){
    this.env.gameover = true;
    setTimeout(this.env.restart, 1500)
  }
  
}

//Scenes.cell.prototype.paintOnce = true;

Scenes.cell.prototype.paint = function (fx, gx, sx) {

  gx.ctx.save();
  gx.ctx.translate(this.opts.max_x * 0.05, this.opts.max_y * 0.05);
  gx.ctx.scale(0.9, 0.9);

  this.cell.paint(gx)

  gx.ctx.save();
  gx.ctx.translate(this.opts.max_x * 0.5, this.opts.max_y * 0.2);

  var h = (Date.now()%360 * 0.22) - 10;
  gx.ctx.fillStyle = 'hsla(' + h + ', 100%, 50%, 0.5)';
  
  if(Math.random() < 0.025){
    gx.ctx.fillStyle = 'rgba(255,255,0,0.5)';
  }

  if(Math.random() < 0.025){
    gx.ctx.fillStyle = 'rgba(255,255,255,0.5)';
  }

  if(Date.now() % 1000 < 200){
    gx.ctx.fillStyle = 'rgba(0,0,0,0.5)';
  }

  if(Date.now() % 1000 > 950){
    gx.ctx.fillStyle = 'rgba(255,255,255,0.5)';
  }     

  gx.ctx.font = '40pt robotron';
  gx.ctx.textAlign='center';
  gx.ctx.textBaseline='middle'
  gx.ctx.fillText('SIMULATION', 0, 0);
  gx.ctx.restore();

  
  gx.ctx.restore();

}
