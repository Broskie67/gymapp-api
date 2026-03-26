import app from './app'
import { env } from './env'

app.listen(env.PORT, env.HOST, () => {
  console.log(`Server running at ${env.URL}:${env.PORT}`)
})