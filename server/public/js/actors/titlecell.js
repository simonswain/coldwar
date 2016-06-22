/* global Actors, Actor, Vec3 */

Actors.TitleCell = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init()
}

Actors.TitleCell.prototype = Object.create(Actor.prototype)

Actors.TitleCell.prototype.title = 'TitleCell'

Actors.TitleCell.prototype.genAttrs = function (attrs) {
  return {
    i: attrs.i,
    x: attrs.x,
    y: attrs.y,
    flash: 0,
  }
}

Actors.TitleCell.prototype.init = function () {
  // top right bottom left 
  this.exits = [
    null, null, null, null
  ];
  
  this.gridmates = [
    null, null, null, null
  ];
}

Actors.TitleCell.prototype.defaults = [{
  key: 'max_x',
  info: 'Max X',
  value: 480,
  min: 100,
  max: 1600
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 480,
  min: 100,
  max: 1000
}]

Actors.TitleCell.prototype.colors = [
  '#00c',
  '#090',
  '#fff'
]


Actors.TitleCell.prototype.update = function (delta) {
  if(Math.random() < 0.001){
    this.attrs.flash = 1;
  }
}

Actors.TitleCell.prototype.paint = function (view) {
  
  if (this.attrs.flash>0) {
    view.ctx.fillStyle = 'rgba(0,255,0,0.7);'
    view.ctx.fillStyle = '#0f0'
    view.ctx.fillRect(0, 0, this.opts.max_x, this.opts.max_y)
    this.attrs.flash --
  }

  var i, ii

  view.ctx.lineWidth = 12

  view.ctx.save()

  var vecs =  [
    [0, 0, 1, 0],
    [1, 0, 1, 1],
    [1, 1, 0, 1],
    [0, 1, 0, 0]
  ];

  var rgb = '0, 153, 0';
  if(Math.random()<0.01){
    rgb = '204, 0, 0';
  }
  
  for(var exit = 0; exit < 4; exit ++){

    if(this.exits[exit]){
    }

    if(!this.exits[exit]){
      view.ctx.strokeStyle = 'rgba(' + rgb + ', ' + (0.25 + (Math.random() * 0.25))+  ')'
      if(!this.gridmates[exit]){
        view.ctx.strokeStyle = 'rgba(' + rgb + ', ' + (0.5 + (Math.random() * 0.25))+  ')'
      }
      view.ctx.beginPath()
      view.ctx.moveTo(this.opts.max_x * vecs[exit][0], this.opts.max_y * vecs[exit][1])
      view.ctx.lineTo(this.opts.max_x * vecs[exit][2], this.opts.max_y * vecs[exit][3])
      view.ctx.stroke()
    }
  }

  view.ctx.restore()
  
  
}
