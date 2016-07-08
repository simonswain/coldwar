/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.reactor = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.reactor.prototype = Object.create(Scene.prototype);

Scenes.reactor.prototype.title = 'Reactor';

Scenes.reactor.prototype.layout = '';

Scenes.reactor.prototype.genAttrs = function(){
  return {
    x: -150,
    mode: 'attack',
    frame_index: 0,
    step_index: 0,
    time: 0,
    hold: 0,
  };
};

Scenes.reactor.prototype.init = function(){
  this.booms = [];
}

Scenes.reactor.prototype.getCast = function(){
  return {
  }
};

Scenes.reactor.prototype.defaults = [{
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

Scenes.reactor.prototype.update = function(delta){

  for (i = 0, ii = this.booms.length; i<ii; i++) {
    if(this.booms[i]){
      this.booms[i].update(delta);
    }
  }

  for (i = 0, ii = this.booms.length; i<ii; i++) {
    if(!this.booms[i] || this.booms[i].attrs.dead){
      this.booms.splice(i, 1);
      i--
      ii--
    }
  }

  if(this.attrs.mode === 'boom'){
    this.attrs.x -= delta * 1.5;
    if(this.attrs.x < -150){
      this.attrs.mode = 'attack';
    }
  }

  if(this.attrs.mode === 'primed'){
    this.attrs.x -= delta * 1.5;
    if(this.attrs.x < -40){
      this.attrs.mode = 'boom';
      this.booms.push(new Actors.Boom(
        this.env, {
        }, {
          style: 'nuke',
          radius: 128,
          x: this.opts.max_x/2,
          y: this.opts.max_y/2,
        }
      ))
    }
  }

  if(this.attrs.mode === 'attack'){
    this.attrs.x += delta * 1.5;
    if(this.attrs.x >= this.opts.max_x * 0.4){
      this.attrs.mode = 'primed';
      this.booms.push(new Actors.Boom(
        this.env, {
        }, {
          style: 'laser',
          radius: 64,
          x: this.opts.max_x/2,
          y: this.opts.max_y/2,
          color: '0,255,255'
        }
      ))
    }
  }

  if(this.attrs.hold > 0){
    // this.attrs.hold -= delta;
    // if(this.attrs.hold <= 0){
    //   this.attrs.hold = 0;
    //   this.attrs.step_index = 0;
    //   this.attrs.frame_index ++;
    //   if(this.attrs.frame_index === Scenes.reactor.prototype.frames.length){
    //     this.attrs.frame_index = 0;
    //   }
    // }
  } else {
    this.attrs.time += this.env.diff * 100;
    if (this.attrs.time > this.opts.step_hold) {
      this.attrs.time = 0;
      this.attrs.step_index += this.opts.step_skip;
      if (this.attrs.step_index >= Scenes.reactor.prototype.frames[this.attrs.frame_index].text.length) {
        this.attrs.hold = this.opts.frame_hold;
      }
    }
  }
}

Scenes.reactor.prototype.flash = function(fx, gx, sx){
  if(this.attrs.mode === 'boom'){
    if(Math.random() < 0.5){
      gx.ctx.fillStyle = '#ffffff'
      gx.ctx.fillRect(0, 0, gx.w, gx.h)
    }
    if(Math.random() < 0.15){
      fx.ctx.fillStyle = '#f00'
      fx.ctx.fillRect(0, 0, fx.w, fx.h)
    }
    if(Math.random() < 0.15){
      fx.ctx.fillStyle = '#ff0'
      fx.ctx.fillRect(0, 0, fx.w, fx.h)
    }
  }
}

Scenes.reactor.prototype.paint = function(fx, gx, sx){
  
  var frame = Scenes.reactor.prototype.frames[this.attrs.frame_index];

  var ix = this.attrs.step_index;
  if(ix >= frame.text.length){
    ix = frame.text.length;
  }

  var yy = (this.opts.max_y * 0.225);
  var dy = (this.opts.max_y * 0.066);
  var xx = (this.opts.max_x * 0.11);
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
  
  var arc = Math.PI/3;
  var r = 64;

  var view = gx;
  view.ctx.save();
  view.ctx.translate(this.opts.max_x * 0.5, this.opts.max_y * 0.5);
  view.ctx.strokeStyle = 'rgba(255, 0, 255, 0.9)'
  view.ctx.fillStyle = 'rgba(255, 0, 255, 0.3)'
  var p = (this.env.ms / 2000) + 0.5;

  if(this.attrs.mode === 'primed' && this.env.ms / 80 < 5){
    view.ctx.fillStyle = '#f0f'
  }

  if(this.attrs.mode === 'attack' || this.attrs.mode === 'primed'){
    view.ctx.beginPath()
    view.ctx.arc(0, 0, r, 0, 2*Math.PI)
    view.ctx.fill()
    view.ctx.stroke()

    view.ctx.strokeStyle = 'rgba(51, 0, 51, 1)'
    if(this.attrs.mode === 'primed' && this.env.ms / 100 < 1){
      view.ctx.strokeStyle = '#fff'
    }
    view.ctx.lineWidth = 8
    view.ctx.beginPath()
    view.ctx.rect(-r* 0.66, -r* 0.66, r * 0.66 * 2, r * 0.66 * 2)
    view.ctx.strokeStyle = 'rgba(255, 0, 255, 0.5)'
    view.ctx.stroke()
    
    view.ctx.lineWidth = 32

    if(this.attrs.mode === 'primed' && this.env.ms / 80 < 5){
      view.ctx.strokeStyle = '#000'
    } else {
      view.ctx.strokeStyle = 'rgba(255, 0, 255, ' + p + ')'
    }
    if(Math.random() < 0.1){
      view.ctx.strokeStyle = '#fff'
    }
    view.ctx.beginPath()
    view.ctx.arc(0, 0, r/2, 0, arc)
    view.ctx.stroke()

    if(this.attrs.mode === 'primed' && this.env.ms / 80 < 5){
      view.ctx.strokeStyle = '#000'
    } else {
      view.ctx.strokeStyle = 'rgba(255, 0, 255, ' + p + ')'
    }
    if(Math.random() < 0.1){
      view.ctx.strokeStyle = '#fff'
    }
    view.ctx.beginPath()
    view.ctx.arc(0, 0, r/2, 2*arc, 3*arc)
    view.ctx.stroke()

    if(this.attrs.mode === 'primed' && this.env.ms / 80 < 5){
      view.ctx.strokeStyle = '#000'
    } else {
      view.ctx.strokeStyle = 'rgba(255, 0, 255, ' + p + ')'
    }
    if(Math.random() < 0.1){
      view.ctx.strokeStyle = '#fff'
    }
    if(Math.random() < 0.1){
      view.ctx.strokeStyle = '#fff'
    }
    view.ctx.beginPath()
    view.ctx.arc(0, 0, r/2, 4*arc, 5*arc)
    view.ctx.stroke()
  }

  if(this.attrs.mode === 'boom'){
    view.ctx.lineWidth = 32

    view.ctx.strokeStyle = '#fff'
    if(Math.random() < 0.25){
      view.ctx.strokeStyle = '#000'
    }
    
    view.ctx.beginPath()
    view.ctx.arc(0, 0, r/2, 0, arc)
    view.ctx.stroke()

    view.ctx.beginPath()
    view.ctx.arc(0, 0, r/2, 2*arc, 3*arc)
    view.ctx.stroke()

    view.ctx.beginPath()
    view.ctx.arc(0, 0, r/2, 4*arc, 5*arc)
    view.ctx.stroke()

  }


  var z = r * 2;
  if(this.attrs.mode === 'primed' && this.env.ms / 100 < 1){
    view.ctx.strokeStyle = '#fff'
    view.ctx.lineWidth = 8
    view.ctx.beginPath()
    view.ctx.rect(-z/2, -z/2, z, z)
    view.ctx.stroke()
  }
  view.ctx.restore();



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

  var boom;
  for (i = 0, ii = this.booms.length; i < ii; i++) {
    boom = this.booms[i]
    if(!boom){
      continue
    }      
    view.ctx.save()
    view.ctx.translate(boom.pos.x, boom.pos.y);
    this.booms[i].paint(view)
    view.ctx.restore()
  }
  
  
}

Scenes.reactor.prototype.frames = [];

Scenes.reactor.prototype.frames[0] = {
  text:[
    '    Each maze     ',
    '  has a reactor   ',
    '    ',
    '    ',
    '    ',
    '    ',
    '    ',
    '    ',
    '      Find     ',
    '    sabotage   ',
    '     escape    ',
  ].join("\n"),
};
