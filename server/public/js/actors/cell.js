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
    kings: 0,
    rats_max: this.opts.rats_max || 0,
    rats_per_tick: this.opts.rats_per_tick || 1,
    title: null,
    hideWalls: attrs.hideWalls || false,
    training: attrs.training || false
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

  this.oneups = [];
  this.humans = [];
  this.breeders = [];
  this.rats = [];
  this.kings = [];
  this.snake = false;

  this.booms = [];
  this.zaps = [];
  this.robots = [];
  this.reactor = false;
  this.portal = false;
  this.logo = false;
  this.capacitor = false;
  this.capacitors = false; 
  this.machine = false;
  this.pong = false;
  this.powerup = false;

  // this.oneups = [];
  // this.humans = [];
  // this.breeders = [];
  // this.rats = [];
  // this.kings = [];
  // this.snake = false;
  // this.reactors = [];
  // this.portals = [];

  // this.booms = [];
  // this.zaps = [];
  // this.robots = [];
  // this.reactor = false;
  // this.portal = false;
  // this.logo = false;
  // this.capacitor = false;
  // this.capacitors = false; 
  // this.machine = false;
  // this.pong = false;
  // this.powerup = false;

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

Actors.Cell.prototype.addZap = function (x, y, target_x, target_y, style) {
  this.zaps.push(new Actors.Zap(
    this.env, {
      cell: this,
    }, {
      style: style,
      x: x,
      y: y,
      target_x: target_x,
      target_y: target_y
    }));
}

Actors.Cell.prototype.addLogo = function () {
  this.logo = new Actors.Logo(
    this.env, {
      cell: this,
    }, {
    });
}

Actors.Cell.prototype.addCapacitor = function () {
  this.capacitor = new Actors.Capacitor(
    this.env, {
      cell: this,
    }, {
    });
}

Actors.Cell.prototype.addCapacitors = function () {
  this.capacitors = new Actors.Capacitors(
    this.env, {
      cell: this,
    }, {
    });
}

Actors.Cell.prototype.addMachine = function () {
  this.machine = new Actors.Machine(
    this.env, {
      cell: this,
    }, {
    });
}

Actors.Cell.prototype.addPong = function () {
  this.pong = new Actors.Pong(
    this.env, {
      cell: this,
    }, {
    });
}

Actors.Cell.prototype.addPowerup = function () {
  this.powerup = new Actors.Powerup(
    this.env, {
      cell: this,
    }, {
    });
}

Actors.Cell.prototype.addSnake = function () {
  this.snake = new Actors.Snake(
    this.env, {
      cell: this,
    }, {
    });
}

Actors.Cell.prototype.addStory = function () {
  this.story = new Actors.Story(
    this.env, {
      cell: this,
    }, {
    });
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
  this.reactor = reactor
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

  if(!this.attrs.training){
    this.oneups.push(new Actors.Oneup(
      this.env, {
        cell: this.refs.cell
      }, {
        text: 'INGRESS',
        ttl: 120,
        style: 'static',
        x: this.opts.max_x / 2,
        y: this.opts.max_y / 2
      }
    ));
  }
  
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
  this.portal = portal;
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

  for (i = 0, ii = this.kings.length; i<ii; i++) {
    if(this.kings[i]){
      this.kings[i].kill(true);
    }
  }

  if(this.snake){
    this.snake.kill(true);
  }

  if(this.logo){
    this.logo.kill();
  }

  if(this.capacitor){
    this.capacitor.kill();
  }

  if(this.capacitors){
    this.capacitors.kill();
  }

  if(this.machine){
    this.machine.kill();
  }
  
  if(this.pong){
    this.pong.kill();
  }
  
  if(this.powerup){
    this.powerup.kill();
  }
  
}


Actors.Cell.prototype.disableAllEnergyActors = function () {

  if(this.capacitor){
    this.capacitor.disable();
  }

  // if(this.capacitors){
  //   this.capacitors.disable();
  // }

  // if(this.machine){
  //   this.machine.disable();
  // }
  
  if(this.pong){
    this.pong.angry();
  }
  
}


