# Harpiö Mind · Super Agentes de R&S

Landing page da **Harpiö** — a primeira HRtech AI-native do Brasil — apresentando os cinco
super agentes especialistas em Recrutamento & Seleção: **Sofia** (Triagem), **Rafael** (Sourcing),
**Luna** (Monitoring), **Iris** (Analytics) e **Vera** (Comunicação).

## Estrutura da página

| Seção | Conteúdo |
| --- | --- |
| Hero | Aura quente + texto fantasma gigante + persona mascarada flutuante + métricas |
| Agentes | Tabs interativas (rotação automática) + 5 cards de persona com tilt 3D |
| Banner Builder | Painel gradiente animado — "construa o agente exato" |
| Produto | Stepper progressivo "um briefing sobe um time inteiro" |
| Humanamente possível | Checklist de poderes + chat demo da Vera (typing + aprovação) |
| Contador | 4,2M tarefas executadas (count-up) |
| Nuvem de skills | 4 fileiras de habilidades em marquee com persona central |
| Aurora | Transição clara → escura |
| Superpoderes | Anatomia raio-x com scrollspy dos 7 pilares |
| Tecnologia | Dashboards neon: equalizer, matriz de pontos, radar, gauges, leaderboard |
| Segurança | Split-face "você vê / o agente vê" + 3 cards (auditoria, zero retenção, reflexão) |
| Billing | Cartão "fair billing" com sheen animado |
| FAQ · CTA final | Accordion + painel gradiente com os 5 agentes |

## Stack

HTML + CSS + JavaScript puros, sem build. Fontes via Google Fonts
(Space Grotesk, Inter, JetBrains Mono). Toda a arte — os bustos humanos com
visores iridescentes, a figura raio-x e as visualizações de dados — é SVG/CSS
original feito à mão.

## Como rodar

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

Ou simplesmente abra `index.html` no navegador.

## Design system

- **Base clara:** branco `#ffffff` · cinza `#f6f5fa` · tinta `#0e0d13`
- **Gradiente da marca:** rosa `#ff3dd8` → violeta `#8a5cff` → azul `#3fa9ff` (+ âmbar `#ffb02e`)
- **Metade escura:** preto `#060609` com neon verde `#46f7a7` e ciano `#35d6ff`
- **Bordas animadas:** `@property --ga` + `conic-gradient` com máscara
- **Motions:** scrollspy (anatomia), tilt 3D, count-up, marquees, typing, sheen, aurora
- Acessibilidade: `prefers-reduced-motion` respeitado em todas as animações
