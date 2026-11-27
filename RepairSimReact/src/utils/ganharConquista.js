const EVENTO_CONQUISTA = "repairsim:conquista-desbloqueada";

export function notificarConquistaNaTela(codigo, titulo) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(EVENTO_CONQUISTA, {
      detail: { codigo, titulo }
    })
  );
}

export async function ganharConquista(codigo_conquista, titulo) {
  const codigoLimpo = String(codigo_conquista || "").trim().toUpperCase();
  if (!codigoLimpo) {
    console.warn("ganharConquista chamado sem codigo_conquista.");
    return null;
  }

  const tituloFinal = String(titulo || codigoLimpo).trim();

  try {
    const resposta = await fetch("http://localhost:3000/api/conquistas/desbloquear", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codigo_conquista: codigoLimpo,
        titulo: tituloFinal
      })
    });

    const textoResposta = await resposta.text().catch(() => "");
    let dados = null;
    if (textoResposta) {
      try {
        dados = JSON.parse(textoResposta);
      } catch {
        dados = { mensagem: textoResposta };
      }
    }

    if (!resposta.ok) {
      console.warn("Falha ao desbloquear conquista:", resposta.status, textoResposta);
      return null;
    }

    console.log("Resposta conquista:", dados);

    // Exibe a notificação estilo Steam na tela
    notificarConquistaNaTela(codigoLimpo, tituloFinal);

    // Se o backend desbloqueou MESTRE_MUNDOS junto, exibe o toast dele também
    if (dados?.mestreMundosDesbloqueado) {
      notificarConquistaNaTela("MESTRE_MUNDOS", "Mestre dos Três Mundos");
    }

    return dados;
  } catch (erro) {
    console.error("Erro ao chamar conquista:", erro);
    return null;
  }
}