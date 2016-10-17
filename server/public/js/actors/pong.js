/* global Actors, Actor, Vec3, VecR */

Actors.Pong = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init(attrs)
}

Actors.Pong.prototype = Object.create(Actor.prototype)

Actors.Pong.prototype.title = 'Pong'

Actors.Pong.prototype.init = function (attrs) {
  this.pos = new Vec3(
    attrs.x,
    attrs.y
  );

  this.velo = new VecR(
    Math.PI * 2 * Math.random(),
    this.attrs.speed
  ).vec3()

}

Actors.Pong.prototype.genAttrs = function (attrs) {

  var speed = this.opts.speed_base + (Math.random() * this.opts.speed_flux)

  return {
    angry: false,
    speed: speed,
    ttl: this.opts.ttl
  }

}

Actors.Pong.prototype.defaults = [{
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
  key: 'ttl',
  value: 800,
  min: 1,
  max: 2000
}, {
  key: 'speed_base',
  info: '',
  value: 32,
  min: 1,
  max: 100
}, {
  key: 'speed_flux',
  info: '',
  value: 8,
  min: 0,
  max: 50
}, {
  key: 'velo_scale',
  info: '',
  value: 1,
  min: 0.1,
  max: 1,
  step: 0.1
}]

Actors.Pong.prototype.kill = function () {
  if (this.attrs.dead) {
    return
  }
  this.attrs.dead = true;

}

Actors.Pong.prototype.angry = function () {
  this.attrs.angry = true;
}


Actors.Pong.prototype.twist = function () {
  var v = this.velo.vecr();
  
  var q = new VecR(Math.PI * 2 * Math.random(), 1 );

  v.a += q.a * 0.1
  this.velo = v.vec3();
};

Actors.Pong.prototype.update = function (delta, intent) {

  var vec = new Vec3()

  vec.scale(this.opts.velo_scale);
  
  var speed = this.attrs.speed;
  
  this.velo.add(vec)
  this.velo.limit(speed )
  this.pos.add(this.velo)
  if(this.attrs.angry){
    this.pos.add(this.velo)
  }

  if(this.refs.cell.snake){
    var pos = this.refs.cell.snake.vec();
    if(this.pos.rangeXY(pos) < 128){
      this.velo = new Vec3(-this.velo.x, -this.velo.y, 0);
    }
  }

  // if(this.refs.cell.reactor){
  //   var pos = new Vec3(this.refs.cell.opts.max_x, this.refs.cell.opts.max_x);
  //   if(this.pos.rangeXY(pos) < this.refs.cell.opts.max_x * 0.5){
  //     this.velo = new Vec3(-this.velo.x, -this.velo.y, 0);
  //   }
  // }

  // if(this.refs.cell.breeders.length > 0){
  //   var pos = new Vec3(this.refs.cell.opts.max_x, this.refs.cell.opts.max_x);
  //   if(this.pos.rangeXY(pos) < this.refs.cell.opts.max_x * 0.5){
  //     this.velo = new Vec3(-this.velo.x, -this.velo.y, 0);
  //   }
  // }
  
  // if(this.refs.cell.capacitor){
  //   var pos = new Vec3(this.refs.cell.opts.max_x, this.refs.cell.opts.max_x);
  //   if(this.pos.rangeXY(pos) < this.refs.cell.opts.max_x * 0.5){
  //     this.velo = new Vec3(-this.velo.x, -this.velo.y, 0);
  //   }
  // }

  var other;
  if (this.pos.x < 0) {
    other = this.refs.cell.exits[3];
    if(other){
      this.pos.x += this.refs.cell.opts.max_x
    } else {
      this.velo = new Vec3(-this.velo.x, this.velo.y, 0);
      this.twist();
      this.pos.x = 0
    }
  } else if (this.pos.x > this.refs.cell.opts.max_x) {
    other = this.refs.cell.exits[1];
    if(other){
      this.pos.x = this.pos.x - this.refs.cell.opts.max_x
    } else {
      this.velo = new Vec3(-this.velo.x, this.velo.y, 0);
      this.twist();
      this.pos.x = this.refs.cell.opts.max_x
    }
  } else if (this.pos.y < 0) {
    other = this.refs.cell.exits[0];
    if(other){
      this.pos.y += this.refs.cell.opts.max_y
    } else {
      this.velo = new Vec3(this.velo.x, - this.velo.y, 0);
      this.twist();
      this.pos.y = 0
    }
  } else if (this.pos.y > this.refs.cell.opts.max_y) {
    other = this.refs.cell.exits[2];
    if(other){
      this.pos.y = this.pos.y - this.refs.cell.opts.max_y
    } else {
      this.velo = new Vec3(this.velo.x, -this.velo.y, 0);
      this.twist();
      this.pos.y = this.refs.cell.opts.max_y
    }
  }

  cell = this.refs.cell;

  if(other){
    cell.pong = null;
    this.refs.cell = other;
    other.pong = this;
  }
 
  
}

