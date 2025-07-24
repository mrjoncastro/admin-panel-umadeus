import { Router } from 'express'
import { query } from '../../database/connection'
import type { Usuario } from '../../types'

const router = Router()

// Listar usuários por tenant
router.get('/', async (req, res) => {
  const { cliente } = req.query
  if (!cliente) return res.status(400).json({ error: 'Cliente não informado' })
  try {
    const result = await query('SELECT * FROM usuarios WHERE cliente = $1', [cliente])
    res.json(result.rows as Usuario[])
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuários', details: String(err) })
  }
})

export default router 