/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.title = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
  this.env.fx_alpha = 0.3;
};

Scenes.title.prototype = Object.create(Scene.prototype);

Scenes.title.prototype.title = 'Title';

Scenes.title.prototype.layout = '';

Scenes.title.prototype.init = function(){

}

Scenes.title.prototype.getCast = function(){
  return {
  }
};

Scenes.title.prototype.defaults = [{
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
  key: 'frame_hold',
  value: 850,
  min: 1,
  max: 6000
}, {
  key: 'font-size',
  value: 24,
  min: 8,
  max: 64
}, {
  key: 'wiggle_size',
  value: 5,
  min: 0,
  max: 64
}];

Scenes.title.prototype.genAttrs = function(){
  return {
    frame_index: 0,
    step_index: 0,
    time: 0,
    hold: 0,
  };
};

Scenes.title.prototype.update = function(delta){

  var diff = this.env.diff;
  
  if(this.attrs.hold > 0){
    this.attrs.hold -= diff;
  }

  if(this.attrs.hold <= 0){
    this.attrs.hold = this.opts.frame_hold;
    this.attrs.frame_index ++;
    if(this.attrs.frame_index === Scenes.title.prototype.frames.length){
      this.attrs.frame_index = 0;
    }
  }
  
}

Scenes.title.prototype.paint = function(fx, gx, sx){


  this.paintTitle(gx);
  
  fx.ctx.save();
  fx.ctx.translate(this.opts.wiggle_size*(Math.random() - 0.5), this.opts.wiggle_size*(Math.random() - 0.5));
  this.paintTitle(fx);
  fx.ctx.restore();
  
}

Scenes.title.prototype.paintTitle = function(view){
  
  var frame = Scenes.title.prototype.frames[this.attrs.frame_index];

  view.ctx.fillStyle = '#fb0';
  view.ctx.font = this.opts.font_size + 'pt ubuntu mono';
 
  var yy = (this.opts.max_y * 0.1);
  var dy = (this.opts.max_y * 0.025);
  var xx = (this.opts.max_x * 0.1);
  var dx = (this.opts.max_x * 0.015);
  var y = 0;
  var x = 0;
  var ii = Scenes.title.prototype.frames[this.attrs.frame_index].text.length
  //var ii = this.attrs.step_index;
  for (var i = 0; i < ii; i++) {
    if(frame.text[i] === "\n"){
      y ++;
      x = 0;
      continue;
    }
    view.ctx.save();
    view.ctx.translate(this.opts.max_x * 0.2, this.opts.max_y * 0.3);
    view.ctx.translate(Math.random() - 0.5, Math.random() - 0.5);
    view.ctx.fillText(frame.text[i], xx + (x * dx), yy + (y * dy));
    view.ctx.restore();
    x ++;
  }

  
}

Scenes.title.prototype.frames = [];

Scenes.title.prototype.frames[0] = {
  text:[
    'xxx    xx  xxxxxx xxxx',
    'x xx  xxxx   xx   xx   ',
    'x xx  x  x   xx   xx  ',
    'xxx   xxxx   xx   xxxx',
    'x  x  x  x   xx     xx',
    'x  x  x  x   xx   xxxx',
  ].join("\n").replace(/x/g, 'O')
};

Scenes.title.prototype.frames[1] = {
  text:[
    '     xxx   xxxx    ',
    '    x  xx  x       ',
    '    x  xx  x       ',
    '    x  xx  xx      ',
    '    x  xx  xx      ',
    '     xxx   x       ',
  ].join("\n").replace(/x/g, 'O')
};

Scenes.title.prototype.frames[2] = {
  text:[
    ' xxxxxx x   x  xxxx  ',
    '   xx   x   x  xx    ',
    '   xx   x   x  xx    ',
    '   xx   xxxxx  xxx   ',
    '   xx   xxxxx  xx    ',
    '   xx   x   x  xxxx  ',
  ].join("\n").replace(/x/g, 'O')
};

Scenes.title.prototype.frames[3] = {
  text:[
    ' x x    xx   zzzz  xxxx',
    'xxxxx  xxxx    zz  x   ',
    'x x x  x  x   zz   xx  ',
    'x   x  xxxx  zz    xx  ',
    'x   x  x  x  zz    x   ',
    'x   x  x  x  zzzz  xxxx'
  ].join("\n").replace(/x/g, 'O')
};


