/* global Actors, Actor */

Actors.Breeder = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init(attrs)
}

Actors.Breeder.prototype = Object.create(Actor.prototype)

Actors.Breeder.prototype.title = 'Breeder'

Actors.Breeder.prototype.genAttrs = function (attrs) {
  return {
    x: attrs.x,
    y: attrs.y,
    dead: false
  }
}

Actors.Breeder.prototype.init = function (attrs) {

  this.rats = [];
  this.pos = new Vec3(attrs.x, attrs.y)

}

Actors.Breeder.prototype.defaults = [{
  key: 'max_x',
  info: 'Max X',
  value: 96,
  min: 100,
  max: 1600
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 96,
  min: 100,
  max: 1000
}, {
  key: 'rats_max',
  value: 12,
  min: 0,
  max: 255
}, {
  key: 'rats_per_tick',
  value: 1,
  min: 0,
  max: 8
}]

Actors.Breeder.prototype.update = function (delta) {
  // if (this.refs.rats.length < this.refs.scene.opts.rat_limit) {
  //   this.refs.rats.push(new Actors.Rat(
  //     this.env, {
  //       scene: this.refs.scene,
  //       maze: this.refs.maze,
  //       human: this.refs.human,
  //       reactor: this.refs.reactor,
  //       rats: this.refs.rats
  //     }, {
  //       cell_x: this.attrs.cell_x,
  //       cell_y: this.attrs.cell_y
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

Actors.Breeder.prototype.addRat = function () {

  var rat
  rat = new Actors.Rat(
    this.env, {
      breeder: this,
      cell: this.refs.cell,
    }, {
      x: this.pos.x,
      y: this.pos.y,
    })

  this.refs.cell.rats.push(rat)
  this.rats.push(rat)

}

Actors.Breeder.prototype.addRats = function () {

  // var launched_this_tick = 0

  // var rat
  // while (this.rats.length < this.opts.rats_max && launched_this_tick < this.opts.rats_per_tick) {

  //   rat = new Actors.Rat(
  //     this.env, {
  //       breeder: this,
  //       cell: this.refs.cell,
  //       rats: this.rats,
  //     }, {
  //       x: this.pos.x,
  //       y: this.pos.y,
  //     })

  //   this.refs.cell.rats.push(rat)
  //   this.rats.push(rat)
  //   launched_this_tick++
  // }
}


Actors.Breeder.prototype.paint = function (view) {

  view.ctx.strokeStyle = '#fff'

  view.ctx.fillStyle = 'rgba(0, 0, 255, 1)'
  view.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
  view.ctx.beginPath()
  view.ctx.rect(0, 0, this.opts.max_x, this.opts.max_y)

  if(this.env.ms % 20 < 10){
    view.ctx.fill()
  }

  view.ctx.stroke()

}
