export async function ganharConquista(codigo_conquista, titulo) {
  const codigoLimpo = String(codigo_conquista || "").trim().toUpperCase();
  if (!codigoLimpo) {
    console.warn("ganharConquista chamado sem codigo_conquista.");
    return null;
  }

  try {
    const resposta = await fetch("http://localhost:3000/api/conquistas/desbloquear", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codigo_conquista: codigoLimpo,
        titulo: titulo || codigoLimpo
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
    return dados;
  } catch (erro) {
    console.error("Erro ao chamar conquista:", erro);
    return null;
  }
}