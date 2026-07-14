# PULSE Core Engine

Este diretório contém funções reutilizáveis e independentes do n8n para a evolução do PULSE.

## Módulos

- `sla.js`: estado, consumo, tempo restante e tempo desde o estouro do SLA.
- `priority.js`: score e ranking determinístico por bucket de SLA.
- `recommendation.js`: ação e motivo estruturado a partir do estado de SLA.
- `eta.js`: contrato placeholder para a futura estimativa de ETA.
- `staffing.js`: contrato placeholder para a futura sugestão de agentes.
- `index.js`: ponto único de exportação.

O Core Engine ainda não é importado pelos workflows ADS ou TNS. Sua inclusão, portanto, não altera a execução, o WhatsApp ou a saída da versão atual.

Os placeholders de ETA e agentes retornam `NOT_IMPLEMENTED` e a mensagem `não implementado` até que contratos de histórico e capacidade sejam aprovados.
