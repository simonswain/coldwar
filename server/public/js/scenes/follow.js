/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.follow = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.follow.prototype = Object.create(Scene.prototype);

Scenes.follow.prototype.title = 'Follow';

Scenes.follow.prototype.layout = '';

Scenes.follow.prototype.genAttrs = function(){
  return {
    x: -150,
    mode: 'attack',
    frame_index: 0,
    step_index: 0,
    time: 0,
    hold: 0,
    tt: 0
  };
};

Scenes.follow.prototype.init = function(){
}

Scenes.follow.prototype.getCast = function(){
  return {
  }
};

Scenes.follow.prototype.defaults = [{
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

Scenes.follow.prototype.update = function(delta){

  this.attrs.tt += delta/5;
  if(this.attrs.tt > 5){
    this.attrs.tt = 0;
  }
  
  if(this.attrs.mode === 'boom'){
    this.attrs.x -= delta * 4;
    if(this.attrs.x < -150){
      this.env.goNext();
      this.attrs.mode = 'done';

      //this.attrs.mode = 'attack';
    }
  }

  if(this.attrs.mode === 'primed'){
    this.attrs.x -= delta * 4;
    if(this.attrs.x < -40){
      this.attrs.mode = 'boom';
    }
  }

  if(this.attrs.mode === 'attack'){
    this.attrs.x += delta * 4;
    if(this.attrs.x >= this.opts.max_x * 1.1){
      this.attrs.mode = 'primed';
    }
  }

  this.attrs.time += this.env.diff * 100;
  if (this.attrs.time > this.opts.step_hold) {
    this.attrs.time = 0;
    this.attrs.step_index += this.opts.step_skip;
    if (this.attrs.step_index >= Scenes.follow.prototype.frames[this.attrs.frame_index].text.length) {
      this.attrs.hold = this.opts.frame_hold;
    }
  }
}


Scenes.follow.prototype.paint = function(fx, gx, sx){
  
  var frame = Scenes.follow.prototype.frames[this.attrs.frame_index];

  var ix = this.attrs.step_index;
  if(ix >= frame.text.length){
    ix = frame.text.length;
  }

  var yy = (this.opts.max_y * 0.225);
  var dy = (this.opts.max_y * 0.066);
  var xx = (this.opts.max_x * 0.08);
  var dx = (this.opts.max_x * 0.047);
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
    var h = ((Date.now()/5) - i*2) % 255;
    gx.ctx.fillStyle = 'hsl(' + h + ',100%,50%)';

    if(i > 40){
      var h = (Date.now()%360 * 0.22) - 10;
      gx.ctx.fillStyle = 'hsl(' + h + ', 100%, 50%)';
      
      if(Math.random() < 0.025){
        gx.ctx.fillStyle = 'rgba(255,255,0,0.5)';
      }

      if(Math.random() < 0.025){
        gx.ctx.fillStyle = 'rgba(255,255,255,1)';
      }

    }

    gx.ctx.font = '28pt robotron';
    gx.ctx.fillText(frame.text[i], xx + (x * dx), yy + (y * dy));
    gx.ctx.restore();
    x ++;
  }

  var view = gx;



  var w = this.opts.max_x * 0.05;
  var cx = 0;
  var tt = Math.floor(this.attrs.tt);

  for (var x = this.opts.max_x * 0.1; x < this.opts.max_x; x += this.opts.max_x * 0.2){
    view.ctx.save();
    view.ctx.lineWidth=2;
    view.ctx.translate(x, this.opts.max_y * 0.5);
    if(this.attrs.mode === 'attack' && x > this.attrs.x){
      view.ctx.strokeStyle='rgba(0,255,255,0.75)';
      if(cx === tt){
        view.ctx.lineWidth=3;
        view.ctx.strokeStyle='rgba(0,255,255,1)';
      }
      view.ctx.beginPath();
      view.ctx.moveTo(-w/2, -w);
      view.ctx.lineTo(w/2, 0);
      view.ctx.lineTo(-w/2, w);
      view.ctx.stroke();
    } else if (this.attrs.mode === 'primed' && x < this.attrs.x) { 
      view.ctx.strokeStyle='rgba(255,0,0,0.75)';
      if(4-cx === tt){
        view.ctx.lineWidth=3;
        view.ctx.strokeStyle='rgba(255,0,0,1)';
      }
      view.ctx.beginPath();
      view.ctx.moveTo(w/2, -w);
      view.ctx.lineTo(-w/2, 0);
      view.ctx.lineTo(w/2, w);
      view.ctx.stroke();
    }
    view.ctx.restore();
    cx ++;
  }

  
  if(this.attrs.mode === 'attack' || this.attrs.mode === 'primed'){
    
    var rgb = '0, 153, 0';
    if(this.attrs.mode === 'primed'){
      rgb = '153, 0, 0';
    }
    
    // maze wall
    view.ctx.lineWidth = 6
    view.ctx.strokeStyle = 'rgba(' + rgb + ', ' + (0.25 + (Math.random() * 0.25))+  ')'
    
    view.ctx.beginPath()
    view.ctx.moveTo(0, this.opts.max_y * 0.35)
    view.ctx.lineTo(this.opts.max_x, this.opts.max_y * 0.35)
    view.ctx.stroke()

    view.ctx.beginPath()
    view.ctx.moveTo(0, this.opts.max_y * 0.65)
    view.ctx.lineTo(this.opts.max_x, this.opts.max_y * 0.66)
    view.ctx.stroke()
  }
  
  

  // human
  var view = gx;
  if(this.attrs.mode === 'attack' || this.attrs.mode === 'primed'){

    view.ctx.save()
    view.ctx.translate(this.attrs.x, this.opts.max_y/2)

    if(this.attrs.mode === 'primed'){
      view.ctx.rotate(Math.PI)
    }

    view.ctx.fillStyle = '#022'
    view.ctx.strokeStyle = '#0ff'
    view.ctx.lineWidth = 1

    var z = 16
    view.ctx.lineWidth = 4

    view.ctx.beginPath()
    view.ctx.rect(-z ,-z-z, z, z+z+z+z)
    view.ctx.stroke()

    view.ctx.beginPath()
    view.ctx.moveTo(z, 0)
    view.ctx.lineTo(-z, z)
    view.ctx.lineTo(-z, -z)
    view.ctx.lineTo(z, 0)
    view.ctx.closePath()
    view.ctx.fill()
    view.ctx.stroke()

    view.ctx.restore()

  }
  
}

Scenes.follow.prototype.frames = [];

Scenes.follow.prototype.frames[0] = {
  text:[
    '    ',
    '  Follow markers ',
    '    ',
    '    ',
    '    ',
    '    ',
    '    ',
    '    ',
    'to reach your goal  ',
  ].join("\n"),
};
