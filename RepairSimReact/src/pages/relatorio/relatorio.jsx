// Importa o useState e o useEffect do React
import { useState, useEffect } from "react";

// Importa o useNavigate para trocar de página
import { useNavigate } from "react-router-dom";

// Importa os estilos
import "./Relatorio.css";


function Relatorio() {

  const navigate = useNavigate();


  // =====================================================
  // DADOS DO DESAFIO
  // =====================================================

  // Por enquanto o desafio é fixo para teste
  const idDesafio = 1;

  // Usuário temporário
  const idUsuario = 1;


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
  // Mantemos a estrutura antiga
  // =====================================================

  const [form, setForm] = useState({
    numeroCaso: "",
    cliente: "",
    data: "",
    problema: "",
    diagnostico: ""
  });


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

  }, []);


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

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        id_usuario: idUsuario,

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
  // VOLTAR
  // =====================================================

  function voltar() {

    navigate("/caso");

  }


  // =====================================================
  // PRÓXIMO CASO
  // =====================================================

  function proximoCaso() {

    console.log("Próximo caso");

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
                      item => item.id_item === id
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
              onClick={() => navigate("/resultado")}
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


        <button
          className="btn-voltar"
          onClick={voltar}
        >

          <span className="seta">
            ←
          </span>

          VOLTAR

        </button>


        {!resultadoRelatorio && (

          <button
            className="btn-salvar"
            onClick={salvarLaudo}
          >

            SALVAR LAUDO

          </button>

        )}


        <button
          className="btn-proximo"
          onClick={proximoCaso}
        >

          PRÓXIMO CASO

        </button>


      </footer>


    </div>

  );

}

export default Relatorio;