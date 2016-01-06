/* global Scenes, Scene, Actors */

Scenes.coldwar = function (env, opts) {
  this.env = env
  this.opts = this.genOpts(opts)
  this.attrs = this.genAttrs()
  this.init()
}

Scenes.coldwar.prototype = Object.create(Scene.prototype)

Scenes.coldwar.prototype.title = 'Cold War'
Scenes.coldwar.prototype.layout = 'scanner'

Scenes.coldwar.prototype.init = function () {
  this.maps = []
  this.booms = []
  this.capitals = []
  this.cities = []
  this.bases = []
  this.factories = []
  this.supplies = []
  this.bombers = []
  this.fighters = []
  this.icbms = []
  this.abms = []
  this.sats = []

  this.sets = [
    this.maps,
    this.supplies,
    this.capitals,
    this.cities,
    this.bases,
    this.factories,
    this.bombers,
    this.fighters,
    this.icbms,
    this.abms,
    this.booms,
    this.sats
  ]

  this.scenarios = []
  this.loadScenarios()
  this.scenarios[this.opts.scenario]()

  this.map = new Actors.Map(
    this.env,
    {
      scene: this
    },
    {
    }
  )
}

Scenes.coldwar.prototype.defaults = [{
  key: 'max',
  info: 'Max',
  value: 500,
  min: 50,
  max: 1600
}, {
  key: 'max_x',
  info: 'Max X',
  value: 1000,
  min: 200,
  max: 1600
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 400,
  min: 200,
  max: 1000
}, {
  key: 'max_z',
  info: 'Max Z',
  value: 200,
  min: 50,
  max: 500
}, {
  key: 'scenario',
  info: 'Scenario',
  value: 0,
  min: 0,
  max: 4
}, {
  key: 'map',
  info: 'Map',
  value: 0,
  min: 0,
  max: 1
}, {
  key: 'safe_mode',
  info: 'Safe Mode',
  value: 0,
  min: 0,
  max: 1
}, {
  key: 'capital_count',
  info: 'Capitals',
  value: 2,
  min: 1,
  max: 4
}, {
  key: 'first_strike',
  info: 'First Strike',
  value: 0,
  min: 0,
  max: 1
}, {
  key: 'gameover_restart_delay',
  info: 'Game Over restart delay',
  value: 5,
  min: 0,
  max: 30,
  step: 0.1
}]

Scenes.coldwar.prototype.genAttrs = function () {
  return {
    defcon: this.opts.defcon
  }
}

Scenes.coldwar.prototype.getCast = function () {
  return {
    Map: Actors.Map,
    Capital: Actors.Capital,
    City: Actors.City,
    Factory: Actors.Factory,
    Base: Actors.Base,
    Supply: Actors.Supply,
    Bomber: Actors.Supply,
    Fighter: Actors.Supply,
    Icbm: Actors.Supply,
    Abm: Actors.Supply,
    Sat: Actors.Sat,
    Boom: Actors.Boom,
    CapitalMap: Actors.CapitalMap
  }
}

Scenes.coldwar.prototype.update = function (delta) {
  var n, nn
  var i, ii
  var set

  for (n = 0, nn = this.sets.length; n < nn; n++) {
    set = this.sets[n]
    for (i = 0, ii = set.length; i < ii; i++) {
      set[i].update(delta)
    }
  }

  for (n = 0, nn = this.sets.length; n < nn; n++) {
    set = this.sets[n]
    for (i = 0, ii = set.length; i < ii; i++) {
      if (set[i].attrs.dead) {
        set.splice(i, 1)
        i--
        ii--
      }
    }
  }

  if (this.opts.capital_count > 1 && this.capitals.length <= 1 && !this.env.gameover) {
    this.env.gameover = true
    setTimeout(this.env.restart, this.opts.gameover_restart_delay * 1000)
  }
}

Scenes.coldwar.prototype.paint = function (fx, gx, sx) {
  if (this.opts.map > 0) {
    this.map.paint(gx)
  }

  this.paintMap(gx)
  this.paintElevation(sx)

  if (this.env.gameover && Date.now() / 1000 % 1 > 0.5) {
    gx.ctx.fillStyle = '#f00'
    gx.ctx.font = '32pt ubuntu mono, monospace'
    gx.ctx.textBaseline = 'middle'
    gx.ctx.textAlign = 'center'
    gx.ctx.fillText('GAME OVER', this.opts.max_x * 0.5, this.opts.max_y * 0.5)
  }
}

