import styles from './Faq.module.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FundoAnimado from '../../components/FundoAnimado';
import TechSolveLogo from '../../components/TechSolveLogo';
import TituloRepairSim from '../../components/TituloRepairSim';

const PERGUNTAS = [
  {
    id: 'contato',
    pergunta: 'Como entrar em contato com a equipe TechSolve?',
    destino: '/suporte',
  },
  {
    id: 'oque',
    pergunta: 'O que é o RepairSim?',
    resposta: 'O RepairSim é um simulador de reparos de computadores. Você enfrenta desafios de diagnóstico e manutenção em um ambiente virtual, sem risco para equipamentos reais.',
  },
  {
    id: 'jogar',
    pergunta: 'Preciso de conta para jogar?',
    resposta: 'Não. Você pode jogar sem conta, mas só quem está logado tem o histórico de partidas salvo.',
  },
  {
    id: 'conta',
    pergunta: 'Como crio uma conta?',
    resposta: 'Na tela de login, toque em "Cadastre-se", preencha seus dados e pronto.',
  },
  {
    id: 'historico',
    pergunta: 'Onde vejo meu histórico de partidas?',
    resposta: 'Entre com sua conta e use o botão "Histórico" no menu inicial.',
  },
  {
    id: 'tema',
    pergunta: 'Como mudo o tema, a fonte ou desligo as animações?',
    resposta: 'Em "Configurações" você escolhe tema claro ou escuro, o tamanho da fonte e o nível de cada efeito (normal, reduzido ou desligado).',
  },
  {
    id: 'sessao',
    pergunta: 'Por que fui desconectado da minha conta?',
    resposta: 'Cada conta só pode ficar ativa em um lugar por vez. Se você entrar em outro dispositivo, a sessão anterior é encerrada.',
  },
  {
    id: 'senha',
    pergunta: 'Esqueceu a senha?',
    destino: '/esqueci-senha', // item especial: leva para a tela de troca de senha
  },
];

function Faq() {
  const navigate = useNavigate();
  const [aberta, setAberta] = useState(null);

  const alternar = (id) => setAberta((atual) => (atual === id ? null : id));

  return (
    <div className={styles.page} data-efeito="menu">
      <FundoAnimado />

      <div className={styles.topo}>
        <TechSolveLogo size={90} className={styles.logo} />
        <h1 className={styles.title} aria-label="RepairSim"><TituloRepairSim /></h1>
        <h2 className={styles.subtitle}>Perguntas frequentes</h2>
      </div>

      <section className={styles.card}>
        <div className={styles.iconBadge} aria-hidden="true">
          <span className={styles.chave}>🔧</span>
        </div>

        <ul className={styles.lista}>
          {PERGUNTAS.map((item, i) => {
            const estaAberta = aberta === item.id;
            const ehLink = Boolean(item.destino);

            return (
              <li
                key={item.id}
                className={`${styles.item} ${ehLink ? styles.itemLink : ''} ${item.id === 'contato' ? styles.itemContato : ''} ${estaAberta ? styles.itemAberto : ''}`}
                style={{ '--i': i }}
              >
                <button
                  type="button"
                  className={styles.pergunta}
                  aria-expanded={ehLink ? undefined : estaAberta}
                  onClick={() => (ehLink ? navigate(item.destino) : alternar(item.id))}
                >
                  <span>{item.pergunta}</span>
                  <span className={styles.seta} aria-hidden="true">{ehLink ? '→' : '▾'}</span>
                </button>

                {!ehLink && (
                  <div className={styles.respostaWrap}>
                    <div className={styles.respostaInterna}>
                      <p className={styles.resposta}>{item.resposta}</p>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <button type="button" className={styles.voltarButton} onClick={() => navigate(-1)}>
          Voltar
        </button>
      </section>
    </div>
  );
}

export default Faq;