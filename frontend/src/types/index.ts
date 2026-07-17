export interface Pessoa {
  id: number
  nome: string
  idade: number
}

export interface CriarPessoa {
  nome: string
  idade: number
}

export type TipoTransacao = 'Despesa' | 'Receita'

export interface Transacao {
  id: number
  descricao: string
  valor: number
  tipo: TipoTransacao
  pessoaId: number
  pessoaNome: string
}

export interface CriarTransacao {
  descricao: string
  valor: number
  tipo: TipoTransacao
  pessoaId: number
}

export interface TotalPessoa {
  pessoaId: number
  pessoaNome: string
  totalReceitas: number
  totalDespesas: number
  saldo: number
}

export interface ResumoTotais {
  pessoas: TotalPessoa[]
  totalReceitas: number
  totalDespesas: number
  saldo: number
}