Scenes.coldwar.prototype.paintMap = function (view) {
  for (var n = 0, nn = this.sets.length; n < nn; n++) {
    var set = this.sets[n]
    for (var i = 0, ii = set.length; i < ii; i++) {
      set[i].paint(view)
    }
  }

  if (this.env.gameover && Date.now() / 400 % 1 > 0.5) {
    if (this.capitals.length === 0) {
      view.ctx.fillStyle = '#fff'
      view.ctx.font = '24pt ubuntu mono, monospace'
      view.ctx.textBaseline = 'middle'
      view.ctx.textAlign = 'center'
      view.ctx.fillText('MAD', this.opts.max_x / 2, this.opts.max_y * 0.1)
    }

    if (this.capitals.length === 1) {
      view.ctx.fillStyle = '#fff'
      view.ctx.font = '24pt ubuntu mono, monospace'
      view.ctx.textBaseline = 'middle'
      view.ctx.textAlign = 'center'
      view.ctx.fillText('WIN', this.capitals[0].pos.x, this.opts.max_y * 0.1)
    }
  }
}

Scenes.coldwar.prototype.paintElevation = function (view) {
  for (var set, n = 0, nn = this.sets.length; n < nn; n++) {
    set = this.sets[n]
    for (var i = 0, ii = set.length; i < ii; i++) {
      set[i].elevation(view)
    }
  }

  if (this.env.gameover && Date.now() / 400 % 1 > 0.5) {
    if (this.capitals.length === 0) {
      view.ctx.fillStyle = '#fff'
      view.ctx.font = '24pt ubuntu mono, monospace'
      view.ctx.textBaseline = 'middle'
      view.ctx.textAlign = 'center'
      view.ctx.fillText('MAD', this.opts.max_x / 2, this.opts.max_y * 0.3)
    }

    if (this.capitals.length === 1) {
      view.ctx.fillStyle = '#fff'
      view.ctx.font = '24 ubuntu mono, monospace'
      view.ctx.textBaseline = 'middle'
      view.ctx.textAlign = 'center'
      view.ctx.fillText('WIN', this.capitals[0].pos.x, this.opts.max_y * 0.3)
    }
  }
}

