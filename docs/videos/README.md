# Vídeos da loja

## Funcionalidades da loja

- Arquivo final: `funcionalidades-da-loja.mp4`
- Resolução: 1280 × 720
- Áudio: não possui
- Duração aproximada: 40 segundos
- Gerador: `scripts/create-store-features-video.mjs`

O vídeo apresenta as funcionalidades implementadas na loja:

1. home e produtos em destaque;
2. catálogo com busca e categorias;
3. detalhe do produto, preço, estoque e variações;
4. carrinho e cálculo dos totais;
5. checkout como visitante, frete regional e pagamento;
6. resumo do pedido e acompanhamento do status;
7. painel administrativo de produtos, estoque e pedidos.

As imagens utilizadas são as mesmas URLs do catálogo de demonstração, hospedadas
no Unsplash. Cópias locais usadas na renderização ficam em `docs/videos/assets/`.

Para regenerar os quadros:

```bash
node scripts/create-store-features-video.mjs
```

Para gerar o MP4:

```bash
docker run --rm \
  -v "$(pwd)/docs/videos:/work" \
  -w /work/funcionalidades-loja \
  jrottenberg/ffmpeg:6.1-alpine \
  -f concat -safe 0 -i timeline.txt \
  -vf fps=30,format=yuv420p \
  -movflags +faststart -an -y \
  ../funcionalidades-da-loja.mp4
```
