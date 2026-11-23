import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import styles from './CadastrarDesafio.module.css';
import { API_URL, ehAdmin, limparSessao } from '../../services/auth';

// Tela do ADM: cadastrar casos exclusivos da instituição e remover os que já existem.
// ATENÇÃO: ehAdmin() só esconde a tela. Quem protege de verdade é o servidor (responde 403 para quem não é ADM).

const TIPOS_ACEITOS = ['image/png', 'image/jpeg', 'image/webp'];
const TAMANHO_MAXIMO = 2 * 1024 * 1024; // 2 MB por imagem

// nomes EXATOS dos campos de arquivo esperados pelo backend
const IMAGENS_FIXAS = [
  { campo: 'monitor_ligado', rotulo: 'Monitor ligado' },
  { campo: 'monitor_desligado', rotulo: 'Monitor desligado' },
  { campo: 'gabinete_ligado', rotulo: 'Gabinete ligado' },
  { campo: 'gabinete_desligado', rotulo: 'Gabinete desligado (o jogador clica nele para abrir)' },
  { campo: 'gabinete_limpo', rotulo: 'Gabinete aberto de lado e limpo (aparece quando o problema for resolvido)' }
];

const FORM_VAZIO = {
  titulo: '',
  cliente: '',
  descricao: '',
  problema_relatorio: '',
  diagnostico_relatorio: '',
  dica: '',
  origem_problema: 'hardware',
  id_item_resposta: ''
};

