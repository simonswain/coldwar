import fs from 'fs'
import _ from 'lodash'
import async from 'async'
import UglifyJS from 'uglify-js'
import less from 'less'

export function create (opts) {
  opts = Object.assign(opts, {
    key: false,
    base: '',
    url: '/',
    out: __dirname + '/public/assets',
    outUrl: '/assets'
  })

  const assets = {
    css: [],
    js: []
  }

  const html = {
    css: '',
    js: ''
  }

  let renderedFiles

  const preload = files => {
    renderedFiles = files
  }

  const renderJs = done => {
    const files = assets.js.map(x => opts.base + '/' + x)

    const filename =
      `${ opts.key ? `${ opts.key }-` : '' }` +
      `script-${ new Date().getTime() }.js`

    const outf = opts.out + '/' + filename

    const { code } = UglifyJS.minify(files)
    fs.writeFileSync(outf, code)
    renderedFiles.js = opts.outUrl + '/' + filename
    done()
  }

  const renderCss = done => {
    var filename = 'styles-' + new Date().getTime() + '.css'

    if (opts.key) {
      filename = opts.key + '-' + filename
    }

    const outf = opts.out + '/' + filename

    const css = []

    const renderOne = function (x, cb) {
      const src = opts.base + '/' + x
      less.render(
        fs.readFileSync(src, 'utf8'), {
          compress: true
        }, function (e, output) {
          css.push(output.css)
          cb()
        }
      )
    }

    async.eachSeries(
      assets.css,
      renderOne,
      function (err, res) {
        if (err) return console.error(err)
        const s = css.join('\n')
        fs.writeFileSync(outf, s)
        renderedFiles.css = opts.outUrl + '/' + filename
        done()
      }
    )
  }

  const render = function (done) {
    renderedFiles = {}

    const checkdir = function (next) {
      const d = fs.existsSync(opts.out)
      if (!d) {
        fs.mkdirSync(opts.out)
      }
      return next()
    }

    const cleandir = function (next) {
      let files
      const dirpath = opts.out
      try {
        files = fs.readdirSync(dirpath)
      } catch (e) {
        return next()
      }

      if (files.length === 0) {
        return next()
      }

      for (let i = 0; i < files.length; i++) {
        if (opts.key && files[i].substr(0, opts.key.length) !== opts.key) {
          continue
        }
        const filepath = dirpath + '/' + files[i]
        if (fs.statSync(filepath).isFile()) {
          fs.unlinkSync(filepath)
        }
      }
      next()
    }

    async.series([
      checkdir,
      cleandir,
      renderJs,
      renderCss
    ], function () {
      done(null, renderedFiles)
    })
  }

  const gen = function () {
    html.css = assets.css.map(
      x => `<link rel="stylesheet" href="${ opts.url }${ x.substr(-5) === '.less' ? `${ x.slice(0, -5) }.css` : x }" />`
    ).join('\n')

    html.js = assets.js.map(
      x => `<script type="text/javascript" src="${ opts.url }${ x }"></script>`
    ).join('\n')
  }

  const add = function (f) {
    if (f.substr(0, 1) === '/') {
      f = f.substr(1)
    }

    const src = opts.base + '/' + f

    if (fs.lstatSync(src).isDirectory()) {
      for (const file of fs.readdirSync(src)) {
        if (file.substr(0, 1) === '.') return
        if (file.substr(0, 1) === '#') return
        add(f + '/' + file)
      }
    }

    if (f.substr(-3) === '.js') assets.js.push(f)
    if (f.substr(-4) === '.css') assets.css.push(f)
    if (f.substr(-5) === '.less') assets.css.push(f)

    gen()
  }

  const js = () => renderedFiles
    ? `<script type="text/javascript" src="${ renderedFiles.js }"></script>`
    : html.js

  const css = () => renderedFiles
    ? `<link rel="stylesheet" href="${ renderedFiles.css }" />`
    : html.css

  return {
    add,
    css,
    js,
    render,
    preload
  }
}

export function load (manifests) {
  const files = {}
  const keys = {}

  for (const [key, manifest] of Object.entries(manifests)) {
    keys[key] = {}
    keys[key] = create(manifest.opts)
    for (const f of manifest.assets) {
      keys[key].add(f)
    }
    keys[key].key = key
  }

  const renderOne = (key, next) => {
    key.render((err, res) => {
      if (err) return console.error(err)
      files[key.key] = res
      next()
    })
  }

  const render = (target, done) => {
    if (arguments.length === 1) {
      done = target
      target = false
    }

    async.eachSeries(
      _.toArray(keys),
      renderOne,
      () => {
        if (target) {
          fs.writeFileSync(
            target,
            JSON.stringify(files)
          )
        }
        done()
      }
    )
  }

  const preload = assets => {
    assets.forEach((files, key) => keys[key].preload(files))
  }

  return {
    keys,
    render,
    preload
  }
}
