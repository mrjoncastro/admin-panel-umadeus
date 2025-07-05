'use client'

import {
  useState,
  useEffect,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react'
import { fetchCep } from '@/utils/cep'
import { useAuthContext } from '@/lib/context/AuthContext'
import { useToast } from '@/lib/context/ToastContext'
import createPocketBase from '@/lib/pocketbase'
import { getAuthHeaders } from '@/lib/authHeaders'
import {
  FormField,
  TextField,
  InputWithMask,
  PasswordField,
} from '@/components'
import FormWizard, { WizardStep } from '../organisms/FormWizard'

export interface CreateUserFormHandle {
  submit: () => Promise<boolean>
}

interface CreateUserFormProps {
  onSuccess?: () => void
  children?: React.ReactNode
  initialCpf?: string
  initialEmail?: string
  initialCampo?: string
}

const CreateUserForm = forwardRef<CreateUserFormHandle, CreateUserFormProps>(
  function CreateUserForm(
    { onSuccess, children, initialCpf, initialEmail, initialCampo }: CreateUserFormProps,
    ref,
  ) {
  const { signUp, isLoggedIn } = useAuthContext()
  const pb = useMemo(() => createPocketBase(), [])

  const [campos, setCampos] = useState<{ id: string; nome: string }[]>([])
  const [campo, setCampo] = useState('')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cpf, setCpf] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [genero, setGenero] = useState('')
  const [cep, setCep] = useState('')
  const [endereco, setEndereco] = useState('')
  const [numero, setNumero] = useState('')
  const [bairro, setBairro] = useState('')
  const [estado, setEstado] = useState('')
  const [cidade, setCidade] = useState('')
  const [senha, setSenha] = useState('')
  const [senhaConfirm, setSenhaConfirm] = useState('')
  const { showError, showSuccess } = useToast()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialCpf) setCpf(initialCpf)
    if (initialEmail) setEmail(initialEmail)
  }, [initialCpf, initialEmail])

  useEffect(() => {
    if (initialCampo) setCampo(initialCampo)
  }, [initialCampo])

  useEffect(() => {
    async function loadCampos() {
      try {
        const resTenant = await fetch('/api/tenant', {
          headers: getAuthHeaders(pb),
          credentials: 'include',
        })
        const data = resTenant.ok ? await resTenant.json() : { tenantId: null }
        const tenantId = data.tenantId

        if (!tenantId) return

        const res = await fetch('/api/campos', {
          headers: getAuthHeaders(pb),
          credentials: 'include',
        })
        if (res.ok) {
          const data = await res.json()
          const lista = Array.isArray(data)
            ? data.map((item: { id: string; nome: string }) => ({
                id: item.id,
                nome: item.nome,
              }))
            : []
          setCampos(lista)
        }
      } catch {
        console.warn('Erro ao carregar os campos')
      }
    }

    loadCampos()
  }, [pb])

  useEffect(() => {
    async function lookup() {
      const data = await fetchCep(cep).catch(() => null)
      if (!data) {
        showError('CEP não encontrado.')
        setEndereco('')
        setCidade('')
        setEstado('')
        setBairro('')
        return
      }
      setEndereco(data.street)
      setCidade(data.city)
      setEstado(data.state)
      setBairro(data.neighborhood)
    }
    if (cep.replace(/\D/g, '').length === 8) lookup()
  }, [cep, showError])

  async function handleSubmit(): Promise<boolean> {
    if (senha.length < 8) {
      showError('A senha deve ter ao menos 8 caracteres.')
      return false
    }
    if (senha !== senhaConfirm) {
      showError('As senhas não coincidem.')
      return false
    }

    if (!campo) {
      showError('Selecione um campo.')
      return false
    }

    setLoading(true)
    try {
      await signUp(
        nome,
        email,
        telefone,
        cpf,
        dataNascimento,
        genero,
        endereco,
        numero,
        bairro,
        estado,
        cep,
        cidade,
        campo,
        senha,
      )
      showSuccess('Conta criada com sucesso!')
      setTimeout(() => {
        onSuccess?.()
      }, 500)
      return true
    } catch (err: unknown) {
      console.error('Erro no cadastro:', err)
      const message = err instanceof Error ? err.message : 'Não foi possível criar a conta.'
      showError(message)
      return false
    } finally {
      setLoading(false)
    }
  }
  const includeSenhaStep = !(initialCampo || isLoggedIn)

  const steps: WizardStep[] = [
    {
      title: 'Dados Pessoais',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nome completo" htmlFor="signup-nome">
            <TextField
              id="signup-nome"
              type="text"
              placeholder="Nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-md px-4 py-2"
              required
            />
          </FormField>
          <FormField label="E-mail" htmlFor="signup-email">
            <TextField
              id="signup-email"
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md px-4 py-2"
              required
              readOnly={Boolean(initialEmail)}
            />
          </FormField>
          <FormField label="Telefone" htmlFor="signup-telefone">
            <InputWithMask
              id="signup-telefone"
              type="text"
              mask="telefone"
              placeholder="Telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="w-full rounded-md px-4 py-2"
              required
            />
          </FormField>
          <FormField label="CPF" htmlFor="signup-cpf">
            <InputWithMask
              id="signup-cpf"
              type="text"
              mask="cpf"
              placeholder="CPF"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              className="w-full rounded-md px-4 py-2"
              required
              readOnly={Boolean(initialCpf)}
            />
          </FormField>
          <FormField label="Data de nascimento" htmlFor="signup-data">
            <TextField
              id="signup-data"
              type="date"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              className="w-full rounded-md px-4 py-2"
              required
            />
          </FormField>
          <FormField label="Gênero" htmlFor="signup-genero">
            <select
              id="signup-genero"
              value={genero}
              onChange={(e) => setGenero(e.target.value)}
              className="input-base w-full rounded-md px-4 py-2"
              required
            >
              <option value="">Selecione</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
            </select>
          </FormField>
        </div>
      ),
    },
    {
      title: 'Endereço',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="CEP" htmlFor="signup-cep">
            <TextField
              id="signup-cep"
              type="text"
              placeholder="CEP"
              value={cep}
              onChange={(e) => setCep(e.target.value)}
              className="w-full rounded-md px-4 py-2"
              required
            />
          </FormField>
          <FormField label="Endereço" htmlFor="signup-endereco">
            <TextField
              id="signup-endereco"
              type="text"
              placeholder="Endereço"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className="w-full rounded-md px-4 py-2"
              required
            />
          </FormField>
          <FormField label="Número" htmlFor="signup-numero">
            <TextField
              id="signup-numero"
              type="text"
              placeholder="Número"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="w-full rounded-md px-4 py-2"
              required
            />
          </FormField>
          <FormField label="Bairro" htmlFor="signup-bairro">
            <TextField
              id="signup-bairro"
              type="text"
              placeholder="Bairro"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              className="w-full rounded-md px-4 py-2"
              required
            />
          </FormField>
          <FormField label="Cidade" htmlFor="signup-cidade">
            <TextField
              id="signup-cidade"
              type="text"
              placeholder="Cidade"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              className="w-full rounded-md px-4 py-2"
              required
            />
          </FormField>
          <FormField label="Estado" htmlFor="signup-estado">
            <TextField
              id="signup-estado"
              type="text"
              placeholder="Estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full rounded-md px-4 py-2"
              required
            />
          </FormField>
        </div>
      ),
    },
    {
      title: 'Campo de Atuação',
      content: (
        <div className="space-y-4">
          <select
            value={campo}
            onChange={(e) => setCampo(e.target.value)}
            className="input-base w-full rounded-md px-4 py-2"
            required
            disabled={Boolean(initialCampo)}
          >
            <option value="">Selecione o campo</option>
            {campos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
      ),
    },
  ]

  if (includeSenhaStep) {
    steps.push({
      title: 'Senha',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Senha" htmlFor="signup-senha">
            <PasswordField
              id="signup-senha"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-md px-4 py-2"
              required
            />
          </FormField>
          <FormField label="Confirme a senha" htmlFor="signup-confirm">
            <PasswordField
              id="signup-confirm"
              placeholder="Confirme a senha"
              value={senhaConfirm}
              onChange={(e) => setSenhaConfirm(e.target.value)}
              className="w-full rounded-md px-4 py-2"
              required
            />
          </FormField>
        </div>
      ),
    })
  }

  steps.push({
    title: 'Revisão',
    content: (
      <div className="space-y-2 text-sm">
        <p>Nome: {nome}</p>
        <p>Email: {email}</p>
        <p>Telefone: {telefone}</p>
        <p>CPF: {cpf}</p>
        <p>Nascimento: {dataNascimento}</p>
        <p>Gênero: {genero}</p>
        <p>CEP: {cep}</p>
        <p>Endereço: {endereco}, {numero}</p>
        <p>Bairro: {bairro}</p>
        <p>Cidade/Estado: {cidade}/{estado}</p>
        <p>Campo: {campos.find((c) => c.id === campo)?.nome || campo}</p>
      </div>
    ),
  })

  const handleStepValidate = (index: number) => {
    const title = steps[index].title
    if (title === 'Senha') {
      if (senha.length < 8) {
        showError('A senha deve ter ao menos 8 caracteres.')
        return false
      }
      if (senha !== senhaConfirm) {
        showError('As senhas não coincidem.')
        return false
      }
    }
    if (title === 'Campo de Atuação' && !campo) {
      showError('Selecione um campo.')
      return false
    }
    return true
  }

  useImperativeHandle(ref, () => ({ submit: handleSubmit }))

  return (
    <div>
      <h2 className="text-2xl font-semibold text-center text-white mb-4">
        Criar Conta
      </h2>
      <FormWizard
        steps={steps}
        onFinish={handleSubmit}
        loading={loading}
        onStepValidate={handleStepValidate}
      />
      {children && (
        <div className="text-sm text-gray-300 text-center mt-4">{children}</div>
      )}
    </div>
  )
}
)
export default CreateUserForm
