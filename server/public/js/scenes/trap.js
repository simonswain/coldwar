/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.trap = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.trap.prototype = Object.create(Scene.prototype);

Scenes.trap.prototype.title = 'Trap';

Scenes.trap.prototype.layout = '';

Scenes.trap.prototype.genAttrs = function(){
  return {
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

Scenes.trap.prototype.init = function(){
}

Scenes.trap.prototype.getCast = function(){
  return {
  }
};

Scenes.trap.prototype.defaults = [{
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

Scenes.trap.prototype.flash = function(fx, gx){

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

Scenes.trap.prototype.update = function(delta){

  this.attrs.tt += delta/5;
  if(this.attrs.tt > 5){
    this.attrs.tt = 0;
  }
  
  if(this.attrs.mode === 'enter'){
    this.attrs.x += delta * 4;
    if(this.attrs.x >= this.opts.max_x * 0.5){
      this.attrs.mode = 'circle';
      this.attrs.time = 0;
    }

    this.attrs.y = (this.opts.max_y * 0.5) + (Math.cos(Date.now()/500 % 2*Math.PI) * this.opts.max_y * 0.05);

  }

  if(this.attrs.mode === 'circle'){
    this.attrs.time += delta;
    if(this.attrs.time >= 200){
      this.attrs.mode = 'close';
      this.env.flash = true
      this.attrs.time = 0;
    }

    if(Math.random() < 0.1){
      this.env.flash = true
    }
    
  }

  if(this.attrs.mode === 'close'){
    this.attrs.time += delta;
    if(this.attrs.time >= 200){
      this.attrs.mode = 'open';
      this.env.flash = true
      this.attrs.time = 0;
    }
  }

  if(this.attrs.mode === 'open'){
    this.attrs.time += delta;
    if(this.attrs.time >= 100){
      this.attrs.mode = 'charge';
      this.attrs.time = 0;
    }
  }

  if(this.attrs.mode === 'charge'){
  }
  

  this.attrs.charge += this.env.diff / 50
  if (this.attrs.charge > this.attrs.duration) {
    this.attrs.charge = 0;
  }

}


Scenes.trap.prototype.paint = function(fx, gx, sx){

  var view = gx;

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

  // markers
  if(this.attrs.mode === 'enter'){

    var w = this.opts.max_x * 0.05;
    var cx = 0;
    var tt = Math.floor(this.attrs.tt);

    for (var x = this.opts.max_x * 0.1; x < this.opts.max_x * 0.4; x += this.opts.max_x * 0.2){
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
 
    view.ctx.lineWidth=2;
    if(Date.now() % 500 < 250){
      view.ctx.lineWidth=3;
      view.ctx.strokeStyle='rgba(0,255,255,1)';
    }
    
    view.ctx.strokeStyle='rgba(0,255,255,0.75)';
    view.ctx.beginPath();
    view.ctx.arc(this.opts.max_x*0.5, this.opts.max_y * 0.5, w, 0, 2*Math.PI);
    view.ctx.stroke();     
  }

    // markers
  if(this.attrs.mode === 'circle'){

    var w = this.opts.max_x * 0.05;

    view.ctx.lineWidth=2;
    if(Date.now() % 500 < 250){
      view.ctx.lineWidth=3;
      view.ctx.strokeStyle='rgba(0,255,255,1)';
    }

    var a = 1-(this.attrs.charge / this.attrs.duration*2);
    gx.ctx.fillStyle = 'rgba(0,255,255,' + a + ')';
    
    view.ctx.strokeStyle='rgba(0,255,255,0.75)';
    view.ctx.beginPath();
    view.ctx.arc(this.opts.max_x*0.5, this.opts.max_y * 0.5, w, 0, 2*Math.PI);
    view.ctx.stroke();
    view.ctx.fill();

    
    
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


  if(this.attrs.mode === 'circle'){
    gx.ctx.save()
    gx.ctx.translate(this.opts.max_x * 0.5, this.opts.max_y * 0.5);

    gx.ctx.rotate(Date.now() /500 % (2*Math.PI))
    gx.ctx.translate(this.opts.max_x * 0.05, 0);
    
    gx.ctx.fillStyle = '#022'
    gx.ctx.strokeStyle = '#0ff'
    gx.ctx.lineWidth = 1

    var z = 16
    gx.ctx.lineWidth = 4
 
    gx.ctx.rotate((2*Math.PI) * - 0.25)
   
    gx.ctx.beginPath()
    gx.ctx.rect(-z ,-z-z, z, z+z+z+z)
    gx.ctx.stroke()

    gx.ctx.beginPath()
    gx.ctx.moveTo(z, 0)
    gx.ctx.lineTo(-z, z)
    gx.ctx.lineTo(-z, -z)
    gx.ctx.lineTo(z, 0)
    gx.ctx.closePath()
    gx.ctx.fill()
    gx.ctx.stroke()

    gx.ctx.restore()
    
  }

  if(this.attrs.mode === 'close'){

    var yy = (this.opts.max_y * 0.5) * (this.attrs.time / 200);
    if(yy<270){
      var n = (270 / tt) * this.opts.max_x * 0.05;
      
      gx.ctx.save()
      gx.ctx.translate(this.opts.max_x * 0.5, this.opts.max_y * 0.5);

      gx.ctx.rotate(Date.now() /500 % (2*Math.PI))
      gx.ctx.translate(n, 0);
      
      gx.ctx.fillStyle = '#022'
      gx.ctx.strokeStyle = '#0ff'
      gx.ctx.lineWidth = 1

      var z = 16
      gx.ctx.lineWidth = 4
      
      gx.ctx.rotate((2*Math.PI) * 0.25)
      
      gx.ctx.beginPath()
      gx.ctx.rect(-z ,-z-z, z, z+z+z+z)
      gx.ctx.stroke()

      gx.ctx.beginPath()
      gx.ctx.moveTo(z, 0)
      gx.ctx.lineTo(-z, z)
      gx.ctx.lineTo(-z, -z)
      gx.ctx.lineTo(z, 0)
      gx.ctx.closePath()
      gx.ctx.fill()
      gx.ctx.stroke()

      gx.ctx.restore()
    }

    if(yy>=275){
      fx.ctx.save()
      fx.ctx.translate(this.opts.max_x * 0.5, this.opts.max_y * 0.5);
      
      fx.ctx.fillStyle = '#f00'
      fx.ctx.strokeStyle = '#f00'
      fx.ctx.lineWidth = 1

      var z = 80
      fx.ctx.lineWidth = 8
            
      fx.ctx.beginPath()
      fx.ctx.moveTo(-z, 0)
      fx.ctx.lineTo(z, 0)
      fx.ctx.stroke()
      
      fx.ctx.restore()
    }    

    
  }
  
  // squashing capacitor
  if(this.attrs.mode === 'close'){

    var yy = (this.opts.max_y * 0.5) * (this.attrs.time / 200);

    gx.ctx.strokeStyle = '#0ff';
    gx.ctx.lineWidth = 16;

    gx.ctx.beginPath();
    gx.ctx.moveTo(0, yy) 
    gx.ctx.lineTo(this.opts.max_x, yy)
    gx.ctx.stroke();

    gx.ctx.beginPath();
    gx.ctx.moveTo(this.opts.max_x * 0.5, yy) 
    gx.ctx.lineTo(this.opts.max_x * 0.5, - this.opts.max_y)
    gx.ctx.stroke();

    gx.ctx.beginPath();
    gx.ctx.moveTo(0, this.opts.max_y - yy) 
    gx.ctx.lineTo(this.opts.max_x, this.opts.max_y- yy)
    gx.ctx.stroke();

    gx.ctx.beginPath();
    gx.ctx.moveTo(this.opts.max_x * 0.5, this.opts.max_y - yy) 
    gx.ctx.lineTo(this.opts.max_x * 0.5, this.opts.max_y * 2)
    gx.ctx.stroke();
    
  }

  
  // squashing capacitor
  if(this.attrs.mode === 'open'){

    var yy = (this.opts.max_y * 0.25) * (this.attrs.time / 100);

    gx.ctx.strokeStyle = '#0ff';
    gx.ctx.lineWidth = 16;

    gx.ctx.beginPath();
    gx.ctx.moveTo(0, this.opts.max_y * 0.5 - yy) 
    gx.ctx.lineTo(this.opts.max_x, this.opts.max_y * 0.5 - yy)
    gx.ctx.stroke();

    gx.ctx.beginPath();
    gx.ctx.moveTo(this.opts.max_x * 0.5, this.opts.max_y * 0.5 - yy) 
    gx.ctx.lineTo(this.opts.max_x * 0.5, - this.opts.max_y)
    gx.ctx.stroke();

    gx.ctx.beginPath();
    gx.ctx.moveTo(0, this.opts.max_y * 0.5 + yy) 
    gx.ctx.lineTo(this.opts.max_x, this.opts.max_y * 0.5 + yy)
    gx.ctx.stroke();

    gx.ctx.beginPath();
    gx.ctx.moveTo(this.opts.max_x * 0.5, this.opts.max_y * 0.5 + yy) 
    gx.ctx.lineTo(this.opts.max_x * 0.5, this.opts.max_y * 2)
    gx.ctx.stroke();
    
  }
  
  if(this.attrs.mode === 'charge'){
    gx.ctx.strokeStyle = '#0ff';
    gx.ctx.lineWidth = 16;

    var a = 1-(this.attrs.charge / this.attrs.duration);
    gx.ctx.fillStyle = 'rgba(255,0,255,' + a + ')';
    gx.ctx.beginPath();
    gx.ctx.fillRect(
      0,
      this.opts.max_y * 0.25,    
      this.opts.max_x,
      this.opts.max_y * 0.5   
    )

    gx.ctx.beginPath();
    gx.ctx.moveTo(this.opts.max_x * 0.5, - this.opts.max_y) 
    gx.ctx.lineTo(this.opts.max_x * 0.5, this.opts.max_y * 0.25)
    gx.ctx.stroke();

    gx.ctx.beginPath();
    gx.ctx.moveTo(0, this.opts.max_y * 0.25) 
    gx.ctx.lineTo(this.opts.max_x, this.opts.max_y * 0.25)
    gx.ctx.stroke();

    gx.ctx.beginPath();
    gx.ctx.moveTo(0, this.opts.max_y * 0.75) 
    gx.ctx.lineTo(this.opts.max_x, this.opts.max_y * 0.75)
    gx.ctx.stroke();

    gx.ctx.beginPath();
    gx.ctx.moveTo(this.opts.max_x * 0.5, this.opts.max_y * 0.75) 
    gx.ctx.lineTo(this.opts.max_x * 0.5, this.opts.max_y * 2)
    gx.ctx.stroke();
  }

  if(this.attrs.mode == 'charge') {

    gx.ctx.save();
    gx.ctx.translate(Math.random() - 0.5, Math.random() - 0.5);

    var h = (Date.now()%360 * 0.22) - 10;
    var c = 'hsl(' + h + ', 100%, 50%)';
    
    if(Math.random() < 0.025){
      c = 'rgba(255,255,0,0.5)';
    }

    if(Math.random() < 0.025){
      c = 'rgba(255,255,255,1)';
    }

    if(Date.now() % 1000 < 200){
      c = 'rgba(0,0,0,1)';
    }

    if(Date.now() % 1000 > 950){
      c = 'rgba(255,255,255,1)';
    }     

    gx.ctx.fillStyle = c;
    
    gx.ctx.font = '48pt robotron';
    gx.ctx.textAlign = 'center';
    gx.ctx.textBaseline = 'middle';

    gx.ctx.fillText('GAME OVER', this.opts.max_x * 0.5, this.opts.max_y * 0.5);
    gx.ctx.restore();
    
  }
  
  
}
