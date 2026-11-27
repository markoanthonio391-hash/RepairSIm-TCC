import { ganharConquista } from "./ganharConquista";

const CHAVE_TEMPO_DIFICULDADES = "repairsim_tempo_bancada_dificuldades_v1";
const CHAVE_PLANTAO_DISPARADO = "repairsim_plantao_10min_disparado_v1";
const META_SEGUNDOS = 600; // 10 minutos
const MAX_SEGUNDOS_POR_CASO = 86400; // trava de segurança contra timestamp inválido

function normalizarChaveDificuldade(dificuldade) {
  const limpa = String(dificuldade || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  if (limpa === "medio") return "Medio";
  if (limpa === "dificil") return "Dificil";
  return "Facil";
}

function lerEstadoTempo() {
  try {
    const dados = JSON.parse(window.localStorage.getItem(CHAVE_TEMPO_DIFICULDADES) || "{}");
    return {
      Facil: Math.max(0, Number(dados?.Facil) || 0),
      Medio: Math.max(0, Number(dados?.Medio) || 0),
      Dificil: Math.max(0, Number(dados?.Dificil) || 0),
    };
  } catch {
    return { Facil: 0, Medio: 0, Dificil: 0 };
  }
}

function jaDisparouPlantao10Min() {
  try {
    return window.localStorage.getItem(CHAVE_PLANTAO_DISPARADO) === "true";
  } catch {
    return false;
  }
}

function marcarPlantao10MinDisparado() {
  try {
    window.localStorage.setItem(CHAVE_PLANTAO_DISPARADO, "true");
  } catch (erro) {
    console.warn("Não foi possível salvar flag da conquista de 10 minutos:", erro);
  }
}

export function registrarTempoBancada(dificuldade, segundosGastos) {
  const seg = Number(segundosGastos);
  if (!Number.isFinite(seg) || seg <= 0 || seg > MAX_SEGUNDOS_POR_CASO) {
    return lerEstadoTempo();
  }

  const dif = normalizarChaveDificuldade(dificuldade);
  const estado = lerEstadoTempo();
  const estadoAntes = { ...estado };

  estado[dif] += Math.round(seg);

  try {
    window.localStorage.setItem(CHAVE_TEMPO_DIFICULDADES, JSON.stringify(estado));
  } catch (erro) {
    console.warn("Não foi possível salvar tempo no localStorage:", erro);
  }

  const totalAcumulado = estado.Facil + estado.Medio + estado.Dificil;

  console.log("[tempoConquista]", {
    dificuldadeRecebida: dificuldade,
    chaveNormalizada: dif,
    segundosRecebidos: Math.round(seg),
    estadoAntes,
    estadoDepois: estado,
    totalAcumulado,
    metaSegundos: META_SEGUNDOS
  });

  if (totalAcumulado >= META_SEGUNDOS && !jaDisparouPlantao10Min()) {
    marcarPlantao10MinDisparado();
    ganharConquista("PLANTAO_10MIN", "Plantão de 10 Minutos");
  }

  return estado;
}