Actors.Pong.prototype.paint = function(view, fx){
  var gx = view;
 
  var ww = this.opts.max_x * 0.075
  
  if(this.attrs.angry){
    ww = this.opts.max_x * 0.1
    c = 'rgb(0, 255,0)';

    if(Math.random() < 0.85){
      c = 'rgba(255,255,255,1)';
    }
    
    gx.ctx.shadowColor = c;
    gx.ctx.shadowBlur = 40;
    gx.ctx.shadowOffsetX = 0;
    gx.ctx.shadowOffsetY = 0;
    gx.ctx.shadowBlur = ww * 5;

    gx.ctx.fillStyle = c;
    gx.ctx.strokeStyle = c;
    gx.ctx.beginPath();
    gx.ctx.lineWidth = 2;

    gx.ctx.rect(0 - ww/2, 0 - ww/2, ww, ww)
    //gx.ctx.arc(0, 0, ww, 0, 2 * Math.PI)

    gx.ctx.fill();
    gx.ctx.stroke();
    gx.ctx.shadowBlur = 0;
    
    fx.ctx.shadowColor = c;
    fx.ctx.shadowBlur = 40;
    fx.ctx.shadowOffsetX = 0;
    fx.ctx.shadowOffsetY = 0;
    fx.ctx.shadowBlur = ww * 5;

    fx.ctx.fillStyle = '#444';
    fx.ctx.strokeStyle = c;
    fx.ctx.beginPath();
    fx.ctx.lineWidth = 2;

    fx.ctx.beginPath();
    fx.ctx.fillRect(0 - ww, 0 - ww, ww*2, ww*2)
    //fx.ctx.arc(0, 0, ww, 0, 2 * Math.PI)

    fx.ctx.fill();
    fx.ctx.stroke();

    fx.ctx.fill();
    fx.ctx.stroke();
    fx.ctx.shadowBlur = 0;
    
  } else {
    var h = 0.5 + ((Date.now()%360 * 0.5) * 0.5);
    var c;
    c = 'hsl(' + h + ', 100%, 50%)';

    if(Math.random() < 0.025){
      c = 'rgba(255,255,0,0.5)';
    }

    if(Math.random() < 0.15){
      c = 'rgba(255,255,255,1)';
    }


    gx.ctx.fillStyle = c;
    gx.ctx.stroketyle = c;
    gx.ctx.beginPath();
    gx.ctx.lineWidth = 2;

    gx.ctx.rect(0 - (ww/2), 0 - (ww/2), ww, ww)
    //gx.ctx.arc(0, 0, ww, 0, 2 * Math.PI)

    gx.ctx.fill();
    gx.ctx.stroke();
    gx.ctx.shadowBlur = 0;


    fx.ctx.shadowColor = c;
    fx.ctx.shadowBlur = 40;
    fx.ctx.shadowOffsetX = 0;
    fx.ctx.shadowOffsetY = 0;
    fx.ctx.shadowBlur = ww * 5;

    fx.ctx.fillStyle = '#444';
    fx.ctx.strokeStyle = c;
    fx.ctx.beginPath();
    fx.ctx.lineWidth = 2;

    fx.ctx.beginPath();
    fx.ctx.fillRect(0 - (ww/2), 0 - (ww/2), ww, ww)
    //fx.ctx.arc(0, 0, ww, 0, 2 * Math.PI)

    fx.ctx.fill();
    fx.ctx.stroke();

    fx.ctx.fill();
    fx.ctx.stroke();
    fx.ctx.shadowBlur = 0;
    
  }
  

}
