/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.enemies = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.enemies.prototype = Object.create(Scene.prototype);

Scenes.enemies.prototype.title = 'Enemies';

Scenes.enemies.prototype.genAttrs = function(){
  return {
    frame_index: 0,
    time: 0,
    flash: 0
  };
};

Scenes.enemies.prototype.init = function(){

  this.demo = new Actors.Demo(
    this.env, {
      scene: this
    }, {
    });

  this.frames = [{
    title:'White Rat'
  }, {
    title:'Momma Rat',
  }, {
    title:'Baby Rat',
  }];
  
}

Scenes.enemies.prototype.getCast = function(){
  return {
    Demo: Actors.Demo,
    Demobreeder: Actors.Demobreeder,
    Demorat: Actors.Demorat,
  }
};

Scenes.enemies.prototype.defaults = [{
  key: 'max_x',
  value: 640,
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
  key: 'hold',
  value: 3000,
  min: 1,
  max: 2400
}, {
  key: 'font-size',
  value: 24,
  min: 8,
  max: 64
}];

Scenes.enemies.prototype.update = function(delta){
  this.demo.update(delta)

  this.attrs.time += this.env.diff;
  if (this.attrs.time > this.opts.hold) {
    this.attrs.time = 0;
    this.attrs.frame_index ++;
    if (this.attrs.frame_index >= this.frames.length) {
      this.attrs.frame_index = 0;
    }
  }
}

Scenes.enemies.prototype.flash = function(fx, gx){
  var view = fx;
  if(this.demo.attrs.flash > 0){
    this.attrs.flash += 5;
    gx.ctx.fillStyle = '#ffffff'
    gx.ctx.fillRect(0, 0, gx.w, gx.h)
    if(this.demo.attrs.flash === 1){
      fx.ctx.fillStyle = '#ffffff'
      fx.ctx.fillRect(0, 0, fx.w, fx.h)
    }
    this.demo.attrs.flash --;
  }
}

Scenes.enemies.prototype.paint = function(fx, gx, sx){

  if(this.attrs.flash > 0){
    this.attrs.flash --;
    fx.ctx.save();
    fx.ctx.translate(this.opts.max_x * 0.5, this.opts.max_y * 0.8);
    fx.ctx.translate(Math.random(), Math.random());
    fx.ctx.fillStyle='#fff';
    if(Math.random() < 0.025){
      fx.ctx.fillStyle = '#f00';
    }
    if(Math.random() < 0.025){
      fx.ctx.fillStyle = '#ff0';
    }
    fx.ctx.textAlign='center';
    fx.ctx.textBaseline = 'middle';
    fx.ctx.font = '28pt robotron';
    fx.ctx.fillText('SUPERZAPPER', 0, 0);
    fx.ctx.restore();
  }
  
  this.demo.paint(gx)

  var frame = this.frames[this.attrs.frame_index];

  gx.ctx.textAlign='center';
  gx.ctx.textBaseline = 'middle';
  gx.ctx.font = '28pt robotron';

  gx.ctx.save();
  gx.ctx.translate(this.opts.max_x * 0.5, this.opts.max_y * 0.2);
  gx.ctx.translate(Math.random(), Math.random());

  var h = (Date.now()%360 * 0.22) - 10;
  gx.ctx.fillStyle = 'hsl(' + h + ', 100%, 50%)';
  
  if(Math.random() < 0.025){
    gx.ctx.fillStyle = 'rgba(255,255,0,0.5)';
  }

  if(Math.random() < 0.025){
    gx.ctx.fillStyle = 'rgba(255,255,255,1)';
  }

  gx.ctx.fillText('destroy rats, no mercy', 0, 0);
  gx.ctx.restore();


  
  // gx.ctx.save();
  // gx.ctx.translate(this.opts.max_x * 0.5, this.opts.max_y * 0.8);
  // gx.ctx.translate(Math.random(), Math.random());
  // gx.ctx.fillStyle='#0f0';
  // if(Math.random() < 0.025){
  //   gx.ctx.fillStyle = '#fff';
  // }
  // if(Math.random() < 0.025){
  //   gx.ctx.fillStyle = '#000';
  // }
  // gx.ctx.fillText(frame.title, 0, 0);
  // gx.ctx.restore();

}
