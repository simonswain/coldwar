/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.address = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.address.prototype = Object.create(Scene.prototype);

Scenes.address.prototype.title = 'Address';

Scenes.address.prototype.layout = '';

Scenes.address.prototype.init = function(){

  this.memory = [];
  for(var i = 0; i < 16; i++){
    this.memory.push(Math.floor(Math.random() * 256));
  }
  
}

Scenes.address.prototype.getCast = function(){
  return {
  }
};

Scenes.address.prototype.defaults = [{
  key: 'max_x',
  value: 640,
  min: 32,
  max: 1024
}, {
  key: 'max_y',
  value: 640,
  min: 32,
  max: 1024
}, {
  key: 'max_z',
  value: 1,
  min: 1,
  max: 1
}, {
  key: 'duration',
  value: 60,
  min: 1,
  max: 120
}];

Scenes.address.prototype.genAttrs = function(){
  return {
    time: 0,
    index: 0,
    stringdex: 0,
    value: 0,
    duration: this.opts.duration,
  };
};

Scenes.address.prototype.update = function(delta){
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

Scenes.address.prototype.drawCap = function(gx, charge){

  gx.ctx.save();

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

  gx.ctx.restore();
  
}


Scenes.address.prototype.paint = function(fx, gx, sx){

  fx.ctx.save();
  fx.ctx.translate(0, this.opts.max_y * 0.075);

  gx.ctx.save();
  gx.ctx.translate(0, this.opts.max_y * 0.075);

  // gx.ctx.fillStyle = 'rgba(255,0,255, 0.2)';
  // gx.ctx.beginPath();
  // gx.ctx.fillRect(
  //   0, 0,    
  //   this.opts.max_x,
  //   this.opts.max_y    
  // )
  
  var value;
  for(var i = 0; i < this.memory.length; i++){
    for(var j = 0; j < 7; j++){
      gx.ctx.save();
      gx.ctx.translate((this.opts.max_x / 18) * (14-j), this.opts.max_y * 0.05 * (i+0.25));
      gx.ctx.scale(0.07, 0.07);
      value = (this.memory[i] & Math.pow(2, j));
      this.drawCap(gx, value);
      gx.ctx.restore()
    }

    if(this.attrs.index !== i){
      gx.ctx.fillStyle = 'rgba(0,0,0, 0.5)';
      gx.ctx.beginPath();
      gx.ctx.fillRect(
        (this.opts.max_x / 18) * (15-j),
        this.opts.max_y * 0.02 + (this.opts.max_y * 0.05 * i),
        this.opts.max_x * 0.4,
        this.opts.max_y * 0.05
      );
    }

  gx.ctx.lineWidth=2;
    if(this.attrs.index == i){
      gx.ctx.beginPath();
      gx.ctx.strokeStyle = '#ff0';
      gx.ctx.moveTo(this.opts.max_x * 0.3, this.opts.max_y * 0.4) 
      gx.ctx.lineTo(this.opts.max_x * 0.4, this.opts.max_y * 0.4)
      gx.ctx.stroke();

      gx.ctx.beginPath();
      gx.ctx.strokeStyle = '#ff0';
      gx.ctx.moveTo(this.opts.max_x * 0.4, this.opts.max_y * 0.4)
      gx.ctx.lineTo(
        this.opts.max_x * 0.4,
        this.opts.max_y * 0.02 + (this.opts.max_y * 0.05 * i) + (this.opts.max_y * 0.022)
      ) 
      gx.ctx.stroke();

      gx.ctx.beginPath();
      gx.ctx.strokeStyle = '#ff0';
      gx.ctx.moveTo(
        this.opts.max_x * 0.4,
        this.opts.max_y * 0.02 + (this.opts.max_y * 0.05 * i) + (this.opts.max_y * 0.022)
      ) 
      gx.ctx.lineTo(
        this.opts.max_x * 0.45,
        this.opts.max_y * 0.02 + (this.opts.max_y * 0.05 * i) + (this.opts.max_y * 0.022)
      ) 
      gx.ctx.stroke();

      fx.ctx.fillStyle = '#0f0';
      fx.ctx.font='36px robotron';
      fx.ctx.textAlign='center';
      fx.ctx.textBaseline='bottom';
      fx.ctx.fillText(
        ((this.memory[i]<16)? '0' : '') + String.fromCharCode(this.memory[i]),
        this.opts.max_x * 0.9,
        this.opts.max_y * 0.02 + (this.opts.max_y * 0.05 * i) + (this.opts.max_y * 0.05)
      );

      gx.ctx.fillStyle = '#fff';
      gx.ctx.font='36px robotron';
      gx.ctx.textAlign='center';
      gx.ctx.textBaseline='bottom';
      gx.ctx.fillText(
        ((this.memory[i]<16)? '0' : '') + String.fromCharCode(this.memory[i]),
        this.opts.max_x * 0.9,
        this.opts.max_y * 0.02 + (this.opts.max_y * 0.05 * i) + (this.opts.max_y * 0.05)
      );
      
    }
   
  }

  gx.ctx.strokeStyle = '#ff0';
  gx.ctx.fillStyle = '#ff0';

  gx.ctx.lineWidth=2;
  gx.ctx.beginPath();

  gx.ctx.rect(
    this.opts.max_x * 0.2,
    this.opts.max_y * 0.3,
    this.opts.max_x * 0.1,
    this.opts.max_y * 0.2
  );
  gx.ctx.stroke();

  if(this.attrs.index & 1) {
    gx.ctx.beginPath();
    gx.ctx.fillRect(
      this.opts.max_x * 0.1,
      this.opts.max_y * 0.355,
      this.opts.max_x * 0.1,
      this.opts.max_y * 0.01
    );  
  }

  if(this.attrs.index & 2) {
    gx.ctx.beginPath();
    gx.ctx.fillRect(
      this.opts.max_x * 0.1,
      this.opts.max_y * 0.385,
      this.opts.max_x * 0.1,
      this.opts.max_y * 0.01
    );  
  }

  if(this.attrs.index & 4) {
    gx.ctx.beginPath();
    gx.ctx.fillRect(
      this.opts.max_x * 0.1,
      this.opts.max_y * 0.415,
      this.opts.max_x * 0.1,
      this.opts.max_y * 0.01
    );  
  }

  if(this.attrs.index & 8) {
    gx.ctx.beginPath();
    gx.ctx.fillRect(
      this.opts.max_x * 0.1,
      this.opts.max_y * 0.445,
      this.opts.max_x * 0.1,
      this.opts.max_y * 0.01
    );  
  }
  
  

  gx.ctx.fillStyle = '#fff';
  gx.ctx.font='48px robotron';
  gx.ctx.textAlign='center';
  gx.ctx.textBaseline='middle';
  gx.ctx.fillText(
    this.attrs.index.toString(16).toUpperCase(),
    this.opts.max_x * 0.255,
    this.opts.max_y * 0.395
  );
  

  gx.ctx.restore();
  fx.ctx.restore();
  
}