function CadastrarDesafio() {
  const navigate = useNavigate();

  const [form, setForm] = useState(FORM_VAZIO);
  const [arquivos, setArquivos] = useState({});  // { campo: File }
  const [previas, setPrevias] = useState({});    // { campo: url da prévia }
  const [itens, setItens] = useState([]);
  const [casos, setCasos] = useState([]);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [chaveInputs, setChaveInputs] = useState(0); // muda para limpar os campos de arquivo

  // sala de prova (código para os alunos)
  const [sala, setSala] = useState(null);            // { codigo, segundos_restantes }
  const [fimMs, setFimMs] = useState(0);             // momento (performance.now) em que o código expira
  const [agora, setAgora] = useState(() => performance.now());
  const [minutosSala, setMinutosSala] = useState(10);
  const [erroSala, setErroSala] = useState('');
  const [gerando, setGerando] = useState(false);

  const admin = ehAdmin();

  // trata respostas de sessão/permissão. Devolve true se já redirecionou.
  const tratarAcesso = useCallback((resposta) => {
    if (resposta.status === 401) {
      limparSessao();
      navigate('/login');
      return true;
    }
    if (resposta.status === 403) {
      navigate('/'); // o papel pode ter mudado: não é mais ADM
      return true;
    }
    return false;
  }, [navigate]);

  const carregarCasos = useCallback(async () => {
    try {
      const resposta = await fetch(`${API_URL}/desafios-exclusivos`, { credentials: 'include' });
      if (tratarAcesso(resposta)) return;
      if (!resposta.ok) throw new Error('Erro ao listar os casos.');
      const dados = await resposta.json();
      setCasos(Array.isArray(dados.casos) ? dados.casos : []);
    } catch (e) {
      console.error('Erro ao listar os casos exclusivos:', e);
      setErro('Não foi possível carregar a lista de casos.');
    }
  }, [tratarAcesso]);

  // coloca na tela o código vindo do servidor (a contagem usa os segundos que o SERVIDOR calculou)
  const mostrarSala = useCallback((dados) => {
    setSala(dados);
    setFimMs(performance.now() + dados.segundos_restantes * 1000);
    setAgora(performance.now());
  }, []);

  const carregarSala = useCallback(async () => {
    try {
      const resposta = await fetch(`${API_URL}/salas/ativa`, { credentials: 'include' });
      if (tratarAcesso(resposta)) return;
      if (!resposta.ok) throw new Error('Erro ao buscar o código.');
      const dados = await resposta.json();
      if (dados.sala) mostrarSala(dados.sala);
    } catch (e) {
      console.error('Erro ao buscar a sala ativa:', e);
    }
  }, [tratarAcesso, mostrarSala]);

  // contagem regressiva do código (atualiza a cada segundo enquanto existir um código)
  useEffect(() => {
    if (!sala) return;
    const timer = setInterval(() => setAgora(performance.now()), 1000);
    return () => clearInterval(timer);
  }, [sala]);

  // itens (opções da resposta correta) e lista de casos: uma vez ao abrir
  useEffect(() => {
    if (!admin) return;

    let cancelado = false;

    fetch(`${API_URL}/itens`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Erro ao buscar itens.'))))
      .then((dados) => { if (!cancelado) setItens(Array.isArray(dados) ? dados : []); })
      .catch((e) => {
        console.error(e);
        if (!cancelado) setErro('Não foi possível carregar a lista de itens.');
      });

    carregarCasos();
    carregarSala();

    return () => { cancelado = true; };
  }, [admin, carregarCasos, carregarSala]);

  // libera as URLs de prévia só ao sair da tela (a ref guarda sempre o valor mais recente)
  const previasRef = useRef({});
  useEffect(() => { previasRef.current = previas; }, [previas]);
  useEffect(() => () => {
    Object.values(previasRef.current).forEach((url) => URL.revokeObjectURL(url));
  }, []);

  // software: só itens de software. hardware: peças e ferramentas.
  const itensDisponiveis = useMemo(() => itens.filter((item) => (
    form.origem_problema === 'software'
      ? item.tipo === 'software'
      : item.tipo === 'peca' || item.tipo === 'ferramenta'
  )), [itens, form.origem_problema]);

  if (!admin) {
    return <Navigate to="/" replace />;
  }

  function alterar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  // ao trocar a origem, limpa a resposta já escolhida (o servidor recusa combinações erradas)
  function trocarOrigem(valor) {
    setForm((atual) => ({ ...atual, origem_problema: valor, id_item_resposta: '' }));
  }

  function escolherArquivo(campo, evento) {
    const arquivo = evento.target.files?.[0];

    setErro('');
    setSucesso('');

    if (!arquivo) {
      setArquivos((a) => { const n = { ...a }; delete n[campo]; return n; });
      setPrevias((p) => { const n = { ...p }; delete n[campo]; return n; });
      return;
    }

    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
      setErro('Use imagens PNG, JPG ou WEBP (SVG não é aceito).');
      evento.target.value = '';
      return;
    }

    if (arquivo.size > TAMANHO_MAXIMO) {
      setErro('Cada imagem pode ter no máximo 2 MB.');
      evento.target.value = '';
      return;
    }

    setArquivos((a) => ({ ...a, [campo]: arquivo }));
    setPrevias((p) => ({ ...p, [campo]: URL.createObjectURL(arquivo) }));
  }

  async function enviar(e) {
    e.preventDefault();

    if (enviando) return; // evita duplicar o caso com dois cliques

    setErro('');
    setSucesso('');

    const faltando = IMAGENS_FIXAS.filter((img) => !arquivos[img.campo]);
    if (faltando.length > 0) {
      setErro(`Envie as imagens: ${faltando.map((img) => img.rotulo.split(' (')[0]).join(', ')}.`);
      return;
    }

    if (!form.id_item_resposta) {
      setErro('Escolha o item da resposta correta.');
      return;
    }

    const dados = new FormData();
    Object.entries(form).forEach(([campo, valor]) => {
      if (campo === 'dica' && !valor.trim()) return; // dica é opcional
      dados.append(campo, valor);
    });
    Object.entries(arquivos).forEach(([campo, arquivo]) => dados.append(campo, arquivo));

    setEnviando(true);

    try {
      // NÃO definir Content-Type: o navegador coloca sozinho o "boundary" do multipart
      const resposta = await fetch(`${API_URL}/desafios-exclusivos`, {
        method: 'POST',
        credentials: 'include',
        body: dados
      });

      if (tratarAcesso(resposta)) return;

      const resultado = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        // 400 e 429: a API manda a mensagem pronta em português
        setErro(resultado.mensagem || 'Não foi possível cadastrar o caso.');
        return;
      }

      setSucesso(resultado.mensagem || 'Caso cadastrado com sucesso!');
      setForm(FORM_VAZIO);
      setArquivos({});
      setPrevias({});
      setChaveInputs((n) => n + 1);
      carregarCasos();
    } catch (erroRede) {
      console.error('Erro ao cadastrar o caso:', erroRede);
      setErro('Não foi possível conectar ao servidor.');
    } finally {
      setEnviando(false);
    }
  }

  async function gerarCodigo() {
    if (gerando) return;

    setGerando(true);
    setErroSala('');

    try {
      const resposta = await fetch(`${API_URL}/salas`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutos: minutosSala })
      });

      if (tratarAcesso(resposta)) return;

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        setErroSala(dados.mensagem || 'Não foi possível gerar o código.');
        return;
      }

      mostrarSala(dados.sala);
    } catch (erroRede) {
      console.error('Erro ao gerar o código:', erroRede);
      setErroSala('Não foi possível conectar ao servidor.');
    } finally {
      setGerando(false);
    }
  }

  async function cancelarCodigo() {
    setErroSala('');

    try {
      const resposta = await fetch(`${API_URL}/salas/ativa`, { method: 'DELETE', credentials: 'include' });

      if (tratarAcesso(resposta)) return;

      if (!resposta.ok) {
        setErroSala('Não foi possível cancelar o código.');
        return;
      }

      setSala(null);
    } catch (erroRede) {
      console.error('Erro ao cancelar o código:', erroRede);
      setErroSala('Não foi possível conectar ao servidor.');
    }
  }

  // interruptor do professor: caso desativado não entra no sorteio (mas pode ser reativado)
  async function alternarAtivo(caso) {
    const novoValor = !caso.ativo;

    setErro('');
    setSucesso('');

    try {
      const resposta = await fetch(`${API_URL}/desafios-exclusivos/${caso.id_desafio}/ativo`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: novoValor })
      });

      if (tratarAcesso(resposta)) return;

      const resultado = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        setErro(resultado.mensagem || 'Não foi possível alterar o caso.');
        return;
      }

      // atualiza só este caso na lista (sem buscar tudo de novo)
      setCasos((lista) => lista.map((c) => (c.id_desafio === caso.id_desafio ? { ...c, ativo: novoValor ? 1 : 0 } : c)));
    } catch (erroRede) {
      console.error('Erro ao alterar o caso:', erroRede);
      setErro('Não foi possível conectar ao servidor.');
    }
  }

  async function remover(caso) {
    if (!window.confirm(`Remover o caso "${caso.titulo}" do jogo?`)) return;

    setErro('');
    setSucesso('');

    try {
      const resposta = await fetch(`${API_URL}/desafios-exclusivos/${caso.id_desafio}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (tratarAcesso(resposta)) return;

      const resultado = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        setErro(resultado.mensagem || 'Não foi possível remover o caso.');
        return;
      }

      setSucesso(resultado.mensagem || 'Caso removido com sucesso.');
      carregarCasos();
    } catch (erroRede) {
      console.error('Erro ao remover o caso:', erroRede);
      setErro('Não foi possível conectar ao servidor.');
    }
  }

  const restante = sala ? Math.max(0, Math.ceil((fimMs - agora) / 1000)) : 0;
  const minutosRestantes = String(Math.floor(restante / 60)).padStart(2, '0');
  const segundosRestantes = String(restante % 60).padStart(2, '0');

  const rotuloProblema = form.origem_problema === 'software'
    ? 'Monitor mostrando o problema'
    : 'Gabinete aberto mostrando o problema';

  return (
    <div className={styles.pagina}>
      <div className={styles.conteudo}>
        <h1 className={styles.titulo}>CADASTRAR DESAFIO</h1>

        <form className={styles.secao} onSubmit={enviar}>
          <div className={styles.campo}>
            <label htmlFor="titulo">Título (3 a 80 caracteres)</label>
            <input id="titulo" type="text" maxLength={80} value={form.titulo} onChange={(e) => alterar('titulo', e.target.value)} required />
          </div>

          <div className={styles.campo}>
            <label htmlFor="cliente">Nome do cliente</label>
            <input id="cliente" type="text" maxLength={100} value={form.cliente} onChange={(e) => alterar('cliente', e.target.value)} required />
          </div>

          <div className={styles.campo}>
            <label htmlFor="descricao">O que o cliente fala (aparece como "Sintomas", 10 a 255)</label>
            <textarea id="descricao" maxLength={255} value={form.descricao} onChange={(e) => alterar('descricao', e.target.value)} required />
          </div>

          <div className={styles.campo}>
            <label htmlFor="problema">Resumo do problema (usado no relatório)</label>
            <textarea id="problema" maxLength={1000} value={form.problema_relatorio} onChange={(e) => alterar('problema_relatorio', e.target.value)} required />
          </div>

          <div className={styles.campo}>
            <label htmlFor="diagnostico">Diagnóstico (usado no relatório)</label>
            <textarea id="diagnostico" maxLength={1000} value={form.diagnostico_relatorio} onChange={(e) => alterar('diagnostico_relatorio', e.target.value)} required />
          </div>

          <div className={styles.campo}>
            <label htmlFor="dica">Dica (opcional)</label>
            <input id="dica" type="text" maxLength={255} value={form.dica} onChange={(e) => alterar('dica', e.target.value)} />
          </div>

          <div className={styles.campo}>
            <label htmlFor="origem">Origem do problema</label>
            <select id="origem" value={form.origem_problema} onChange={(e) => trocarOrigem(e.target.value)}>
              <option value="hardware">Hardware (peça ou ferramenta)</option>
              <option value="software">Software</option>
            </select>
          </div>

          <div className={styles.campo}>
            <label htmlFor="resposta">Item da resposta correta</label>
            <select id="resposta" value={form.id_item_resposta} onChange={(e) => alterar('id_item_resposta', e.target.value)} required>
              <option value="">Escolha um item...</option>
              {itensDisponiveis.map((item) => (
                <option key={item.id_item} value={item.id_item}>{item.nome} ({item.tipo})</option>
              ))}
            </select>
            <span className={styles.ajuda}>
              {form.origem_problema === 'software' ? 'Só itens de software.' : 'Só peças e ferramentas.'}
            </span>
          </div>

          <div className={styles.grade} key={chaveInputs}>
            {IMAGENS_FIXAS.map((img) => (
              <div className={styles.campo} key={img.campo}>
                <label htmlFor={img.campo}>{img.rotulo} *</label>
                <input id={img.campo} type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => escolherArquivo(img.campo, e)} />
                {previas[img.campo] && <img className={styles.previa} src={previas[img.campo]} alt={`Prévia: ${img.rotulo}`} />}
              </div>
            ))}

            <div className={styles.campo}>
              <label htmlFor="imagem_problema">{rotuloProblema} (opcional)</label>
              <input id="imagem_problema" type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => escolherArquivo('imagem_problema', e)} />
              {previas.imagem_problema && <img className={styles.previa} src={previas.imagem_problema} alt={`Prévia: ${rotuloProblema}`} />}
            </div>
          </div>
          <p className={styles.ajuda}>PNG, JPG ou WEBP, até 2 MB cada. As 5 imagens com * são obrigatórias. Sem a imagem do problema o jogador vê menos pistas.</p>

          {erro && <p className={styles.erro} role="alert">{erro}</p>}
          {sucesso && <p className={styles.sucesso} role="status">{sucesso}</p>}

          <div className={styles.botoes}>
            <button type="submit" className={styles.botao} disabled={enviando}>
              {enviando ? 'SALVANDO...' : 'SALVAR CASO'}
            </button>
            <button type="button" className={`${styles.botao} ${styles.botaoVoltar}`} onClick={() => navigate('/')}>
              VOLTAR
            </button>
          </div>
        </form>

        <section className={styles.secao}>
          <h2>Casos da sua instituição</h2>
          <p className={styles.ajuda}>Só os casos ativos entram no sorteio (até 10 por partida). Desativar não apaga o caso; remover apaga de vez.</p>
          {casos.length === 0 ? (
            <p>Nenhum caso cadastrado ainda.</p>
          ) : (
            casos.map((caso) => (
              <div className={`${styles.caso} ${caso.ativo ? '' : styles.casoInativo}`} key={caso.id_desafio}>
                <div className={styles.casoInfo}>
                  <strong>{caso.titulo}</strong>
                  <small>{caso.cliente} · {caso.origem_problema} · resposta: {caso.item_resposta}</small>
                  <small>{caso.ativo ? 'Ativo: entra no sorteio' : 'Desativado: não entra no sorteio'}</small>
                </div>
                <div className={styles.acoesCaso}>
                  <button type="button" className={`${styles.botao} ${caso.ativo ? styles.botaoVoltar : ''}`} onClick={() => alternarAtivo(caso)}>
                    {caso.ativo ? 'DESATIVAR' : 'ATIVAR'}
                  </button>
                  <button type="button" className={`${styles.botao} ${styles.botaoPerigo}`} onClick={() => remover(caso)}>
                    REMOVER
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        <section className={styles.secao}>
          <h2>Sala de prova (código para os alunos)</h2>
          <p className={styles.ajuda}>
            O aluno digita este código em "Casos exclusivos" para COMEÇAR uma partida com os seus casos ativos.
            Quem já começou termina normalmente depois que o código expira. Um código novo cancela o anterior.
          </p>

          <div className={styles.campo}>
            <label htmlFor="validade">Validade do código</label>
            <select id="validade" value={minutosSala} onChange={(e) => setMinutosSala(Number(e.target.value))}>
              <option value={5}>5 minutos</option>
              <option value={10}>10 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={60}>60 minutos</option>
            </select>
          </div>

          <div className={styles.botoes}>
            <button type="button" className={styles.botao} onClick={gerarCodigo} disabled={gerando}>
              {gerando ? 'GERANDO...' : 'GERAR CÓDIGO'}
            </button>
            {sala && restante > 0 && (
              <button type="button" className={`${styles.botao} ${styles.botaoVoltar}`} onClick={cancelarCodigo}>
                CANCELAR CÓDIGO
              </button>
            )}
          </div>

          {sala && (
            <div className={styles.codigoBox}>
              <span className={restante > 0 ? styles.codigo : `${styles.codigo} ${styles.codigoExpirado}`}>{sala.codigo}</span>
              <span>
                {restante > 0
                  ? `Expira em ${minutosRestantes}:${segundosRestantes}`
                  : 'Código expirado. Gere outro para novas partidas.'}
              </span>
            </div>
          )}

          {erroSala && <p className={styles.erro} role="alert">{erroSala}</p>}
        </section>
      </div>
    </div>
  );
}

export default CadastrarDesafio;
