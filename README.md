# Video Maker

Ambiente de render com [Remotion](https://www.remotion.dev) e [ffmpeg](https://ffmpeg.org).

O **grok bot não gera o MP4**. Ele entrega um roteiro JSON e os arquivos de mídia. Este repositório valida, pré-visualiza e renderiza.

## O que o grok bot faz

1. Escolhe um `id` só com letras, números e hífen (`meu-video`).
2. Escreve `public/specs/{id}.json` no schema `public/specs/schema.json`. O campo `id` **tem que ser igual** ao nome do arquivo.
3. Coloca a mídia em `public/`, com caminhos relativos a `public/` no JSON:
   - clipe de pessoa/produto falando → `public/clips/`
   - still → `public/assets/`
   - narração, música, sfx → `public/audio/`
4. Gera os clipes de movimento **fora daqui** (HeyGen, Kling, Sora, filmagem). Este repo não chama nenhuma API de vídeo.
5. Roda `npm run validate {id}` e corrige avisos de arquivo faltando.

Ele **não** escreve TSX Remotion, **não** edita `src/` e **não** precisa rodar o Studio. Mix e render ficam com este ambiente:

```bash
npm run mix {id}
npm run render {id}    # sai em out/{id}.mp4
```

## O que cada campo vira na tela

| Campo | Aparece no vídeo? | Uso |
| --- | --- | --- |
| `scenes[].title` | sim | título grande |
| `scenes[].subtitle` | sim | texto menor abaixo do título |
| `scenes[].name` | sim | rótulo no topo (`01  ROTEIRO`) |
| `scenes[].video` | sim | fundo em movimento; ganha de `image` |
| `scenes[].image` | sim | fundo estático se não houver `video` |
| `scenes[].background` / `palette` | sim | cores se não houver mídia |
| `scenes[].animation` | sim | `fade`, `slide-up`, `scale`, `none` |
| `scenes[].narration` | não | texto da fala; o áudio real é o MP3 |
| `scenes[].visual` | não | nota de direção; o renderer ignora |

Sem `video` e sem `image`, a cena vira só tipografia no fundo da paleta.

## Regras de mídia

- Caminhos: `clips/pessoa.mp4`, `assets/cena-01.png`, `audio/narracao.mp3`. Nunca use `public/` no JSON.
- Nome sugerido: `clips/{id}-01.mp4`, `assets/{id}-01.png`.
- Resolução padrão do spec: `1920x1080`, `fps: 30`.
- O clipe deve durar **no mínimo** `durationInSeconds` da cena. Se for mais curto, o último frame congela.
- A duração do vídeo final é a **soma das cenas**, não `durationInSeconds` do root (esse campo é só documentação).

Fala — escolha um caminho só:

- Clipe já tem a voz → `"muted": false` e **não** coloque `audio.narration`.
- Voz em `audio/narracao.mp3` → `"muted": true` no clipe.

`audio.mixed` é saída do `npm run mix` (`audio/mix/{id}.mp3`). O grok bot não precisa gerar esse arquivo. Se ele existir, o Remotion usa o mix e ignora narração+música soltas.

## Spec mínimo

Copie `public/specs/exemplo.json` ou parta disto:

```json
{
  "$schema": "./schema.json",
  "id": "meu-video",
  "title": "Título interno",
  "fps": 30,
  "width": 1920,
  "height": 1080,
  "palette": {
    "background": "#07111F",
    "primary": "#5EEAD4",
    "secondary": "#818CF8",
    "text": "#F8FAFC",
    "muted": "#CBD5E1"
  },
  "audio": {
    "music": "audio/musica.mp3",
    "musicVolume": 0.15
  },
  "scenes": [
    {
      "id": "abertura",
      "name": "Abertura",
      "durationInSeconds": 5,
      "title": "Texto na tela",
      "subtitle": "Linha de apoio",
      "video": {
        "file": "clips/meu-video-01.mp4",
        "muted": false,
        "fit": "cover"
      },
      "animation": { "enter": "fade", "exit": "fade" }
    }
  ]
}
```

`video` também aceita só o caminho: `"video": "clips/meu-video-01.mp4"`.

Objeto completo do clipe:

```json
"video": {
  "file": "clips/pessoa-falando.mp4",
  "startFromSeconds": 0,
  "volume": 1,
  "muted": false,
  "fit": "cover"
}
```

Schema oficial: `public/specs/schema.json`. Cada JSON em `public/specs/{id}.json` vira uma composition com o mesmo `id` no Studio.

## Estrutura

```text
public/
  specs/{id}.json     roteiro do grok bot
  specs/schema.json   contrato
  clips/              MP4s de pessoa/produto
  assets/             stills
  audio/              narracao, musica, sfx
  audio/mix/          gerado pelo npm run mix
out/{id}.mp4          gerado pelo npm run render
```

## Ambiente local

```bash
npm install
npm run check
npm run validate
npm run dev                 # http://localhost:3000
npm run mix exemplo
npm run render exemplo      # out/exemplo.mp4
npm run compress out/exemplo.mp4 social
```

Requisitos: Node.js LTS e ffmpeg/ffprobe no PATH.

## Licença Remotion

Remotion é gratuito para times de até 3 pessoas. Uso em empresa maior exige licença: https://www.remotion.pro/license
