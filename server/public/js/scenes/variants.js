/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.variants = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.variants.prototype = Object.create(Scene.prototype);

Scenes.variants.prototype.title = 'Variants';

Scenes.variants.prototype.genAttrs = function(){
  return {
    frame_index: 0,
    time: 0,
    hold: 0,
    tail: 0
  };
};
Scenes.variants.prototype.init = function(){
  this.frames = [{
    title:'White Rat'
  }, {
    title:'Momma Rat',
  }, {
    title:'Baby Rat',
  }];
}

Scenes.variants.prototype.getCast = function(){
  return {
  }
};

Scenes.variants.prototype.defaults = [{
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
  key: 'hold',
  value: 2500,
  min: 1,
  max: 2400
}];

Scenes.variants.prototype.update = function(delta){
  this.attrs.time += this.env.diff;
  if (this.attrs.time > this.opts.hold) {
    this.attrs.time = 0;
    this.attrs.frame_index ++;
    if (this.attrs.frame_index >= this.frames.length) {
      this.attrs.frame_index = 0;
    }
  }
}

Scenes.variants.prototype.paint = function(fx, gx, sx){

  gx.ctx.textAlign='center';
  gx.ctx.textBaseline='middle';
  gx.ctx.font = '28pt robotron';

  gx.ctx.save();
  gx.ctx.translate(this.opts.max_x * 0.5, this.opts.max_y * 0.1);
  gx.ctx.translate(Math.random(), Math.random());

  var h = (Date.now()%360 * 0.22) - 10;
  gx.ctx.fillStyle = 'hsl(' + h + ', 100%, 50%)';

  if(Math.random() < 0.025){
    gx.ctx.fillStyle = 'rgba(255,255,0,0.5)';
  }

  if(Math.random() < 0.025){
    gx.ctx.fillStyle = 'rgba(255,255,255,1)';
  }

  gx.ctx.fillText('VERMIN VARIANTS', 0, 0);
  gx.ctx.restore();


  var frame = this.frames[this.attrs.frame_index];

  gx.ctx.save();
  gx.ctx.translate(this.opts.max_x * 0.5, this.opts.max_y * 0.85);
  gx.ctx.translate(Math.random(), Math.random());
  gx.ctx.fillStyle='#0f0';
  if(Math.random() < 0.2){
    gx.ctx.fillStyle = '#fff';
  }
  if(Math.random() < 0.025){
    gx.ctx.fillStyle = '#000';
  }
  gx.ctx.fillText(frame.title, 0, 0);
  gx.ctx.restore();


  if(this.attrs.time < this.opts.hold * 0.2){
    fx.ctx.lineWidth=4;
    fx.ctx.strokeStyle = '#0f0';
    if(Math.random() < 0.25){
      fx.ctx.strokeStyle = '#000';
    } else if(Math.random() < 0.25){
      fx.ctx.strokeStyle = '#fff';
    }

    fx.ctx.beginPath();
    fx.ctx.rect(
      this.opts.max_x * 0.25,
      this.opts.max_y * 0.25,
      this.opts.max_x * 0.5,
      this.opts.max_y * 0.5
    );
    fx.ctx.lineWidth=4;
    fx.ctx.stroke();

    fx.ctx.fillStyle = '#000';
    fx.ctx.beginPath();
    fx.ctx.fillRect(
      this.opts.max_x * 0.2,
      this.opts.max_y * 0.35,
      this.opts.max_x * 0.6,
      this.opts.max_y * 0.3
    );

    fx.ctx.beginPath();
    fx.ctx.fillRect(
      this.opts.max_x * 0.35,
      this.opts.max_y * 0.2,
      this.opts.max_x * 0.3,
      this.opts.max_y * 0.6
    );
  }


  gx.ctx.save()
  gx.ctx.translate(this.opts.max_x * 0.5, this.opts.max_y * 0.5);

  gx.ctx.rotate(Math.sin((Date.now()/1000) % (2*Math.PI)) - Math.PI*0.5)

  var view = gx;
  var z = 24

  view.ctx.fillStyle = '#fff'
  view.ctx.strokeStyle = '#fff'
  view.ctx.lineWidth = 1

  // for tails
  var q1 = (Math.sin((Date.now()/125) % (2*Math.PI)));
  var q2 = (Math.sin((Date.now()/333) % (2*Math.PI)));

  switch (this.attrs.frame_index) {
  case 0:
    // white rat

    // tail
    view.ctx.fillStyle = '#fff'
    view.ctx.strokeStyle = '#fff'
    view.ctx.save()
    view.ctx.translate(-1.5*z, 0)
    view.ctx.beginPath()
    view.ctx.moveTo(0, 0.5*z)
    view.ctx.quadraticCurveTo(-2*z, z * q1, -5 * z, 0)
    view.ctx.quadraticCurveTo(-2*z, z * q1, 0, -0.5*z)
    view.ctx.closePath()
    view.ctx.stroke()
    view.ctx.fill()
    view.ctx.restore()

    // body
    view.ctx.fillStyle = '#fff'
    view.ctx.lineWidth = 1
    view.ctx.beginPath()
    view.ctx.ellipse(0, 0, z * 2.5, z * 1.2, 0, 2*Math.PI, 0);
    view.ctx.closePath()
    view.ctx.fill()

    // head
    view.ctx.save()
    view.ctx.translate(2.2*z, 0)
    view.ctx.rotate(q2 * 0.3)

    // whiskers
    view.ctx.strokeStyle = '#fff'

    view.ctx.beginPath()
    view.ctx.moveTo(z*0.8, 0)
    view.ctx.lineTo(z*0.7, -z)
    view.ctx.stroke()

    view.ctx.beginPath()
    view.ctx.moveTo(z*0.8, 0)
    view.ctx.lineTo(z*0.9, -z)
    view.ctx.stroke()

    view.ctx.beginPath()
    view.ctx.moveTo(z*0.8, 0)
    view.ctx.lineTo(z*0.7, z)
    view.ctx.stroke()

    view.ctx.beginPath()
    view.ctx.moveTo(z*0.8, 0)
    view.ctx.lineTo(z*0.9, z)
    view.ctx.stroke()

    // skull
    view.ctx.fillStyle = '#fff'
    view.ctx.beginPath()
    view.ctx.ellipse(0, 0, z * 1.2, z * 0.7, 0, 2*Math.PI, 0);
    view.ctx.closePath()
    view.ctx.fill()

    //eyes
    view.ctx.fillStyle = '#f00'
    // blink
    if(Math.random() < 0.1){
      view.ctx.fillStyle = '#fff'
    }
    view.ctx.beginPath()
    view.ctx.ellipse(z * 0.8, -z*0.2, z * 0.1, z * 0.05, 0, 2*Math.PI, 0);
    view.ctx.closePath()

    view.ctx.fill()
    view.ctx.beginPath()
    view.ctx.ellipse(z * 0.8, z*0.2, z * 0.1, z * 0.05, 0, 2*Math.PI, 0);
    view.ctx.closePath()
    view.ctx.fill()

    view.ctx.restore()
    // end head
    break;

  case 1:
    // momma rat

    // tail
    view.ctx.fillStyle = '#ccc'
    view.ctx.strokeStyle = '#ccc'
    view.ctx.save()
    view.ctx.translate(-1.5*z, 0)
    view.ctx.beginPath()
    view.ctx.moveTo(0, 0.5*z)
    view.ctx.quadraticCurveTo(-2*z, z * q1, -5 * z, 0)
    view.ctx.quadraticCurveTo(-2*z, z * q1, 0, -0.5*z)
    view.ctx.closePath()
    view.ctx.stroke()
    view.ctx.fill()
    view.ctx.restore()

    // body
    view.ctx.fillStyle = '#666'
    view.ctx.lineWidth = 1
    view.ctx.beginPath()
    view.ctx.ellipse(0, 0, z * 2.4, z * 1.8, 0, 2*Math.PI, 0);
    view.ctx.closePath()
    view.ctx.fill()

    // head
    view.ctx.save()
    view.ctx.translate(2.2*z, 0)
    view.ctx.rotate(q2 * 0.3)

    // whiskers
    view.ctx.strokeStyle = '#666'

    view.ctx.beginPath()
    view.ctx.moveTo(z*0.8, 0)
    view.ctx.lineTo(z*0.7, -z)
    view.ctx.stroke()

    view.ctx.beginPath()
    view.ctx.moveTo(z*0.8, 0)
    view.ctx.lineTo(z*0.9, -z)
    view.ctx.stroke()

    view.ctx.beginPath()
    view.ctx.moveTo(z*0.8, 0)
    view.ctx.lineTo(z*0.7, z)
    view.ctx.stroke()

    view.ctx.beginPath()
    view.ctx.moveTo(z*0.8, 0)
    view.ctx.lineTo(z*0.9, z)
    view.ctx.stroke()

    // skull
    view.ctx.fillStyle = '#666'
    view.ctx.beginPath()
    view.ctx.ellipse(0, 0, z * 1.2, z * 0.7, 0, 2*Math.PI, 0);
    view.ctx.closePath()
    view.ctx.fill()

    //eyes
    view.ctx.fillStyle = '#f00'
    // blink
    if(Math.random() < 0.1){
      view.ctx.fillStyle = '#000'
    }
    view.ctx.beginPath()
    view.ctx.ellipse(z * 0.8, -z*0.2, z * 0.1, z * 0.05, 0, 2*Math.PI, 0);
    view.ctx.closePath()

    view.ctx.fill()
    view.ctx.beginPath()
    view.ctx.ellipse(z * 0.8, z*0.2, z * 0.1, z * 0.05, 0, 2*Math.PI, 0);
    view.ctx.closePath()
    view.ctx.fill()

    view.ctx.restore()
    // end head
    break;

  case 2:
    // baby rat

    // tail
    view.ctx.fillStyle = '#fff'
    view.ctx.strokeStyle = '#fff'
    view.ctx.save()
    view.ctx.translate(-0.8*z, 0)
    view.ctx.beginPath()
    view.ctx.moveTo(0, 0.25*z)
    view.ctx.quadraticCurveTo(-2*z, z * q1, -3 * z, 0)
    view.ctx.quadraticCurveTo(-2*z, z * q1, 0, -0.25*z)
    view.ctx.closePath()
    view.ctx.stroke()
    view.ctx.fill()
    view.ctx.restore()

    // body
    view.ctx.fillStyle = '#fff'
    view.ctx.lineWidth = 1
    view.ctx.beginPath()
    view.ctx.ellipse(0, 0, z * 1.1, z * 0.8, 0, 2*Math.PI, 0);
    view.ctx.closePath()
    view.ctx.fill()

    // head
    view.ctx.save()
    view.ctx.translate(z, 0)
    view.ctx.rotate(q2 * 0.3)

    // whiskers
    view.ctx.strokeStyle = '#fff'

    view.ctx.beginPath()
    view.ctx.moveTo(z*0.2, 0)
    view.ctx.lineTo(z*0.1, -z)
    view.ctx.stroke()

    view.ctx.beginPath()
    view.ctx.moveTo(z*0.2, 0)
    view.ctx.lineTo(z*0.3, -z)
    view.ctx.stroke()

    view.ctx.beginPath()
    view.ctx.moveTo(z*0.2, 0)
    view.ctx.lineTo(z*0.1, z)
    view.ctx.stroke()

    view.ctx.beginPath()
    view.ctx.moveTo(z*0.2, 0)
    view.ctx.lineTo(z*0.3, z)
    view.ctx.stroke()

    // skull
    view.ctx.fillStyle = '#fff'
    view.ctx.beginPath()
    view.ctx.ellipse(0, 0, z * 0.4, z * 0.4, 0, 2*Math.PI, 0);
    view.ctx.closePath()
    view.ctx.fill()

    //eyes
    view.ctx.fillStyle = '#f00'
    // blink
    if(Math.random() < 0.1){
      view.ctx.fillStyle = '#fff'
    }
    view.ctx.beginPath()
    view.ctx.ellipse(z * 0.2, -z*0.1, z * 0.1, z * 0.05, 0, 2*Math.PI, 0);
    view.ctx.closePath()

    view.ctx.fill()
    view.ctx.beginPath()
    view.ctx.ellipse(z * 0.2, z*0.1, z * 0.1, z * 0.05, 0, 2*Math.PI, 0);
    view.ctx.closePath()
    view.ctx.fill()

    view.ctx.restore()
    break;
  default:
    // tail
    view.ctx.fillStyle = '#ccc'
    view.ctx.beginPath()
    view.ctx.moveTo(-z-z-z-z, 0)
    view.ctx.lineTo(0, z)
    view.ctx.lineTo(0, -z)
    view.ctx.lineTo(-z-z-z-z, 0)
    view.ctx.closePath()
    view.ctx.fill()

    // body
    view.ctx.fillStyle = '#eee'
    view.ctx.lineWidth = 1
    view.ctx.beginPath()
    view.ctx.arc(0, 0, 2*z, 0, 2*Math.PI);
    view.ctx.closePath()
    view.ctx.fill()

    // head
    view.ctx.fillStyle = '#fff'
    view.ctx.beginPath()
    view.ctx.arc(z*2, 0, z, 0, 2*Math.PI);
    view.ctx.closePath()
    view.ctx.fill()
    break;
  }

  gx.ctx.restore()


}
