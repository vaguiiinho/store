type ProdutoPageProps = {
  params: { slug: string };
};

export default function ProdutoPage({ params }: ProdutoPageProps) {
  const { slug } = params;

  return (
    <main>
      <h1>Produto</h1>
      <p>{slug}</p>
    </main>
  );
}
