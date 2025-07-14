import axios from 'axios';

const COMMISSION_ENGINE_URL = process.env.COMMISSION_ENGINE_URL || 'http://commission:7000';

export async function calcularComissao(payload: Record<string, unknown>) {
  const res = await axios.post(`${COMMISSION_ENGINE_URL}/calculate`, payload);
  return res.data;
}