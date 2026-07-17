import type {
  CriarPessoa,
  CriarTransacao,
  Pessoa,
  ResumoTotais,
  Transacao,
} from '../types'

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5045'
).replace(/\/$/, '')

interface ApiErrorResponse {
  mensagem?: string
  title?: string
  errors?: Record<string, string[]>
}

async function request<T>(
  caminho: string,
  options?: RequestInit,
): Promise<T> {
  const headers = new Headers(options?.headers)

  if (options?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_URL}${caminho}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let mensagem = `Erro ao comunicar com a API. Status: ${response.status}.`

    try {
      const erro = (await response.json()) as ApiErrorResponse

      if (erro.mensagem) {
        mensagem = erro.mensagem
      } else if (erro.errors) {
        mensagem = Object.values(erro.errors)
          .flat()
          .join(' ')
      } else if (erro.title) {
        mensagem = erro.title
      }
    } catch {
      // Mensagem padrão.
    }

    throw new Error(mensagem)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export function listarPessoas(): Promise<Pessoa[]> {
  return request<Pessoa[]>('/api/pessoas')
}

export function criarPessoa(
  dados: CriarPessoa,
): Promise<Pessoa> {
  return request<Pessoa>('/api/pessoas', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export function excluirPessoa(id: number): Promise<void> {
  return request<void>(`/api/pessoas/${id}`, {
    method: 'DELETE',
  })
}

export function listarTransacoes(): Promise<Transacao[]> {
  return request<Transacao[]>('/api/transacoes')
}

export function criarTransacao(
  dados: CriarTransacao,
): Promise<Transacao> {
  return request<Transacao>('/api/transacoes', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export function consultarTotais(): Promise<ResumoTotais> {
  return request<ResumoTotais>('/api/totais')
}
