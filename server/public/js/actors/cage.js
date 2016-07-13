/* global Actors, Actor, Vec3 */

Actors.Cage = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init()
}

Actors.Cage.prototype = Object.create(Actor.prototype)

Actors.Cage.prototype.title = 'Cage'

Actors.Cage.prototype.genAttrs = function (attrs) {
  return {
    i: attrs.i,
    x: attrs.x,
    y: attrs.y,
    flash: 0,
    rats: 0,
    rats_max: this.opts.rats_max || 0,
    rats_per_tick: this.opts.rats_per_tick || 1,
  }
}

Actors.Cage.prototype.init = function () {
  this.rats = [];
  this.booms = [];
}

Actors.Cage.prototype.defaults = [{
  key: 'max_x',
  info: 'Max X',
  value: 640,
  min: 100,
  max: 1600
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 480,
  min: 100,
  max: 1000
}, {
  key: 'reduce',
  value: 0,
  min: 0,
  max: 1
}]

Actors.Cage.prototype.colors = [
  '#00c',
  '#090',
  '#fff'
]

Actors.Cage.prototype.addRat = function () {
  this.rats.push(new Actors.Demorat(
    this.env, {
      demo: this,
      rats: this.rats,
      booms: this.booms
    }, {
      x: this.opts.max_x * Math.random(),
      y: this.opts.max_x * Math.random()
    }));
}

Actors.Cage.prototype.update = function (delta) {

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

}

Actors.Cage.prototype.paint = function (view) {
  
  var i, ii

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

  // var boom;
  // for (i = 0, ii = this.booms.length; i < ii; i++) {
  //   boom = this.booms[i]
  //   if(!boom){
  //     continue
  //   }      
  //   view.ctx.save()
  //   view.ctx.translate(boom.pos.x, boom.pos.y);
  //   this.booms[i].paint(view)
  //   view.ctx.restore()
  // }
 
  
}
