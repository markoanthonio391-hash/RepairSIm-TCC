import styles from './conquistas.module.css';
import { useNavigate } from 'react-router-dom';

function Conquistas() {
  const navigate = useNavigate();

  const conquistas = [
    { id: 1, nome: 'Conquista 1', descricao: 'Descrição da Conquista 1' },
    { id: 2, nome: 'Conquista 2', descricao: 'Descrição da Conquista 2' },
    { id: 3, nome: 'Conquista 3', descricao: 'Descrição da Conquista 3' },
  ];

  function fecharJanela(opcao) {
    if (opcao === 'Voltar') {
      navigate(-1);
    }
  }
  return (
    <div className={styles.container}>
      <button className={`${styles.menuButton} ${styles.voltar}`}onClick={() => fecharJanela('Voltar')}>Voltar</button>
      <ul>{conquistas.map((conquista) => (<li key={conquista.id}>{conquista.nome}</li>))}</ul>
    </div>
  );

}
export default Conquistas;
