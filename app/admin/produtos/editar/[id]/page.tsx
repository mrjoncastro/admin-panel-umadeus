'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthContext } from '@/lib/context/AuthContext'
import { calculateGross } from '@/lib/asaasFees'
import LoadingOverlay from '@/components/organisms/LoadingOverlay'
import { useToast } from '@/lib/context/ToastContext'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'

interface Categoria {
  id: string
  nome: string
  slug: string
}

// Função para gerar slug automático
function slugify(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .replace(/-+/g, '-')
}

export default function EditarProdutoPage() {
  const { id } = useParams<{ id: string }>()
  const { user: ctxUser, isLoggedIn } = useAuthContext()
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const { authChecked } = useAuthGuard(['coordenador'])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [selectedCategoria, setSelectedCategoria] = useState<string>('')
  const [initial, setInitial] = useState<Record<string, unknown> | null>(null)
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [cores, setCores] = useState<string[]>([])
  const [tamanhos, setTamanhos] = useState<string[]>([])
  const [generos, setGeneros] = useState<string[]>([])
  const inputHex = useRef<HTMLInputElement | null>(null)
  const [valorCliente, setValorCliente] = useState(
    calculateGross(Number(initial?.preco ?? 0), 'pix', 1).gross,
  )

  useEffect(() => {
    setValorCliente(calculateGross(Number(initial?.preco ?? 0), 'pix', 1).gross)
  }, [initial?.preco])

  useEffect(() => {
    if (!authChecked) return
    if (!isLoggedIn || ctxUser?.role !== 'coordenador') {
      router.replace('/login')
    }
  }, [isLoggedIn, router, ctxUser?.role, authChecked])

  useEffect(() => {
    if (!authChecked) return
    if (!isLoggedIn || ctxUser?.role !== 'coordenador') return
    fetch('/admin/api/categorias')
      .then((r) => r.json())
      .then((data) => {
        setCategorias(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        setCategorias([])
      })
    fetch(`/admin/api/produtos/${id}`)
      .then(async (r) => {
        if (r.status === 401) {
          router.replace('/login')
          return null
        }
        return r.json()
      })
      .then((data) => {
        if (!data) return
        const tams = Array.isArray(data.tamanhos)
          ? data.tamanhos
          : typeof data.tamanhos === 'string'
            ? data.tamanhos.split(',').map((s: string) => s.trim())
            : []
        const gens = Array.isArray(data.generos)
          ? data.generos
          : typeof data.generos === 'string'
            ? [data.generos.trim()]
            : []

        setTamanhos(
          tams.map((t: string) => t.trim().toUpperCase()).filter(Boolean),
        )
        setGeneros(
          gens.map((g: string) => g.trim().toLowerCase()).filter(Boolean),
        )

        setInitial({
          nome: data.nome,
          preco: data.preco,
          descricao: data.descricao,
          detalhes: data.detalhes,
          tamanhos: tams,
          generos: gens,
          categoria: data.categoria,
          ativo: data.ativo,
          cores:
            typeof data.cores === 'string'
              ? data.cores
              : Array.isArray(data.cores)
                ? data.cores.join(', ')
                : '',
          imagens: data.imagens,
        })
        setExistingImages(Array.isArray(data.imagens) ? data.imagens : [])
        setSelectedCategoria(
          Array.isArray(data.categoria)
            ? (data.categoria[0] ?? '')
            : data.categoria,
        )
      })
      .finally(() => setLoading(false))
  }, [id, isLoggedIn, router, ctxUser?.role, authChecked])

  useEffect(() => {
    if (initial?.cores && typeof initial.cores === 'string') {
      setCores(
        initial.cores
          .split(',')
          .map((c: string) => c.trim())
          .filter(Boolean),
      )
    } else if (Array.isArray(initial?.cores)) {
      setCores(initial.cores as string[])
    }
    if (initial?.categoria) {
      setSelectedCategoria(
        Array.isArray(initial.categoria)
          ? (initial.categoria[0] ?? '')
          : (initial.categoria as string),
      )
    }
  }, [initial?.cores, initial?.categoria])
  if (loading || !initial) {
    return <LoadingOverlay show={true} text="Carregando..." />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const formElement = e.currentTarget as HTMLFormElement
    const formData = new FormData(formElement)

    const slug = slugify(formElement.nome.value)
    formData.set('slug', slug)

    // Tratamento específico para o campo de imagens
    const imagensInput = formElement.querySelector<HTMLInputElement>(
      "input[name='imagens']",
    )
    const arquivos = imagensInput?.files
    formData.delete('imagens')
    if (arquivos && arquivos.length > 0) {
      Array.from(arquivos).forEach((file) => {
        formData.append('imagens', file)
      })
    } else {
      existingImages.forEach((img) => formData.append('imagens', img))
    }

    // Trata o campo de cores: insere como string separada por vírgula
    formData.set('cores', cores.join(','))
    // Normaliza checkboxes e arrays
    const ativoChecked = formElement.querySelector<HTMLInputElement>(
      "input[name='ativo']",
    )?.checked
    formData.set('ativo', ativoChecked ? 'true' : 'false')

    const tamanhos = Array.from(
      formElement.querySelectorAll<HTMLInputElement>(
        "input[name='tamanhos']:checked",
      ),
    ).map((el) => el.value)
    formData.delete('tamanhos')
    tamanhos.forEach((t) => formData.append('tamanhos', t))

    const generos = Array.from(
      formElement.querySelectorAll<HTMLInputElement>(
        "input[name='generos']:checked",
      ),
    ).map((el) => el.value)
    formData.delete('generos')
    generos.forEach((g) => formData.append('generos', g))

    // Categoria enviada sempre pelo id
    const catValue = selectedCategoria
    formData.delete('categoria')
    if (catValue) {
      formData.append('categoria', catValue)
    }

    // <<< AQUI O CONSOLE!
    console.log('---- FormData a ser enviado ----')
    for (const [key, value] of formData.entries()) {
      console.log(key, value)
    }
    console.log('-------------------------------')

    try {
      const res = await fetch(`/admin/api/produtos/${id}`, {
        method: 'PUT',
        body: formData,
        headers: {},
      })
      if (res.ok) {
        showSuccess('Produto atualizado')
        router.push('/admin/produtos')
      } else {
        showError('Erro ao atualizar produto')
      }
    } catch (err) {
      console.error('Erro ao atualizar produto:', err)
      showError('Erro ao atualizar produto')
    }
  }

  function addCor(hex: string) {
    if (!hex || cores.includes(hex)) return
    setCores([...cores, hex])
    if (inputHex.current) inputHex.current.value = '#000000'
  }
  function removeCor(hex: string) {
    setCores(cores.filter((c) => c !== hex))
  }

  if (!authChecked) return null

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <h1
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        Editar Produto
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold">Informações básicas</legend>

          <input
            className="input-base"
            name="nome"
            placeholder="Ex: Camiseta Básica Preta"
            defaultValue={String(initial.nome)}
            maxLength={30}
            required
          />
          <input
            className="input-base"
            name="preco"
            type="number"
            step="0.01"
            placeholder="Ex: 39.90"
            defaultValue={String(initial.preco)}
            onChange={(e) =>
              setValorCliente(
                calculateGross(Number(e.target.value || 0), 'pix', 1).gross,
              )
            }
            required
          />
          <span className="text-xs text-gray-500 ml-1">
            Valor para o cliente: R$ {valorCliente.toFixed(2).replace('.', ',')}
          </span>
        </fieldset>

        {/* Categoria */}
        <fieldset>
          <legend className="text-lg font-semibold mb-2">Categoria</legend>
          <select
            name="categoria"
            value={selectedCategoria}
            onChange={(e) => setSelectedCategoria(e.target.value)}
            className="input-base w-full"
          >
            <option value="">Selecione a categoria</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-400 ml-1">
            Caso a categoria não exista, adicione pelo cadastro de categorias.
          </span>
        </fieldset>

        {/* Cores */}
        <fieldset>
          <legend className="text-lg font-semibold mb-2">Cores</legend>
          <div className="flex gap-2 items-center mb-2">
            <input
              type="color"
              ref={inputHex}
              defaultValue="#000000"
              className="w-10 h-10 border rounded cursor-pointer"
            />
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => {
                if (inputHex.current) addCor(inputHex.current.value)
              }}
            >
              Adicionar cor
            </button>
          </div>
          <div className="flex gap-2 flex-wrap mt-1">
            {cores.map((cor) => (
              <div key={cor} className="flex items-center gap-1">
                <span
                  className="w-7 h-7 rounded-full border border-gray-300 inline-block"
                  style={{ background: cor }}
                  title={cor}
                />
                <button
                  type="button"
                  className="text-xs text-red-600"
                  onClick={() => removeCor(cor)}
                  title="Remover"
                >
                  ×
                </button>
              </div>
            ))}
            {cores.length === 0 && (
              <span className="text-xs text-gray-500">
                Nenhuma cor selecionada
              </span>
            )}
          </div>
          <input type="hidden" name="cores" value={cores.join(',')} />
          <span className="text-xs text-gray-400 ml-1">
            Adicione as variações de cor do produto.
          </span>
        </fieldset>

        {/* Variações */}
        <fieldset>
          <legend className="text-lg font-semibold mb-2">Variações</legend>

          <div className="mb-4">
            <p className="text-sm font-semibold mb-1">Tamanhos</p>
            <div className="flex gap-2 flex-wrap">
              {['PP', 'P', 'M', 'G', 'GG'].map((t) => {
                const value = t.toUpperCase()
                return (
                  <label
                    key={value}
                    className="flex items-center gap-1 text-sm"
                  >
                    <input
                      type="checkbox"
                      name="tamanhos"
                      value={value}
                      checked={tamanhos
                        .map((x) => x.toUpperCase())
                        .includes(value)}
                      onChange={(e) =>
                        setTamanhos((prev) =>
                          e.target.checked
                            ? [...prev, value]
                            : prev.filter((v) => v.toUpperCase() !== value),
                        )
                      }
                    />
                    {value}
                  </label>
                )
              })}
            </div>
            <span className="text-xs text-gray-400 ml-1">
              Selecione todos os tamanhos disponíveis.
            </span>
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Gêneros</p>
            <div className="flex gap-2 flex-wrap">
              {['masculino', 'feminino'].map((g) => {
                const value = g.toLowerCase()
                return (
                  <label
                    key={value}
                    className="flex items-center gap-1 text-sm"
                  >
                    <input
                      type="checkbox"
                      name="generos"
                      value={value}
                      checked={generos
                        .map((x) => x.toLowerCase())
                        .includes(value)}
                      onChange={(e) =>
                        setGeneros((prev) =>
                          e.target.checked
                            ? [...prev, value]
                            : prev.filter((v) => v.toLowerCase() !== value),
                        )
                      }
                    />
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </label>
                )
              })}
            </div>
            <span className="text-xs text-gray-400 ml-1">
              Marque os públicos para o produto.
            </span>
          </div>
        </fieldset>

        {/* Descrição e Detalhes */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold mb-2">Descrição</legend>

          <textarea
            className="input-base"
            name="descricao"
            rows={2}
            placeholder="Ex: Camiseta 100% algodão, confortável, não desbota."
            defaultValue={String(initial.descricao || '')}
            maxLength={150}
            required
          />
          <span className="text-xs text-gray-400 ml-1">
            Breve descrição que será exibida na loja.
          </span>
          <textarea
            className="input-base"
            name="detalhes"
            rows={2}
            placeholder="Detalhes adicionais: tabela de medidas, instruções de lavagem, etc."
            defaultValue={String(initial.detalhes || '')}
          />
          <span className="text-xs text-gray-400 ml-1">
            Informações extras, se desejar.
          </span>
        </fieldset>

        {/* Upload de imagens */}
        <fieldset>
          <legend className="text-lg font-semibold mb-2">Imagens</legend>
          <input
            type="file"
            name="imagens"
            multiple
            accept="image/*"
            className="input-base"
          />
          <span className="text-xs text-gray-400 ml-1">
            Selecione uma ou mais imagens do produto.
          </span>
        </fieldset>

        {/* Produto ativo */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="ativo"
            defaultChecked={Boolean(initial.ativo)}
          />
          Produto ativo
        </label>

        {/* Ações */}
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary flex-1">
            Salvar
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/produtos')}
            className="btn flex-1"
          >
            Cancelar
          </button>
        </div>
      </form>
    </main>
  )
}
