/* global Actors, Actor, Vec3, VecR */

Actors.Logo = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init(attrs)
}

Actors.Logo.prototype = Object.create(Actor.prototype)

Actors.Logo.prototype.title = 'Logo'

Actors.Logo.prototype.init = function (attrs) {
  this.kings = [];
  this.pos = new Vec3(attrs.x, attrs.y)
}

Actors.Logo.prototype.genAttrs = function (attrs) {
  return {
    time: 0,
    index: 0,
    value: 0,
    duration: this.opts.duration,
  };
}

Actors.Logo.prototype.defaults = [{
  key: 'max_x',
  value: 480,
  min: 32,
  max: 1024
}, {
  key: 'max_y',
  value: 480,
  min: 32,
  max: 1024
}, {
  key: 'duration',
  value: 60,
  min: 1,
  max: 120
}, {
  key: 'scale',
  value: 250,
  min: 50,
  max: 500
}, {
  key: 'kings_max',
  value: 4,
  min: 0,
  max: 255
}]

Actors.Logo.prototype.kill = function () {

  if (this.attrs.dead) {
    return
  }

  this.attrs.dead = true;

}

Actors.Logo.prototype.addKing = function () {
  var king
  king = new Actors.King(
    this.env, {
      logo: this,
      cell: this.refs.cell,
    }, {
      x: this.pos.x,
      y: this.pos.y,
    })

  this.refs.cell.kings.push(king)
  this.kings.push(king)

}

Actors.Logo.prototype.update = function (delta, intent) {
  if(this.kings.length < this.opts.kings_max){
    if(this.refs.cell.refs.maze){
      if( !this.refs.cell.refs.maze.attrs.escape){
        if(Math.random() < 0.001){
          this.addKing();
          }
      }
    } else {
      this.addKing();
    }
  }

  for (i = 0, ii = this.kings.length; i<ii; i++) {
    if(!this.kings[i] || this.kings[i].attrs.dead){
      this.kings.splice(i, 1);
      i--
      ii--
    }
  }
}

Actors.Logo.prototype.paint = function (gx) {


  var z = this.opts.scale;

  var alpha = (0.5-(Math.sin(Math.PI * (Date.now()%4000)/2000)/2));

  gx.ctx.save();
  gx.ctx.translate(this.opts.max_x * 0.5, this.opts.max_y * 0.6)
  gx.ctx.scale(1.2, 1.2)

  gx.ctx.fillStyle = 'rgba(255,0,0,' + alpha + ')';
 
  var ctx = gx.ctx
  var h = (Date.now()%360 * 0.22) - 10;
  var c;
  c = 'hsl(' + h + ', 100%, 50%)';
  
  if(Math.random() < 0.025){
    c = 'rgba(255,255,0,0.5)';
  }

  if(Math.random() < 0.15){
    c = 'rgba(255,255,255,1)';
  }

  ctx.shadowColor = c;
  ctx.shadowBlur = 40;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 16;

  // eyes
  
  gx.ctx.beginPath();
  gx.ctx.moveTo(-0.339 * z, -0.56 * z);
  gx.ctx.quadraticCurveTo(-0.29 * z, -0.40 * z, -0.140 * z, -0.365 * z);
  gx.ctx.quadraticCurveTo(-0.38 * z, -0.32 * z, -0.339 * z, -0.56 * z);
  gx.ctx.fill();

  gx.ctx.beginPath();
  gx.ctx.moveTo(0.339 * z, -0.56 * z);
  gx.ctx.quadraticCurveTo(0.29 * z, -0.40 * z, 0.140 * z, -0.365 * z);
  gx.ctx.quadraticCurveTo(0.38 * z, -0.32 * z, 0.339 * z, -0.56 * z);
  gx.ctx.fill();

  // - whiskers
  
  gx.ctx.strokeStyle = 'rgba(255,0,0,' + alpha + ')';
  //gx.ctx.strokeStyle = '#f00';
  gx.ctx.lineCap='round';
  gx.ctx.lineWidth = 4

  gx.ctx.beginPath();
  gx.ctx.moveTo(-0.18*z, - 0.1 * z);
  gx.ctx.lineTo(-0.75*z, - 0.25 * z);
  gx.ctx.stroke();
 
  gx.ctx.beginPath();
  gx.ctx.moveTo(0.18*z, - 0.1 * z);
  gx.ctx.lineTo(0.75*z, - 0.25 * z);
  gx.ctx.stroke();

  
  gx.ctx.beginPath();
  gx.ctx.moveTo(-0.2*z, 0);
  gx.ctx.lineTo(-1*z, 0);
  gx.ctx.stroke();

  gx.ctx.beginPath();
  gx.ctx.moveTo(0.2*z, 0);
  gx.ctx.lineTo(1*z, 0);
  gx.ctx.stroke();
  
  // /
  gx.ctx.beginPath();
  gx.ctx.moveTo(-0.18*z, 0.1 * z);
  gx.ctx.lineTo(-0.75*z, 0.25 * z);
  gx.ctx.stroke();
 
  gx.ctx.beginPath();
  gx.ctx.moveTo(0.18*z, 0.1 * z);
  gx.ctx.lineTo(0.75*z, 0.25 * z);
  gx.ctx.stroke();

  gx.ctx.restore();

}
