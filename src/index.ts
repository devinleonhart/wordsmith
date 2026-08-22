import { bootstrap } from './bootstrap'

bootstrap().catch(error => {
  console.error('Fatal error during startup:', error)
  process.exit(1)
})
