/* global Actors, Actor */

Actors.Maze = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init()
}

Actors.Maze.prototype = Object.create(Actor.prototype)

Actors.Maze.prototype.title = 'Maze'

Actors.Maze.prototype.genAttrs = function (attrs) {
  return {
    rows: this.opts.cols,
    cols: this.opts.cols
  }
}

Actors.Maze.prototype.init = function () {
  // y, z

  var flip = function (q) {
    if (!q) {
      q = 0.5
    }
    return (Math.random() < q)
  }

  var x, y, i, ii

  this.cells = new Array(this.opts.rows)
  var visited = new Array(this.opts.rows)
  for (x, y = 0; y < this.opts.rows; y++) {
    this.cells[y] = new Array(this.opts.cols)
    visited[y] = new Array(this.opts.cols)
    for (x = 0; x < this.opts.cols; x++) {
      // this.cells[y][x] = [true, true, true, true]
      this.cells[y][x] = [flip(), flip(), flip(), flip()]
      visited[y][x] = false
    }
  }

  x = this.opts.cols
  y = this.opts.rows
  var here = [Math.floor(this.opts.rows / 2), 0]
  var there = [Math.floor(this.opts.rows / 2), this.opts.cols - 1]

  var path = [here]
  while (here[0] !== there[0] || here[1] !== there[1]) {
    var potentials = [
      [here[0] + 1, here[1]],
      [here[0], here[1] + 1],
      [here[0] - 1, here[1]],
      [here[0], here[1] - 1]
    ]

    var neighbors = []

    for (var j = 0; j < 4; j++) {
      if (typeof this.cells[potentials[j][0]] !== 'undefined' &&
        typeof this.cells[potentials[j][0]][potentials[j][1]] !== 'undefined' &&
        !visited[potentials[j][0]][potentials[j][1]]
      ) {
        neighbors.push(potentials[j])
      }
    }
    if (neighbors.length === 0 && path.length > 0) {
      here = path.pop()
    } else {
      var next = neighbors[Math.floor(Math.random() * neighbors.length)]
      visited[next[0]][next[1]] = true
      path.push(here)
      here = next
    }
  }

  this.path = path

  for (i = 0, ii = path.length; i < ii; i++) {
    this.cells[path[i][0]][path[i][1]] = [false, false, false, false]
  }

  var cell
  // clear random walls
  for (y = 0; y < this.opts.rows; y++) {
    for (x = 0; x < this.opts.cols; x++) {
      cell = this.cells[y][x]
      cell[0] = flip(1 - this.opts.density) && cell[0]
      cell[1] = flip(1 - this.opts.density) && cell[1]
      cell[2] = flip(1 - this.opts.density) && cell[2]
      cell[3] = flip(1 - this.opts.density) && cell[3]
    }
  }

  for (y = 0; y < this.opts.rows; y++) {
    for (x = 0; x < this.opts.cols; x++) {
      cell = this.cells[y][x]
      if (y > 0) this.cells[y - 1][x][2] = this.cells[y - 1][x][2] && cell[0]
      if (y < this.opts.max_y - 1) this.cells[y + 1][x][0] = this.cells[y + 1][x][0] && cell[3]
      if (x > 0) this.cells[y][x - 1][1] = this.cells[y][x - 1][1] && cell[3]
      if (x < this.opts.max_x - 1) this.cells[y][x + 1][3] = this.cells[y][x + 1][3] && cell[1]
    }
  }

  // borders
  for (i = 0, ii = this.opts.cols; i < ii; i++) {
    this.cells[0][i][0] = true
    this.cells[this.opts.rows - 1][i][2] = true
  }

  for (i = 0, ii = this.opts.rows; i < ii; i++) {
    this.cells[i][0][3] = true
    this.cells[i][this.opts.cols - 1][1] = true
  }
}

Actors.Maze.prototype.defaults = [{
  key: 'rows',
  info: '',
  value: 15,
  min: 3,
  max: 15
}, {
  key: 'cols',
  info: '',
  value: 20,
  min: 8,
  max: 32
}, {
  key: 'density',
  info: '',
  value: 0.25,
  min: 0.1,
  max: 1
}]

Actors.Maze.prototype.update = function (delta) {}

