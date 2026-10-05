import { useState } from "react";
import styles from "./cliente.module.css";
import { useNavigate } from "react-router-dom";
import { useJogo } from "../../context/JogoContext";

function Cliente() {

  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [statusOrcamento, setStatusOrcamento] = useState("Em Andamento");
  const { getDesafioAtual, aceitarDesafio } = useJogo();
  const desafioAtual = getDesafioAtual();

  const responderOrcamento = (novoStatus) => {
    setStatusOrcamento(novoStatus);

    setAviso({
      texto: `Orçamento ${novoStatus === "Aprovado" ? "aceito" : "cancelado"} com sucesso!`,
      tipo: novoStatus === "Aprovado" ? "sucesso" : "erro"
    });

    setTimeout(() => setAviso(null), 2500);
  };

  if (!desafioAtual) {
    return <div className={styles.carregando}>Nenhum desafio disponível.</div>;
  }

  return (
    <div className={styles.container}>
      <h2>Área do Cliente</h2>
      <p>Bem-vindo cliente {desafioAtual.cliente}!</p>

      <button
        className={styles.btnPrincipal}
        onClick={() => setIsModalOpen(true)}
      >
        Sistema de Manutenção
      </button>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalConteudo} onClick={(e) => e.stopPropagation()}>

            <div className={styles.modalHeader}>
              <h3>Ordem de Serviço {desafioAtual.id_desafio}</h3>
              <span className={`${styles.status} ${
                statusOrcamento === "Em Andamento" ? styles.emAndamento :
                statusOrcamento === "Aprovado" ? styles.aprovado : styles.reprovado
              }`}>
                {statusOrcamento}
              </span>
            </div>

            <div className={styles.modalCorpo}>
              <div className={styles.secaoInfo}>
                <h4>{desafioAtual.titulo}</h4>
                <p><strong>Sintomas:</strong> {desafioAtual.descricao}</p>
              </div>

                <div className={styles.acoes}>
                  <button 
                    className={styles.btnCancelar} 
                    onClick={() => {
                      //primeiro agente avisa o estado do sistema que orçamento foi recusado
                      responderOrcamento("Reprovado");

                      //Importante, em vez de ir para os desafios ira para tela de resultado
                      //o state é como uma mochila ele vai carregar esses dados para la no caso para o resultado
                      //ai a tela de resultado uca vai quebrar por falta de dados
                      navigate('/resultado', {
                        state: {
                          pontuacao: 0,
                          tempo: "00:00",
                          erros: 0,
                          motivo: "O cliente recusou o orçamento logo de cara"
                        }
                      });
                    }}
                  >
                    Cancelar Orçamento
                  </button>
                  <button 
                    className={styles.btnAceitar} 
                    onClick={() => {
                      responderOrcamento("Aprovado");
                      navigate('/caso');
                    }}
                  >
                    Aceitar Desafio
                  </button>
                </div>
            </div>
          </div>
        </div>
      )}

      {aviso && (
        <div className={`${styles.avisoFlutuante} ${aviso.tipo === 'sucesso' ? styles.avisoSucesso : styles.avisoErro}`}>
          {aviso.texto}
        </div>
      )}
    </div>
  );
}

export default Cliente;



















// import { useState, useEffect } from "react";
// import styles from "./cliente.module.css";
// import { useNavigate } from "react-router-dom";
// import { useJogo } from "../../context/JogoContext";


// function Cliente() {

//   const navigate = useNavigate();

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [aviso, setAviso] = useState(null); // <-- ESSA LINHA ESTAVA FALTANDO
//   const {getDesafioAtual, aceitarDesafio, jogatina} = useJogo();
//   const desafioAtual = getDesafioAtual();
//   // const [manutencao, setManutencao] = useState(null);


//   useEffect(() => {
//         fetch('http://localhost:3000/desafios/1')
//         .then(resposta => resposta.json())
//         .then(dados => {
//             setManutencao(dados);
//         })
//         .catch(erro => {
//             console.error(erro);
//         });
//   }, []);

//   const responderOrcamento = (novoStatus) => {
//     setManutencao((prev) => ({ ...prev, status: novoStatus }));
    
//     setAviso({
//       texto: `Orçamento ${novoStatus === "Aprovado" ? "aceito" : "cancelado"} com sucesso!`,
//       tipo: novoStatus ===  "Aprovado" ? "sucesso" : "erro"
//     });

//     setTimeout(() => setAviso(null), 2500);
//   };


//   if (!manutencao) {
//     return <div className={styles.carregando}>Carregando dados do cliente...</div>;
//   }

//   return (
//     <div className={styles.container}>
//       <h2>Área do Cliente</h2>
//       <p>Bem-vindo cliente {desafioAtual?.cliente}!</p>
      
//       {/* Botão para abrir o histórico do caso */}
//       <button 
//         className={styles.btnPrincipal} 
//         onClick={() => setIsModalOpen(true)}
//       >
//         Sistema de Manutenção
//       </button>

//       {/* Tela de Caso (Modal) condicional */}
//       {isModalOpen && (
//         <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
//           <div className={styles.modalConteudo} onClick={(e) => e.stopPropagation()}>
          
            
//             <div className={styles.modalHeader}>
//               <h3>Ordem de Serviço {desafioAtual?.id_desafio}</h3>
//               {/* Mudança dinâmica na classe do badge conforme o status muda */}
//               <span className={`${styles.status} ${
//                 manutencao.status === "Em Andamento" ? styles.emAndamento : 
//                 manutencao.status === "Aprovado" ? styles.aprovado : styles.reprovado
//               }`}>
//                 {desafioAtual?.status} {/*antes era manutenção*/}
//               </span>
//             </div>

//             <div className={styles.modalCorpo}>
//               <div className={styles.secaoInfo}>
//                 <h4>{desafioAtual?.titulo}</h4>
//                 <p><strong>Sintomas:</strong> {desafioAtual?.descricao}</p>
//               </div>

//                 <div className={styles.acoes}>
//                   <button 
//                     className={styles.btnCancelar} 
//                     onClick={() => {
//                       responderOrcamento("Reprovado");
//                       navigate('/dificuldade');
//                     }}
//                   >
//                     Cancelar Orçamento
//                   </button>
//                   <button 
//                     className={styles.btnAceitar} 
//                     onClick={() => {
//                       aceitarDesafio();
//                       navigate('/caso');
//                     }}
//                   >
//                     Aceitar Desafio
//                   </button>
//                 </div>
//             </div>
//           </div>
//         </div>
//       )}
//       {aviso && (
//         <div className={`${styles.avisoFlutuante} ${aviso.tipo === 'sucesso' ? styles.avisoSucesso : styles.avisoErro}`}>{aviso.texto}
//         </div>
//       )}
//     </div>
//   );
// }

// export default Cliente;

