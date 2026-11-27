// Importa o useState, o useEffect e o useRef do React
import { useState, useEffect, useRef } from "react";

// Importa o useNavigate para trocar de página
import { useNavigate, useParams } from "react-router-dom";

// Importa os estilos
import "./Relatorio.css";

import { useJogo } from "../../context/JogoContext";
import { ganharConquista } from "../../utils/ganharConquista";

// pausa a música de fundo enquanto um vídeo (que tem som próprio) está tocando
import { usePausarMusica } from "../../audio/musicaControle";

const CHAVE_RELATORIOS_DETALHADOS = "repairsim_relatorios_detalhados_count";

function registrarConquistasRelatorio(quantidadeItensSelecionados) {
  ganharConquista("RELATORIO_ENTREGUE", "Relatório Entregue");

  if (quantidadeItensSelecionados > 0) {
    const atual = Number(localStorage.getItem(CHAVE_RELATORIOS_DETALHADOS) || "0");
    const novoTotal = atual + 1;
    localStorage.setItem(CHAVE_RELATORIOS_DETALHADOS, String(novoTotal));

    if (novoTotal >= 5) {
      ganharConquista("DETALHISTA_OFICINA", "Detalhista da Oficina");
    }
  }
}


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

  // mensagens de falha de rede (antes a tela ficava em "Carregando..." para sempre ou o erro só ia para o console)
  const [erroCarregamento, setErroCarregamento] = useState("");
  const [erroAcao, setErroAcao] = useState("");

  // trava de clique duplo no SALVAR LAUDO (dois cliques rápidos criavam dois relatórios)
  const [salvando, setSalvando] = useState(false);
  const conquistaRelatorioDisparada = useRef(false);


  // =====================================================
  // VÍDEO (aparece depois de apertar CONTINUAR no último caso)
  // =====================================================

  // true = mostra o vídeo de FINALIZAÇÃO DO CASO antes do relatório (acontece depois de TODO caso)
  const [videoCaso, setVideoCaso] = useState(true);

  // true = mostra o vídeo de FINALIZAÇÃO DO JOGO no lugar do relatório (só depois do ÚLTIMO caso)
  const [mostrarVideo, setMostrarVideo] = useState(false);

  // enquanto algum vídeo toca, a música dos casos pausa e depois volta
  usePausarMusica(videoCaso || mostrarVideo);

  // trava para não executar o "seguir" duas vezes
  // (o vídeo terminar + clicar em PULAR ao mesmo tempo)
  const seguindo = useRef(false);


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
    conquistaRelatorioDisparada.current = false;

    // credentials: "include" envia o cookie de login (casos exclusivos de instituição respondem 404 sem ele)
    fetch(`http://localhost:3000/relatorios/desafio/${idDesafio}`, { credentials: "include" })

      .then(resposta => {

        if (!resposta.ok) {
          throw new Error("Erro ao buscar dados do relatório.");
        }

        return resposta.json();

      })

      .then(dados => {

        setDadosDesafio(dados);

        // Preenche o formulário automaticamente
        setForm({
          numeroCaso: dados.id_desafio,
          cliente: dados.cliente,
          data: new Date().toLocaleDateString("en-CA"), // data LOCAL (toISOString usa UTC e mostrava o dia seguinte depois das 21h)
          problema: dados.problema_relatorio,
          diagnostico: dados.diagnostico_relatorio
        });

      })

      .catch(erro => {

        console.error(erro);

        setErroCarregamento("Não foi possível carregar os dados do caso.");

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

        setItens(dados);

        setCarregando(false);

      })

      .catch(erro => {

        console.error(erro);

        setErroCarregamento("Não foi possível carregar a lista de itens.");

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

    // ignora o segundo clique enquanto o primeiro ainda está sendo avaliado
    if (salvando) {
      return;
    }

    setSalvando(true);
    setErroAcao("");

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

        // Os erros são contabilizados somente em seguirDepoisDoVideo()
        setResultadoRelatorio(resultado);

        if (!conquistaRelatorioDisparada.current) {
          conquistaRelatorioDisparada.current = true;
          registrarConquistasRelatorio(itensSelecionados.length);
        }

      })

      .catch(erro => {

        console.error(
          "Erro ao avaliar relatório:",
          erro
        );

        setErroAcao("Não foi possível salvar o laudo. Verifique a conexão e tente novamente.");

      })

      .finally(() => {

        setSalvando(false);

      });

  }


  // =====================================================
  // CONTINUAR
  // No último caso, mostra o vídeo de finalização do jogo antes do resultado.
  // Nos outros casos, vai direto para o próximo cliente.
  // =====================================================

  function continuar() {

    if (!resultadoRelatorio) {
      return;
    }

    setErroAcao("");

    if (ehUltimoDesafio()) {

      setMostrarVideo(true);

    } else {

      seguirDepoisDoVideo();

    }

  }


  // =====================================================
  // SEGUIR DEPOIS DO VÍDEO
  // Roda quando o vídeo termina ou quando aperta PULAR.
  // Se não for o último caso, vai para o próximo cliente.
  // Se for o último, salva o resultado e vai para a tela final.
  // =====================================================

  async function seguirDepoisDoVideo() {

    if (seguindo.current) {
      return;
    }

    seguindo.current = true;

    const quantidadeErros = resultadoRelatorio?.erros || 0;

    // Último desafio: os erros vão direto para finalizarJogatina,
    // pois o estado do React ainda não estaria atualizado.
    if (ehUltimoDesafio()) {

      try {

        await finalizarJogatina(quantidadeErros);

        navigate("/resultado");

      } catch (erro) {

        console.error("Erro ao finalizar jogatina:", erro);

        setErroAcao("Não foi possível salvar o resultado da partida. Tente continuar de novo.");

        // volta para o relatório para mostrar o erro e deixar tentar de novo
        setMostrarVideo(false);

        seguindo.current = false;

      }

      return;
    }

    registrarErrosRelatorio(quantidadeErros);

    proximoDesafio();

    navigate("/cliente");
  }


  // =====================================================
  // TELA DO VÍDEO
  // (fica depois de todos os hooks, nunca antes deles)
  // =====================================================

  // 1) vídeo de finalização do CASO: toca ao abrir o relatório de qualquer caso, e depois mostra o relatório
  if (videoCaso) {

    return (
      <main className="tela-video">

        <video
          className="video-tela"
          src="/videos/finalizacao_caso.mp4"
          autoPlay
          playsInline
          onEnded={() => setVideoCaso(false)}
        />

        <button
          type="button"
          className="btn-pular"
          onClick={() => setVideoCaso(false)}
        >
          PULAR
        </button>

      </main>
    );

  }

  // 2) vídeo de finalização do JOGO: toca depois do relatório do ÚLTIMO caso e leva para a tela de resultado
  if (mostrarVideo) {

    return (
      <main className="tela-video">

        <video
          className="video-tela"
          src="/videos/finalizacao_jogo.mp4"
          autoPlay
          playsInline
          onEnded={seguirDepoisDoVideo}
        />

        <button
          type="button"
          className="btn-pular"
          onClick={seguirDepoisDoVideo}
        >
          PULAR
        </button>

      </main>
    );

  }


  // =====================================================
  // EVITA MOSTRAR A TELA ANTES DOS DADOS
  // =====================================================

  if (erroCarregamento) {

    return (
      <div className="relatorio-container">

        <header className="relatorio-header">

          <h1>RELATÓRIO</h1>

          <p role="alert">
            {erroCarregamento}
          </p>

          <button type="button" onClick={() => navigate("/dificuldade")}>
            VOLTAR
          </button>

        </header>

      </div>
    );

  }

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


        {erroAcao && (
          <p role="alert" style={{ color: "#ff8a8a", textAlign: "center" }}>
            {erroAcao}
          </p>
        )}

        {!resultadoRelatorio && (

          <button
            type="button"
            className="btn-salvar"
            onClick={salvarLaudo}
            disabled={salvando}
          >

            {salvando ? "SALVANDO..." : "SALVAR LAUDO"}

          </button>

        )}


      </footer>


    </div>

  );

}


export default Relatorio;