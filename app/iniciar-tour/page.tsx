import LayoutWrapper from "../components/LayoutWrapper";

export const metadata = {
  title: "Iniciar Tour",
  description: "Guia de primeiro acesso para novos clientes",
};

export default function IniciarTourPage() {
  return (
    <LayoutWrapper>
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        <h1 className="text-3xl font-bold">Iniciar Tour</h1>

        <section>
          <h2 className="text-2xl font-semibold mt-6">1. Acesso inicial</h2>
          <ol className="list-decimal space-y-2 pl-5 mt-2">
            <li>Abra a URL do site e clique em <strong>Login</strong>.</li>
            <li>Insira as credenciais fornecidas durante o cadastro.</li>
            <li>
              Na primeira visita, clique em <strong>Iniciar Tour</strong> para seguir as etapas abaixo.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-6">2. Loja</h2>
          <ol className="list-decimal space-y-2 pl-5 mt-2">
            <li>Explore a vitrine de produtos em <strong>Loja</strong>.</li>
            <li>Adicione itens ao carrinho e finalize em <strong>Checkout</strong>.</li>
            <li>Acompanhe seus pedidos em <strong>Minhas compras</strong>.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-6">3. Painel Administrativo</h2>
          <ol className="list-decimal space-y-2 pl-5 mt-2">
            <li>Acesse <strong>Admin</strong> para abrir o painel de gestão.</li>
            <li>No menu lateral, visite cada seção:</li>
            <li className="list-none">
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Dashboard</strong> – visão geral de inscrições e vendas.</li>
                <li><strong>Inscrições</strong> – lista e aprovação de participantes.</li>
                <li><strong>Pedidos</strong> – pagamentos relacionados às inscrições.</li>
                <li><strong>Compras</strong> – histórico de compras na loja.</li>
                <li><strong>Produtos</strong> – cadastro e edição de itens.</li>
                <li><strong>Clientes</strong> – dados de cada tenant e domínio.</li>
                <li><strong>Campos</strong> – gerenciamento das áreas de atuação.</li>
                <li><strong>Configurações</strong> – logo, cores e opções do sistema.</li>
              </ul>
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-6">4. Blog</h2>
          <ol className="list-decimal space-y-2 pl-5 mt-2">
            <li>Acesse a aba <strong>Blog</strong> para ler ou criar posts (via admin).</li>
            <li>Utilize o editor para publicar novidades no portal.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-6">5. Conclusão</h2>
          <p className="mt-2">
            Ao final do tour, você estará apto a navegar entre loja, admin e blog, gerenciando suas informações de forma centralizada.
          </p>
        </section>
      </div>
    </LayoutWrapper>
  );
}
