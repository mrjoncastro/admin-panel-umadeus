'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/lib/context/ToastContext'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import type { VendedorForm } from '@/types'
import { logger } from '@/lib/logger'

export default function NovoVendedorPage() {
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const { authChecked } = useAuthGuard(['coordenador'])

  const [formData, setFormData] = useState<VendedorForm>({
    nome: '',
    email: '',
    telefone: '',
    cpf_cnpj: '',
    tipo_pessoa: 'fisica',
    razao_social: '',
    nome_fantasia: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    taxa_comissao: 15.0,
    bio: '',
    site_url: '',
    instagram: '',
    facebook: '',
    whatsapp: '',
    banco: '',
    agencia: '',
    conta: '',
    tipo_conta: 'corrente',
    pix_key: '',
    aceita_devolvidos: true,
    tempo_processamento: 2,
    politica_troca: '',
    politica_devolucao: '',
    cliente: ''
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleInputChange(field: keyof VendedorForm, value: any) {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {}

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.cpf_cnpj.trim()) {
      newErrors.cpf_cnpj = 'CPF/CNPJ é obrigatório'
    }

    if (formData.tipo_pessoa === 'juridica' && !formData.razao_social?.trim()) {
      newErrors.razao_social = 'Razão social é obrigatória para pessoa jurídica'
    }

    if (formData.taxa_comissao < 0 || formData.taxa_comissao > 100) {
      newErrors.taxa_comissao = 'Taxa de comissão deve estar entre 0% e 100%'
    }

    if (formData.tempo_processamento < 1) {
      newErrors.tempo_processamento = 'Tempo de processamento deve ser pelo menos 1 dia'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!validateForm()) {
      showError('Por favor, corrija os erros no formulário')
      return
    }

    try {
      setLoading(true)

      const res = await fetch('/admin/api/vendedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao cadastrar vendedor')
      }

      showSuccess('Vendedor cadastrado com sucesso!')
      router.push('/admin/vendedores')
    } catch (err) {
      logger.error('Erro ao cadastrar vendedor:', err)
      showError('Erro ao cadastrar vendedor')
    } finally {
      setLoading(false)
    }
  }

  if (!authChecked) return null

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
          Novo Vendedor
        </h2>
        <p className="text-gray-600 mt-2">
          Cadastre um novo vendedor para o marketplace
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informações Básicas */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nome *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                className={`input w-full ${errors.nome ? 'border-red-500' : ''}`}
                placeholder="Nome do vendedor"
              />
              {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`input w-full ${errors.email ? 'border-red-500' : ''}`}
                placeholder="email@exemplo.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Telefone
              </label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                className="input w-full"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tipo de Pessoa *
              </label>
              <select
                value={formData.tipo_pessoa}
                onChange={(e) => handleInputChange('tipo_pessoa', e.target.value as 'fisica' | 'juridica')}
                className="input w-full"
              >
                <option value="fisica">Pessoa Física</option>
                <option value="juridica">Pessoa Jurídica</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                CPF/CNPJ *
              </label>
              <input
                type="text"
                value={formData.cpf_cnpj}
                onChange={(e) => handleInputChange('cpf_cnpj', e.target.value)}
                className={`input w-full ${errors.cpf_cnpj ? 'border-red-500' : ''}`}
                placeholder={formData.tipo_pessoa === 'fisica' ? '000.000.000-00' : '00.000.000/0000-00'}
              />
              {errors.cpf_cnpj && <p className="text-red-500 text-sm mt-1">{errors.cpf_cnpj}</p>}
            </div>

            {formData.tipo_pessoa === 'juridica' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Razão Social *
                  </label>
                  <input
                    type="text"
                    value={formData.razao_social}
                    onChange={(e) => handleInputChange('razao_social', e.target.value)}
                    className={`input w-full ${errors.razao_social ? 'border-red-500' : ''}`}
                    placeholder="Razão social da empresa"
                  />
                  {errors.razao_social && <p className="text-red-500 text-sm mt-1">{errors.razao_social}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nome Fantasia
                  </label>
                  <input
                    type="text"
                    value={formData.nome_fantasia}
                    onChange={(e) => handleInputChange('nome_fantasia', e.target.value)}
                    className="input w-full"
                    placeholder="Nome fantasia da empresa"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Endereço */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Endereço</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Endereço
              </label>
              <input
                type="text"
                value={formData.endereco}
                onChange={(e) => handleInputChange('endereco', e.target.value)}
                className="input w-full"
                placeholder="Rua, número, complemento"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                CEP
              </label>
              <input
                type="text"
                value={formData.cep}
                onChange={(e) => handleInputChange('cep', e.target.value)}
                className="input w-full"
                placeholder="00000-000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Cidade
              </label>
              <input
                type="text"
                value={formData.cidade}
                onChange={(e) => handleInputChange('cidade', e.target.value)}
                className="input w-full"
                placeholder="Cidade"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Estado
              </label>
              <input
                type="text"
                value={formData.estado}
                onChange={(e) => handleInputChange('estado', e.target.value)}
                className="input w-full"
                placeholder="SP"
                maxLength={2}
              />
            </div>
          </div>
        </div>

        {/* Configurações de Vendas */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Configurações de Vendas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Taxa de Comissão (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.taxa_comissao}
                onChange={(e) => handleInputChange('taxa_comissao', parseFloat(e.target.value) || 0)}
                className={`input w-full ${errors.taxa_comissao ? 'border-red-500' : ''}`}
              />
              {errors.taxa_comissao && <p className="text-red-500 text-sm mt-1">{errors.taxa_comissao}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tempo de Processamento (dias úteis)
              </label>
              <input
                type="number"
                min="1"
                value={formData.tempo_processamento}
                onChange={(e) => handleInputChange('tempo_processamento', parseInt(e.target.value) || 1)}
                className={`input w-full ${errors.tempo_processamento ? 'border-red-500' : ''}`}
              />
              {errors.tempo_processamento && <p className="text-red-500 text-sm mt-1">{errors.tempo_processamento}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.aceita_devolvidos}
                  onChange={(e) => handleInputChange('aceita_devolvidos', e.target.checked)}
                  className="mr-2"
                />
                Aceita produtos devolvidos
              </label>
            </div>
          </div>
        </div>

        {/* Dados Bancários */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Dados Bancários</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Banco
              </label>
              <input
                type="text"
                value={formData.banco}
                onChange={(e) => handleInputChange('banco', e.target.value)}
                className="input w-full"
                placeholder="Nome do banco"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tipo de Conta
              </label>
              <select
                value={formData.tipo_conta}
                onChange={(e) => handleInputChange('tipo_conta', e.target.value as 'corrente' | 'poupanca')}
                className="input w-full"
              >
                <option value="corrente">Conta Corrente</option>
                <option value="poupanca">Conta Poupança</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Agência
              </label>
              <input
                type="text"
                value={formData.agencia}
                onChange={(e) => handleInputChange('agencia', e.target.value)}
                className="input w-full"
                placeholder="0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Conta
              </label>
              <input
                type="text"
                value={formData.conta}
                onChange={(e) => handleInputChange('conta', e.target.value)}
                className="input w-full"
                placeholder="00000-0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Chave PIX
              </label>
              <input
                type="text"
                value={formData.pix_key}
                onChange={(e) => handleInputChange('pix_key', e.target.value)}
                className="input w-full"
                placeholder="CPF, email ou chave aleatória"
              />
            </div>
          </div>
        </div>

        {/* Redes Sociais */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Redes Sociais e Contato</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Site
              </label>
              <input
                type="url"
                value={formData.site_url}
                onChange={(e) => handleInputChange('site_url', e.target.value)}
                className="input w-full"
                placeholder="https://www.exemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                WhatsApp
              </label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                className="input w-full"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Instagram
              </label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => handleInputChange('instagram', e.target.value)}
                className="input w-full"
                placeholder="@usuario"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Facebook
              </label>
              <input
                type="text"
                value={formData.facebook}
                onChange={(e) => handleInputChange('facebook', e.target.value)}
                className="input w-full"
                placeholder="facebook.com/usuario"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              Biografia
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="input w-full h-24"
              placeholder="Conte um pouco sobre o vendedor..."
            />
          </div>
        </div>

        {/* Políticas */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Políticas</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Política de Troca
              </label>
              <textarea
                value={formData.politica_troca}
                onChange={(e) => handleInputChange('politica_troca', e.target.value)}
                className="input w-full h-24"
                placeholder="Descreva a política de troca..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Política de Devolução
              </label>
              <textarea
                value={formData.politica_devolucao}
                onChange={(e) => handleInputChange('politica_devolucao', e.target.value)}
                className="input w-full h-24"
                placeholder="Descreva a política de devolução..."
              />
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar Vendedor'}
          </button>
        </div>
      </form>
    </main>
  )
}