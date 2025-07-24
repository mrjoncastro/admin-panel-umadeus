// src/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-black_bean/80 backdrop-blur-sm text-platinum text-center text-sm px-6 py-6 mt-16 border-t border-platinum/20">
      <p className="mb-1">© 2025 UMADEUS. Todos os direitos reservados.</p>
      <p className="space-x-2">
        <a
          href="/loja/privacidade"
          className="underline underline-offset-4 hover:text-yellow-400 transition"
        >
          Política de Privacidade
        </a>
        <span>|</span>
        <a
          href="/loja/termos"
          className="underline underline-offset-4 hover:text-yellow-400 transition"
        >
          Termos de Uso
        </a>
      </p>
    </footer>
  )
}
