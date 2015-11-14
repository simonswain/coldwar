/*global Actors:true, Actor:true, Vec3:true, VecR:true, hex2rgb:true, random:true, random0to:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Actors.Planet = function(env, refs, attrs){
  this.env = env;
  this.refs = refs; // system
  this.opts = this.genOpts();
  this.attrs = this.genAttrs(attrs);
  this.init();
};

Actors.Planet.prototype.title = 'Planet';

Actors.Planet.prototype.init = function(){
  this.pos = new Vec3(
    this.attrs.r * Math.cos(this.attrs.a),
    this.attrs.r * Math.sin(this.attrs.a),
    0);
  this.refs.ships = [];
};

Actors.Planet.prototype.defaults = [{
  key: 'type',
  info: '',
  value: 3,
  min: 0,
  max: 9
}, {
  key: 'radius',
  value: 6,
  min: 1,
  max: 16
}, {
  key: 'easy_spawn',
  info: '',
  value: 0,
  min: 0,
  max: 1
}, {
  key: 'ship_cost',
  info: '',
  value: 4000,
  min: 1000,
  max: 50000
}, {
  key: 'low_guard',
  info: 'How many friendlies to protect planet',
  value: 3,
  min: 0,
  max: 20
}];

Actors.Planet.prototype.getParams = function(){
  return this.defaults;
};

Actors.Planet.prototype.genOpts = function(args){
  var opts = {};
  var params = this.getParams();
  params.forEach(function(param){
    if(args && args.hasOwnProperty(param.key)){
      opts[param.key] = Number(args[param.key]);
    } else {
      opts[param.key] = param.value;
    }
  }, this);
  return opts;
};

Actors.Planet.prototype.genAttrs = function(attrs){

  // direction of lanet orbit
  if(!attrs.hasOwnProperty('orbit')){
    attrs.orbit = 1;
  }

  var land = 10000 * random.from1to(5);
  var agr = (15 + random.from1to(25)) * land/100;
  var agr_max = agr;

  return {
    x: attrs.x,
    y: attrs.y,
    z: attrs.z,
    standalone: attrs.standalone || false,
    orbit: attrs.orbit,
    r: attrs.r,
    a: 2*Math.PI * Math.random(),
    v: Math.random()/200 * attrs.orbit,

    radius: this.opts.radius,
    age: 0,

    // positions sats are at for animation
    sat_orbit: 2 * Math.PI * Math.random(),

    birthrate: 0.002, //( 50 + random0to(50)) * 0.0005,
    deathrate: 0.001,
    popup: 100 + (100 * Math.random()) * 0.0030,
    indup: 500 + (200 * Math.random()) * 0.0030,
    agrup: 250 + (200 * Math.random()) * 0.15,

    pop: (15 + random.from1to(25)) * land/100,
    agr: agr,
    agr_max: agr,
    size: 2 + random.from0to(3),
    land: land,
    cr: 1000,
    ship_cost: this.opts.ship_cost,

    pol: 0,

    //ind: (5 + random.from1to(5)) * land/100,
    ind: 0,

    // deltas from last tick
    d_pop: 0,
    d_agr: 0,
    d_ind: 0,
    d_pol:0,
    d_cr:0,

    out_agr: 0,
    out_ind: 0,

    fake_species: attrs.fake_species || false
  };
};

Actors.Planet.prototype.physics = function(delta){

  if(!this.refs.system){
    return;
  }

  this.attrs.a = (this.attrs.a + this.attrs.v) % (2 * Math.PI);
  this.pos.x = this.attrs.r * Math.cos(this.attrs.a);
  this.pos.y = this.attrs.r * Math.sin(this.attrs.a);

};

Actors.Planet.prototype.update = function(delta){

  var i, ii;
  
  this.attrs.sat_orbit += (2*Math.PI/120);
  if(this.attrs.sat_orbit >= 2*Math.PI ){
    this.attrs.sat_orbit -= 2*Math.PI;
  }

  for(i=0, ii=this.refs.ships.length; i<ii; i++){
    if(!this.refs.ships[i]){
      continue;
    }
    this.refs.ships[i].update(delta);
  }

  for(i=0, ii=this.refs.ships.length; i<ii; i++){
    if(this.refs.ships[i].attrs.dead){
      this.refs.ships.splice(i, 1);
      i--;
      ii--;
    }
  }

  this.physics();

  var sum = this.attrs.pop + this.attrs.pol + this.attrs.agr + this.attrs.ind;
  if(sum > this.attrs.land){
    this.attrs.pop *= 0.95;
    this.attrs.ind *= 0.95;
    this.attrs.agr *= 0.95;
  }

  // pollution recovery
  this.attrs.pol = this.attrs.pol * 0.90;

  // // // births and deaths
  // var births = this.attrs.pop * (this.attrs.birthrate/100 * (50 + random.from1to(50)));
  // var deaths = this.attrs.pop * (this.attrs.deathrate/100 * (50 + random.from1to(50)));

  // deaths += 0.5 * this.attrs.pop * (this.attrs.pol/100);
  // //this.attrs.pop += Number(births) + Number(deaths);

  this.attrs.pop += this.attrs.popup;

  // // pop consumes agr
  this.attrs.agr -= this.attrs.pop * 0.0005;

  // // pol kills agr
  this.attrs.agr -= this.attrs.pol;

  if(this.attrs.agr > this.attrs.pop){
    this.attrs.agr = this.attrs.pop;
  }

  // // agr up
  this.attrs.agr += this.attrs.agrup;

  // // ind up
  this.attrs.ind += this.attrs.indup;
  this.attrs.ind += this.attrs.pop * 0.01;

  // // ind improves agr
  // this.attrs.agr += this.attrs.ind * 0.002;

  // // pollution from % of planet covered in ind and pop
  this.attrs.pol += ((this.attrs.ind + this.attrs.pop) / this.attrs.land)  * 1;

  if(this.attrs.ind > this.attrs.pop * 0.95){
    this.attrs.ind *= 0.90;
  }

  // if(this.attrs.agr > this.attrs.land * 0.5){
  //   //this.attrs.agr = this.attrs.agr * 0.90;
  // }

  // if(this.attrs.pop > this.attrs.agr * 0.95){
  //   this.attrs.pop = this.attrs.pop * 0.98;
  // }

  // // if(this.attrs.agr < this.attrs.land * 0.05){
  // //   this.attrs.agr = this.attrs.land * 0.1;
  // // }

  // if (this.attrs.pol >= 100){
  //   this.attrs.pol = 100;
  // }


  // // use tech to increase efficiency

  // // pollution reduces ag output
  // this.attrs.out_agr = this.attrs.agr/2 * (1 - (this.attrs.pol/100));


  //if(true || this.species || this.get('fake_species')){
  // Calculate earnings from planet
  //var earnings = ((this.attrs.ind / 1000) * (this.attrs.pop / 1000)) * ((50 + random0to(50))/100);
  var earnings = (this.attrs.ind/100 +this.attrs.pop/100) * ((50 + random0to(50))/100);

  this.attrs.d_cr = earnings;
  this.attrs.cr += earnings;
  //}

  this.attrs.age ++;

  // enough credit spawns ships to carry away pop

  if(this.refs.species || this.attrs.fake_species){

    if(this.refs.system && this.opts.easy_spawn){
      this.spawnShip();
    }

    if(this.attrs.pop > this.attrs.ship_cost){
      this.spawnShip();
    }

  }

};

Actors.Planet.prototype.takePop = function(max){
  // up to 10% of pop, or max
  var pop = Math.floor(this.attrs.pop * 0.025);
  pop = Math.min(pop, max);
  if(pop > this.attrs.pop){
    pop = this.attrs.pop;
  }
  this.attrs.pop -= pop;
  return pop;
};

Actors.Planet.prototype.killPop = function(n){

  var pop = this.attrs.pop.toFixed(0);
  var before = pop;
  var kill = n * 15;

  pop = Math.max(0, pop - kill);
  if(pop<0){
    pop = 0;
  }
  this.attrs.pop = pop;

};

Actors.Planet.prototype.addShip = function(ship){
  this.refs.ships.push(ship);
};

Actors.Planet.prototype.addShip = function(ship){
  this.refs.ships.push(ship);
};

Actors.Planet.prototype.removeShip = function(ship){
  for(var i=0, ii=this.refs.ships.length; i<ii; i++){
    if(this.refs.ships[i] === ship){
      this.refs.ships.splice(i, 1);
      break;
    }
  }
};

Actors.Planet.prototype.spawnShip = function(){

  if(!this.attrs.fake_species){
    var system_friends = this.refs.system.ships.filter(function(ship){
      return (ship.refs.species === this.refs.species);
    }, this);

    var system_enemies = this.refs.system.ships.filter(function(ship){
      return (ship.refs.species !== this.refs.species);
    }, this);

    var planet_friends = this.refs.ships.filter(function(ship){
      return (ship.refs.species === this.refs.species);
    }, this);

    var planet_enemies = this.refs.ships.filter(function(ship){
      return (ship.refs.species !== this.refs.species);
    }, this);

    // enough ships in planet already
    var advantage = planet_friends.length - planet_enemies.length + system_friends.length - system_enemies.length;

    if(system_friends.length - system_enemies.length > this.refs.system.opts.high_guard){
      return;
    }
  }

  this.attrs.pop -= this.attrs.ship_cost;

  // calculate desired ship

  var ship = new Actors.Ship(
    this.env, {
      scene: this.refs.scene,
      species: this.refs.species,
      system: this.refs.system,
      planet: this
    },{
      state: 'planet',
      x: this.pos.x,
      y: this.pos.y,
      z: this.pos.z
    });

  // add to planet's ships
  this.addShip(ship);

  if(this.attrs.fake_species){
    return;
  }

  // add to planets species
  this.refs.species.addShip(ship);

};

Actors.Planet.prototype.paint = function(view){

  var z = this.attrs.radius

  view.ctx.save();
  view.ctx.translate(this.pos.x, this.pos.y);

  view.ctx.strokeStyle = '#ccc';
  view.ctx.fillStyle = '#999';

  if(this.refs.species){
    view.ctx.strokeStyle = this.refs.species.attrs.color;
    view.ctx.fillStyle = this.refs.species.attrs.color;
  }

  view.ctx.lineWidth = 1;

  view.ctx.beginPath();
  view.ctx.arc(0, 0, z, 0, 2*Math.PI);
  view.ctx.stroke();
  view.ctx.fill();

  var angle = this.pos.angleXY() - Math.PI/2;
  view.ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  view.ctx.beginPath();
  view.ctx.arc(0, 0, z, angle, angle + Math.PI);
  view.ctx.fill();


  view.ctx.fillStyle = '#999';
  if(this.refs.species){
    view.ctx.fillStyle = this.refs.species.attrs.color;
  }
  view.ctx.font = 'bold 6pt ubuntu mono, monospace';
  view.ctx.textAlign = 'center';
  view.ctx.textBaseline = 'middle';
  view.ctx.fillText((this.attrs.pop/100).toFixed(0), 0, 20);

  var colors = {};
  var count = 0;
  for(var i=0, ii = this.refs.ships.length; i<ii; i++){
    if(!colors.hasOwnProperty(this.refs.ships[i].refs.species.attrs.color)){
      count ++;
      colors[this.refs.ships[i].refs.species.attrs.color] = 1;
    } else {
      colors[this.refs.ships[i].refs.species.attrs.color] ++;
    }
  }

  // orbiting ships

  if(count > 0){

    view.ctx.save();
    view.ctx.rotate(this.attrs.sat_orbit);

    var angle = (2*Math.PI)/count;
    var theta = 0;

    var div = 2 * Math.PI / 24
    var i, ii;
    for (var color in colors){
      angle -= colors[color] * (div * 0.5);

      view.ctx.lineWidth = 2;
      //view.ctx.lineWidth = colors[color];
      view.ctx.strokeStyle = color;
      for(i = 0; i< colors[color]; i++){
        view.ctx.beginPath();
        view.ctx.arc(0, 0, z * 2, theta, theta + (div * 0.5));
        view.ctx.stroke();
        theta += div;
      }
      theta += angle;
    }

    view.ctx.restore();
  }

  // if(this.refs.ships.length > 0){
  //   view.ctx.fillText(this.refs.ships.length, 0, -16);
  // }

  view.ctx.restore();

};
