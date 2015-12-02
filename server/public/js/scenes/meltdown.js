/* global Scenes, Scene, Actors */

Scenes.meltdown = function (env, opts) {
  this.env = env
  this.opts = this.genOpts(opts)
  this.attrs = this.genAttrs()
  this.init()
}

Scenes.meltdown.prototype = Object.create(Scene.prototype)

Scenes.meltdown.prototype.title = 'Meltdown'

Scenes.meltdown.prototype.layout = ''

Scenes.meltdown.prototype.init = function () {
  var x, y

  // create worldspace
  this.cells = []
  this.atoms = []
  this.jetstreams = []

  for (x = 0; x < this.opts.max_x; x++) {
    for (y = 0; y < this.opts.max_y; y++) {
      this.cells.push(new Actors.Cell(
        this.env,
        {
          scene: this
        },
        {
          x: x,
          y: y,
          z: 0
        }
      ))
    }
  }

  for (x = 0; x < this.opts.max_x * this.opts.density; x++) {
    for (y = 0; y < this.opts.max_y * this.opts.density; y++) {
      this.atoms.push(new Actors.Atom(
        this.env,
        {
          scene: this,
          cells: this.cells,
          jetstreams: this.jetstreams
        },
        {
          x: x / this.opts.density,
          y: y / this.opts.density,
          z: 0
        }
      ))
    }
  }

  this.jetstreams.push(new Actors.Jetstream(
    this.env,
    {
      scene: this
    },
    {
      x: x,
      y: this.opts.max_y * 0.3,
      z: 0,
      vel: 1
    }
  ))

  this.jetstreams.push(new Actors.Jetstream(
    this.env,
    {
      scene: this
    },
    {
      x: x,
      y: this.opts.max_y * 0.7,
      z: 0,
      vel: -1
    }
  ))
}

Scenes.meltdown.prototype.getCast = function () {
  return {
    Cell: Actors.Cell,
    Jetstream: Actors.Jetstream
  }
}

Scenes.meltdown.prototype.defaults = [{
  key: 'max_x',
  info: 'Max X',
  value: 16,
  min: 32,
  max: 1280
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 16,
  min: 32,
  max: 960
}, {
  key: 'max_z',
  info: 'Max Z',
  value: 1,
  min: 1,
  max: 128
}, {
  key: 'delay',
  value: 900,
  min: 600,
  max: 15000
}, {
  key: 'density',
  value: 2,
  min: 1,
  max: 16
}, {
  key: 'font_size',
  value: 24,
  min: 1,
  max: 160
}]

Scenes.meltdown.prototype.genAttrs = function () {
  return {
    period: this.opts.delay + Math.floor(Math.random() * this.opts.delay),
    at: 0,
    cycle: 0,
    phase: 0,
    cell_i: 0,
    atom_i: 0
  }
}

Scenes.meltdown.prototype.update = function (delta) {
  this.attrs.at = this.attrs.at + delta
  if (this.attrs.at >= this.attrs.period) {
    this.attrs.at -= this.attrs.period
  }

  this.attrs.phase = this.attrs.at / this.attrs.period
  this.attrs.cycle = Math.sin(((2 * Math.PI) / this.attrs.period) * this.attrs.at)

  var i, ii
  for (i = 0, ii = this.cells.length; i < ii; i++) {
    this.cells[i].update(delta)
  }

  // if(this.atoms[this.attrs.atom_i]){
  //   this.atoms[this.attrs.atom_i].update(delta)
  // }
  // this.attrs.atom_i ++

  for (i = 0, ii = this.atoms.length; i < ii; i++) {
    this.atoms[i].update(delta)
  }

  // var skip = 128

  // for(i=0; i<skip; i++){
  //   if(this.attrs.atom_i + i >= this.atoms.length){
  //     this.attrs.atom_i = 0
  //   }
  //   this.atoms[this.attrs.atom_i + i].update(delta)
  // }
  // this.attrs.atom_i += skip

  for (i = 0, ii = this.jetstreams.length; i < ii; i++) {
    this.jetstreams[i].update(delta)
  }
}

Scenes.meltdown.prototype.paint = function (fx, gx, sx) {
  this.paintCells(gx)
  this.paintAtoms(gx)
  // this.paintJetstreams(gx)

  var view = gx

  // day/night
  view.ctx.save()
  // view.ctx.translate(1, 1)
  // view.ctx.scale(0.2, 0.2)

  // day
  view.ctx.lineWidth = 0.1
  view.ctx.strokeStyle = '#fff'
  view.ctx.fillStyle = 'rgba(255, 255, 153, 0.25'

  view.ctx.fillRect(
    this.opts.max_x * this.attrs.phase,
    0,
    this.opts.max_x * 0.5,
    this.opts.max_y
  )

  view.ctx.fillRect(
    -this.opts.max_x + (this.opts.max_x * this.attrs.phase),
    0,
    this.opts.max_x * 0.5,
    this.opts.max_y
  )

  view.ctx.lineWidth = 0.1
  view.ctx.strokeStyle = '#fff'
  view.ctx.fillStyle = 'rgba(255, 255, 255, 0.25'

  view.ctx.fillRect(
    (this.opts.max_x * this.attrs.phase) + (this.opts.max_x * 0.2),
    0,
    this.opts.max_x * 0.125,
    this.opts.max_y
  )

  view.ctx.fillRect(
    -this.opts.max_x + ((this.opts.max_x * this.attrs.phase) + (this.opts.max_x * 0.2)),
    0,
    this.opts.max_x * 0.125,
    this.opts.max_y
  )

  // night
  view.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'

  view.ctx.fillRect(
    (this.opts.max_x * 0.5) + (this.opts.max_x * this.attrs.phase),
    0,
    this.opts.max_x * 0.5,
    this.opts.max_y
  )

  view.ctx.fillRect(
    -(this.opts.max_x * 0.5) + (this.opts.max_x * this.attrs.phase),
    0,
    this.opts.max_x * 0.5,
    this.opts.max_y
  )

  view.ctx.fillStyle = 'rgba(0, 0, 0, 1)'

  view.ctx.fillRect(
    0,
    0,
    -this.opts.max_x,
    this.opts.max_y
  )

  view.ctx.fillRect(
    this.opts.max_x,
    0,
    this.opts.max_x,
    this.opts.max_y
  )

  view.ctx.restore()

  // view.ctx.save()
  // view.ctx.translate(1, 1)
  // view.ctx.scale(0.2, 0.2)
  // view.ctx.fillStyle = '#fff'
  // view.ctx.font = '10px ubuntu mono'
  // view.ctx.textAlign = 'left'
  // view.ctx.textBaseline = 'middle'
  // view.ctx.fillText(this.attrs.phase.toFixed(2), 0, 0)
  // view.ctx.fillText(this.attrs.at.toFixed(2), 0, 10)
  // view.ctx.fillText(this.attrs.period.toFixed(2), 0, 20)
  // view.ctx.restore()
}

Scenes.meltdown.prototype.paintCells = function (view) {
  for (var i = 0, ii = this.cells.length; i < ii; i++) {
    this.cells[i].paint(view)
  }
}

Scenes.meltdown.prototype.paintAtoms = function (view) {
  for (var i = 0, ii = this.atoms.length; i < ii; i++) {
    this.atoms[i].paint(view)
  }
}

Scenes.meltdown.prototype.paintJetstreams = function (view) {
  for (var i = 0, ii = this.jetstreams.length; i < ii; i++) {
    this.jetstreams[i].paint(view)
  }
}

Scenes.meltdown.prototype.getHelp = function () {
  return ''
}
