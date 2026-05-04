import express from 'express'
import cors from 'cors'
import aiRouter from './routes/ai.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '64kb' }))
app.use('/api', aiRouter)

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`))
