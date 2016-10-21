/* global Actors, Actor, Vec3, VecR */

Actors.Machine = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init(attrs)
}

Actors.Machine.prototype = Object.create(Actor.prototype)

Actors.Machine.prototype.title = 'Machine'

Actors.Machine.prototype.init = function (attrs) {
  this.memory = [];
  for(var i = 0; i < 8; i++){
    this.memory.push(0);
    // Math.floor(Math.random() * 256)
  }
}

Actors.Machine.prototype.genAttrs = function (attrs) {
  return {
    time: 0,
    index: 0,
    stringdex: 0,
    value: 0,
    duration: this.opts.duration,
  };
}

Actors.Machine.prototype.defaults = [{
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
}]

Actors.Machine.prototype.kill = function () {

  if (this.attrs.dead) {
    return
  }

  this.attrs.dead = true;

}

Actors.Machine.prototype.update = function (delta, intent) {
  var str = 'Rats of the Maze of the ';
  var len = str.length;
  this.attrs.time += this.env.diff * 0.5
  if (this.attrs.time > this.attrs.duration) {
    this.attrs.time = 0;
    this.attrs.index ++;
    if(this.attrs.index === this.memory.length){
      this.attrs.index = 0;
    }  
    this.attrs.stringdex ++;
    if(this.attrs.stringdex === len){
      this.attrs.stringdex = 0;
    }
    this.memory[this.attrs.index] = str.charCodeAt(this.attrs.stringdex);
    //this.memory[this.attrs.index] = (Math.floor(Math.random() * 256));
  }
}

Actors.Machine.prototype.drawCap = function(gx, charge){

  gx.ctx.strokeStyle = '#0ff';
  gx.ctx.lineWidth = 16;

  gx.ctx.fillStyle = 'rgba(255,0,255,' + charge + ')';
  gx.ctx.beginPath();
  gx.ctx.fillRect(
    this.opts.max_x * 0.3,
    this.opts.max_y * 0.4,    
    this.opts.max_x * 0.4,
    this.opts.max_y * 0.2    
  )

  gx.ctx.beginPath();
  gx.ctx.moveTo(this.opts.max_x * 0.5, this.opts.max_y * 0.2) 
  gx.ctx.lineTo(this.opts.max_x * 0.5, this.opts.max_y * 0.4)
  gx.ctx.stroke();

  gx.ctx.beginPath();
  gx.ctx.moveTo(this.opts.max_x * 0.3, this.opts.max_y * 0.4) 
  gx.ctx.lineTo(this.opts.max_x * 0.7, this.opts.max_y * 0.4)
  gx.ctx.stroke();

  gx.ctx.beginPath();
  gx.ctx.moveTo(this.opts.max_x * 0.3, this.opts.max_y * 0.6) 
  gx.ctx.lineTo(this.opts.max_x * 0.7, this.opts.max_y * 0.6)
  gx.ctx.stroke();

  gx.ctx.beginPath();
  gx.ctx.moveTo(this.opts.max_x * 0.5, this.opts.max_y * 0.6) 
  gx.ctx.lineTo(this.opts.max_x * 0.5, this.opts.max_y * 0.8)
  gx.ctx.stroke();
  
}

Actors.Machine.prototype.paint = function (gx) {
  gx.ctx.save();

  // gx.ctx.fillStyle = 'rgba(255,0,255, 0.2)';
  // gx.ctx.beginPath();
  // gx.ctx.fillRect(
  //   0, 0,    
  //   this.opts.max_x,
  //   this.opts.max_y    
  // )
  
  var value;
  for(var i = 0; i < this.memory.length; i++){
    for(var j = 0; j < 4; j++){

      if(this.attrs.index === i){

        gx.ctx.save();
        gx.ctx.translate(
          (this.opts.max_x * 0.12) + (this.opts.max_x / 8) * (3-j),
          this.opts.max_y * 0.1 + ((this.opts.max_y /12) * i)
        );
        gx.ctx.scale(0.3, 0.3);
        value = (this.memory[i] & Math.pow(2, j));
        this.drawCap(gx, value);
        gx.ctx.restore()
      }
    }

    // if(this.attrs.index !== i){
    //   gx.ctx.fillStyle = 'rgba(0,0,0, 1)';
    //   gx.ctx.beginPath();
    //   gx.ctx.fillRect(
    //     (this.opts.max_x * 0.2),
    //     this.opts.max_y * 0.13 + ((this.opts.max_y / 12) * i),
    //     this.opts.max_x * 0.55,
    //     this.opts.max_y * 0.1
    //   );
    // }    
  }


  gx.ctx.strokeStyle = '#ff0';
  gx.ctx.fillStyle = '#ff0';

  gx.ctx.lineWidth=2;

  gx.ctx.save();
  gx.ctx.translate(0, -this.opts.max_y * 0.025);

  if(this.attrs.index & 1) {
    gx.ctx.beginPath();
    gx.ctx.fillRect(
      this.opts.max_x * 0.1,
      this.opts.max_y * 0.2,
      this.opts.max_x * 0.05,
      this.opts.max_y * 0.05
    );  
    gx.ctx.beginPath();
    gx.ctx.fillRect(
      this.opts.max_x * 0.8,
      this.opts.max_y * 0.2,
      this.opts.max_x * 0.05,
      this.opts.max_y * 0.05
    );  
  }

  if(this.attrs.index & 2) {
    gx.ctx.beginPath();
    gx.ctx.fillRect(
      this.opts.max_x * 0.1,
      this.opts.max_y * 0.4,
      this.opts.max_x * 0.05,
      this.opts.max_y * 0.05
    );   
    gx.ctx.beginPath();
    gx.ctx.fillRect(
      this.opts.max_x * 0.8,
      this.opts.max_y * 0.4,
      this.opts.max_x * 0.05,
      this.opts.max_y * 0.05
    );   
  }

  if(this.attrs.index & 4) {
    gx.ctx.beginPath();
    gx.ctx.fillRect(
      this.opts.max_x * 0.1,
      this.opts.max_y * 0.6,
      this.opts.max_x * 0.05,
      this.opts.max_y * 0.05
    );  
    gx.ctx.beginPath();
    gx.ctx.fillRect(
      this.opts.max_x * 0.8,
      this.opts.max_y * 0.6,
      this.opts.max_x * 0.05,
      this.opts.max_y * 0.05
    );  
  }

  if(this.attrs.index & 8) {
    gx.ctx.beginPath();
    gx.ctx.fillRect(
      this.opts.max_x * 0.1,
      this.opts.max_y * 0.8,
      this.opts.max_x * 0.05,
      this.opts.max_y * 0.05
    );  
    gx.ctx.beginPath();
    gx.ctx.fillRect(
      this.opts.max_x * 0.7,
      this.opts.max_y * 0.8,
      this.opts.max_x * 0.05,
      this.opts.max_y * 0.05
    );  
  }
    
  gx.ctx.restore();

  gx.ctx.restore();
  
}
