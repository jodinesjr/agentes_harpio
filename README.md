# Harpiö Mind · Super Agentes de R&S

Landing page da **Harpiö** — a primeira HRtech AI-native do Brasil — apresentando os cinco
super agentes especialistas em Recrutamento & Seleção: **Sofia** (Triagem), **Rafael** (Sourcing),
**Luna** (Monitoring), **Iris** (Analytics) e **Vera** (Comunicação).

## Estrutura da página

| Seção | Conteúdo |
| --- | --- |
| Hero | Demo animada de atribuição de tarefa à Sofia + métricas (340% ROI, −67% TTH) |
| Diferença | Chatbot vs. Automatizador vs. Super Agente |
| Camada 1 | Poderes humanos (@assign, chat, @mention, 500+ habilidades) |
| Camada 2 | Superpoderes (24/7, Ambient, Configure-e-esqueça, Self-learning) |
| Camada 3 | Os 7 pilares da superinteligência (tabs interativas) |
| A família | Cards dos 5 agentes com voz, skills e amostras de conversa |
| Org | "Agentes têm gestor — o gestor é humano" |
| Contador | 48.000 horas/ano devolvidas (count-up animado) |
| Skills | Marquee com 60+ skills tipadas em 9 famílias |
| Autonomia | Escada de 4 níveis: Sombra → Copiloto → Tutelado → Autônomo Total |
| Tecnologia | 7 sistemas proprietários + stack de modelos + 50+ integrações |
| Builder | Monte seu próprio agente sem código |
| Entrega | Software · Copilot · Autopilot (a tese "Serviços: o Novo Software") |
| Segurança | LGPD, SOC 2, ISO 27001, trilha de auditoria, zero retenção |
| Depoimentos · Billing justo · FAQ · CTA final | — |

## Stack

HTML + CSS + JavaScript puros, sem build. Fontes via Google Fonts
(Space Grotesk, Inter, JetBrains Mono). Avatares dos agentes são SVGs originais inline.

## Como rodar

```bash
# qualquer servidor estático serve; por exemplo:
python3 -m http.server 8000
# depois abra http://localhost:8000
```

Ou simplesmente abra `index.html` no navegador.

## Design system

- **Base:** verde-tinta `#081511` · creme `#f6f3ea` · papel `#fdfcf8`
- **Acento:** lima elétrico `#c8f169` · menta `#2fbf8f`
- **Agentes:** Sofia `#7c5cff` · Rafael `#ff7847` · Luna `#4cc9f0` · Iris `#ffc53d` · Vera `#ff5c8a`
- Acessibilidade: `prefers-reduced-motion` respeitado em todas as animações.
