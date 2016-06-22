/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.rats = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.rats.prototype = Object.create(Scene.prototype);

Scenes.rats.prototype.title = 'Rats';

Scenes.rats.prototype.layout = '';

Scenes.rats.prototype.init = function(){

  this.demo = new Actors.Demo(
    this.env, {
      scene: this
    }, {
    });

  this.frames = [{
    title:'Human'
  }, {
    title:'Breeder'
  }, {
    title:'White Rat'
  }, {
    title:'Baby Rat',
  }, {
    title:'King Rat',
  }, {
    title:'Droid',
  }];
  
}

Scenes.rats.prototype.getCast = function(){
  return {
    Demo: Actors.Demo,
    Demobreeder: Actors.Demobreeder,
    Demorat: Actors.Demorat,
  }
};

Scenes.rats.prototype.defaults = [{
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

Scenes.rats.prototype.genAttrs = function(){
  return {
    frame_index: 0,
    time: 0,
  };
};

Scenes.rats.prototype.update = function(delta){
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

Scenes.rats.prototype.paint = function(fx, gx, sx){

  this.demo.paint(gx)

  var frame = this.frames[this.attrs.frame_index];

  gx.ctx.fillStyle='#0f0';
  gx.ctx.textAlign='center';
  gx.ctx.font = '28pt robotron';

  gx.ctx.save();
  gx.ctx.translate(this.opts.max_x * 0.5, this.opts.max_y * 0.8);
  gx.ctx.translate(Math.random(), Math.random());
  gx.ctx.fillText(frame.title, 0, 0);
  gx.ctx.restore();

}
