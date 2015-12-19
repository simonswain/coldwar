import logger from '../lib/logger'
import environment from '../config'
import server from './server'

const config = environment(process.env.NODE_ENV)
const app = server(config)

app.start(() => {
  logger.log(
    'info',
    `${ config.nickname } server ${ config.env } ` +
    `${ config.server.host }:${ config.server.port }`
  )
})

process.on('SIGINT', () => {
  logger.log('info', 'Shutting Down...')
  app.stop(() => logger.log('info', 'Finished Server'))
})
