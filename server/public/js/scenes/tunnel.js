/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.tunnel = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.tunnel.prototype = Object.create(Scene.prototype);

Scenes.tunnel.prototype.title = 'Tunnel';

Scenes.tunnel.prototype.layout = '';

Scenes.tunnel.prototype.genAttrs = function(){
  return {
    index: 0,
    alpha: 0,
    x: -150,
    y: 0,
    mode: 'enter',
    frame_index: 0,
    step_index: 0,
    time: 0,
    hold: 0,
    tt: 0,
    charge: 0,
    duration: 30,
  };
};

Scenes.tunnel.prototype.init = function(){
  this.string = '  R A T S   O F   T H E   M A Z E   O F   T H E ';
}

Scenes.tunnel.prototype.getCast = function(){
  return {
  }
};

Scenes.tunnel.prototype.defaults = [{
  key: 'max_x',
  value: 1024,
  min: 32,
  max: 1024
}, {
  key: 'max_y',
  value: 576,
  min: 32,
  max: 1024
}];

Scenes.tunnel.prototype.flash = function(fx, gx){

  gx.ctx.clearRect(0, 0, gx.w, gx.h)
  if (this.env.flash) {
    gx.ctx.fillStyle = '#fff'
    gx.ctx.fillRect(0, 0, gx.w, gx.h)
  }

  if (this.env.flash) {
    fx.ctx.fillStyle = '#f0f'
    fx.ctx.fillRect(0, 0, fx.w, fx.h)
  }
  
}

Scenes.tunnel.prototype.update = function(delta){

  this.attrs.index += delta * 0.25;
  if(this.attrs.index >= this.string.length){
    this.attrs.index = 0;
  }      
  
  this.attrs.alpha += delta * 0.5 
  if(this.attrs.alpha > 2 * Math.PI){
    this.attrs.alpha -= 2 * Math.PI;
    this.env.play('heartbeat');   
    this.init();
  }

  this.attrs.tt += delta/5;
  if(this.attrs.tt > 5){
    this.attrs.tt = 0;
  }

  if(this.attrs.mode === 'enter'){
    this.attrs.x += delta * 4;
    if(this.attrs.x >= this.opts.max_x){
      this.attrs.x = 0;
      setTimeout(this.env.goNext, 10)
      this.mode = 'leaving'
    }

    this.attrs.y = (this.opts.max_y * 0.5) + (Math.cos(Date.now()/500 % 2*Math.PI) * this.opts.max_y * 0.05);
  }

}


Scenes.tunnel.prototype.paint = function(fx, gx, sx){

  var view = gx;

  var w = this.opts.max_x * 0.05;
  var cx = 0;
  var tt = Math.floor(this.attrs.tt);

  for (var x = this.opts.max_x * 0.1; x < this.opts.max_x; x += this.opts.max_x * 0.2){
    view.ctx.save();
    view.ctx.lineWidth=2;
    view.ctx.translate(x, this.opts.max_y * 0.5);
    if(x > this.attrs.x){
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
    }
    view.ctx.restore();
    cx ++;
  }

  
  if(this.attrs.mode === 'enter'){
    
    var rgb = '0, 153, 0';

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
  if(this.attrs.mode === 'enter'){

    view.ctx.save()
    view.ctx.translate(this.attrs.x, this.attrs.y)

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

  var len = this.string.length;
  var ww = this.opts.max_x / len;
  var ix = Math.floor(this.attrs.index)
var ch;

  gx.ctx.font = '36pt robotron';
  gx.ctx.textAlign='center';
  gx.ctx.baseline='middle';
  
  for(var i=0, ii=len; i<ii; i++ ) {
    ch = this.string[(ix + i) % len];

    var h = (Date.now()%360 * 0.82) - 10 * i;
    gx.ctx.fillStyle = 'hsl(' + h + ', 100%, 50%)';
    
    if(Math.random() < 0.025){
      gx.ctx.fillStyle = 'rgba(0,255,0,0.5)';
    }

    if(Math.random() < 0.025){
      gx.ctx.fillStyle = 'rgba(0,255,255,1)';
    }

    if(Date.now() % 1000 > 950){
      gx.ctx.fillStyle = 'rgba(255,255,255,1)';
    }     

    //gx.ctx.fillStyle = 'rgba(0,255,0,0.5)';
    gx.ctx.save();
    gx.ctx.translate(i * ww, this.opts.max_y * 0.25);
    gx.ctx.fillText(ch, 0, 0);
    gx.ctx.restore();

    gx.ctx.save();
    gx.ctx.translate(i * ww, this.opts.max_y * 0.8);
    gx.ctx.fillText(ch, 0, 0);
    gx.ctx.restore();

  }
  
  
  
  
}
