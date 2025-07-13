import express, { type Request, type Response } from 'express'
import jwt from 'jsonwebtoken'

const app = express()
app.use(express.json())

const SECRET = process.env.JWT_SECRET || 'secret'

app.post('/login', (req: Request<Record<string, unknown>, any, { username: string }>, res: Response) => {
  const { username } = req.body
  if (!username) {
    return res.status(400).json({ error: 'username required' })
  }
  const token = jwt.sign({ sub: username }, SECRET, { expiresIn: '1h' })
  res.json({ token })
})

if (require.main === module) {
  const port = process.env.PORT || 4000
  app.listen(port, () => {
    console.log(`Auth service running on port ${port}`)
  })
}

export default app
