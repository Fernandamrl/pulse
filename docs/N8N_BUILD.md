# Build e implantação dos Code nodes n8n

## Objetivo

O n8n não importa módulos locais do repositório em runtime. O build empacota o Core Engine e uma cópia integral do processador v5 em um único arquivo JavaScript, pronto para colar no node **Processar Snapshot**.

Os artefatos são:

- `workflows/dist/PULSE_ADS_v6.js`
- `workflows/dist/PULSE_TNS_v6.js`

O artefato executa o processador v5 encapsulado e preserva seus campos de saída. Em seguida, a camada executiva v6 gera o novo `whatsappText`, reduz o tamanho do QuickChart e adiciona `decisionsV6`.

A capacidade exibida é uma estimativa mínima teórica baseada em backlog, AHT, tempo restante e ocupação de 85%. Ela não representa agentes adicionais, pois o snapshot atual não informa staffing já alocado.

## Pré-requisitos

- Node.js 18 ou superior.
- Não é necessário instalar dependências npm.

## Gerar os arquivos

Na raiz do repositório:

```powershell
npm run build
```

O comando lê:

- `src/core/*.js`;
- `workflows/01_PULSE_ADS_v5.js`;
- `workflows/02_PULSE_TNS_v5.js`.

Não edite arquivos em `workflows/dist/` manualmente. Corrija a fonte e execute o build novamente.

## Validar

Execute toda a validação:

```powershell
npm run check
```

Esse comando:

1. regenera os dois artefatos;
2. compila sintaticamente cada arquivo como corpo de uma função, formato compatível com o top-level `return` do Code node;
3. verifica a presença do bundle e a ausência de imports externos em runtime;
4. executa os testes do Core Engine;
5. confirma que o processador v5 continua encapsulado em cada artefato.

## Copiar para o n8n

### ADS

1. Execute `npm run check`.
2. Abra `workflows/dist/PULSE_ADS_v6.js`.
3. Selecione e copie todo o conteúdo do arquivo.
4. No n8n, duplique o workflow/node ADS atual para manter rollback.
5. Abra o Code node **Processar Snapshot** da cópia.
6. Substitua todo o código pelo conteúdo copiado.
7. Execute com um snapshot ADS representativo.
8. Compare `whatsappText`, `quickchartBody` e os demais campos com a versão v5 antes de ativar.

### TNS

Repita o mesmo processo usando `workflows/dist/PULSE_TNS_v6.js` e um snapshot TNS. Confirme que a mensagem lista todas as filas em alerta/estouradas e somente as cinco maiores filas normais.

## Estratégia de implantação

- Não substituir diretamente os nodes produtivos nesta etapa.
- Usar uma cópia inativa ou execução paralela.
- Comparar as saídas v5 e v6 com o mesmo input.
- Manter o node v5 como rollback.
- A ativação produtiva requer aprovação separada.

## Compatibilidade

O build não modifica os arquivos v5. Ele os encapsula e conserva seus campos de saída, aliases, targets, peak e histórico. A camada v6 altera apenas os artefatos em `dist`, com novo WhatsApp, gráfico menor e `decisionsV6`. O rollout continua separado e reversível.
