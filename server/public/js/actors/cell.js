/* global Actors, Actor, Vec3 */

Actors.Cell = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init()
}

Actors.Cell.prototype = Object.create(Actor.prototype)

Actors.Cell.prototype.title = 'Cell'

Actors.Cell.prototype.genAttrs = function (attrs) {
  return {
    i: attrs.i,
    x: attrs.x,
    y: attrs.y,
    rats: 0,
    rats_max: this.opts.rats_max || 0,
    rats_per_tick: this.opts.rats_per_tick || 1,
  }
}

Actors.Cell.prototype.init = function () {

  // top right bottom left 
  this.exits = [
    null, null, null, null
  ];
  
  this.gridmates = [
    null, null, null, null
  ];

  this.humans = [];
  this.breeders = [];
  this.rats = [];

  this.booms = [];
  this.zaps = [];
  this.robots = [];
  this.reactors = [];

}

Actors.Cell.prototype.defaults = [{
  key: 'max_x',
  info: 'Max X',
  value: 120,
  min: 100,
  max: 1600
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 120,
  min: 100,
  max: 1000
}]

Actors.Cell.prototype.colors = [
  '#00c',
  '#090',
  '#fff'
]

Actors.Cell.prototype.addZap = function (x, y, target_x, target_y) {
  this.zaps.push(new Actors.Zap(
    this.env, {
      cell: this,
    }, {
      x: x,
      y: y,
      target_x: target_x,
      target_y: target_y
    }));
}

Actors.Cell.prototype.addBreeder = function () {
  this.breeders.push(new Actors.Breeder(
    this.env, {
      cell: this,
    }, {
      x: this.opts.max_x * 0.5,
      y: this.opts.max_y * 0.5
    }));
}

Actors.Cell.prototype.addReactor = function () {
  this.reactors.push(new Actors.Reactor(
    this.env, {
      cell: this,
    }, {
      x: this.opts.max_x * 0.75,
      y: this.opts.max_y * 0.25
    }));
}


Actors.Cell.prototype.addHuman = function () {

  var human
  human = new Actors.Human(
    this.env, {
      cell: this,
    }, {
      x: this.opts.max_x * 0.75,
      y: this.opts.max_y * 0.25,
    })

  this.humans.push(human)

}

Actors.Cell.prototype.update = function (delta) {

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
  
  for (i = 0, ii = this.humans.length; i<ii; i++) {
    if(this.humans[i]){
      this.humans[i].update(delta);
    }
  }

  for (i = 0, ii = this.zaps.length; i<ii; i++) {
    if(this.zaps[i]){
      this.zaps[i].update(delta);
    }
  }

  for (i = 0, ii = this.zaps.length; i<ii; i++) {
    if(!this.zaps[i] || this.zaps[i].attrs.dead){
      this.zaps.splice(i, 1);
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

Actors.Cell.prototype.paint = function (view) {

  var i, ii

  view.ctx.lineWidth = 2

  if(this.attrs.active){
    view.ctx.strokeStyle = '#0ff'
    view.ctx.fillStyle = 'rgba(0, 0, 255, 0.2)'
    view.ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)'
    view.ctx.beginPath()
    view.ctx.rect(0, 0, this.opts.max_x, this.opts.max_y)
    view.ctx.fill()
  }

  if(this.attrs.activeother){
    view.ctx.fillStyle = 'rgba(255, 0, 255, 0.2)'
    view.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
    view.ctx.beginPath()
    view.ctx.rect(0, 0, this.opts.max_x, this.opts.max_y)
    view.ctx.fill()
  }

  view.ctx.save()
  //view.ctx.scale(0.9, 0.9)
  
  //trbl
  // expect cell.exits to br array of 4 cells or nulls
  var vecs =  [
    [0, 0, 1, 0],
    [1, 0, 1, 1],
    [1, 1, 0, 1],
    [0, 1, 0, 0]
  ];

  for(var exit = 0; exit < 4; exit ++){

    if(this.exits[exit]){
    }

    if(!this.exits[exit]){

      view.ctx.strokeStyle = 'rgba(0, 153, 0, ' + (0.25 + (Math.random() * 0.25))+  ')'
      if(!this.gridmates[exit]){
        view.ctx.strokeStyle = 'rgba(0, 153, 0, ' + (0.5 + (Math.random() * 0.25))+  ')'
      }
   
      view.ctx.beginPath()
      view.ctx.moveTo(this.opts.max_x * vecs[exit][0], this.opts.max_y * vecs[exit][1])
      view.ctx.lineTo(this.opts.max_x * vecs[exit][2], this.opts.max_y * vecs[exit][3])
      view.ctx.stroke()
    }
  }

  view.ctx.restore()

  var reactor
  for (i = 0, ii = this.reactors.length; i<ii; i++) {
    reactor = this.reactors[i];
    view.ctx.save()
    view.ctx.translate(reactor.pos.x, reactor.pos.y);

    this.reactors[i].paint(view)

    view.ctx.fillStyle = 'rgba(255, 0, 255, 0.9)'
    view.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
    view.ctx.beginPath()
    view.ctx.rect(0, 0, reactor.opts.max_x, reactor.opts.max_y)
    view.ctx.fill()
    view.ctx.restore()
  }
  
 
  var breeder;
  for (i = 0, ii = this.breeders.length; i<ii; i++) {
    breeder = this.breeders[i];
    view.ctx.save()
    view.ctx.translate(breeder.pos.x - (breeder.opts.max_x/2), breeder.pos.y - (breeder.opts.max_y/2));

    view.ctx.fillStyle = 'rgba(0, 0, 255, 0.8)'
    view.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
    view.ctx.beginPath()
    view.ctx.rect(0, 0, breeder.opts.max_x, breeder.opts.max_y)
    view.ctx.fill()
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
    view.ctx.scale(0.2, 0.2);
    this.rats[i].paint(view)
    view.ctx.restore()
  }

  var human;
  for (i = 0, ii = this.humans.length; i < ii; i++) {
    human = this.humans[i]
    if(!human){
      continue
    }      
    view.ctx.save()
    view.ctx.translate(human.pos.x, human.pos.y);
    view.ctx.scale(0.4, 0.4);
    this.humans[i].paint(view)
    view.ctx.restore()
  }

  var zap;
  for (i = 0, ii = this.zaps.length; i < ii; i++) {
    zap = this.zaps[i]
    if(!zap){
      continue
    }      
    view.ctx.save()
    view.ctx.translate(zap.pos.x, zap.pos.y);
    view.ctx.scale(0.4, 0.4);
    this.zaps[i].paint(view)
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
    view.ctx.scale(0.4, 0.4);
    this.booms[i].paint(view)
    view.ctx.restore()
  }

  
  
}
