import { useEffect, useState } from 'react'
import { listarPessoas } from './api/api'
import './App.css'

function App() {
  const [mensagem, setMensagem] = useState(
    'Verificando conexão com a API...',
  )
  const [quantidadePessoas, setQuantidadePessoas] = useState<
    number | null
  >(null)
  const [possuiErro, setPossuiErro] = useState(false)

  useEffect(() => {
    listarPessoas()
      .then((pessoas) => {
        setQuantidadePessoas(pessoas.length)
        setMensagem('API conectada com sucesso.')
      })
      .catch((erro: unknown) => {
        setPossuiErro(true)

        if (erro instanceof Error) {
          setMensagem(erro.message)
          return
        }

        setMensagem('Não foi possível acessar a API.')
      })
  }, [])

  return (
    <main className="pagina">
      <section className="cartao">
        <h1>Controle de Gastos Residenciais</h1>

        <p
          className={
            possuiErro
              ? 'mensagem mensagem-erro'
              : 'mensagem mensagem-sucesso'
          }
        >
          {mensagem}
        </p>

        {quantidadePessoas !== null && (
          <p>
            Pessoas cadastradas: <strong>{quantidadePessoas}</strong>
          </p>
        )}
      </section>
    </main>
  )
}

export default App
