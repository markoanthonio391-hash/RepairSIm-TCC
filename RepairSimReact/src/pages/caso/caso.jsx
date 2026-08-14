import styles from './caso.module.css'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import imgFundo from '../../assets/imgFundo.jpeg';
// // import test from '../../assets/TesteDeAnim/gabinete_preto_ligado_1.png'
function Caso() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [itens, setItens] = useState ([]);

  return(
     <div className={styles.mainContainer}>
        <div className={styles.toolsContainer}>
          <button className={styles.btnToolsBox} onClick={() => setIsOpen(!isOpen)}> FERRAMENTAS
            <span className={styles.iconBtnTools}>🛠️</span>  
          </button>
          {isOpen && (
            <div className={styles.toolsBox}>
              <h3 className={styles.titleTools}></h3>
              <div className={styles.contentTools}>
                <p> VOCÊS PRECISAM TESTAR COM O BACKEND DEPOIS SE VAI APARECER OS ITENS AQUI </p>
              </div>
            </div>
          )}
        </div>
      </div>
     
 )
}

export default Caso;

// // const ferramentas = [{ id: 5, name: "Machado de Bronze", icon: "🪓" }];
// // export default function workbench(){
// //   const [tools, setTools] = useState(ferramentas);
// //   return(
// //         <div className={styles.grid}>
// //       {tools.map((tool) => (
// //         <div key={tool.id} className={styles.slot} title={tool.name}>
// //           <span className={styles.icon}>{tool.icon}</span>
// //         </div>
// //       ))}
// //     </div>
// //   )
// // }

// const ferramentas = [
//   { id: 1, name: "gabinete preto", image: "/assets/TesteDeAnim/gabinete_preto_ligado_1.png"}
// ];

// export default function Caso(){
//   const [tools] = useState(ferramentas);
//   const [selectedTools, setSelectedTools] = useState(null);
//   return(
//     <div>
//       <div className={styles.grid}>
//         {tools.map((tool)) => {
//           const isSelected = selectedTool && selectedTool.id === tool.id;
          
//         }}

//       </div>
//     </div>
//   )
// }
