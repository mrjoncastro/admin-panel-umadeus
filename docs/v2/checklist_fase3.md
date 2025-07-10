# Checklist de Conclusão – Fase 3

Este checklist prático serve para acompanhar a implementação e validação dos requisitos da Fase 3 do projeto.

## 1. Orders Service
- [ ] Microserviço dedicado implementado (`services/orders`)
- [ ] Endpoints REST/GraphQL para pedidos (criar, consultar, atualizar)
- [ ] Testes unitários e de integração
- [ ] Integração com Commission Engine
- [ ] Documentação de API

## 2. Commission Engine PoC
- [ ] Serviço implementado conforme guia PoC
- [ ] Rota `/calculate` funcional
- [ ] Lógica de split e cálculo reverso
- [ ] Testes unitários e de integração
- [ ] Integração com Orders Service
- [ ] Documentação de payloads e exemplos

## 3. Deploy Automatizado (CI/CD)
- [ ] Workflows de CI/CD criados (GitHub Actions ou similar)
- [ ] Etapas de lint, testes, build e deploy
- [ ] Deploy automático para ambiente de staging
- [ ] Deploy automático para produção
- [ ] Documentação do fluxo de deploy

## 4. Observabilidade e Alertas
- [ ] OpenTelemetry configurado nos serviços
- [ ] Exposição de métricas Prometheus
- [ ] Dashboards no Grafana
- [ ] Alertas configurados para erros, latência e uso de recursos

## 5. Escalabilidade e Disaster Recovery
- [ ] Autoscaling configurado (Railway, Vercel, K8s, etc.)
- [ ] Canary deploy implementado
- [ ] Backups automáticos ativos
- [ ] Teste de failover documentado

## 6. Métricas de Performance e UX
- [ ] Coleta de Web Vitals no frontend
- [ ] Exposição de métricas de API
- [ ] Dashboards de performance ativos
- [ ] Alertas para SLO/SLA de UX

## 7. Testes de Carga e Resiliência
- [ ] Scripts de teste de carga criados (k6, Artillery, etc.)
- [ ] Execução de cenários de stress documentada
- [ ] Práticas de chaos engineering realizadas
- [ ] Resultados documentados

## 8. Infraestrutura como Código
- [ ] docker-compose atualizado
- [ ] Scripts Terraform para cloud (opcional)
- [ ] Documentação de setup e manutenção

---

> Preencha cada item conforme for concluído. Use este checklist para reuniões de acompanhamento e validação da Fase 3. 