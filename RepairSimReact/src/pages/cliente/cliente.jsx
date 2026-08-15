import { useState, useEffect } from "react";
import styles from "./cliente.module.css";
import { useNavigate } from "react-router-dom";


function Cliente() {

   const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  

  const [manutencao, setManutencao] = useState(null);


  useEffect(() => {
    const carregarDadosCaso = () => {
      const dadosMockados = {
        id: "2026",
        status: "Em Andamento", 
        cliente: "Cliente001",
        aparelho: "Notebook Dell Inspiron 15",
        especificacoes: "Core i5, 8GB RAM, SSD 256GB",
        relato: "Computador liga, mas a tela fica preta e emite 3 bipes.",
        analise: "Mau contato nos módulos de memória RAM devido à oxidação.",
        servico: "Limpeza química dos contatos e substituição de 1 pente de 4GB.",
        valor: "R$ 250,00"
      };
      
      setManutencao(dadosMockados);
    };

    carregarDadosCaso();
  }, []);

  const responderOrcamento = (novoStatus) => {
    setManutencao((prev) => ({ ...prev, status: novoStatus }));
    alert(`Orçamento ${novoStatus === "Aprovado" ? "aceito" : "cancelado"} com sucesso!`);
  };


  if (!manutencao) {
    return <div className={styles.carregando}>Carregando dados do cliente...</div>;
  }

  return (
    <div className={styles.container}>
      <h2>Área do Cliente</h2>
      <p>Bem-vindo, {manutencao.cliente}!</p>
      
      {/* Botão para abrir o histórico do caso */}
      <button 
        className={styles.btnPrincipal} 
        onClick={() => setIsModalOpen(true)}
      >
        Sistema de Manutenção
      </button>

      {/* Tela de Caso (Modal) condicional */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalConteudo} onClick={(e) => e.stopPropagation()}>
          
            
            <div className={styles.modalHeader}>
              <h3>Ordem de Serviço #{manutencao.id}</h3>
              {/* Mudança dinâmica na classe do badge conforme o status muda */}
              <span className={`${styles.status} ${
                manutencao.status === "Em Andamento" ? styles.emAndamento : 
                manutencao.status === "Aprovado" ? styles.aprovado : styles.reprovado
              }`}>
                {manutencao.status}
              </span>
            </div>

            <div className={styles.modalCorpo}>
              <div className={styles.secaoInfo}>
                <h4> Equipamento</h4>
                <p><strong>Aparelho:</strong> {manutencao.aparelho}</p>
                <p><strong>Configuração:</strong> {manutencao.especificacoes}</p>
              </div>

              <div className={styles.secaoInfo}>
                <h4> Situação e Diagnóstico</h4>
                <p><strong>Sintomas:</strong> {manutencao.relato}</p>
                <p><strong>Informações Adicionais:</strong> {manutencao.analise}</p>
              </div>

              {manutencao.status === "Em Andamento" && (
                <div className={styles.acoes}>
                  <button 
                    className={styles.btnCancelar} 
                    onClick={() => navigate('/dificuldade')}
                    
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
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cliente;

