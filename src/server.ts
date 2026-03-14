import app from './app'
import { env } from './env'

app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`Server running at http://${env.HOST}:${env.PORT}`)
})