import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

// Mock DB
interface Order {
  id: string
  userId: string
  items: Record<string, unknown>[]
  total: number
  status: string
  createdAt: Date
}

const orders: Order[] = [];

// Criar pedido
app.post('/orders', (req, res) => {
  const { userId, items, total } = req.body;
  const order = { id: uuidv4(), userId, items, total, status: 'created', createdAt: new Date() };
  orders.push(order);
  res.status(201).json(order);
});

// Listar pedidos
app.get('/orders', (req, res) => {
  res.json(orders);
});

// Atualizar status do pedido
app.patch('/orders/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
  order.status = status;
  res.json(order);
});

const port = process.env.PORT || 6000;
app.listen(port, () => {
  console.log(`Orders Service rodando na porta ${port}`);
}); 