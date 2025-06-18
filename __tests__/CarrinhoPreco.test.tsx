/* @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import CarrinhoPage from "@/app/loja/carrinho/page";
import CartPreview from "@/app/components/CartPreview";
import { CartProvider } from "@/lib/context/CartContext";
import { calculateGross } from "@/lib/asaasFees";

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt} />,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

vi.mock("@/lib/context/AuthContext", () => ({
  useAuthContext: () => ({ isLoggedIn: true }),
}));

function renderWithItem() {
  const preco = 50;
  const item = {
    id: "1",
    nome: "Prod",
    preco,
    imagens: ["/img.jpg"],
    slug: "prod",
    quantidade: 1,
    variationId: "1",
  };
  window.localStorage.setItem("carrinho", JSON.stringify([item]));
  return { preco };
}

describe("CarrinhoPage", () => {
  it("mostra valor bruto do item", async () => {
    const { preco } = renderWithItem();
    const gross = calculateGross(preco, "pix", 1).gross;
    render(
      <CartProvider>
        <CarrinhoPage />
      </CartProvider>,
    );
    await screen.findByText("Carrinho");
    expect(
      screen.getByText(`R$ ${gross.toFixed(2).replace(".", ",")}`),
    ).toBeInTheDocument();
  });
});

describe("CartPreview", () => {
  it("mostra total bruto calculado", () => {
    const { preco } = renderWithItem();
    const gross = calculateGross(preco, "pix", 1).gross;
    render(
      <CartProvider>
        <CartPreview />
      </CartProvider>,
    );
    expect(
      screen.getByText(`R$ ${gross.toFixed(2).replace(".", ",")}`),
    ).toBeInTheDocument();
  });
});