Scenes.coldwar.prototype.loadScenarios = function () {
  this.scenarios[0] = function () {
    // capital and rings

    var capitals = []

    if (this.opts.capital_count === 4) {
      capitals.push({
        x: this.opts.max_x * 0.2,
        y: this.opts.max_y * 0.6,
        z: 0,
        color: '#fc0'
      })

      capitals.push({
        x: this.opts.max_x * 0.8,
        y: this.opts.max_y * 0.4,
        z: 0,
        color: '#0ff'
      })

      capitals.push({
        x: this.opts.max_x * 0.4,
        y: this.opts.max_y * 0.2,
        z: 0,
        color: '#f00'
      })

      capitals.push({
        x: this.opts.max_x * 0.6,
        y: this.opts.max_y * 0.9,
        z: 0,
        color: '#090'
      })
    } else if (this.opts.capital_count === 3) {
      capitals.push({
        x: this.opts.max_x * 0.35,
        y: this.opts.max_y * 0.8,
        z: 0,
        color: '#fc0'
      })

      capitals.push({
        x: this.opts.max_x * 0.65,
        y: this.opts.max_y * 0.8,
        z: 0,
        color: '#0ff'
      })

      capitals.push({
        x: this.opts.max_x * 0.5,
        y: this.opts.max_y * 0.2,
        z: 0,
        color: '#f00'
      })
    } else if (this.opts.capital_count === 1) {
      capitals.push({
        x: this.opts.max_x * 0.5,
        y: this.opts.max_y * 0.5,
        z: 0,
        color: '#0ff'
      })
    } else {
      capitals = [{
        x: this.opts.max_x * 0.25,
        y: this.opts.max_y * 0.5,
        z: 0,
        color: '#fc0'
      }, {
        x: this.opts.max_x * 0.75,
        y: this.opts.max_y * 0.5,
        z: 0,
        color: '#0ff'
      }]
    }

    if (this.opts.first_strike) {
      // select one capital to attack first
      capitals.forEach(function (attrs, xx) {
        attrs.strike = false
      })
      capitals[Math.floor(Math.random() * capitals.length)].strike = true
    } else {
      // all capitals attack
      capitals.forEach(function (attrs) {
        attrs.strike = true
      })
    }

    capitals.forEach(function (attrs) {
      this.capitals.push(new Actors.Capital(
        this.env,
        {
          scene: this
        },
        {
          x: attrs.x,
          y: attrs.y,
          z: attrs.z,
          color: attrs.color,
          strike: attrs.strike,
          defcon: this.opts.defcon
        }
      ))
    }, this)
  }.bind(this)

  this.scenarios[1] = function () {
    // au vs nz

    var capitals = []

    // au
    capitals.push({
      x: this.opts.max_x * 0.3,
      y: this.opts.max_y * 0.5,
      z: 0,
      color: '#fc0',
      scene: this,
      strike: false,
      defcon: this.opts.defcon,
      unit_rate: this.opts.unit_rate,
      title: 'AU',
      outline: [[-200, -250, true], [-150, -250], [-150, -200], [-60, -180], [-50, -250], [70, -60], [20, 100], [-70, 100], [-90, 70], [-150, 50], [-250, 70], [-300, 70], [-320, 0], [-330, -50], [-200, -250], [-200, -250], [-50, 130, true], [10, 130], [-20, 180], [-50, 130]],
      assets: {
        bases: [[30, -120], [30, 50], [-20, 150], [-300, 50]],
        cities: [[50, -20], [-40, 100], [20, -70]],
        factories: [[-50, -20]]
      }
    })

    // nz
    capitals.push({
      x: this.opts.max_x * 0.7,
      y: this.opts.max_y * 0.5,
      z: 0,
      color: '#0cc',

      scene: this,
      strike: false,
      defcon: this.opts.defcon,
      unit_rate: this.opts.unit_rate,

      bases_max: this.opts.bases_max,
      cities_max: this.opts.cities_max,
      factories_max: this.opts.factories_max,
      sats_max: this.opts.sats_max,

      bomber_launch_max: this.opts.bomber_launch_max,
      fighter_launch_max: this.opts.fighter_launch_max,

      icbm_launch_max: this.opts.icbm_launch_max,
      abm_launch_max: this.opts.abm_launch_max,

      stock: {
        bombers: this.opts.stock_bombers,
        fighters: this.opts.stock_fighters,
        icbms: this.opts.stock_icbms,
        abms: this.opts.stock_abms
      },

      title: 'NZ',
      outline: [
        // ni
        [-30, 20, true],
        [0, -60],
        [-60, -90],
        [0, -120],
        [-20, -200],
        [10, -230],
        [40, -120],
        [90, -120],
        [90, -100],
        [50, -60],
        [70, -60],
        [0, 40],
        [-30, 20],
        // si
        [-60, 60, true],
        [0, 70],
        [20, 90],
        [-40, 180],
        [-40, 240],
        [-120, 240],
        [-100, 190],
        [-60, 60],

        // stewart island
        [-100, 260, true],
        [-60, 260],
        [-80, 290],
        [-100, 260]
      ],

      assets: {
        bases: [[10, -150], [-40, -80], [-40, 70], [-90, 220]],
        cities: [[30, -120], [-10, 140], [10, 100], [50, -40]],
        factories: [[-50, 170], [20, -70]]
      }
    })

    if (this.opts.first_strike) {
      // select one capital to attack first
      capitals.forEach(function (attrs, xx) {
        attrs.strike = false
      })
      capitals[Math.floor(Math.random() * capitals.length)].strike = true
    } else {
      // all capitals attack
      capitals.forEach(function (attrs) {
        attrs.strike = true
      }, this)
    }

    capitals.forEach(function (attrs) {
      this.capitals.push(new Actors.Capital(
        this.env, {
          scene: this
        }, attrs))

      this.maps.push(new Actors.CapitalMap(
        this.env, {
          scene: this
        }, {
          x: attrs.x,
          y: attrs.y,
          z: attrs.z,
          color: attrs.color,
          title: attrs.title,
          outline: attrs.outline
        }))
    }, this)
  }.bind(this)

  this.scenarios[2] = function () {
    // ca vs tx

    var capitals = []

    // ca
    capitals.push({
      x: this.opts.max_x * 0.3,
      y: this.opts.max_y * 0.5,
      z: 0,
      color: '#fc0',
      title: 'CA',
      outline: [[20, -180, true], [20, -80], [150, 160], [150, 170], [140, 190], [140, 200], [140, 200], [80, 210], [70, 180], [0, 130], [0, 120], [-100, -100], [-80, -170], [-80, -200], [20, -180]],
      assets: {
        bases: [[-30, -150], [30, 50], [90, 200], [20, -80]],
        cities: [[45, 160], [-70, -60], [-30, 40], [-10, 90]],
        factories: [[-50, -20], [60, 100]]
      }
    })

    // tx
    capitals.push({
      x: this.opts.max_x * 0.7,
      y: this.opts.max_y * 0.5,
      z: 0,
      color: '#0cc',
      title: 'TX',
      outline: [[0, -190, true], [0, -80], [100, -70], [150, -80], [180, -70], [180, 0], [200, 35], [190, 80], [80, 140], [80, 200], [20, 180], [-40, 100], [-70, 100], [-90, 120], [-100, 120], [-120, 120], [-150, 60], [-200, 0], [-100, 0], [-100, -190], [0, -190]],
      assets: {
        bases: [[100, 40], [-50, -160], [-190, 0], [100, 140]],
        cities: [[-50, -100], [-50, 40], [-80, 70], [50, -40]],
        factories: [[100, -40], [150, 100]]
      }
    })

    if (this.opts.first_strike) {
      // select one capital to attack first
      capitals.forEach(function (attrs, xx) {
        attrs.strike = false
      })
      capitals[Math.floor(Math.random() * capitals.length)].strike = true
    } else {
      // all capitals attack
      capitals.forEach(function (attrs) {
        attrs.strike = true
      })
    }

    capitals.forEach(function (attrs) {
      this.capitals.push(new Actors.Capital(
        this.env,
        {
          scene: this
        },
        attrs
      ))

      this.maps.push(new Actors.CapitalMap(
        this.env,
        {
          scene: this
        },
        {
          x: attrs.x,
          y: attrs.y,
          z: attrs.z,
          color: attrs.color,
          title: attrs.title,
          outline: attrs.outline
        }
      ))
    }, this)
  }.bind(this)

  this.scenarios[3] = function () {
    // ca vs tx

    var capitals = []

    // ca
    capitals.push({
      x: this.opts.max_x * 0.2,
      y: this.opts.max_y * 0.2,
      z: 0,
      color: '#fc0',
      title: 'KL',
      outline: [
        [720, -800, true], [700, -480], [640, -450], [640, -200], [760, -100], [780, 180], [700, 160], [650, 200], [520, 140], [400, 150], [380, 200], [340, 280], [0, 200], [10, 100], [-50, 50], [-60, 20], [-60, 20, true], [-300, -220] ],
      assets: {
        bases: [[650, -70], [50, -10], [90, 200], [20, -70]],
        cities: [[650, 200], [20, 60], [-10, 40], [300, 200]],
        factories: [[680, -50], [60, 100]]
      }
    })

    // tx
    capitals.push({
      x: this.opts.max_x * 0.7,
      y: this.opts.max_y * 0.8,
      z: 0,
      color: '#0cc',
      title: 'SG',
      outline: [[0, -80, true], [150, 0], [120, 20], [0, 50], [-50, 30], [-120, 50], [-80, -60], [-60, -50], [-40, -60], [0, -80]],
      assets: {
        bases: [[-30, -40], [-60, -10], [-90, 20], [120, 0]],
        cities: [[20, 20], [10, 40], [-20, 20], [20, -10]],
        factories: [[80, -30], [90, 10]]
      }
    })

    if (this.opts.first_strike) {
      // select one capital to attack first
      capitals.forEach(function (attrs, xx) {
        attrs.strike = false
      })
      capitals[Math.floor(Math.random() * capitals.length)].strike = true
    } else {
      // all capitals attack
      capitals.forEach(function (attrs) {
        attrs.strike = true
      })
    }

    capitals.forEach(function (attrs) {
      this.capitals.push(new Actors.Capital(
        this.env,
        {
          scene: this
        },
        attrs
      ))

      this.maps.push(new Actors.CapitalMap(
        this.env,
        {
          scene: this
        },
        {
          x: attrs.x,
          y: attrs.y,
          z: attrs.z,
          color: attrs.color,
          title: attrs.title,
          outline: attrs.outline
        }
      ))
    }, this)
  }.bind(this)

  this.scenarios[4] = function () {
    // dprk vs usa

    var capitals = []

    // dprk
    capitals.push({
      x: this.opts.max_x * 0.2,
      y: this.opts.max_y * 0.6,
      z: 0,
      color: '#f00',
      title: 'DPRK',
      strike: true,
      defcon: 1,
      sats_max: 0,
      outline: [
        [-25, 0, true], [-25, -25], [25, -85], [50, -65], [50, -90], [100, - 120], [110, -100], [100, -50], [50, -35], [40, 0], [40, 75], [0, 60], [-20, 50], [-30, 60], [-40, 25], [-25, 0]
      ],
      assets: {
        bases: [[100, -100]],
        cities: [],
        factories: []
      }
    })

    // usa
    capitals.push({
      x: this.opts.max_x * 0.8,
      y: this.opts.max_y * 0.5,
      z: 0,
      color: '#0cc',
      title: 'USA',
      defcon: 1,
      sats_max: 0,
      outline: [[-20, 25, true], [50, -25], [25, -50], [-40, -40], [-75,-60], [-200, -60], [-200, 20], [-175, 50], [-125, 50], [-100, 75], [-75,50], [-50, 45], [-35, 66], [-20, 50], [-20, 25]],
      assets: {
        bases: [[-170, -40], [-100, -30], [-100, 30], [-175, 0]],
        cities: [],
        factories: []
      }
    })

    this.opts.first_strike = true;
    this.opts.defcon = 1;
    this.opts.first_strike = true;

    capitals.forEach(function (attrs) {
      this.capitals.push(new Actors.Capital(
        this.env,
        {
          scene: this
        },
        attrs
      ))

      this.maps.push(new Actors.CapitalMap(
        this.env,
        {
          scene: this
        }, {
          x: attrs.x,
          y: attrs.y,
          z: attrs.z,
          color: attrs.color,
          title: attrs.title,
          outline: attrs.outline
        }
      ))
    }, this)

    this.bases[0].attrs.stock.icbms = 1; 

    this.bases[1].attrs.stock.abms = 50;
    this.bases[1].attrs.stock.icbms = 50;
    this.bases[1].attrs.icbm_launch_max = 25;
    this.bases[2].attrs.stock.abms = 50;
    this.bases[2].attrs.stock.icbms = 50;
    this.bases[2].attrs.icbm_launch_max = 25;
    this.bases[3].attrs.stock.abms = 50;
    this.bases[3].attrs.stock.icbms = 50;
    this.bases[3].attrs.icbm_launch_max = 25;
    this.bases[4].attrs.stock.abms = 50;
    this.bases[4].attrs.stock.icbms = 50;
    this.bases[4].attrs.icbm_launch_max = 25;
    console.log(this.bases);
  }.bind(this)


}

