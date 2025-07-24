import request from 'supertest';
import express from 'express';
import app from './index';

describe('Commission Engine', () => {
  it('calcula comissão para Pix', async () => {
    const res = await request(app)
      .post('/calculate')
      .send({ cost: 100, salePrice: 150, paymentMethod: 'pix', installments: 1 });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('grossFinal');
    expect(res.body.split.length).toBe(4);
  });

  it('calcula comissão para Boleto', async () => {
    const res = await request(app)
      .post('/calculate')
      .send({ cost: 80, salePrice: 120, paymentMethod: 'boleto', installments: 1 });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('grossFinal');
    expect(res.body.split.length).toBe(4);
  });

  it('retorna erro para payload inválido', async () => {
    const res = await request(app)
      .post('/calculate')
      .send({ cost: 'abc', salePrice: 120, paymentMethod: 'pix' });
    expect(res.status).toBe(400);
  });
}); 