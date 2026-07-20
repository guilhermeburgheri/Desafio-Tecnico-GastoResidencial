import { useEffect, useState, type FormEvent } from 'react'
import {
  consultarTotais,
  criarPessoa,
  criarTransacao,
  excluirPessoa,
  listarPessoas,
  listarTransacoes,
} from './api/api'
import type {
  CriarPessoa,
  CriarTransacao,
  Pessoa,
  ResumoTotais,
  TipoTransacao,
  Transacao,
} from './types'
import './App.css'

type Secao = 'pessoas' | 'transacoes' | 'totais'

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

function obterMensagemErro(erro: unknown): string {
  if (erro instanceof Error) {
    return erro.message
  }

  return 'Ocorreu um erro inesperado.'
}

function obterClasseSaldo(saldo: number): string {
  if (saldo > 0) {
    return 'valor-positivo'
  }

  if (saldo < 0) {
    return 'valor-negativo'
  }

  return 'valor-neutro'
}

function App() {
  const [secaoAtiva, setSecaoAtiva] = useState<Secao>('pessoas')

  const [pessoas, setPessoas] = useState<Pessoa[]>([])
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [resumoTotais, setResumoTotais] =
    useState<ResumoTotais | null>(null)

  const [nome, setNome] = useState('')
  const [idade, setIdade] = useState('')

  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [tipo, setTipo] = useState<TipoTransacao>('Despesa')
  const [pessoaId, setPessoaId] = useState('')

  const [carregando, setCarregando] = useState(true)
  const [carregandoTotais, setCarregandoTotais] = useState(false)
  const [salvandoPessoa, setSalvandoPessoa] = useState(false)
  const [salvandoTransacao, setSalvandoTransacao] = useState(false)
  const [excluindoId, setExcluindoId] = useState<number | null>(null)

  const [mensagemSucesso, setMensagemSucesso] = useState('')
  const [mensagemErro, setMensagemErro] = useState('')

  const pessoaSelecionada = pessoas.find(
    (pessoa) => pessoa.id === Number(pessoaId),
  )

  const pessoaSelecionadaMenor =
    pessoaSelecionada !== undefined && pessoaSelecionada.idade < 18

  useEffect(() => {
    async function carregarDados() {
      try {
        const [pessoasCadastradas, transacoesCadastradas] =
          await Promise.all([
            listarPessoas(),
            listarTransacoes(),
          ])

        setPessoas(pessoasCadastradas)
        setTransacoes(transacoesCadastradas)

        // Primeira pessoa disponível.
        if (pessoasCadastradas.length > 0) {
          setPessoaId(String(pessoasCadastradas[0].id))
        }
      } catch (erro) {
        setMensagemErro(obterMensagemErro(erro))
      } finally {
        setCarregando(false)
      }
    }

    void carregarDados()
  }, [])

  async function carregarTotais() {
    setMensagemErro('')
    setCarregandoTotais(true)

    try {
      const totaisConsultados = await consultarTotais()
      setResumoTotais(totaisConsultados)
    } catch (erro) {
      setMensagemErro(obterMensagemErro(erro))
    } finally {
      setCarregandoTotais(false)
    }
  }

  function trocarSecao(secao: Secao) {
    setSecaoAtiva(secao)
    setMensagemSucesso('')
    setMensagemErro('')

    if (secao === 'totais') {
      void carregarTotais()
    }
  }

  async function cadastrarPessoa(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setMensagemSucesso('')
    setMensagemErro('')

    const nomeNormalizado = nome.trim()
    const idadeNumerica = Number(idade)

    if (nomeNormalizado.length < 2 || nomeNormalizado.length > 100) {
      setMensagemErro('O nome deve ter entre 2 e 100 caracteres.')
      return
    }

    if (
      idade.trim() === '' ||
      !Number.isInteger(idadeNumerica) ||
      idadeNumerica < 0 ||
      idadeNumerica > 150
    ) {
      setMensagemErro('A idade deve ser um número inteiro entre 0 e 150.')
      return
    }

    const novaPessoa: CriarPessoa = {
      nome: nomeNormalizado,
      idade: idadeNumerica,
    }

    try {
      setSalvandoPessoa(true)

      const pessoaCriada = await criarPessoa(novaPessoa)

      setPessoas((pessoasAtuais) =>
        [...pessoasAtuais, pessoaCriada].sort(
          (primeiraPessoa, segundaPessoa) =>
            primeiraPessoa.id - segundaPessoa.id,
        ),
      )

      if (pessoas.length === 0) {
        setPessoaId(String(pessoaCriada.id))
      }

      setResumoTotais(null)

      setNome('')
      setIdade('')
      setMensagemSucesso(
        `Pessoa "${pessoaCriada.nome}" cadastrada com sucesso.`,
      )
    } catch (erro) {
      setMensagemErro(obterMensagemErro(erro))
    } finally {
      setSalvandoPessoa(false)
    }
  }

  async function removerPessoa(pessoa: Pessoa) {
    const confirmouExclusao = window.confirm(
      `Deseja excluir "${pessoa.nome}"?\n\n` +
        'Todas as transações dessa pessoa também serão excluídas.',
    )

    if (!confirmouExclusao) {
      return
    }

    setMensagemSucesso('')
    setMensagemErro('')

    try {
      setExcluindoId(pessoa.id)

      await excluirPessoa(pessoa.id)

      const pessoasRestantes = pessoas.filter(
        (pessoaAtual) => pessoaAtual.id !== pessoa.id,
      )

      setPessoas(pessoasRestantes)

      // Frontend sincronizado com o banco de dados.
      setTransacoes((transacoesAtuais) =>
        transacoesAtuais.filter(
          (transacao) => transacao.pessoaId !== pessoa.id,
        ),
      )

      if (Number(pessoaId) === pessoa.id) {
        const proximaPessoa = pessoasRestantes[0]

        if (proximaPessoa) {
          setPessoaId(String(proximaPessoa.id))

          if (proximaPessoa.idade < 18) {
            setTipo('Despesa')
          }
        } else {
          setPessoaId('')
          setTipo('Despesa')
        }
      }

      // A exclusão altera os totais individuais e gerais.
      setResumoTotais(null)

      setMensagemSucesso(
        `Pessoa "${pessoa.nome}" excluída com sucesso.`,
      )
    } catch (erro) {
      setMensagemErro(obterMensagemErro(erro))
    } finally {
      setExcluindoId(null)
    }
  }

  function alterarPessoaSelecionada(novoPessoaId: string) {
    setPessoaId(novoPessoaId)

    const novaPessoaSelecionada = pessoas.find(
      (pessoa) => pessoa.id === Number(novoPessoaId),
    )

    if (novaPessoaSelecionada && novaPessoaSelecionada.idade < 18) {
      setTipo('Despesa')
    }
  }

  async function cadastrarTransacao(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setMensagemSucesso('')
    setMensagemErro('')

    const descricaoNormalizada = descricao.trim()

    // Aceita , ou .
    const valorNormalizado = valor.trim().replace(',', '.')
    const valorNumerico = Number(valorNormalizado)
    const pessoaIdNumerico = Number(pessoaId)

    if (
      descricaoNormalizada.length < 2 ||
      descricaoNormalizada.length > 150
    ) {
      setMensagemErro(
        'A descrição deve ter entre 2 e 150 caracteres.',
      )
      return
    }

    if (
      !Number.isFinite(valorNumerico) ||
      valorNumerico <= 0 ||
      valorNumerico > 999999999.99
    ) {
      setMensagemErro('O valor deve ser maior que zero.')
      return
    }

    if (
      !Number.isInteger(pessoaIdNumerico) ||
      !pessoas.some((pessoa) => pessoa.id === pessoaIdNumerico)
    ) {
      setMensagemErro('Selecione uma pessoa válida.')
      return
    }

    if (pessoaSelecionadaMenor && tipo === 'Receita') {
      setMensagemErro(
        'Pessoas menores de 18 anos podem cadastrar somente despesas.',
      )
      return
    }

    const novaTransacao: CriarTransacao = {
      descricao: descricaoNormalizada,
      valor: valorNumerico,
      tipo,
      pessoaId: pessoaIdNumerico,
    }

    try {
      setSalvandoTransacao(true)

      const transacaoCriada = await criarTransacao(novaTransacao)

      setTransacoes((transacoesAtuais) =>
        [...transacoesAtuais, transacaoCriada].sort(
          (primeiraTransacao, segundaTransacao) =>
            primeiraTransacao.id - segundaTransacao.id,
        ),
      )

      // A nova transação altera receitas, despesas e saldo.
      setResumoTotais(null)

      setDescricao('')
      setValor('')
      setMensagemSucesso(
        `Transação "${transacaoCriada.descricao}" cadastrada com sucesso.`,
      )
    } catch (erro) {
      setMensagemErro(obterMensagemErro(erro))
    } finally {
      setSalvandoTransacao(false)
    }
  }

  function obterNomePessoa(pessoaIdTransacao: number): string {
    const pessoa = pessoas.find(
      (pessoaAtual) => pessoaAtual.id === pessoaIdTransacao,
    )

    return pessoa?.nome ?? 'Pessoa não encontrada'
  }

  return (
    <main className="app">
      <header className="app-cabecalho">
        <h1>Controle de Gastos Residenciais</h1>
        <p>Gerencie as pessoas e as transações da residência.</p>
      </header>

      <nav className="abas" aria-label="Seções do sistema">
        <button
          className={`aba ${
            secaoAtiva === 'pessoas' ? 'aba-ativa' : ''
          }`}
          type="button"
          onClick={() => trocarSecao('pessoas')}
        >
          Pessoas
        </button>

        <button
          className={`aba ${
            secaoAtiva === 'transacoes' ? 'aba-ativa' : ''
          }`}
          type="button"
          onClick={() => trocarSecao('transacoes')}
        >
          Transações
        </button>

        <button
          className={`aba ${
            secaoAtiva === 'totais' ? 'aba-ativa' : ''
          }`}
          type="button"
          onClick={() => trocarSecao('totais')}
        >
          Totais
        </button>
      </nav>

      <div className="mensagens" aria-live="polite">
        {mensagemSucesso && (
          <p className="mensagem mensagem-sucesso" role="status">
            {mensagemSucesso}
          </p>
        )}

        {mensagemErro && (
          <p className="mensagem mensagem-erro" role="alert">
            {mensagemErro}
          </p>
        )}
      </div>

      {carregando ? (
        <section className="cartao">
          <p className="estado-lista">Carregando dados...</p>
        </section>
      ) : secaoAtiva === 'pessoas' ? (
        <div className="conteudo">
          <section className="cartao">
            <h2>Cadastrar pessoa</h2>

            <form className="formulario" onSubmit={cadastrarPessoa}>
              <div className="campo">
                <label htmlFor="nome">Nome</label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  minLength={2}
                  maxLength={100}
                  disabled={salvandoPessoa}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="campo">
                <label htmlFor="idade">Idade</label>
                <input
                  id="idade"
                  name="idade"
                  type="number"
                  value={idade}
                  onChange={(event) => setIdade(event.target.value)}
                  min={0}
                  max={150}
                  step={1}
                  disabled={salvandoPessoa}
                  required
                />
              </div>

              <button
                className="botao botao-primario"
                type="submit"
                disabled={salvandoPessoa}
              >
                {salvandoPessoa
                  ? 'Cadastrando...'
                  : 'Cadastrar'}
              </button>
            </form>
          </section>

          <section className="cartao">
            <div className="lista-cabecalho">
              <h2>Pessoas cadastradas</h2>
              <span className="contador">{pessoas.length}</span>
            </div>

            {pessoas.length === 0 ? (
              <p className="estado-lista">
                Nenhuma pessoa cadastrada.
              </p>
            ) : (
              <ul className="lista-registros">
                {pessoas.map((pessoa) => (
                  <li className="pessoa-item" key={pessoa.id}>
                    <div className="registro-dados">
                      <strong>{pessoa.nome}</strong>

                      <span>
                        ID {pessoa.id} ·{' '}
                        {pessoa.idade === 1
                          ? '1 ano'
                          : `${pessoa.idade} anos`}
                      </span>
                    </div>

                    <button
                      className="botao botao-excluir"
                      type="button"
                      onClick={() => void removerPessoa(pessoa)}
                      disabled={excluindoId !== null}
                      aria-label={`Excluir ${pessoa.nome}`}
                    >
                      {excluindoId === pessoa.id
                        ? 'Excluindo...'
                        : 'Excluir'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : secaoAtiva === 'transacoes' ? (
        <div className="conteudo">
          <section className="cartao">
            <h2>Cadastrar transação</h2>

            {pessoas.length === 0 ? (
              <p className="aviso">
                Cadastre uma pessoa antes de registrar transações.
              </p>
            ) : (
              <form
                className="formulario"
                onSubmit={cadastrarTransacao}
              >
                <div className="campo">
                  <label htmlFor="pessoa">Pessoa</label>
                  <select
                    id="pessoa"
                    name="pessoa"
                    value={pessoaId}
                    onChange={(event) =>
                      alterarPessoaSelecionada(event.target.value)
                    }
                    disabled={salvandoTransacao}
                    required
                  >
                    {pessoas.map((pessoa) => (
                      <option key={pessoa.id} value={pessoa.id}>
                        {pessoa.nome} — {pessoa.idade}{' '}
                        {pessoa.idade === 1 ? 'ano' : 'anos'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="campo">
                  <label htmlFor="descricao">Descrição</label>
                  <input
                    id="descricao"
                    name="descricao"
                    type="text"
                    value={descricao}
                    onChange={(event) =>
                      setDescricao(event.target.value)
                    }
                    minLength={2}
                    maxLength={150}
                    disabled={salvandoTransacao}
                    required
                  />
                </div>

                <div className="campo">
                  <label htmlFor="valor">Valor</label>
                  <input
                    id="valor"
                    name="valor"
                    type="text"
                    inputMode="decimal"
                    value={valor}
                    onChange={(event) =>
                      setValor(event.target.value)
                    }
                    placeholder="Ex.: 150,50"
                    disabled={salvandoTransacao}
                    required
                  />

                  <span className="ajuda-campo">
                    Informe apenas valores positivos.
                  </span>
                </div>

                <div className="campo">
                  <label htmlFor="tipo">Tipo</label>
                  <select
                    id="tipo"
                    name="tipo"
                    value={tipo}
                    onChange={(event) =>
                      setTipo(
                        event.target.value as TipoTransacao,
                      )
                    }
                    disabled={salvandoTransacao}
                    required
                  >
                    <option value="Despesa">Despesa</option>

                    <option
                      value="Receita"
                      disabled={pessoaSelecionadaMenor}
                    >
                      Receita
                    </option>
                  </select>

                  {pessoaSelecionadaMenor && (
                    <span className="ajuda-campo">
                      Menores de 18 anos podem cadastrar somente despesas.
                    </span>
                  )}
                </div>

                <button
                  className="botao botao-primario"
                  type="submit"
                  disabled={salvandoTransacao}
                >
                  {salvandoTransacao
                    ? 'Cadastrando...'
                    : 'Cadastrar'}
                </button>
              </form>
            )}
          </section>

          <section className="cartao">
            <div className="lista-cabecalho">
              <h2>Transações cadastradas</h2>
              <span className="contador">{transacoes.length}</span>
            </div>

            {transacoes.length === 0 ? (
              <p className="estado-lista">
                Nenhuma transação cadastrada.
              </p>
            ) : (
              <ul className="lista-registros">
                {transacoes.map((transacao) => (
                  <li
                    className="transacao-item"
                    key={transacao.id}
                  >
                    <div className="registro-dados">
                      <strong>{transacao.descricao}</strong>

                      <span>
                        ID {transacao.id} ·{' '}
                        {obterNomePessoa(transacao.pessoaId)}
                      </span>
                    </div>

                    <div className="transacao-resumo">
                      <strong>
                        {formatadorMoeda.format(transacao.valor)}
                      </strong>

                      <span
                        className={`tipo-transacao ${
                          transacao.tipo === 'Receita'
                            ? 'tipo-receita'
                            : 'tipo-despesa'
                        }`}
                      >
                        {transacao.tipo}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : (
        <section className="totais-secao">
          <div className="totais-cabecalho">
            <div>
              <h2>Totais da residência</h2>
              <p>
                Receitas, despesas e saldo de cada pessoa.
              </p>
            </div>

            <button
              className="botao botao-secundario"
              type="button"
              onClick={() => void carregarTotais()}
              disabled={carregandoTotais}
            >
              {carregandoTotais ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>

          {carregandoTotais ? (
            <section className="cartao">
              <p className="estado-lista">
                Calculando totais...
              </p>
            </section>
          ) : resumoTotais === null ? (
            <section className="cartao">
              <p className="estado-lista">
                Não foi possível carregar os totais.
              </p>
            </section>
          ) : (
            <>
              <div className="resumo-geral">
                <article className="cartao-total">
                  <span className="rotulo-total">
                    Receitas gerais
                  </span>

                  <strong className="valor-positivo">
                    {formatadorMoeda.format(
                      resumoTotais.totalReceitas,
                    )}
                  </strong>
                </article>

                <article className="cartao-total">
                  <span className="rotulo-total">
                    Despesas gerais
                  </span>

                  <strong className="valor-negativo">
                    {formatadorMoeda.format(
                      resumoTotais.totalDespesas,
                    )}
                  </strong>
                </article>

                <article className="cartao-total">
                  <span className="rotulo-total">
                    Saldo geral
                  </span>

                  <strong
                    className={obterClasseSaldo(
                      resumoTotais.saldo,
                    )}
                  >
                    {formatadorMoeda.format(resumoTotais.saldo)}
                  </strong>
                </article>
              </div>

              <section className="cartao">
                <div className="lista-cabecalho">
                  <h2>Totais por pessoa</h2>

                  <span className="contador">
                    {resumoTotais.pessoas.length}
                  </span>
                </div>

                {resumoTotais.pessoas.length === 0 ? (
                  <p className="estado-lista">
                    Nenhuma pessoa cadastrada.
                  </p>
                ) : (
                  <div className="tabela-container">
                    <table className="tabela-totais">
                      <thead>
                        <tr>
                          <th>Pessoa</th>
                          <th>Receitas</th>
                          <th>Despesas</th>
                          <th>Saldo</th>
                        </tr>
                      </thead>

                      <tbody>
                        {resumoTotais.pessoas.map((totalPessoa) => (
                          <tr key={totalPessoa.pessoaId}>
                            <td>
                              <strong>
                                {totalPessoa.pessoaNome}
                              </strong>

                              <span>
                                ID {totalPessoa.pessoaId}
                              </span>
                            </td>

                            <td className="valor-positivo">
                              {formatadorMoeda.format(
                                totalPessoa.totalReceitas,
                              )}
                            </td>

                            <td className="valor-negativo">
                              {formatadorMoeda.format(
                                totalPessoa.totalDespesas,
                              )}
                            </td>

                            <td
                              className={obterClasseSaldo(
                                totalPessoa.saldo,
                              )}
                            >
                              {formatadorMoeda.format(
                                totalPessoa.saldo,
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </section>
      )}
    </main>
  )
}

export default App
