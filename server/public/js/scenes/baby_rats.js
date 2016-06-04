/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.baby_rats = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.baby_rats.prototype = Object.create(Scene.prototype);

Scenes.baby_rats.prototype.title = 'Baby_Rats';

Scenes.baby_rats.prototype.layout = '';

Scenes.baby_rats.prototype.init = function(){

}

Scenes.baby_rats.prototype.getCast = function(){
  return {
  }
};

Scenes.baby_rats.prototype.defaults = [{
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
  key: 'step_delay',
  value: 1,
  min: 1,
  max: 120
}, {
  key: 'step_hold',
  value: 85,
  min: 1,
  max: 1000
}, {
  key: 'step_skip',
  value: 1,
  min: 1,
  max: 20
}, {
  key: 'frame_hold',
  value: 140,
  min: 1,
  max: 2400
}, {
  key: 'font-size',
  value: 24,
  min: 8,
  max: 64
}];

Scenes.baby_rats.prototype.genAttrs = function(){
  return {
    frame_index: 0,
    step_index: 0,
    time: 0,
    hold: 0,
  };
};

Scenes.baby_rats.prototype.update = function(delta){

  if(this.attrs.hold > 0){
    this.attrs.hold -= delta;
    if(this.attrs.hold <= 0){
      this.attrs.hold = 0;
      this.attrs.step_index = 0;
      this.attrs.frame_index ++;
      if(this.attrs.frame_index === Scenes.baby_rats.prototype.frames.length){
        this.attrs.frame_index = 0;
      }
    }
  } else {
    this.attrs.time += this.env.diff * 100;
    if (this.attrs.time > this.opts.step_hold) {
      this.attrs.time = 0;
      this.attrs.step_index += this.opts.step_skip;
      if (this.attrs.step_index >= Scenes.baby_rats.prototype.frames[this.attrs.frame_index].text.length) {
        this.attrs.hold = this.opts.frame_hold;
      }
    }
  }
  
}

Scenes.baby_rats.prototype.paint = function(fx, gx, sx){

  var frame = Scenes.baby_rats.prototype.frames[this.attrs.frame_index];

  var ix = this.attrs.step_index;
  if(ix >= frame.text.length){
    ix = frame.text.length;
  }
  
  var yy = (this.opts.max_y * 0.2);
  var dy = (this.opts.max_y * 0.066);
  var xx = (this.opts.max_x * 0.1);
  var dx = (this.opts.max_x * 0.05);
  var y = 0;
  var x = 0;
  for (var i = 0; i < ix; i++) {
    if(frame.text[i] === "\n"){
      y ++;
      x = 0;
      continue;
    }
    gx.ctx.save();
    gx.ctx.translate(Math.random() - 0.5, Math.random() - 0.5);
    var h = ((Date.now()/5) - i*5) % 255;
    gx.ctx.fillStyle = '#f00';
    gx.ctx.font = '28pt robotron';
    gx.ctx.fillText(frame.text[i], xx + (x * dx), yy + (y * dy));
    gx.ctx.restore();
    x ++;
  }

  
}

Scenes.baby_rats.prototype.frames = [];

Scenes.baby_rats.prototype.frames[0] = {
  text:[
    'Beware the',
    'baby rats'
  ].join("\n"),
};
