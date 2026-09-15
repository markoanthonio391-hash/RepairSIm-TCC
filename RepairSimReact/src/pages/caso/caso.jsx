import styles from './caso.module.css'
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bancada from '../../assets/bancada.jpeg';

function Caso() {

  const navigate = useNavigate();
  const idDesafio = 1; //por enquanto é permanente esse id, dps podemos alterar para ser variavel(talvez)
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

  }, []);


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
  function pegarImagemPc(idPc) {
    return imagensPc.find( //.find pecorre o array ate atender a condição
      imagem => Number(imagem.id_pc) === idPc);
  }

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


        //item correto
        if (resultado.correto) {
          setEstadoPc('concluido');
          setMensagem('✅ ' + resultado.mensagem);
        }

        //item errado
        else {
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

  //------------------------
  //imagem especifica de cada estado do pc
  //------------------------
  const monitorLigado = pegarImagemPc(2);
  const monitorDesligado = pegarImagemPc(1);
  const gabineteLigado = pegarImagemPc(3);
  const gabineteDesligado = pegarImagemPc(4);
  const gabineteEmpoeirado = pegarImagemPc(6);
  const gabineteLimpo = pegarImagemPc(5);


  //transformando tudo em tela
  return (
    <div className={styles.screenWrapper}>
      <div className={styles.mainContainer}>
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

          {/* gabinete empoeirado */}

          {estadoPc === 'manutencao' && gabineteEmpoeirado && (

            <img src={`http://localhost:3000${gabineteEmpoeirado.caminho_imagem}`}
              className={styles.gabineteManutencao}
              alt="Gabinete empoeirado"/>

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
          {/*teste para levar para relatorio */}
          <button className={styles.btnRelatorio} onClick={() => navigate(`/relatorio/${idDesafio}`)}>
            IR PARA RELATÓRIO
          </button>


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


export default Caso;