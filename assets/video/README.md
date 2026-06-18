# Vídeos da Harpiö — onde soltar os arquivos

O site já funciona **lindo sem nenhum vídeo**: cada slot tem um fallback
sintético (canvas "grafo de talento vivo" no hero, pipeline animado no
"como funciona", gradientes cinematográficos nos CTAs).

Quando você soltar os arquivos abaixo, eles **assumem automaticamente**
o lugar do fallback — sem editar código.

| Arquivo                         | Onde aparece                         | Como toca                                  |
|---------------------------------|--------------------------------------|--------------------------------------------|
| `hero.mp4`                      | Fundo do hero (home)                 | autoplay, mudo, loop                       |
| `como-funciona.mp4`             | Seção "Como funciona"                | **scroll-scrub** (avança com a rolagem)    |
| `cta.mp4`                       | Fundo do CTA final (home + hunters)  | autoplay, mudo, loop                       |

Recomendações: H.264/MP4, 1080p, < 8 MB, sem áudio. Para o
`como-funciona.mp4`, exporte um clipe linear (ex.: um candidato avançando
no funil) — a duração inteira é mapeada na altura de rolagem da seção.
