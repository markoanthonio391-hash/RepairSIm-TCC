//Importa o useState do React e o arquivo do estilos
import { useState } from "react";
import "./Relatorio.css"

//Cria um estado para armazenar os dados do formulário
//form = valores atuais
//setForm = Função para atualizar os valores
function Relatorio() {
  const [form, setForm] = useState ({
    numeroCaso:"",
    cliente:"",
    data:"",
    situacao:"",
    problema:"",
    diagnostico:"",
    solucao:"",
  });

function handleChange(e) {
  //pega o nome e o valor do campo que foi alterado
  const { name, value } = e.target;

  //Atualiza o formulário mantendo os outros campos
  setForm((prev) => ({
    ...prev,
    [name]: value,
  }));
}

function salvarLaudo() {
  //Mostra os dados do formulário no console do navegador
  console.log("Laudo salvo:", form);
  //Exibe uma mensagem na tela
  alert("Laudo salvo com sucesso!");
}

//Cria o estado de voltar e Exibe uma mensagem na tela
function voltar(){
  console.log("Voltar");
}

//Cria o estado do próximo caso e Exibe uma mensagem na tela
function proximoCaso(){
  console.log("Próximo Caso");
}

return(
  <div className="relatorio-container">
  {/*Cabeçalho */}
  <header className="relatorio-header">
  <h1>RELÁTORIO</h1> 
  <p>Registre aqui todas as informações sobre o atendimento realizado.</p>
  </header>
  
  <main>
  {/*Identificação*/}
  {/*cria o campo “Nº do Caso”, mostra o valor armazenado em form.numeroCaso e usa handleChange para atualizar esse valor.*/}
    <section className="relatorio-section identificacao">
      <h2> IDENTIFICAÇÃO DO CASO</h2>

      <div className="identificacao-grid">
      <div className="campo pequeno">
      <label>Nº do Caso:</label>
      <input
      type="text"
      name="numeroCaso"
      value={form.numeroCaso}
      onChange={handleChange}
      />
      </div>

  <div className="campo">
    <label>Cliente:</label>
    <input
    type="text"
    name="cliente"
    value={form.cliente}
    onChange={handleChange}
     />
       </div>

  <div className="campo">
    <label> Data:</label>
    <input
    type="date"
    name="data"
    value={form.data}
    onChange={handleChange}
    />
    </div>
</div>

      </section>
    
    {/*Problema */}
    <section className="relatorio-section">
      <h2>PROBLEMA IDENTIFICADO </h2>

      <textarea
      name="problema"
      value={form.problema}
      onChange={handleChange}
      />
      </section>


      {/*Diagnóstico*/}
      <section className="relatorio-section">
      <h2> DIAGNÓSTICO REALIZADO </h2>

    <textarea
      name="diagnostico"
      value={form.diagnostico}
      onChange={handleChange}
      />
    </section>

    {/*Solução*/}

    <section className="relatorio-section">
    <h2> SOLUÇÃO APLICADA </h2>

    <textarea
      name="solucao"
      value={form.solucao}
      onChange={handleChange}
      />
    </section>
    </main>

  <footer className="relatorio-footer">
  <button className="btn-voltar" OnClick={voltar}>
  <span className="seta"> ←</span>
    VOLTAR
  </button>

  <button className="btn-salvar" OnClick={salvarLaudo}>
    SALVAR LAUDO
  </button>

  <button className="btn-proximo" OnClick={proximoCaso}>
    PRÓXIMO CASO
  </button>
  </footer>
  </div>
);
}

export default Relatorio;