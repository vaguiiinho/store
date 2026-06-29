# ADR 0009 - Cloudinary para Imagens

## Contexto

A loja virtual depende de imagens de produto com boa entrega e otimizacao.

## Decisao

Usar Cloudinary para upload, armazenamento e entrega das imagens de produto.

## Razao

- A documentacao oficial destaca upload, transformacao e entrega via CDN.
- Produtos de e-commerce costumam exigir redimensionamento e otimizacao.
- A operacao de imagens fica desacoplada do banco principal.

## Alternativas Consideradas

- Supabase Storage.
- Armazenamento local.
- Storage proprio no backend.

## Impacto

- O upload precisara gerar URLs e metadados para os produtos.
- O frontend se beneficia de imagens otimizadas.
- A configuracao externa passa a ser parte do ambiente.

