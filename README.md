# Harpiö · A infraestrutura de talento do R&S brasileiro

Site institucional da **Harpiö** — marketplace de talento que junta, numa só plataforma,
**Software** (Harpiö Flow), **Agentes de IA** (Harpiö Mind) e uma **rede de Hunters**
especialistas. Posicionamento de marketplace de duas pontas (empresas + recrutadores),
inspirado na arquitetura de comunicação de referências como a Paraform, adaptado ao R&S
brasileiro e à tese "Serviços: o Novo Software".

## Posicionamento

> **Contrate no modo fácil.** Hunters especialistas e agentes de IA sob medida trabalham
> juntos — dentro de uma só plataforma — para preencher as vagas que mais importam.

A tese: *o futuro do R&S não é o software substituindo o humano, nem o humano ignorando o
software — é os dois juntos, com informação melhor.* Inteligência → máquina; julgamento → humano.

## Mapa do site

| Página | Papel |
| --- | --- |
| `index.html` | **Home (Para empresas)** — hero "modo fácil", trio Software/Agentes/Hunters, como-funciona scroll-scrub, especialidades, marketplace 2 lados, tese, modelos, clientes, Índice de Densidade de Talento |
| `recrutadores.html` | **Para hunters** — "a forma mais rápida de fazer mais placements": clientes, IA, back-office, painel de ganhos |
| `especialidades.html` | Verticais por setor (seguros, tech, comercial, financeiro, saúde…) |
| `plataforma.html` | Mind · Flow · Sense |
| `modelos.html` | Software · Copilot · Autopilot |
| `tecnologia.html` | 7 sistemas Agentic, AI-native vs bolt-on, segurança/LGPD |
| `empresa.html` | Jornada em 4 atos, manifesto, piloto de seguros, roadmap |
| `agentes/*.html` | Hub + subpágina por agente (Sofia, Rafael, Luna, Iris, Vera) com demo de tela |

## Sistema de vídeo (autoplay + scroll-scrub)

O site funciona **lindo sem nenhum arquivo de vídeo**: cada slot tem um fallback sintético.
Quando você soltar os MP4s em `assets/video/`, eles assumem automaticamente. Veja
`assets/video/README.md`.

- **Hero** — `assets/video/hero.mp4` (autoplay/loop) sobre um canvas "grafo de talento vivo":
  candidatos sobem o funil, os 5 agentes pulsam e desenham matches; reage à rolagem e ao mouse.
- **Como funciona** — `assets/video/como-funciona.mp4` com **scroll-scrub** (a rolagem avança o
  vídeo). Sem o arquivo, um pipeline em canvas avança Defina → Acesse → Contrate com a rolagem.
- **CTAs** — `assets/video/cta.mp4` (autoplay/loop) sobre gradiente cinematográfico.

Tudo respeita `prefers-reduced-motion`.

## Stack

HTML/CSS/JS puros, sem build. Retratos dos agentes em SVG vetorial original
(`assets/img/personas.svg`). Fontes: Space Grotesk, Inter, JetBrains Mono.

## Como rodar

```bash
python3 -m http.server 8000
# abra http://localhost:8000  (sirva via HTTP, não file://)
```

## Design

- Base clara, muito respiro, tipografia display grande (mega-plataforma) com pegada jovem.
- Acento violeta `#6e3aff`; gradiente rosa→violeta→azul nos destaques; verde-neon `#3ddc97`
  no lado dos hunters. Ink `#0b0b13` nas seções escuras.
