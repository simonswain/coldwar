'use strict'

var async = require('async')
var hapi = require('hapi')
var Path = require('path')

var AssetManager = require('./assets')

module.exports = function (config) {
  config = config || {}

  if (!config.hasOwnProperty('server')) {
    config.server = {
      host: '127.0.0.1',
      port: 3002
    }
  }

  if (!config.server.hasOwnProperty('host')) {
    config.server.host = '127.0.0.1'
  }

  if (!config.server.hasOwnProperty('port')) {
    config.server.port = 3002
  }

  var server = new hapi.Server()

  server.connection({
    host: config.server.host,
    port: config.server.port
  })

  server.views({
    engines: {
      html: require('handlebars')
    },
    path: Path.join(__dirname, 'views'),
    isCached: (config.env !== 'development')
  })

  var manifest = require(__dirname + '/manifest')

  if (config.docroot) {
    manifest.pub.opts.outUrl = '/' + config.docroot + '/assets'
    manifest.pub.opts.url = '/' + config.docroot
  }

  var assets = AssetManager.load(manifest)

  var appHandler = function (request, reply) {
    reply.view('app', {
      js: assets.keys.pub.js(),
      css: assets.keys.pub.css(),
      ga_id: config.ga_id
    })
  }

  server.route({
    method: 'GET',
    path: '/',
    handler: appHandler
  })

  // asset routes - css, js, images
  server.route({
    method: 'GET',
    path: '/favicon.ico',
    handler: {
      file: Path.join(__dirname, 'public/images/favicon.ico')
    }
  })

  // minified assets
  server.route({
    method: 'GET',
    path: '/assets/{path*}',
    handler: {
      directory: {
        path: Path.join(__dirname, 'public/assets'),
        listing: false,
        index: false
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/public/js/{path*}',
    handler: {
      directory: {
        path: Path.join(__dirname, 'public/js'),
        listing: false,
        index: false
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/css/{path*}',
    handler: {
      directory: {
        path: Path.join(__dirname, 'public/css'),
        listing: false,
        index: false
      }
    }
  })

  server.register({
    register: require('hapi-less'),
    options: {
      home: __dirname + '/public/less',
      route: '/public/css/{filename*}',
      less: {
        compress: true
      }
    }
  }, function (err) {
    if (err) console.error(err)
  })

  server.register({
    register: require('hapi-less'),
    options: {
      home: __dirname + '/public/less',
      route: '/public/less/{filename*}',
      less: {
        compress: true
      }
    }
  }, function (err) {
    if (err) console.error(err)
  })

  // api routes

  // ...

  // catchall route
  server.route({
    method: 'GET',
    path: '/{path*}',
    handler: appHandler
  })

  // lifecycle management
  var start = function (done) {
    async.series([
      function (next) {
        if (config.env === 'production') {
          return assets.render(next)
        }
        next()
      }, function (next) {
        server.start(next)
      }
    ], function () {
      if (done) {
        done()
      }
    })
  }

  var stop = function (done) {
    async.series([
      function (next) {
        server.stop({
          timeout: 1000
        }, function (err, res) {
          if (err) console.error(err)
          else next()
        })
      }
    ], done)
  }

  return {
    start: start,
    stop: stop
  }
}