Actors.Maze.prototype.paint = function (view) {
  var xf = this.refs.scene.opts.max_x / this.opts.cols
  var yf = this.refs.scene.opts.max_y / this.opts.rows
  var f = Math.min(xf, yf)

  view.ctx.save()
  view.ctx.translate(
    (this.refs.scene.opts.max_x / 2) - (f * this.opts.cols / 2),
    (this.refs.scene.opts.max_y / 2) - (f * this.opts.rows / 2)
  )

  var y, x, cell

  view.ctx.font = '12px ubuntu mono, monospace'
  view.ctx.textBaseline = 'middle'
  view.ctx.textAlign = 'center'

  // view.ctx.lineWidth = 0
  // for(var i = 0, ii = this.path.length; i < ii; i++ ) {
  //   cell = this.path[i]
  //   view.ctx.beginPath()
  //   view.ctx.fillStyle = '#333'
  //   view.ctx.fillRect(cell[1] * f, cell[0] * f, f, f)
  //   view.ctx.fillStyle = '#fff'
  //   view.ctx.fillText(i, (cell[1] * f) + (f / 2), (cell[0] * f) + (f / 2))
  // }

  view.ctx.strokeStyle = '#090'
  view.ctx.lineWidth = 2

  for (y = 0; y < this.opts.rows; y++) {
    for (x = 0; x < this.opts.cols; x++) {
      cell = this.cells[y][x]
      view.ctx.save()
      view.ctx.translate(x * f, y * f)

      view.ctx.fillStyle = 'rgba(255, 0, 255, ' + (0.5 + (Math.random() * 0.5)) + ')'
      view.ctx.beginPath()
      view.ctx.fillRect(-0.5, -0.5, 1, 1)

      if (cell[0] && cell[1] && cell[2] && cell[3]) {
        view.ctx.beginPath()
        view.ctx.fillStyle = '#333'
        view.ctx.fillRect(x * f, y * f, f, f)
      }

      view.ctx.strokeStyle = 'rgba(0, 255, 0, ' + (0.5 + (Math.random() * 0.2)) + ')'

      if (cell[0]) {
        view.ctx.beginPath()
        view.ctx.moveTo(0, 0)
        view.ctx.lineTo(f, 0)
        view.ctx.stroke()
      }
      if (cell[1]) {
        view.ctx.beginPath()
        view.ctx.moveTo(f, 0)
        view.ctx.lineTo(f, f)
        view.ctx.stroke()
      }
      if (cell[2]) {
        view.ctx.beginPath()
        view.ctx.moveTo(f, f)
        view.ctx.lineTo(0, f)
        view.ctx.stroke()
      }
      if (cell[3]) {
        view.ctx.beginPath()
        view.ctx.moveTo(0, f)
        view.ctx.lineTo(0, 0)
        view.ctx.stroke()
      }
      view.ctx.restore()
    }
  }

  view.ctx.restore()
}

Actors.Maze.prototype.elevation = function (view) {
  var xf = this.refs.scene.opts.max_x / this.opts.cols
  var yf = this.refs.scene.opts.max_z / this.opts.rows
  var f = Math.min(xf, yf)

  view.ctx.strokeStyle = '#0c0'
  view.ctx.lineWidth = 1

  view.ctx.save()
  view.ctx.translate(
    (this.refs.scene.opts.max_x / 2) - (f * this.opts.cols / 2),
    (f * this.opts.rows / 2)
  )

  var y, x, cell

  for (y = 0; y < this.opts.rows; y++) {
    for (x = 0; x < this.opts.cols; x++) {
      cell = this.cells[y][x]
      view.ctx.save()
      view.ctx.translate(x * f, y * f)

      if (cell[0]) {
        view.ctx.beginPath()
        view.ctx.moveTo(0, 0)
        view.ctx.lineTo(f, 0)
        view.ctx.stroke()
      }
      if (cell[1]) {
        view.ctx.beginPath()
        view.ctx.moveTo(f, 0)
        view.ctx.lineTo(f, f)
        view.ctx.stroke()
      }
      if (cell[2]) {
        view.ctx.beginPath()
        view.ctx.moveTo(f, f)
        view.ctx.lineTo(0, f)
        view.ctx.stroke()
      }
      if (cell[3]) {
        view.ctx.beginPath()
        view.ctx.moveTo(0, f)
        view.ctx.lineTo(0, 0)
        view.ctx.stroke()
      }
      view.ctx.restore()
    }
  }

  view.ctx.restore()
}
