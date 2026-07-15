# Build e implantação dos Code nodes n8n

## Objetivo

O n8n não importa módulos locais do repositório em runtime. O build empacota o Core Engine e uma cópia integral do processador v5 em um único arquivo JavaScript, pronto para colar no node **Processar Snapshot**.

Os artefatos são:

- `workflows/dist/PULSE_ADS_v6.js`
- `workflows/dist/PULSE_TNS_v6.js`

Nesta etapa, o Core Engine está presente no bundle como `PULSE_CORE`, mas não é chamado pelo processador. Portanto, o input, o texto do WhatsApp, o QuickChart e a saída estruturada continuam sendo produzidos pelo código v5 original.

ETA e sugestão de agentes permanecem placeholders `NOT_IMPLEMENTED` e não aparecem na saída atual.

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
5. confirma que o processador v5 é preservado integralmente no final de cada artefato.

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

## Por que o comportamento é preservado

O build não transforma o processador v5. Ele apenas adiciona antes dele um carregador de módulos autocontido. Um teste automatizado garante que o arquivo gerado termina com o conteúdo completo e inalterado do respectivo workflow v5. Como `PULSE_CORE` ainda não é chamado, nenhuma regra ou saída muda.
