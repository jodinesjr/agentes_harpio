# Harpiö · Site institucional — HRtech AI-native de R&S

Site multi-página da **Harpiö**, a primeira HRtech AI-native do Brasil, com os cinco
super agentes de Recrutamento & Seleção: **Sofia** (Triagem), **Rafael** (Sourcing),
**Luna** (Monitoring), **Iris** (Analytics) e **Vera** (Comunicação).

## Mapa do site

| Página | Conteúdo |
| --- | --- |
| `index.html` | Home: hero com **agentes operando o Flow ao vivo** (cursores multiplayer, kanban, console de skills), dores, 3 pilares, time, widgets de funções, tese, modelos, escada gamificada, resultados + piloto, depoimentos, FAQ |
| `agentes/index.html` | Hub do time: coleção gamificada (X/5 conhecidos) + diagrama de hand-off |
| `agentes/sofia.html` … `vera.html` | Subpágina por agente: retrato, voz, 5 habilidades, **demo animada da tela** (triagem, boolean, sinais, gráfico+briefing, composer com crítico de empatia), skills atômicas, navegação próximo/anterior |
| `plataforma.html` | Mind (3 camadas) · Flow (ATS legado vs Flow + integrações) · Sense (capacitação) |
| `modelos.html` | Software · Copilot · Autopilot detalhados, tabela comparada, tese 1:6, billing justo |
| `tecnologia.html` | Bolt-on vs AI-native, os 7 sistemas proprietários, níveis de segurança por skill, LGPD |
| `empresa.html` | Jornada em 4 atos, manifesto, piloto do setor de seguros, roadmap 18 meses, convite |

## Gamificação

- Barra de progresso de leitura + trilha lateral com checkpoints (home)
- **Conquistas** (toasts, uma única vez via localStorage)
- **Coleção do time**: visitar cada agente marca ✓ nos cards (X/5; conquista ao completar)
- Escada de autonomia com níveis que se **destravam** em sequência (cadeado → XP)

## Motions de produto

- Cena em loop na home: Sofia pontua e move card no kanban, Vera agenda, Luna alerta, Iris atualiza KPI — com **cursores nomeados** e console de chamadas de função (`sofia.score_resume() → 92 ✓`)
- Widgets vivos: funil, agenda preenchendo, inbox, gauge NPS, sinais, sparkline
- Demos por agente: tabela de triagem pontuando, boolean digitando + resultados, feed de sinais, gráfico se desenhando + briefing digitado, composer com checklist de empatia

## Stack

HTML/CSS/JS puros, sem build. Retratos corporativos dos agentes em **SVG vetorial
original** (`assets/img/personas.svg`) — slots prontos para troca por fotografia/3D.
Fontes: Space Grotesk, Inter, JetBrains Mono.

## Como rodar

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

> Sirva via HTTP (não `file://`) — os retratos usam `<use href="…svg#id">` externo.

## Design system

- Base profissional: branco `#ffffff` · cinza `#f4f4f8` · tinta `#101019`
- Acento: violeta `#6e3aff`; gradiente rosa→violeta→azul reservado a destaques
- Seções escuras: `#0b0b13` com verde `#3ddc97`
- Agentes: Sofia violeta · Rafael verde · Luna azul · Iris âmbar · Vera rosa
- `prefers-reduced-motion` respeitado em todas as animações
