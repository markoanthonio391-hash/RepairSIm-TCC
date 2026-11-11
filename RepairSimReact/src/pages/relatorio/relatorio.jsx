// Importa o useState e o useEffect do React
import { useState, useEffect } from "react";

// Importa o useNavigate para trocar de página
import { useNavigate, useParams } from "react-router-dom";

// Importa os estilos
import "./Relatorio.css";

import { useJogo } from "../../context/JogoContext";


function Relatorio() {
  const navigate = useNavigate();

  // =====================================================
  // DADOS DO DESAFIO
  // =====================================================

  const { id } = useParams();
  const idDesafio = Number(id);

  const { registrarErrosRelatorio, proximoDesafio, ehUltimoDesafio, finalizarJogatina } = useJogo();


  // =====================================================
  // ESTADOS DO BACKEND
  // =====================================================

  const [dadosDesafio, setDadosDesafio] = useState(null);

  const [itens, setItens] = useState([]);

  const [itensSelecionados, setItensSelecionados] = useState([]);

  const [resultadoRelatorio, setResultadoRelatorio] = useState(null);

  const [carregando, setCarregando] = useState(true);


  // =====================================================
  // ESTADO DO FORMULÁRIO
  // =====================================================

  const [form, setForm] = useState({
    numeroCaso: "",
    cliente: "",
    data: "",
    problema: "",
    diagnostico: ""
  });
  useEffect(() => {
    // Coloca uma classe especial no body
    document.body.classList.add("tela-relatorio");
    // Quando sair da tela,
    // remove a classe novamente.
    return () => {document.body.classList.remove("tela-relatorio");
    };
}, []);

  // =====================================================
  // BUSCAR DADOS DO DESAFIO
  // =====================================================

  useEffect(() => {

    fetch(`http://localhost:3000/relatorios/desafio/${idDesafio}`)

      .then(resposta => {

        if (!resposta.ok) {
          throw new Error("Erro ao buscar dados do relatório.");
        }

        return resposta.json();

      })

      .then(dados => {

        console.log("Dados do relatório:", dados);

        setDadosDesafio(dados);

        // Preenche o formulário automaticamente
        setForm({
          numeroCaso: dados.id_desafio,
          cliente: dados.cliente,
          data: new Date().toISOString().split("T")[0],
          problema: dados.problema_relatorio,
          diagnostico: dados.diagnostico_relatorio
        });

      })

      .catch(erro => {

        console.error(erro);

      });

  }, [idDesafio]);


  // =====================================================
  // BUSCAR ITENS
  // =====================================================

  useEffect(() => {

    fetch("http://localhost:3000/itens")

      .then(resposta => {

        if (!resposta.ok) {
          throw new Error("Erro ao buscar itens.");
        }

        return resposta.json();

      })

      .then(dados => {

        console.log("Itens:", dados);

        setItens(dados);

        setCarregando(false);

      })

      .catch(erro => {

        console.error(erro);

        setCarregando(false);

      });

  }, []);


  // =====================================================
  // SELECIONAR ITEM
  // =====================================================

  function alternarItem(idItem) {

    setItensSelecionados(prev => {

      // Se já estiver selecionado, remove
      if (prev.includes(idItem)) {

        return prev.filter(
          id => id !== idItem
        );

      }

      // Se não estiver selecionado, adiciona
      return [
        ...prev,
        idItem
      ];

    });

  }


  // =====================================================
  // SALVAR / AVALIAR RELATÓRIO
  // =====================================================

  function salvarLaudo() {

    fetch("http://localhost:3000/relatorios/avaliar", {

      method: "POST",

       // envia o cookie de login: se estiver logado, o relatório é salvo na conta
       credentials: "include",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        id_desafio: idDesafio,

        itens: itensSelecionados

      })

    })

      .then(resposta => {

        if (!resposta.ok) {
          throw new Error("Erro ao avaliar relatório.");
        }

        return resposta.json();

      })

      .then(resultado => {

        console.log(
          "Resultado do relatório:",
          resultado
        );

        // Os erros são contabilizados somente em continuar()
        setResultadoRelatorio(resultado);

      })

      .catch(erro => {

        console.error(
          "Erro ao avaliar relatório:",
          erro
        );

      });

  }


  // =====================================================
  // CONTINUAR
  // Se não for o último caso, vai para o próximo cliente.
  // Se for o último, salva o resultado e vai para a tela final.
  // =====================================================

  async function continuar() {

    if (!resultadoRelatorio) {
      return;
    }

    const quantidadeErros = resultadoRelatorio.erros || 0;

    // Último desafio: os erros vão direto para finalizarJogatina,
    // pois o estado do React ainda não estaria atualizado.
    if (ehUltimoDesafio()) {

      try {

        await finalizarJogatina(quantidadeErros);

        navigate("/resultado");

      } catch (erro) {

        console.error("Erro ao finalizar jogatina:", erro);

      }

      return;
    }

    registrarErrosRelatorio(quantidadeErros);

    proximoDesafio();

    navigate("/cliente");
  }


  // =====================================================
  // EVITA MOSTRAR A TELA ANTES DOS DADOS
  // =====================================================

  if (carregando || !dadosDesafio) {

    return (
      <div className="relatorio-container">

        <header className="relatorio-header">

          <h1>RELATÓRIO</h1>

          <p>
            Carregando informações do caso...
          </p>

        </header>

      </div>
    );

  }


  // =====================================================
  // SEPARAÇÃO DOS ITENS
  // =====================================================

  const ferramentas = itens.filter(
    item => item.tipo === "ferramenta"
  );

  const pecas = itens.filter(
    item => item.tipo === "peca"
  );

  const softwares = itens.filter(
    item => item.tipo === "software"
  );


  // =====================================================
  // TELA
  // =====================================================

  return (

    <div className="relatorio-container">

      {/* ==============================
          CABEÇALHO
      ============================== */}

      <header className="relatorio-header">

        <h1>RELATÓRIO</h1>

        <p>
          Registre aqui todas as informações sobre o atendimento realizado.
        </p>

      </header>


      <main>


        {/* ==============================
            1. IDENTIFICAÇÃO
        ============================== */}

        <section className="relatorio-section identificacao">

          <h2>1. IDENTIFICAÇÃO DO CASO</h2>


          <div className="identificacao-grid">


            <div className="campo pequeno">

              <label>Nº do Caso:</label>

              <input
                type="text"
                value={form.numeroCaso}
                readOnly
              />

            </div>


            <div className="campo">

              <label>Cliente:</label>

              <input
                type="text"
                value={form.cliente}
                readOnly
              />

            </div>


            <div className="campo">

              <label>Data:</label>

              <input
                type="date"
                value={form.data}
                readOnly
              />

            </div>


          </div>

        </section>



        {/* ==============================
            2. PROBLEMA
        ============================== */}

        <section className="relatorio-section">

          <h2>2. PROBLEMA IDENTIFICADO</h2>


          <textarea
            value={form.problema}
            readOnly
          />

        </section>



        {/* ==============================
            3. DIAGNÓSTICO
        ============================== */}

        <section className="relatorio-section">

          <h2>3. DIAGNÓSTICO REALIZADO</h2>


          <textarea
            value={form.diagnostico}
            readOnly
          />

        </section>



        {/* ==============================
            4. ITENS UTILIZADOS
        ============================== */}

        <section className="relatorio-section">

          <h2>4. ITENS UTILIZADOS</h2>


          {/* FERRAMENTAS */}

          <h3>Ferramentas</h3>

          <div className="itens-relatorio">

            {ferramentas.map(item => (

              <button
                key={item.id_item}
                type="button"
                disabled={!!resultadoRelatorio}
                className={
                  itensSelecionados.includes(item.id_item)
                    ? "item-relatorio selecionado"
                    : "item-relatorio"
                }
                onClick={() => alternarItem(item.id_item)}
              >

                {item.nome}

              </button>

            ))}

          </div>


          {/* PEÇAS */}

          <h3>Peças</h3>

          <div className="itens-relatorio">

            {pecas.map(item => (

              <button
                key={item.id_item}
                type="button"
                disabled={!!resultadoRelatorio}
                className={
                  itensSelecionados.includes(item.id_item)
                    ? "item-relatorio selecionado"
                    : "item-relatorio"
                }
                onClick={() => alternarItem(item.id_item)}
              >

                {item.nome}

              </button>

            ))}

          </div>


          {/* SOFTWARE */}

          <h3>Software</h3>

          <div className="itens-relatorio">

            {softwares.map(item => (

              <button
                key={item.id_item}
                type="button"
                disabled={!!resultadoRelatorio}
                className={
                  itensSelecionados.includes(item.id_item)
                    ? "item-relatorio selecionado"
                    : "item-relatorio"
                }
                onClick={() => alternarItem(item.id_item)}
              >

                {item.nome}

              </button>

            ))}

          </div>


        </section>


        {/* ==============================
            RESULTADO DO RELATÓRIO
        ============================== */}

        {resultadoRelatorio && (

          <section className="resultado-relatorio">

            <p>
              <strong>Erros cometidos no relatório:</strong>
              {" "} {resultadoRelatorio.erros}
            </p>

            {resultadoRelatorio.tipo === "completo" && (

              <>

                <h2>✅ Parabéns!</h2>

                <p>
                  {resultadoRelatorio.mensagem}
                </p>

              </>

            )}


            {resultadoRelatorio.tipo === "totalmente_incorreto" && (

              <>

                <h2>❌ Relatório incorreto</h2>

                <p>
                  {resultadoRelatorio.mensagem}
                </p>

                <h3>
                  Itens corretos:
                </h3>

                {resultadoRelatorio.itensCorretos.map(
                  item => (

                    <p key={item.id_item}>
                      • {item.nome}
                    </p>

                  )
                )}

              </>

            )}


            {resultadoRelatorio.tipo === "parcial" && (

              <>

                <h2>
                  ⚠️ Relatório parcialmente correto
                </h2>

                <p>
                  {resultadoRelatorio.mensagem}
                </p>


                <h3>
                  Itens corretos:
                </h3>

                {resultadoRelatorio.itensCorretos.map(
                  item => (

                    <p key={item.id_item}>
                      ✅ {item.nome}
                    </p>

                  )
                )}


                <h3>
                  Itens incorretos:
                </h3>

                {resultadoRelatorio.itensIncorretos.map(
                  id => {

                    const item = itens.find(
                      item => Number(item.id_item) === Number(id)
                    );

                    return (

                      <p key={id}>
                        ❌ {item?.nome}
                      </p>

                    );

                  }
                )}

              </>

            )}


            <button
              type="button"
              onClick={continuar}
            >
              CONTINUAR
            </button>


          </section>

        )}


      </main>


      {/* ==============================
          RODAPÉ
      ============================== */}

      <footer className="relatorio-footer">


        {!resultadoRelatorio && (

          <button
            className="btn-salvar"
            onClick={salvarLaudo}
          >

            SALVAR LAUDO

          </button>

        )}


      </footer>


    </div>

  );

}


export default Relatorio;
