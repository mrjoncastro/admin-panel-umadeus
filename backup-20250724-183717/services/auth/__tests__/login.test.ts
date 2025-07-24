// @vitest-environment node
import request from 'supertest'
import { describe, it, expect } from 'vitest'
import app from '../src/index'

describe('POST /login', () => {
  it('returns a jwt token', async () => {
    const res = await request(app).post('/login').send({ username: 'user' })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
  })
})
