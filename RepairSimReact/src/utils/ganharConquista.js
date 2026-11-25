export async function ganharConquista(codigo_conquista, titulo) {
  try {
    const resposta = await fetch("http://localhost:3000/api/conquistas/desbloquear", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codigo_conquista,
        titulo
      })
    });

    if (!resposta.ok) return null;

    const dados = await resposta.json();
    console.log("Resposta conquista:", dados);
    return dados;
  } catch (erro) {
    console.error("Erro ao chamar conquista:", erro);
  }
}