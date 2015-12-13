/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.story = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.story.prototype = Object.create(Scene.prototype);

Scenes.story.prototype.title = 'Story';

Scenes.story.prototype.layout = '';

Scenes.story.prototype.init = function(){

}

Scenes.story.prototype.getCast = function(){
  return {
  }
};

Scenes.story.prototype.defaults = [{
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

Scenes.story.prototype.genAttrs = function(){
  return {
    frame_index: 0,
    step_index: 0,
    time: 0,
    hold: 0,
  };
};

Scenes.story.prototype.update = function(delta){

  if(this.attrs.hold > 0){
    this.attrs.hold -= delta;
    if(this.attrs.hold <= 0){
      this.attrs.hold = 0;
      this.attrs.step_index = 0;
      this.attrs.frame_index ++;
      if(this.attrs.frame_index === Scenes.story.prototype.frames.length){
        this.attrs.frame_index = 0;
      }
    }
  } else {
    this.attrs.time += this.env.diff * 100;
    if (this.attrs.time > this.opts.step_hold) {
      this.attrs.time = 0;
      this.attrs.step_index += this.opts.step_skip;
      if (this.attrs.step_index >= Scenes.story.prototype.frames[this.attrs.frame_index].text.length) {
        this.attrs.hold = this.opts.frame_hold;
      }
    }
  }
  
}

Scenes.story.prototype.paint = function(fx, gx, sx){

  var frame = Scenes.story.prototype.frames[this.attrs.frame_index];

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

Scenes.story.prototype.frames = [];

Scenes.story.prototype.frames.push({
  text:[
    'The year is 2048',
  ].join("\n")
})

Scenes.story.prototype.frames.push({
  text:[
    'You are the last of Humanity',
  ].join("\n")
})

Scenes.story.prototype.frames.push({
  text:[
    'All that remains is the',
    'underworld of the Machines',
  ].join("\n")
})

Scenes.story.prototype.frames.push({
  text:[
    'In a dark era of instability,',
    'covertly compromised engineering, ',
    'and pervasive surveillance,',
    'we entrusted operation of our lives',
    'to networked devices and machines',
  ].join("\n"),
})

Scenes.story.prototype.frames.push({
  text:[
    'Machines that learn',
  ].join("\n"),
})

Scenes.story.prototype.frames.push({
  text:[
    'The Machines learnt too well...',
  ].join("\n"),
})

Scenes.story.prototype.frames.push({
  text:[
    'Twenty years later,',
    'you are they are you.',
  ].join("\n"),
})

Scenes.story.prototype.frames.push({
  text:[
    'Clones bred by our last scientists,',
    'for one final attempt at deactivation,',
    'of the power driving the Machines',
  ].join("\n"),
})

Scenes.story.prototype.frames.push({
  text:[
    'Nobody has succeeded yet',
  ].join("\n"),
})

Scenes.story.prototype.frames.push({
  text:[
    'Enter the maze, sabotage the reactor',
    '                     ',
    'Who knows what horror lies within   ',

  ].join("\n"),
})
