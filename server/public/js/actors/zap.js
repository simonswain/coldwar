/* global Actors, Vec3 */

Actors.Zap = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init(attrs)
}

Actors.Zap.prototype = Object.create(Actor.prototype)

Actors.Zap.prototype.title = 'Zap'

Actors.Zap.prototype.init = function (attrs) {

  this.pos = new Vec3(
    attrs.x,
    attrs.y
  )

  this.target = new Vec3(
    attrs.target_x,
    attrs.target_y
  )

  this.velo = new Vec3();
  this.velo = this.target.minus(this.pos).normalize().scale(this.attrs.speed)
  //this.velo = this.pos.minus(this.target).normalize().scale(this.attrs.speed)
}

Actors.Zap.prototype.defaults = [{
  key: 'color',
  info: 'spectrum',
  value: 4,
  min: 0,
  max: 7
}, {
  key: 'sensitivity',
  info: '',
  value: 8,
  min: 0,
  max: 255
}, {
  key: 'speed',
  info: '',
  value: 2,
  min: 0,
  max: 255
}]

Actors.Zap.prototype.genAttrs = function (attrs) {
  return {
    x: attrs.x,
    y: attrs.y,
    z: attrs.z,
    ttl: 120,
    launched: 0,
    dead: false,
    speed: this.opts.speed
  }
}

Actors.Zap.prototype.update = function (delta) {

  this.attrs.ttl -= delta;
  if(this.attrs.ttl < 0){
    this.attrs.dead = true;
    return
  }

  var accel = this.target.minus(this.pos).normalize().scale(this.attrs.speed)

  //this.velo.add(accel)
  //this.pos.add(this.velo)
  this.pos.add(accel)

  // hit target?
  var range = this.pos.range(this.target)

  if (range < this.opts.sensitivity) {
    this.attrs.dead = true
    this.refs.cell.booms.push(new Actors.Boom(
      this.env, {
      }, {
        style: '',
        radius: 4,
        x: this.pos.x,
        y: this.pos.y,
        color: '152,0,0'
      }
    ))
  }


  if(this.refs.cell.rats.length === 0){
    return;
  };
  
  var rat;
  var i ,ii, range;
  
  for (i = 0, ii = this.refs.cell.rats.length; i < ii; i++) {
    rat = this.refs.cell.rats[i]
    if(!rat){
      continue
    }
    range = this.pos.range(rat.pos)

    if (range < this.opts.sensitivity) {

      this.attrs.dead = true;
      rat.attrs.dead = true;

      for (i = 0, ii = rat.refs.breeder.rats.length; i < ii; i++) {
        if (rat.refs.breeder.rats[i] === this) {
          rat.refs.breeder.rats[i] = null;
          break
        }
      }

      for (i = 0, ii = this.refs.cell.rats.length; i < ii; i++) {
        if (this.refs.cell.rats[i] === this) {
          this.refs.cell.rats[i] = null;
          break
        }
      }

      this.refs.cell.booms.push(new Actors.Boom(
        this.env, {
        }, {
          style: '',
          radius: 16,
          x: rat.pos.x,
          y: rat.pos.y,
          color: '255,0,0'
        }
      ))

      
      break;
    }
    
  }

  
}

Actors.Zap.prototype.paint = function (view) {
  view.ctx.save()
  view.ctx.fillStyle = '#fff'
  view.ctx.beginPath()
  view.ctx.arc(0, 0, 1, 0, 2 * Math.PI)
  view.ctx.fill()
  view.ctx.restore()
}