Scenes.coldwar.prototype.help = [
  "Growing up as a teenager in the 80s wasn't all it's cracked up to be. Sure... We had the video game boom, the home computing revolution, and the last decade in which pop music was still truly cool. But we had zero fashion sense. None of the music had any bass. And everything was in 4x3.",
  'Worst of all, though... We grew up through the peak of the Cold War. Under the perpetual shadow of nuclear oblivion. The stuff of teenage nightmares. For an entire generation. But we made it through. And Generation X emerged with a pretty extreme sense of gallows humor along the way.',
  "In the '80s, if you were nerdy enough, and lucky enough to even have a modem, download speeds maxed out at 1200 baud. But this era still gave us some great breakthroughs in technology, many of them driven by the military. In fact, we all owe our jobs to Cold War networking technology.",
  'This network evolved from the communication links that enabled SAGE, the North American command and control system for air defense.',
  'Operational from the late 1950s, SAGE comprised of factory sized nodes, built of vacuum tubes, distributed across the continental US, with the aggregate computing power of a 386. The first computer to be capable of rendering graphics from data stored in memory.',
  "In it's time, SAGE was impressive, but it seems almost laughable now. One tab of a web browser running on a 21st century mobile phone has more computing resource than billions of dollars of Cold War tech.",
  "If that's the case, maybe in this futuristic age we live in, just for kicks, we could create a simulation of a little bit of the 80s.",
  'There are two views, top view and elevation view. All the actors have an x, y and z position in this world-space.',
  'Each of the circle structures is a nation state.',
  'It has a capital at the center (square, blinking). Defcon is the number in the capital.',
  'Cities (circles) send people to work at factories.',
  'Factories (triangles) make munitions and send them to bases',
  'Bases (square) stockpile munitions (counts, clockwise from top right: icbms, abms (anti ballistic misiles), fighters and bombers.',
  'Bombers are big and slow (triangles) that select a target (factory, base, city, capital in that order, fly to it and nuke it, reselecting a target if somebody else destroys it first.',
  'As defence perimeters are penetrated, defcon gets more scary.',
  'Fighters launch at Defcon 4 and attempt to destroy bombers.',
  'At Defcon 3, Bases launch ICBMs a low probability amount of the time.',
  'Satellites launch at Defcon 2, and can shoot ICBMs out of the sky, but have fire/recharge lasers.',
  "When one of a nation's assets (factory, base, city) is nuked, they go to Defcon 1.",
  'If your enemy goes to Defcon 1, so do you.',
  'At Defcon 1, all ICBMs will fire.',
  "When your capital is destroyed, it's Game Over."
]