Actors.Cell.prototype.update = function (delta) {

  if(this.story){
    this.story.update(delta);
  }

  if(this.logo){
    this.logo.update(delta);
  }
 
  if(this.capacitor){
    this.capacitor.update(delta);
  }

  if(this.capacitors){
    this.capacitors.update(delta);
  }
  
  if(this.machine){
    this.machine.update(delta);
  }
  
  if(this.pong){
    this.pong.update(delta);
  }
 
  if(this.powerup){
    this.powerup.update(delta);
  }
  
  if(this.snake){
    this.snake.update(delta);
  }

  if(this.snake && this.snake.attrs.dead){
    this.snake = null;
  }
  
  var i, ii;

  for (i = 0, ii = this.oneups.length; i<ii; i++) {
    if(this.oneups[i]){
      this.oneups[i].update(delta);
    }
  }

  for (i = 0, ii = this.oneups.length; i<ii; i++) {
    if(!this.oneups[i] || this.oneups[i].attrs.dead){
      this.oneups.splice(i, 1);
      i--
      ii--
    }
  }
 
  for (i = 0, ii = this.breeders.length; i<ii; i++) {
    if(this.breeders[i]){
      this.breeders[i].update(delta);
    }
  }

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
  
  for (i = 0, ii = this.kings.length; i<ii; i++) {
    if(this.kings[i]){
      this.kings[i].update(delta, intentToHuman);
    }
  }

  for (i = 0, ii = this.kings.length; i<ii; i++) {
    if(!this.kings[i] || this.kings[i].attrs.dead){
      this.kings.splice(i, 1);
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

  if(this.logo && this.logo.attrs.dead){
    this.logo = null;
  }

  if(this.capacitor && this.capacitor.attrs.dead){
    this.capacitor = null;
  }

  if(this.capacitors && this.capacitors.attrs.dead){
    this.capacitors = null;
  }
  
  if(this.machine && this.machine.attrs.dead){
    this.machine = null;
  }
  
  if(this.pong && this.pong.attrs.dead){
    this.pong = null;
  }
  
  if(this.powerup && this.powerup.attrs.dead){
    this.powerup = null;
  }

  
}

Actors.Cell.prototype.paint = function (view, fx) {
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
  fx.ctx.save()

  if(this.opts.reduce){
    view.ctx.translate(this.opts.max_x * 0.05, this.opts.max_y * 0.05) 
    view.ctx.scale(0.9, 0.9)

    fx.ctx.translate(this.opts.max_x * 0.05, this.opts.max_y * 0.05) 
    fx.ctx.scale(0.9, 0.9)
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
  } else if (this.refs.maze && this.refs.maze.attrs.color) {
    rgb = this.refs.maze.attrs.color;
  }

  if(this.attrs.hideWalls) {
    // nop
  } else {
    for(var exit = 0; exit < 4; exit ++){

      if(exit === 3 && this.portal){
        continue;
      }

      if(this.exits[exit]){
      }

      if(!this.exits[exit]){

        view.ctx.strokeStyle = 'rgba(' + rgb + ', ' + (0.5 + (Math.random() * 0.25))+  ')'
        if(!this.gridmates[exit]){
          view.ctx.strokeStyle = 'rgba(' + rgb + ', ' + (0.75 + (Math.random() * 0.25))+  ')'
        }
        
        view.ctx.lineCap = 'round'
        view.ctx.beginPath()
        view.ctx.moveTo(this.opts.max_x * vecs[exit][0], this.opts.max_y * vecs[exit][1])
        view.ctx.lineTo(this.opts.max_x * vecs[exit][2], this.opts.max_y * vecs[exit][3])
        view.ctx.stroke()
      }
    }
  }

  view.ctx.restore()
  fx.ctx.restore()

  if(this.logo){
    this.logo.paint(view);
  }

  if(this.capacitor){
    view.ctx.save()
    this.capacitor.paint(view);
    view.ctx.restore()
  }

  if(this.capacitors){
    this.capacitors.paint(view);
  }
  
  if(this.machine){
    this.machine.paint(view);
  }
  
  if(this.pong){
    var w32 = this.opts.max_x/16;
    var h32 = this.opts.max_y/16;
    view.ctx.save()
    //view.ctx.translate(this.pong.pos.x, this.pong.pos.y);
    view.ctx.translate(1 + Math.floor(this.pong.pos.x/32) * w32, 1 + Math.floor(this.pong.pos.y/32) * h32);

    fx.ctx.save()
    fx.ctx.translate(1 + Math.floor(this.pong.pos.x/32) * w32, 1+ Math.floor(this.pong.pos.y/32) * h32);
    //fx.ctx.translate(this.pong.pos.x, this.pong.pos.y);
    this.pong.paint(view, fx)
    view.ctx.restore()
    fx.ctx.restore()
  }

  if(this.reactor){
    view.ctx.save()
    view.ctx.translate(this.reactor.pos.x, this.reactor.pos.y);
    this.reactor.paint(view)
    view.ctx.restore()
  }

  if(this.portal){
    //if(this.refs.maze && this.refs.maze.human && !this.refs.maze.human.attrs.escaped){
      view.ctx.save()
      view.ctx.translate(this.portal.pos.x, this.portal.pos.y);
      this.portal.paint(view)
      view.ctx.restore()
    //}  
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

  var king;
  for (i = 0, ii = this.kings.length; i < ii; i++) {
    king = this.kings[i]
    if(!king){
      continue
    }
    view.ctx.save()
    view.ctx.translate(king.pos.x, king.pos.y);
    this.kings[i].paint(view)
    view.ctx.restore()
  }

  if(this.powerup){
    this.powerup.paint(view);
  }
  
  if(this.snake){
    view.ctx.save()
    this.snake.paint(view)
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
 
  var oneup;
  for (i = 0, ii = this.oneups.length; i < ii; i++) {
    oneup = this.oneups[i]
    if(!oneup){
      continue
    }      
    view.ctx.save() 
    view.ctx.translate(oneup.pos.x, oneup.pos.y);
    this.oneups[i].paint(view)
    view.ctx.restore()
  }
  
}
