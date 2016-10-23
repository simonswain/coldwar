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
        radius: 420,
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

  var yy = (this.opts.max_y * 0.2);
  var dy = (this.opts.max_y * 0.1);
  var xx = (this.opts.max_x * 0.2);
  var dx = (this.opts.max_x * 0.06);
  var y = 0;
  var x = 0;
  gx.ctx.save();
  gx.ctx.translate(Math.random() - 0.5, Math.random() - 0.5);

  var h = (Date.now()%360 * 0.22) - 10;
  var c = 'hsl(' + h + ', 100%, 50%)';
  
  if(Math.random() < 0.025){
    c = 'rgba(255,255,0,0.5)';
  }

  if(Math.random() < 0.025){
    c = 'rgba(255,255,255,1)';
  }

  if(Date.now() % 1000 < 200){
    c = 'rgba(0,0,0,1)';
  }

  if(Date.now() % 1000 > 950){
    c = 'rgba(255,255,255,1)';
  }     

  gx.ctx.fillStyle = c;
 
  gx.ctx.shadowColor = 'rgba(0,0,0,1)';
  gx.ctx.shadowBlur = 40;
  gx.ctx.shadowOffsetX = 0;
  gx.ctx.shadowOffsetY = 0;
  gx.ctx.shadowBlur = this.opts.max_x * 0.1;
  
  gx.ctx.font = '36pt robotron';
  gx.ctx.textAlign = 'center';
  gx.ctx.textBaseline = 'middle';

  gx.ctx.fillText('simon_swain', this.opts.max_x/2, this.opts.max_y * 0.3);

  gx.ctx.font = '36pt monospace';
  gx.ctx.textAlign = 'center';
  gx.ctx.textBaseline = 'middle';

  gx.ctx.fillText('@', this.opts.max_x * 0.18, this.opts.max_y * 0.3);

  //

  var h = (Date.now()%540 * 0.23) - 10;
  var c = 'hsl(' + h + ', 100%, 50%)';
  
  if(Math.random() < 0.025){
    c = 'rgba(255,255,0,0.5)';
  }

  if(Math.random() < 0.025){
    c = 'rgba(255,255,255,1)';
  }

  if(Date.now() % 600 < 50){
    c = 'rgba(0,0,0,1)';
  }

  if(Date.now() % 600 > 550){
    c = 'rgba(255,255,255,1)';
  }     

  gx.ctx.fillStyle = c;
 
  gx.ctx.shadowColor = 'rgba(0,0,0,1)';
  gx.ctx.shadowBlur = 40;
  gx.ctx.shadowOffsetX = 0;
  gx.ctx.shadowOffsetY = 0;
  gx.ctx.shadowBlur = this.opts.max_x * 0.1;
  
  gx.ctx.font = '36pt robotron';
  gx.ctx.textAlign = 'center';
  gx.ctx.textBaseline = 'middle';

  gx.ctx.fillText('ratsofthemaze.com', this.opts.max_x/2, this.opts.max_y * 0.7);
  
  gx.ctx.restore();
  
}
