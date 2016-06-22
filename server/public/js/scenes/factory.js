/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.factory = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.factory.prototype = Object.create(Scene.prototype);

Scenes.factory.prototype.title = 'Factory';

Scenes.factory.prototype.genAttrs = function(){
  return {
    frame_index: 0,
    step_index: 0,
    time: 0,
    hold: 0,
    rats: 0,
    rats_max: this.opts.rats_max || 0,
    rats_per_tick: this.opts.rats_per_tick || 1,
  };
};

Scenes.factory.prototype.init = function(){
  this.rats = []; 
  this.booms = [];
  this.breeders = [];
  this.breeders.push(new Actors.Demobreeder(
    this.env, {
      demo: this,
      rats: this.rats,
    }, {
      x: this.opts.max_x * 0.5,
      y: this.opts.max_y * 0.5,
    }, {
      rats_max: 20,
      rat_chance: 0.1
    }));
}


Scenes.factory.prototype.defaults = [{
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

Scenes.factory.prototype.update = function(delta){

  var i, ii;
  for (i = 0, ii = this.breeders.length; i<ii; i++) {
    if(this.breeders[i]){
      this.breeders[i].update(delta);
    }
  }

  for (i = 0, ii = this.rats.length; i<ii; i++) {
    if(this.rats[i]){
      this.rats[i].update(delta);
    }
  }

  for (i = 0, ii = this.rats.length; i<ii; i++) {
    if(!this.rats[i] || this.rats[i].attrs.dead){
      this.rats.splice(i, 1);
      i--
      ii--
    }
  }

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
  
  if(this.attrs.hold > 0){
  } else {
    this.attrs.time += this.env.diff * 100;
    if (this.attrs.time > this.opts.step_hold) {
      this.attrs.time = 0;
      this.attrs.step_index += this.opts.step_skip;
      if (this.attrs.step_index >= Scenes.factory.prototype.frames[this.attrs.frame_index].text.length) {
        this.attrs.hold = this.opts.frame_hold;
      }
    }
  }

}

Scenes.factory.prototype.paint = function(fx, gx, sx){
  var view = gx;
  var breeder;
  for (i = 0, ii = this.breeders.length; i<ii; i++) {
    breeder = this.breeders[i];
    view.ctx.save()
    view.ctx.translate(breeder.pos.x - (breeder.opts.max_x/2), breeder.pos.y - (breeder.opts.max_y/2));

    breeder.paint(view)
    view.ctx.restore()
  }

  var rat;
  for (i = 0, ii = this.rats.length; i < ii; i++) {
    rat = this.rats[i]
    if(!rat){
      continue
    }
    view.ctx.save()
    view.ctx.translate(rat.pos.x, rat.pos.y);
    this.rats[i].paint(view)
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



  
  var frame = Scenes.factory.prototype.frames[this.attrs.frame_index];

  var ix = this.attrs.step_index;
  if(ix >= frame.text.length){
    ix = frame.text.length;
  }

  var yy = (this.opts.max_y * 0.2);
  var dy = (this.opts.max_y * 0.066);
  var xx = (this.opts.max_x * 0.1);
  var dx = (this.opts.max_x * 0.045);
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
    gx.ctx.font = '28pt robotron';
    gx.ctx.fillText(frame.text[i], xx + (x * dx), yy + (y * dy));
    gx.ctx.restore();
    x ++;
  }


  // var view = gx;
  // var r = 80
  // view.ctx.save()
  // view.ctx.translate(this.opts.max_x * 0.5, this.opts.max_y * 0.5);

  // view.ctx.fillStyle = 'rgba(0, 0, 255, 1)'
  // view.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
  // view.ctx.lineWidth = 8

  // view.ctx.beginPath()
  // view.ctx.rect(-r/2, -r/2, r, r)

  // if(this.env.ms % 20 < 10){
  //   view.ctx.fill()
  // }

  // view.ctx.stroke()
  // view.ctx.restore();

  

}

Scenes.factory.prototype.frames = [];

Scenes.factory.prototype.frames[0] = {
  text:[
    ' superior machine  ',
    '   engineering      ',
    '    ',
    '    ',
    '    ',
    '    ',
    '    ',
    '    ',
    '   creates rat    ',
    'breeding factories',
  ].join("\n"),
};
