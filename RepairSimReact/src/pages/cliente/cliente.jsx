import { useState, useEffect } from "react";
import styles from "./Cliente.module.css";

function Cliente() {
const perguntas = [
{
   pergunta: "Qual é a função do CPU?",
      opcoes: [
        "Armazenar arquivos",
        "Processar informações",
        "Mostrar imagens",
        "Conectar na internet",
      ],
      correta:1,
    },
    {
      pergunta: "Qual linguagem usamos no React?",
      opcoes: [
        "Python",
        "Java",
        "JavaScript",
        "C++",
      ],
      correta: 2,
    },
  ];

  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [tempo, setTempo] = useState(10);
  const [respostaSelecionada, setRespostaSelecionada] = useState(null);
  const [bloqueado, setBloqueado] = useState(false);

  // Timer
  useEffect(() => {
    if (tempo <= 0) {
      proximaPergunta();
      return;
    }

    const timer = setTimeout(() => {
      setTempo(tempo - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [tempo]);


  function responder(index) {
    if (bloqueado) return;

    setRespostaSelecionada(index);
    setBloqueado(true);

    setTimeout(() => {
      proximaPergunta();
    }, 1500);
  }


  function proximaPergunta() {
    if (perguntaAtual < perguntas.length - 1) {
      setPerguntaAtual(perguntaAtual + 1);
      setTempo(10);
      setRespostaSelecionada(null);
      setBloqueado(false);
    }
  }


  const pergunta = perguntas[perguntaAtual];


  return (
    <div className={styles.quiz}>

      <h2>
        Pergunta {perguntaAtual + 1} de {perguntas.length}
      </h2>


      <div className={styles.progress}>
        <div
          style={{
            width: `${((perguntaAtual + 1) / perguntas.length) * 100}%`
          }}
        />
      </div>


      <h3 className={styles.timer}>
        ⏱️ {tempo}s
      </h3>


      <div className={styles.balao}>
        💬 {pergunta.pergunta}
      </div>


      <div className={styles.opcoes}>
        {pergunta.opcoes.map((opcao, index) => (

          <button
            key={index}
            onClick={() => responder(index)}
            className={
              respostaSelecionada === index
                ? index === pergunta.correta
                  ? styles.correta
                  : styles.errada
                : ""
            }
          >
            {opcao}
          </button>

        ))}
      </div>

    </div>
  );
}

export default Cliente;