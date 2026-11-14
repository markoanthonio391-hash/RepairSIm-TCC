import { useEffect } from 'react';
import { useSound } from '../context/useSound';

function SomGlobal() {
  const { play } = useSound();

  useEffect(() => {
    const aoClicar = (e) => {
      const btn = e.target.closest('button');
      if (!btn || btn.disabled) return;
      play(btn.dataset.som || 'click'); // data-som="back" troca o som daquele botão
    };

    const aoPassarMouse = (e) => {
      const btn = e.target.closest('button');
      if (!btn || btn.disabled) return;
      if (btn.contains(e.relatedTarget)) return; // evita repetir ao mover entre filhos do mesmo botão
      play('hover');
    };

    document.addEventListener('click', aoClicar);
    document.addEventListener('mouseover', aoPassarMouse);
    return () => {
      document.removeEventListener('click', aoClicar);
      document.removeEventListener('mouseover', aoPassarMouse);
    };
  }, [play]);

  return null;
}
export default SomGlobal;