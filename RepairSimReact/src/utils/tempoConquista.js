import { ganharConquista } from "./ganharConquista";

const CHAVE_TEMPO_DIFICULDADES = "repairsim_tempo_bancada_dificuldades_v1";
const META_SEGUNDOS = 600; // 10 minutos

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

export function registrarTempoBancada(dificuldade, segundosGastos) {
  const seg = Number(segundosGastos || 0);
  if (!Number.isFinite(seg) || seg <= 0) return;

  const dif = normalizarChaveDificuldade(dificuldade);

  let dados = {};
  try {
    dados = JSON.parse(window.localStorage.getItem(CHAVE_TEMPO_DIFICULDADES) || "{}");
  } catch {
    dados = {};
  }

  const estado = {
    Facil: Number(dados?.Facil) || 0,
    Medio: Number(dados?.Medio) || 0,
    Dificil: Number(dados?.Dificil) || 0,
  };

  estado[dif] += seg;

  try {
    window.localStorage.setItem(CHAVE_TEMPO_DIFICULDADES, JSON.stringify(estado));
  } catch (erro) {
    console.warn("Não foi possível salvar tempo no localStorage:", erro);
  }

  const totalAcumulado = estado.Facil + estado.Medio + estado.Dificil;
  if (totalAcumulado >= META_SEGUNDOS) {
    ganharConquista("PLANTAO_10MIN", "Plantão de 10 Minutos");
  }
}