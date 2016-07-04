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
    flash: 0,
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
  this.portals = [];

}

Actors.Cell.prototype.defaults = [{
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
}, {
  key: 'reduce',
  value: 0,
  min: 0,
  max: 1
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
  var reactor = new Actors.Reactor(
    this.env, {
      cell: this,
    }, {
      x: this.opts.max_x * 0.5,
      y: this.opts.max_y * 0.5
    })
  this.reactors.push(reactor)
  return reactor
}


Actors.Cell.prototype.addHuman = function () {

  var human

  human = new Actors.Human(
    this.env, {
      maze: this.refs.maze,
      cell: this,
    }, {
      x: this.opts.max_x * 0.5,
      y: this.opts.max_y * 0.5,
    })

  this.humans.push(human)
  return human;
  
}

Actors.Cell.prototype.addPortal = function () {
  var portal
  portal = new Actors.Portal(
    this.env, {
      maze: this.refs.maze,
      cell: this,
    }, {
      x: this.opts.max_x * 0.5,
      y: this.opts.max_y * 0.5,
    })
  this.portals.push(portal)
  return portal;
}

Actors.Cell.prototype.killAllActors = function () {
  var i, ii;
  for (i = 0, ii = this.breeders.length; i<ii; i++) {
    if(this.breeders[i]){
      this.breeders[i].kill();
    }
  }

  for (i = 0, ii = this.rats.length; i<ii; i++) {
    if(this.rats[i]){
      this.rats[i].kill(true);
    }
  }
}

Actors.Cell.prototype.update = function (delta) {
  var intentToHuman = null;
  if(this.refs.maze && this.refs.maze.human){
    this.routeToHuman = this.refs.maze.route(this, this.refs.maze.human.refs.cell);

    var qq=[];
    for(var i=0; i<4; i++){
      if(this.exits[i] && this.exits[i].attrs.i == this.routeToHuman[1]){
        intentToHuman = i;
        break;
      }
    }
  }
  
  var i, ii;
  for (i = 0, ii = this.breeders.length; i<ii; i++) {
    if(this.breeders[i]){
      this.breeders[i].update(delta);
    }
  }

  for (i = 0, ii = this.rats.length; i<ii; i++) {
    if(this.rats[i]){
      this.rats[i].update(delta, intentToHuman);
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
  
  // view.ctx.strokeStyle = '#666'
  // view.ctx.rect(0, 0, this.opts.max_x, this.opts.max_y)
  // view.ctx.stroke()

  var intents = [[0,-1],[1,0],[0,1],[-1,0]];
  
  // for(var i=0; i<4; i++){
  //   if(this.exits[i]){
  //     view.ctx.font = '32pt ubuntu mono, monospace'
  //     view.ctx.textAlign='center';
  //     view.ctx.textBaseline='middle';
  //     view.ctx.beginPath()
  //     view.ctx.fillStyle = '#600'
  //     view.ctx.fillText(
  //       i,
  //       (this.opts.max_x / 2) + (intents[i][0] * this.opts.max_x * 0.35),
  //       (this.opts.max_y / 2) + (intents[i][1] * this.opts.max_y * 0.35)
  //     );
  //   }
  // }
  
  if (this.attrs.flash>0) {
    if(this.humans && this.humans[0]){
      view.ctx.fillStyle = 'rgba(255,255,255,0.7);'
      view.ctx.fillStyle = '#ffffff'
      view.ctx.beginPath()
      view.ctx.arc(this.humans[0].pos.x, this.humans[0].pos.y, this.opts.max_x * 0.5, 0, 2*Math.PI);
      view.ctx.fill();
    } else {
      view.ctx.fillStyle = 'rgba(255,255,255,0.7);'
      view.ctx.fillStyle = '#ffffff'
      view.ctx.beginPath()
      view.ctx.arc(this.opts.max_x * 0.5, this.opts.max_y * 0.5, this.opts.max_x * 0.5, 0, 2*Math.PI);
      view.ctx.fill();
    }
    this.attrs.flash --
  }

  // view.ctx.fillStyle = '#ffffff'
  // view.ctx.font = '28pt arial'
  // view.ctx.fillText(this.attrs.i, this.opts.max_x/2, this.opts.max_y/2)
  
  var i, ii
  
  view.ctx.lineWidth = 16

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

  if(this.opts.reduce){
    view.ctx.translate(this.opts.max_x * 0.05, this.opts.max_y * 0.05) 
    view.ctx.scale(0.9, 0.9)
  }
  
  //trbl
  // expect cell.exits to br array of 4 cells or nulls
  var vecs =  [
    [0, 0, 1, 0],
    [1, 0, 1, 1],
    [1, 1, 0, 1],
    [0, 1, 0, 0]
  ];

  var rgb = '0, 153, 0';
  if(this.refs.maze && this.refs.maze.attrs.escape){
    rgb = '153, 0, 0';
  }
  
  for(var exit = 0; exit < 4; exit ++){

    if(this.exits[exit]){
    }

    if(!this.exits[exit]){

      view.ctx.strokeStyle = 'rgba(' + rgb + ', ' + (0.25 + (Math.random() * 0.25))+  ')'
      if(!this.gridmates[exit]){
        view.ctx.strokeStyle = 'rgba(' + rgb + ', ' + (0.5 + (Math.random() * 0.25))+  ')'
      }
   
      view.ctx.lineCap = 'round'
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
    view.ctx.restore()
  }

  if(this.refs.maze && this.refs.maze.human && !this.refs.maze.human.attrs.escaped){
    var portal
    for (i = 0, ii = this.portals.length; i<ii; i++) {
      portal = this.portals[i];
      view.ctx.save()
      view.ctx.translate(portal.pos.x, portal.pos.y);
      this.portals[i].paint(view)
      view.ctx.restore()
    }
  }  
 
  var breeder;
  for (i = 0, ii = this.breeders.length; i<ii; i++) {
    breeder = this.breeders[i];
    if(!breeder){
      continue
    }
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

  var human;
  for (i = 0, ii = this.humans.length; i < ii; i++) {
    human = this.humans[i]
    if(!human){
      continue
    }      
    view.ctx.save()
    view.ctx.translate(human.pos.x, human.pos.y);
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
    this.booms[i].paint(view)
    view.ctx.restore()
  }
 
  
}
