/* global Actors, Actor */

Actors.Demobreeder = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
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
  value: 64,
  min: 100,
  max: 1600
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 128,
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
}]

Actors.Demobreeder.prototype.update = function (delta) {
  
  // if (this.rats.length < 1) {
  //   this.refs.rats.push(new Actors.Demorat(
  //     this.env, {
  //       scene: this.refs.scene,
  //       demo: this.refs.demo,
  //       rats: this.refs.rats
  //     }, {
  //       demo_x: this.attrs.demo_x,
  //       demo_y: this.attrs.demo_y
  //     }
  //   ))
  // }

  if(this.rats.length < this.opts.rats_max){
    this.addRat();
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

  var launched_this_tick = 0

  var rat
  while (this.rats.length < this.opts.rats_max && launched_this_tick < this.opts.rats_per_tick) {
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
    launched_this_tick++
  }

}


Actors.Demobreeder.prototype.paint = function (view) {

  view.ctx.strokeStyle = '#fff'

  view.ctx.fillStyle = 'rgba(0, 0, 255, 1)'
  view.ctx.strokeStyle = 'rgba(158, 204, 0, 0.8)'
  view.ctx.beginPath()
  view.ctx.rect(0, 0, this.opts.max_x, this.opts.max_y)

  if(this.env.ms % 20 < 10){
    view.ctx.fill()
  }

  view.ctx.stroke()

}
