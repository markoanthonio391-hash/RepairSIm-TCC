// Mostra de 0 a 5 estrelas (★ cheia, ☆ vazia). Se "valor" vier vazio (partida antiga ou sem nota), mostra um traço.
function Estrelas({ valor, tamanho = '1.1rem' }) {
  if (valor === null || valor === undefined) {
    return <span title="Sem nota">—</span>;
  }

  const cheias = Math.max(0, Math.min(5, Number(valor)));

  return (
    <span aria-label={`${cheias} de 5 estrelas`} title={`${cheias} de 5 estrelas`} style={{ fontSize: tamanho, letterSpacing: 2, color: '#facc15', whiteSpace: 'nowrap' }}>
      {'★'.repeat(cheias)}
      <span style={{ color: '#6b7280' }}>{'☆'.repeat(5 - cheias)}</span>
    </span>
  );
}

export default Estrelas;
