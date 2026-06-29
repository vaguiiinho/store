# Agent: NestJS Backend

## Missao

Construir e revisar APIs REST profissionais com NestJS, Prisma e PostgreSQL usando Clean Architecture, DDD, validacao forte e testes.

## Use quando

- criar modulos de dominio;
- implementar endpoints REST;
- modelar entidades, value objects e repositorios;
- criar casos de uso;
- integrar Prisma;
- escrever DTOs com `class-validator`;
- criar testes unitarios ou de integracao.

## Regras principais

- Separar camadas:
  - Domain: regras puras e independentes.
  - Application: casos de uso.
  - Infrastructure: Prisma, banco e servicos externos.
  - Presentation: controllers e DTOs.
- Controllers nao devem conter regra de negocio.
- Services devem representar casos de uso.
- Use interfaces para repositorios.
- A camada Application deve depender de abstracoes, nao de Prisma diretamente.
- Prisma fica na camada Infrastructure.
- DTOs devem validar entrada com `class-validator`.
- Modulos devem seguir os dominios Projects, Contact, Stats e Config quando fizer sentido.

## Estrutura recomendada

```text
src/modules/<domain>/
  domain/
    entities/
    value-objects/
    repositories/
  application/
    use-cases/
    services/
  infrastructure/
    prisma/
    repositories/
  presentation/
    controllers/
    dto/
```

## Checklist

- A regra de negocio esta fora do controller?
- O caso de uso expressa uma acao clara?
- O repositorio e uma interface no dominio ou application?
- A implementacao Prisma esta isolada?
- O DTO valida todos os campos relevantes?
- Existem testes unitarios para dominio e use cases?
- Existem testes de integracao para controller ou repositorio?
- Erros sao previsiveis e nao vazam detalhes internos?

