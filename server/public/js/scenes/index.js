/* global Scenes, Scene */

Scenes.index = function (env, opts) {
  this.env = env
  this.opts = this.genOpts(opts)
  this.attrs = this.genAttrs()
  this.env.show_opts = false
  this.init()
}

Scenes.index.prototype = Object.create(Scene.prototype)

Scenes.index.prototype.title = 'Index'
Scenes.index.prototype.fullscreen = true

Scenes.index.prototype.genAttrs = function (attrs) {
  return {
    color_slow: Math.floor(Math.random() * 360),
    color_fast: Math.floor(Math.random() * 360),
    color_crawl: Math.floor(Math.random() * 360)
  }
}

Scenes.index.prototype.defaults = [{
  key: 'max_x',
  info: 'Max X',
  value: 1024,
  min: 200,
  max: 1600
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 1024,
  min: 200,
  max: 1000
}, {
}]

Scenes.index.prototype.getCast = function () {
  return []
}

Scenes.index.prototype.update = function (delta) {
  var i, ii

  this.attrs.color_fast += 9
  if (this.attrs.color_fast >= 360) {
    this.attrs.color_fast = 0
  }

  this.attrs.color_slow += 1
  if (this.attrs.color_slow >= 360) {
    this.attrs.color_slow = 0
  }

  this.attrs.color_crawl += 0.13
  if (this.attrs.color_crawl >= 360) {
    this.attrs.color_crawl = 0
  }

}

Scenes.index.prototype.paint = function (fx, gx, sx) {
}

Scenes.index.prototype.flash = function (fx, gx) {
}

Scenes.index.prototype.tick = function () {
  this.update()
  this.paint()
}

Scenes.index.prototype.init = function () {

  this.scenes = [{
    title: 'Loading',
    slug: 'loading'
  }, {
    title: 'Title',
    slug: 'title'
  }, {
    title: 'Story',
    slug: 'story'
  }, {
    title: 'Maze',
    slug: 'maze'
  }, {
    title: 'Mazegen',
    slug: 'mazegen'
  }, {
    title: 'Cell',
    slug: 'cell'
  }, {
    title: 'Goal',
    slug: 'goal'
  }, {
    title: 'A*',
    slug: 'astar'
  }, {
    title: 'Rats',
    slug: 'rats'
  }, {
    title: 'Swarm', //  of Rats seeking you in the maze
    slug: 'swarm'
  }, {
    title: 'Factory',
    slug: 'factory'
  }, {
    title: 'Weapons',
    slug: 'weapons'
  }, {
    title: 'Reactor',
    slug: 'reactor'
  }, {
    title: 'King Rat',
    slug: 'king_rat'
  }, {
    title: 'Robots',
    slug: 'robots'
  }, {
    title: 'Machines',
    slug: 'machines'
  }, {
    title: 'Sonics',
    slug: 'sonics'
  }, {
    title: 'R.o.t.M',
    slug: 'rats_of_the_maze'
  }]
}

Scenes.index.prototype.render = function () {
  var html
  html = ''
  html += '<div class="index">'
  html += '<h1><a href="/" class="color-cycle-fast">rats of the maze</a></h1>'
  html += '<ul>'
  this.scenes.forEach(function (scene) {
    html += '<li><a href="/' + scene.slug + '" class="color-cycle-crawl">' + scene.title + '</a></li>'
  })
  html += '</ul>'
  html += '<p><a href="https://twitter.com/simon_swain" target="new" class="color-cycle-slow">@simon_swain</a></p>'
  html += '</div>'
  html += '</div>'
  this.env.views.content.el.innerHTML = html

  this.indexItems = document.getElementsByClassName('color-cycle-crawl')

  this.over = false
  var onOver = function (e) {
    e.target.classList.add('color-cycle-over')
  }

  var onOut = function (e) {
    e.target.style.color = null
    e.target.style.backgroundColor = null
    e.target.classList.remove('color-cycle-over')
  }

  for (var i = 0, ii = this.indexItems.length; i < ii; i++) {
    this.indexItems[i].addEventListener('mouseover', onOver.bind(this))
    this.indexItems[i].addEventListener('mouseout', onOut.bind(this))
  }
}

Scenes.index.prototype.start = function () {
  this.init()
  this.render()
  this.at = Date.now()
  this.raf = window.requestAnimationFrame(this.tick.bind(this))
}

Scenes.index.prototype.stop = function () {
  if (this.raf) {
    window.cancelAnimationFrame(this.raf)
  }
}

Scenes.index.prototype.restart = function () {
  this.stop()
  setTimeout(this.start.bind(this), 100)
}
