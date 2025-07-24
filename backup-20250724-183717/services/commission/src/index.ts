import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { logger } from '@/lib/logger'

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

// Mock taxas do Asaas
function obterTaxasAsaas(paymentMethod: string, installments: number) {
  // Exemplo: Pix 1.5%, Boleto 2.5%, Crédito 3.5% + 1 real por parcela
  if (paymentMethod === 'pix') return { fixedFee: 0, percentFee: 0.015 };
  if (paymentMethod === 'boleto') return { fixedFee: 2.5, percentFee: 0.025 };
  if (paymentMethod === 'credit') return { fixedFee: 1 * installments, percentFee: 0.035 };
  return { fixedFee: 0, percentFee: 0.02 };
}

app.post('/calculate', (req, res) => {
  const { cost, salePrice, paymentMethod, installments = 1, grossPix } = req.body;
  if (typeof cost !== 'number' || typeof salePrice !== 'number' || !paymentMethod) {
    return res.status(400).json({ error: 'Dados inválidos' });
  }
  const sellerMargin = salePrice - cost;
  const hostCommission = sellerMargin * 0.04;
  const platformCommission = salePrice * 0.05;
  const S = cost + sellerMargin + hostCommission + platformCommission;
  const { fixedFee: F, percentFee: P } = obterTaxasAsaas(paymentMethod, installments);
  let G = (S + F) / (1 - P);
  if (grossPix) G = Math.max(G, grossPix);
  const grossFinal = Math.round(G * 100) / 100;
  const split = [
    { wallet: 'fornecedor', value: cost },
    { wallet: 'vendedor', value: sellerMargin },
    { wallet: 'host', value: hostCommission },
    { wallet: 'plataforma', value: platformCommission }
  ];
  res.json({ grossFinal, feeFixed: F, feePercent: P, platformMargin: platformCommission, split });
});

const port = process.env.PORT || 7000;
app.listen(port, () => {
  logger.debug(`Commission Engine rodando na porta ${port}`);
}); 