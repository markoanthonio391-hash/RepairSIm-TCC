export async function ganharConquista(codigo_conquista, titulo) {
  try {
    const resposta = await fetch("http://localhost:3000/api/conquistas/desbloquear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_usuario: 1, // ID de teste que deixamos no banco repairsim2
        codigo_conquista,
        titulo
      })
    });

    const dados = await resposta.json();
    console.log("Resposta conquista:", dados);
    return dados;
  } catch (erro) {
    console.error("Erro ao chamar conquista:", erro);
  }
}