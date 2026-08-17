import styles from './caso.module.css'
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Caso() {

  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const [itens, setItens] = useState([]);

  const [tipoSelecionado, setTipoSelecionado] = useState('ferramenta');


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


  function abrirCategoria(tipo) {

    setTipoSelecionado(tipo);

    setIsOpen(true);

  }


  return (

    <div className={styles.mainContainer}>
      <div className={styles.toolsContainer}>
        {/* BOTÃO FERRAMENTAS */}
        <button className={styles.btnToolsBox} onClick={() => abrirCategoria('ferramenta')} >
          FERRAMENTAS
          <span className={styles.iconBtnTools}> 🛠️ </span>
         </button>

        {/* BOTÃO PEÇAS */}
        <button className={styles.btnToolsBox} onClick={() => abrirCategoria('peca')}>
          PEÇAS
        </button>

        {/* BOTÃO SOFTWARE */}
        <button className={styles.btnToolsBox} onClick={() => abrirCategoria('software')}>
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
                  <div key={item.id_item} className={styles.item}>
                    <img src={`http://localhost:3000${item.caminho_imagem}`} className={styles.imgItem} alt={item.nome}/>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


export default Caso;