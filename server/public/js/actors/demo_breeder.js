/* global Actors, Actor */

Actors.Demobreeder = function (env, refs, attrs, opts) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts(opts)
  this.attrs = this.genAttrs(attrs)
  this.init(attrs)
}

Actors.Demobreeder.prototype = Object.create(Actor.prototype)

Actors.Demobreeder.prototype.title = 'Demobreeder'

Actors.Demobreeder.prototype.genAttrs = function (attrs) {
  return {
    x: attrs.x,
    y: attrs.y,
    dead: false
  }
}

Actors.Demobreeder.prototype.init = function (attrs) {
  this.rats = [];
  this.pos = new Vec3(attrs.x, attrs.y)
}

Actors.Demobreeder.prototype.defaults = [{
  key: 'max_x',
  info: 'Max X',
  value: 80,
  min: 100,
  max: 1600
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 80,
  min: 100,
  max: 1000
}, {
  key: 'rats_max',
  value: 1,
  min: 0,
  max: 255
}, {
  key: 'rats_per_tick',
  value: 1,
  min: 0,
  max: 8
}, {
  key: 'rat_chance',
  value: 1,
  min: 0,
  max: 1
}]

Actors.Demobreeder.prototype.update = function (delta) {
  
  if(this.rats.length < this.opts.rats_max){
    this.addRats();
  }

  for (i = 0, ii = this.rats.length; i<ii; i++) {
    if(!this.rats[i] || this.rats[i].attrs.dead){
      this.rats.splice(i, 1);
      i--
      ii--
    }
  }
  
}

Actors.Demobreeder.prototype.addRat = function () {

  var rat
  rat = new Actors.Demorat(
    this.env, {
      breeder: this,
      demo: this.refs.demo,
    }, {
      x: this.pos.x,
      y: this.pos.y,
    })

  this.refs.demo.rats.push(rat)
  this.rats.push(rat)

}

Actors.Demobreeder.prototype.addRats = function () {

  var rat
  if (this.rats.length < this.opts.rats_max && Math.random() < Number(this.opts.rat_chance)) {
    rat = new Actors.Demorat(
      this.env, {
        reeder: this,
        demo: this.refs.demo,
        rats: this.rats,
      }, {
        x: this.pos.x,
        y: this.pos.y,
      })

    this.refs.demo.rats.push(rat)
    this.rats.push(rat)
  }

}


Actors.Demobreeder.prototype.paint = function (view) {

  view.ctx.fillStyle = 'rgba(0, 0, 255, 1)'
  view.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
  view.ctx.lineWidth = 8
  
  view.ctx.fillStyle = 'rgba(0, 0, 255, 1)'
  view.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'

  //view.ctx.rect(0, 0, this.opts.max_x, this.opts.max_y)
  
  var ww = this.opts.max_x;
 
  view.ctx.save()
  view.ctx.translate(this.opts.max_x/2, this.opts.max_y/2)
  view.ctx.beginPath()
  view.ctx.moveTo(-ww, 0);
  view.ctx.lineTo(-ww * 0.5, - ww * .8);
  view.ctx.lineTo(ww * 0.5, - ww * .8);
  view.ctx.lineTo(ww, 0);
  view.ctx.lineTo(ww * 0.5, ww * .8); 
  view.ctx.lineTo(-ww * 0.5, ww * .8);
  view.ctx.lineTo(-ww, 0);
  view.ctx.closePath();
 
  if(this.env.ms % 20 < 10){
    view.ctx.fill()
  }
 
  view.ctx.stroke()
  view.ctx.restore()

}
