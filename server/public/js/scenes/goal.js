/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.goal = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.goal.prototype = Object.create(Scene.prototype);

Scenes.goal.prototype.title = 'Goal';

Scenes.goal.prototype.layout = '';

Scenes.goal.prototype.init = function(){

}

Scenes.goal.prototype.getCast = function(){
  return {
  }
};

Scenes.goal.prototype.defaults = [{
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

Scenes.goal.prototype.genAttrs = function(){
  return {
    frame_index: 0,
    step_index: 0,
    time: 0,
    hold: 0,
  };
};

Scenes.goal.prototype.update = function(delta){

  if(this.attrs.hold > 0){
    this.attrs.hold -= delta;
    if(this.attrs.hold <= 0){
      this.attrs.hold = 0;
      this.attrs.step_index = 0;
      this.attrs.frame_index ++;
      if(this.attrs.frame_index === Scenes.goal.prototype.frames.length){
        this.attrs.frame_index = 0;
      }
    }
  } else {
    this.attrs.time += this.env.diff * 100;
    if (this.attrs.time > this.opts.step_hold) {
      this.attrs.time = 0;
      this.attrs.step_index += this.opts.step_skip;
      if (this.attrs.step_index >= Scenes.goal.prototype.frames[this.attrs.frame_index].text.length) {
        this.attrs.hold = this.opts.frame_hold;
      }
    }
  }
  
}

Scenes.goal.prototype.paint = function(fx, gx, sx){

  var frame = Scenes.goal.prototype.frames[this.attrs.frame_index];

  var ix = this.attrs.step_index;
  if(ix >= frame.text.length){
    ix = frame.text.length;
  }
  
  gx.ctx.fillStyle = '#0f0';
  //gx.ctx.font = this.opts.font_size + '28pt ubuntu mono';
  gx.ctx.font = '28pt ubuntu mono';

  var yy = (this.opts.max_y * 0.2);
  var dy = (this.opts.max_y * 0.066);
  var xx = (this.opts.max_x * 0.01);
  var dx = (this.opts.max_x * 0.027);
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
    gx.ctx.fillText(frame.text[i], xx + (x * dx), yy + (y * dy));
    gx.ctx.restore();
    x ++;
  }

  
}

Scenes.goal.prototype.frames = [];

Scenes.goal.prototype.frames[0] = {
  text:[
    'Goal and baby goal',
  ].join("\n"),
};
