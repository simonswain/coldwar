/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.understand = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.understand.prototype = Object.create(Scene.prototype);

Scenes.understand.prototype.title = 'Understand';

Scenes.understand.prototype.layout = '';

Scenes.understand.prototype.init = function(){

  this.maze = new Actors.Maze(
    this.env, {
      scene: this
    }, {
      rows: 8,
      cols: 8,
      mode: 1,
    }, {
    })

}

Scenes.understand.prototype.getCast = function(){
  return {
    Maze: Actors.Maze,
    Cell: Actors.Cell,
  }
};

Scenes.understand.prototype.defaults = [{
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

Scenes.understand.prototype.genAttrs = function(){
  return {
    frame_index: 0,
    step_index: 0,
    time: 0,
    hold: 0,
  };
};

Scenes.understand.prototype.update = function(delta){

  this.maze.update(delta);

  if(this.attrs.hold > 0){
    this.attrs.hold -= delta;
    if(this.attrs.hold <= 0){
      this.attrs.hold = 0;
      this.attrs.step_index = 0;
      this.attrs.frame_index ++;
      if(this.attrs.frame_index === Scenes.understand.prototype.frames.length){
        this.attrs.frame_index = 0;
      }
    }
  } else {
    this.attrs.time += this.env.diff * 100;
    if (this.attrs.time > this.opts.step_hold) {
      this.attrs.time = 0;
      this.attrs.step_index += this.opts.step_skip;
      if (this.attrs.step_index >= Scenes.understand.prototype.frames[this.attrs.frame_index].text.length) {
        this.attrs.hold = this.opts.frame_hold;
      }
    }
  }
  
}

Scenes.understand.prototype.paint = function(fx, gx, sx){

  this.maze.paint(gx)

  gx.ctx.fillStyle = 'rgba(0,0,0,0.35)';
  gx.ctx.beginPath()
  gx.ctx.fillRect(0, 0, this.opts.max_x, this.opts.max_y)
  

  var frame = Scenes.understand.prototype.frames[this.attrs.frame_index];

  var ix = this.attrs.step_index;
  if(ix >= frame.text.length){
    ix = frame.text.length;
  }
  
  gx.ctx.fillStyle = '#f30';
  //gx.ctx.font = this.opts.font_size + '28pt ubuntu mono';
  gx.ctx.font = '18pt robotron';

  var yy = (this.opts.max_y * 0.2);
  var dy = (this.opts.max_y * 0.066);
  var xx = (this.opts.max_x * 0.01);
  var dx = (this.opts.max_x * 0.035);

  var x, y;

  y = 0;
  x = 0;

  fx.ctx.fillStyle = '#c00';
  fx.ctx.font = '18pt robotron';

  if(Math.random() < 0.5){
    fx.ctx.save();
    fx.ctx.translate(this.opts.max_x * 0.1, this.opts.max_y * 0.1);

    if(Math.random() < 0.1){
      fx.ctx.translate(0, ((Math.random()-0.5))*this.opts.max_y * 0.5)
    }
    
    for (var i = 0; i < ix; i++) {
      if(frame.text[i] === "\n"){
        y ++;
        x = 0;
        continue;
      }
      fx.ctx.save();
      fx.ctx.translate(Math.random() - 0.5, Math.random() - 0.5);
      fx.ctx.fillText(frame.text[i], xx + (x * dx), yy + (y * dy));
      fx.ctx.restore();
      x ++;
    }
    fx.ctx.restore();
  }
 
  y = 0;
  x = 0;
  //gx.ctx.font = this.opts.font_size + '28pt ubuntu mono';
  gx.ctx.font = '16pt robotron';
 
  gx.ctx.save();
  gx.ctx.translate(this.opts.max_x * 0.1, this.opts.max_y * 0.1);

  gx.ctx.fillStyle = '#fc0';
  
  if(Math.random() < 0.025){
    gx.ctx.fillStyle = 'rgba(255,0,0,0.5)';
    gx.ctx.translate(0, ((Math.random()-0.5))*this.opts.max_y * 0.5)
  }

 
  for (var i = 0; i < ix; i++) {
    if(frame.text[i] === "\n"){
      y ++;
      x = 0;
      continue;
    }
    gx.ctx.save();
    gx.ctx.translate(Math.random() - 0.5, Math.random() - 0.5);

    var h = (Date.now()%360 * 0.25) - 10;
    gx.ctx.fillStyle = 'hsl(' + h + ', 100%, 50%)';
    
    if(Math.random() < 0.025){
      gx.ctx.fillStyle = 'rgba(255,255,0,0.5)';
      gx.ctx.translate(0, ((Math.random()-0.5))*this.opts.max_y * 0.5)
    }

    if(Math.random() < 0.025){
      gx.ctx.fillStyle = 'rgba(255,255,255,1)';
      gx.ctx.translate(0, ((Math.random()-0.5))*this.opts.max_y * 0.5)
    }

    gx.ctx.fillText(frame.text[i], xx + (x * dx), yy + (y * dy));
    gx.ctx.restore();
    x ++;
  }
  gx.ctx.restore();
  
}

Scenes.understand.prototype.frames = [];

Scenes.understand.prototype.frames.push({
  text:[
    'To defeat ',
    'The Machines... ',
    '                  ',
    'First we must',
    'understand',
    'The Machines..'
  ].join("\n")
})
