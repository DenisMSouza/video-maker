# Video Maker

Ambiente de geração de vídeo com [Remotion](https://www.remotion.dev) e [ffmpeg](https://ffmpeg.org), seguindo o fluxo do [guia Remotion + Claude](https://cdn.juliaperisse.com.br/guia_remotion_claude.pdf).

O **grok bot** escreve o roteiro (JSON), os prompts e a parte de agentes. Este repositório recebe esse material, pré-visualiza no Studio e renderiza o MP4.

## O que este repo cobre

| Etapa do guia | Responsável |
| --- | --- |
| 01 Pesquisa visual | grok bot |
| 02 Roteiro | grok bot (gera o spec JSON) |
| 03 Imagens e clipes | grok bot (`public/assets` e `public/clips`) |
| 04 Instalação | este repo (Remotion + ffmpeg) |
| 05 Código / preview | este repo (composition a partir do spec) |
| 06 Áudio | este repo (`npm run mix` com ffmpeg) |
| 07 Render | este repo (`npm run render`) |

## Requisitos

- Node.js LTS (já testado com v23)
- ffmpeg e ffprobe no PATH (já testado com ffmpeg 8.1)

```bash
npm install
npm run check
npm run validate
npm run dev
```

O Studio abre em `http://localhost:3000`. A composition `exemplo` já entra no preview.

## Estrutura

```text
public/
  assets/          imagens estáticas das cenas
  clips/           MP4s gerados fora (pessoa falando, produto, etc.)
  audio/           narracao.mp3, musica.mp3, sfx/
  audio/mix/       saída do ffmpeg (gerada)
  specs/           roteiros JSON do grok bot
  specs/schema.json
```

Caminhos de mídia no JSON são relativos a `public/`. Exemplo: `assets/cena-01.png` e `audio/narracao.mp3`.

## Contrato do grok bot

Cada vídeo é um arquivo `public/specs/{id}.json`. O `id` precisa ser igual ao nome do arquivo e só pode ter letras, números e hífen.

O schema está em `public/specs/schema.json`. Campos principais:

- `palette` — cores do vídeo
- `scenes[]` — nome, duração, narração, `video` e/ou `image`, título, animação
- `audio` — narração, música (volume padrão 15%), sfx com timestamp

Prioridade da cena: **clipe de vídeo** > imagem > fundo gráfico.

`video` pode ser um caminho (`"clips/pessoa.mp4"`) ou um objeto:

```json
"video": {
  "file": "clips/pessoa-falando.mp4",
  "startFromSeconds": 0,
  "volume": 1,
  "muted": false,
  "fit": "cover"
}
```

A geração do clipe (pessoa falando, produto na mão) acontece **fora daqui** — HeyGen, Kling, Sora, filmagem, etc. Este repo só empilha o clipe, a legenda e o áudio. Se o clipe já tem a fala, use `muted: false` e não empilhe outra narração. Se a fala vai no `audio.narration`, marque `muted: true`.

O clipe deve durar pelo menos o `durationInSeconds` da cena; se for mais curto, o último frame fica congelado.

Animações suportadas: `fade`, `slide-up`, `scale`, `none`. `kenBurns` vale quando a cena tem imagem (não se aplica ao clipe).

Fluxo esperado do grok bot:

1. Gerar o spec JSON
2. Gerar os clipes de movimento na ferramenta de vídeo e gravar em `public/clips`
3. Opcionalmente colocar stills em `public/assets`
4. Colocar `narracao.mp3`, música e sfx em `public/audio`
5. Rodar `npm run validate {id}`
6. Preview no Studio e, se estiver ok, `npm run mix {id}` e `npm run render {id}`

## Comandos

```bash
npm run dev                  # Remotion Studio
npm run validate             # valida todos os specs
npm run validate exemplo     # valida um spec
npm run mix exemplo          # mistura narração + música + sfx
npm run render exemplo       # gera out/exemplo.mp4
npm run compress out/exemplo.mp4 youtube
npm run compress out/exemplo.mp4 social
```

O mix grava `public/audio/mix/{id}.mp3`. Se esse arquivo existir, o Remotion usa ele no lugar das faixas soltas.

## Licença Remotion

Remotion é gratuito para times de até 3 pessoas. Uso em empresa maior exige licença: https://www.remotion.pro/license
