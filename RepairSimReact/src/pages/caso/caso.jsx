import styles from './caso.module.css'
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bancada from '../../assets/bancada.jpeg';
import { useJogo } from "../../context/JogoContext";
import CasoHd from './CasoHd';
const ID_CASO_HD = 8;

function CasoPadrao() {

  const navigate = useNavigate();
  const { jogatina,getDesafioAtual,adicionarPontos,registrarErroDesafio } = useJogo();
  const desafioAtual = getDesafioAtual();
  const idDesafio = desafioAtual?.id_desafio;

  const [respostaFinalizada, setRespostaFinalizada] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [itens, setItens] = useState([]);
  const [tipoSelecionado, setTipoSelecionado] = useState('ferramenta');
  const [imagensPc, setImagensPc] = useState([]);
  const [estadoPc, setEstadoPc] = useState('ligado');
  const [mensagem, setMensagem] = useState('');

  //------------------------
  //busca a imagens de itens
  //------------------------
  useEffect(() => {

    fetch(`http://localhost:3000/itens/tipo/${tipoSelecionado}`)

      .then(resposta => {

        if (!resposta.ok) {
          throw new Error('Erro ao buscar os itens.');
        }

        return resposta.json();
      })

      .then(dados => {
        console.log('Itens recebidos do backend:', dados);
        setItens(dados);
      })

      .catch(erro => {
        console.error('Erro ao buscar itens:', erro);
      });

  }, [tipoSelecionado]);

  //------------------------
  //busca a imagens de Pcs
  //------------------------
   useEffect(() => {

    fetch(`http://localhost:3000/desafio-imagens-pc/desafio/${idDesafio}`)

      .then(resposta => {

        if (!resposta.ok) {
          throw new Error('Erro ao buscar imagens do PC.');
        }

        return resposta.json();
      })

      .then(dados => {
        console.log('Imagens do PC:', dados);
        setImagensPc(dados);
      })

      .catch(erro => {
        console.error('Erro ao buscar imagens do PC:', erro);
      });

  }, [idDesafio]);


  //------------------------
  //troca a categoria dos itens
  //------------------------
  function abrirCategoria(tipo) {
    if (isOpen && tipoSelecionado === tipo){
      setIsOpen(false);
    } else{
    setTipoSelecionado(tipo);
    setIsOpen(true);
    }
  }

  //------------------------
  //pega uma imagem especifica pelo id
  //------------------------
  // function pegarImagemPc(idPc) {
  //   return imagensPc.find( //.find pecorre o array ate atender a condição
  //     imagem => Number(imagem.id_pc) === idPc);
  // }

  //------------------------
  //botão desligar
  //------------------------
    function desligarPc() {
    setEstadoPc('desligado');
    setMensagem('');
  }

  //------------------------
  //clicar no gabinete desligado
  //------------------------
  function abrirGabinete() {
  if (estadoPc !== 'desligado') {
    setMensagem('Desligue o computador antes de abrir o gabinete.');
    return;
  }

    setEstadoPc('manutencao');
    setMensagem('');
  
  }
  function usarItem(item) {

    if (respostaFinalizada){
      return;
    }

      //------------------------
      //clicar em um item
      //------------------------
    if (estadoPc !== 'manutencao') { //só permite usar itens durante a manutenção
      setMensagem('Primeiro desligue o computador e abra o gabinete.');
      return;
    }
    
      fetch(`http://localhost:3000/desafios/${idDesafio}/verificar`, {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        id_item: item.id_item
      })

    })

      .then(resposta => {

        if (!resposta.ok) {
          throw new Error('Erro ao verificar o item.');
        }

        return resposta.json();
      })

      .then(resultado => {

        console.log('Resultado da verificação:', resultado);

        //POntos sempre que entram no contexto
        adicionarPontos(resultado.pontos);

        //item correto
        if (resultado.correto) {
          setEstadoPc('concluido');
          setMensagem('✅ ' + resultado.mensagem);
          setRespostaFinalizada(true);
        }

        //item errado
        else {
          registrarErroDesafio();
          setMensagem('❌ ' + resultado.mensagem);
        }
      })

      .catch(erro => {

        console.error('Erro ao verificar item:', erro);

        setMensagem(
          'Erro ao verificar o item.'
        );

      });

  }
  //caso n tenha nenhuma imagem...
  if (!imagensPc.length) {
    return (<p>Imagens deste caso ainda não disponíveis.</p>);
  }
  //------------------------
  //imagem especifica de cada funcao do pc
  //------------------------
  function pegarImagemPorFuncao(funcao) {
    return imagensPc.find(imagem => imagem.funcao === funcao);
  }

  const monitorLigado = pegarImagemPorFuncao("monitor_ligado");
  const monitorDesligado = pegarImagemPorFuncao("monitor_desligado");
  const gabineteLigado = pegarImagemPorFuncao("gabinete_ligado");
  const gabineteDesligado = pegarImagemPorFuncao("gabinete_desligado");

  // gabinete ABERTO mostrando o defeito do caso.
  // aceita "gabinete_empoeirado" (caso 1) ou qualquer funcao terminada em "_defeito"
  // (ex: gabinete_ram_defeito = caso 2, gabinete_fonte_defeito = caso 5)
  const gabineteDefeito = imagensPc.find(imagem => imagem.funcao === "gabinete_empoeirado" || imagem.funcao.endsWith("_defeito"));

  const gabineteLimpo = pegarImagemPorFuncao("gabinete_limpo");

  
  //transformando tudo em tela
  return (
    <div className={styles.screenWrapper}>
      <div className={styles.mainContainer}>
        <div className={styles.statusJogo}>
          <span>Caso {jogatina.indiceAtual + 1} {" "} / {jogatina.quantidadeCasos}</span>
          <span>Pontos: {jogatina.pontos}</span>
        </div>
        <img src={bancada} alt="Bancada" className={styles.bancada} />
        <button className={styles.btnVoltar} onClick={() => navigate('/')}>
           Voltar 
        </button>
        <div className={styles.pcContainer}>
          {estadoPc === 'ligado' && (
            <> {/*agrupa varios elementos html, guardando 
            eles para não gera poluição e mostrando quando necessario*/}

            {/*pc ligado */}
              {monitorLigado && (

                <img src={`http://localhost:3000${monitorLigado.caminho_imagem}`}
                  className={styles.monitorImage}
                  alt="Monitor ligado"/>
              )}


              {gabineteLigado && (

                <img src={`http://localhost:3000${gabineteLigado.caminho_imagem}`}
                  className={styles.gabineteImage}
                  alt="Gabinete ligado"/>

              )}

            </>

          )}

          {/* pc desligado */}

          {estadoPc === 'desligado' && (

            <>

              {monitorDesligado && (

                <img src={`http://localhost:3000${monitorDesligado.caminho_imagem}`}
                  className={styles.monitorImage}
                  alt="Monitor desligado"/>

              )}


              {gabineteDesligado && (

                <img src={`http://localhost:3000${gabineteDesligado.caminho_imagem}`}
                  className={`${styles.gabineteImage} ${styles.gabineteClicavel}`}
                  alt="Gabinete desligado"
                  onClick={abrirGabinete}/>

              )}

            </>

          )}

          {/* gabinete aberto com o defeito do caso (poeira, RAM, fonte...) */}

          {estadoPc === 'manutencao' && gabineteDefeito && (

            <img src={`http://localhost:3000${gabineteDefeito.caminho_imagem}`}
              className={styles.gabineteManutencao}
              alt="Gabinete aberto com defeito"/>

          )}


          {/* gabinete limpo */}

          {estadoPc === 'concluido' && gabineteLimpo && (

            <img src={`http://localhost:3000${gabineteLimpo.caminho_imagem}`} className={styles.gabineteManutencao}alt="Gabinete limpo" />

          )}
        </div>


        {/* botão de desligar pc */}

        {estadoPc === 'ligado' && (

          <button className={styles.btnDesligar}
            onClick={desligarPc}>
            DESLIGAR </button>
          )}
          
          {respostaFinalizada && (
          <button className={styles.btnRelatorio} onClick={() => navigate(`/relatorio/${idDesafio}`)}>
            IR PARA RELATÓRIO
          </button>
          )}


        {/*mensagem*/}

        {mensagem && (
          <div className={styles.mensagem}>
            {mensagem}
          </div>
        )}
        <div className={styles.toolsContainer}>
          {/* botão ferramentas */}
          <button className={`${styles.btnToolsBox} ${styles.btnColorTool} ${isOpen && tipoSelecionado === 'ferramenta' ? styles.active : ''}`}onClick={() => abrirCategoria('ferramenta')} >
            FERRAMENTAS
            {/* <span className={styles.iconBtnTools}> 🛠️ </span> */}
          </button>

          {/* botão peças */}
          <button className={`${styles.btnToolsBox} ${styles.btnColorComp} ${isOpen && tipoSelecionado === 'peca' ? styles.active : ''}`}onClick={() => abrirCategoria('peca')}>
            PEÇAS
          </button>

          {/* botão software */}
          <button className={`${styles.btnToolsBox} ${styles.btnColorSoft} ${isOpen && tipoSelecionado === 'software' ? styles.active : ''}`} onClick={() => abrirCategoria('software')}>
            SOFTWARE
          </button>

          {isOpen && (

            <div className={styles.toolsBox}>

              <h3 className={styles.titleTools}>
                {/*substitui o final da url para mostrar apenas imagens daquela categoria  */}
                {tipoSelecionado === 'ferramenta' && 'Ferramentas'}
                {tipoSelecionado === 'peca' && 'Peças'}
                {tipoSelecionado === 'software' && 'Software'}
              </h3>


              <div className={styles.contentTools}>
                {/*se a quantidade for 0, aparece carregando itens, se não mostra as 
                imagens de acordo com o seu tipo apertado*/}
                {itens.length === 0 ? (

                  <p>Carregando itens...</p>

                ) : (
                  itens.map(item => (
                    <div key={item.id_item} className={`${styles.item} ${estadoPc === 'manutencao'? styles.itemClicavel: ''}`} onClick={() => usarItem(item)}> {/*deixa os itens clicaveis */}
                      <img src={`http://localhost:3000${item.caminho_imagem}`} 
                      className={styles.imgItem} alt={item.nome}/>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Caso() {
  const { getDesafioAtual } = useJogo();
  const idDesafio = Number(getDesafioAtual()?.id_desafio);

  // Se o caso for o 8, ele renderiza o CasoHd, senão renderiza o padrão
  return idDesafio === ID_CASO_HD ? <CasoHd /> : <CasoPadrao />;
}

export default Caso;