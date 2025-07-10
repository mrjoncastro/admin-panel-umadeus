import request from 'supertest';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import app from './index';

describe('Orders Service', () => {
  it('cria um pedido', async () => {
    const res = await request(app)
      .post('/orders')
      .send({ userId: 'user1', items: [{ produto: 'p1', qtd: 2 }], total: 100 });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toBe('created');
  });

  it('lista pedidos', async () => {
    await request(app)
      .post('/orders')
      .send({ userId: 'user2', items: [{ produto: 'p2', qtd: 1 }], total: 50 });
    const res = await request(app).get('/orders');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('atualiza status do pedido', async () => {
    const create = await request(app)
      .post('/orders')
      .send({ userId: 'user3', items: [{ produto: 'p3', qtd: 1 }], total: 30 });
    const id = create.body.id;
    const res = await request(app)
      .patch(`/orders/${id}`)
      .send({ status: 'pago' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('pago');
  });
}); 