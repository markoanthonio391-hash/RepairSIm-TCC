import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Importando as imagens
import imgTecnicoIniciante from '../../assets/conquistas/Conquista 1.webp';
import imgDiagnosticoMedio from '../../assets/conquistas/conquista 2.png';
import imgEspecialistaBancada from '../../assets/conquistas/conquista 3.jpg';
import imgMestreMundos from '../../assets/conquistas/conquista 4.jpg';
import imgRelatorioEntregue from '../../assets/conquistas/conquista 5.jpg';
import imgDetalhistaOficina from '../../assets/conquistas/conquista 6.jpg';
import imgPlantao10Min from '../../assets/conquistas/conquista 7.jpg';
import imgMaoNaMassa from '../../assets/conquistas/conquista 8.jpg';
import imgConexaoGlobal from '../../assets/conquistas/conquista 9.jpg';
import imgAuditoriaPerfeita from '../../assets/conquistas/conquista 10.jpg';

export default function Conquistas() {
    const navigate = useNavigate();
    const [conquistasDesbloqueadas, setConquistasDesbloqueadas] = useState([]);
    const [loading, setLoading] = useState(true);

    const listaConquistas = [
        { id: 1, codigo: 'TECNICO_INICIANTE', titulo: 'Técnico Iniciante', descricao: 'Conclua o seu primeiro desafio no modo Fácil.', icone: imgTecnicoIniciante },
        { id: 2, codigo: 'DIAGNOSTICO_MEDIO', titulo: 'Diagnóstico Intermediário', descricao: 'Complete um caso com sucesso no modo Médio.', icone: imgDiagnosticoMedio },
        { id: 3, codigo: 'ESPECIALISTA_BANCADA', titulo: 'Especialista de Bancada', descricao: 'Supere os desafios complexos jogando no modo Difícil.', icone: imgEspecialistaBancada },
        { id: 4, codigo: 'MESTRE_MUNDOS', titulo: 'Mestre dos Três Mundos', descricao: 'Jogue e conclua casos em todas as 3 dificuldades.', icone: imgMestreMundos },
        { id: 5, codigo: 'RELATORIO_ENTREGUE', titulo: 'Relatório Entregue', descricao: 'Envie o seu primeiro relatório de diagnóstico preenchido.', icone: imgRelatorioEntregue },
        { id: 6, codigo: 'DETALHISTA_OFICINA', titulo: 'Detalhista da Oficina', descricao: 'Complete 5 relatórios detalhando os componentes utilizados.', icone: imgDetalhistaOficina },
        { id: 7, codigo: 'PLANTAO_10MIN', titulo: 'Plantão de 10 Minutos', descricao: 'Dedique pelo menos 10 minutos seguidos na bancada de testes.', icone: imgPlantao10Min },
        { id: 8, codigo: 'MAO_NA_MASSA', titulo: 'Mão na Massa', descricao: 'Abra o painel de ferramentas e interaja com o sistema de montagem.', icone: imgMaoNaMassa },
        { id: 9, codigo: 'CONEXAO_GLOBAL', titulo: 'Conexão Global', descricao: 'Conclua com sucesso múltiplos casos envolvendo reparos em servidores ou sistemas de rede.', icone: imgConexaoGlobal },
        { id: 10, codigo: 'AUDITORIA_PERFEITA', titulo: 'Auditoria Perfeita', descricao: 'Finalize um caso no modo Difícil sem cometer erros de montagem.', icone: imgAuditoriaPerfeita },
    ];

    useEffect(() => {
        const id_usuario_teste = 1;

        fetch(`http://localhost:3000/api/conquistas/${id_usuario_teste}`)
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    const codigos = data.map((c) => c.codigo_conquista);
                    setConquistasDesbloqueadas(codigos);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error('Erro ao buscar conquistas:', err);
                setLoading(false);
            });
    }, []);

    return (
        <div style={{ 
            padding: '40px 20px', 
            color: '#fff', 
            textAlign: 'center', 
            minHeight: '100vh', 
            background: 'radial-gradient(circle at center, #0a192f 0%, #020b18 100%)',
            fontFamily: 'sans-serif'
        }}>
            <div style={{ maxWidth: '750px', margin: '0 auto' }}>
                <button 
                    onClick={() => navigate(-1)} 
                    style={{ 
                        padding: '10px 25px', 
                        marginBottom: '25px', 
                        cursor: 'pointer', 
                        background: 'transparent', 
                        border: '2px solid #00ffff', 
                        borderRadius: '6px', 
                        fontWeight: 'bold', 
                        color: '#00ffff',
                        boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                        e.target.style.background = '#00ffff';
                        e.target.style.color = '#000';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.color = '#00ffff';
                    }}
                >
                    Voltar
                </button>
                
                <h2 style={{ 
                    marginBottom: '35px', 
                    textShadow: '0 0 15px rgba(0, 255, 255, 0.7)', 
                    fontSize: '32px',
                    letterSpacing: '1px'
                }}>
                    Conquistas do RepairSim
                </h2>

                {loading ? (
                    <p style={{ color: '#00ffff', fontSize: '18px' }}>Carregando dados de conquistas...</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        {listaConquistas.map((c) => {
                            const desbloqueada = conquistasDesbloqueadas.includes(c.codigo);

                            return (
                                <div key={c.id} style={{ 
                                    background: desbloqueada ? 'rgba(0, 50, 40, 0.65)' : 'rgba(5, 15, 30, 0.75)', 
                                    border: desbloqueada ? '2px solid #00ff88' : '2px solid rgba(0, 255, 255, 0.25)', 
                                    borderRadius: '10px', 
                                    padding: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '20px',
                                    textAlign: 'left',
                                    boxShadow: desbloqueada ? '0 0 15px rgba(0, 255, 136, 0.3)' : '0 0 10px rgba(0, 0, 0, 0.5)',
                                    transition: 'transform 0.2s ease',
                                }}>
                                    <div style={{
                                        width: '76px',
                                        height: '76px',
                                        minWidth: '76px',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        background: '#01060d',
                                        border: desbloqueada ? '2px solid #00ff88' : '2px solid rgba(0, 255, 255, 0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: desbloqueada ? '0 0 10px rgba(0,255,136,0.4)' : 'none'
                                    }}>
                                        <img 
                                            src={c.icone} 
                                            alt={c.titulo} 
                                            style={{ 
                                                width: '100%', 
                                                height: '100%', 
                                                objectFit: 'cover',
                                                filter: desbloqueada ? 'none' : 'grayscale(100%) brightness(40%) contrast(120%)'
                                            }} 
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/76'; }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <h4 style={{ 
                                                margin: '0 0 6px 0', 
                                                color: desbloqueada ? '#00ff88' : '#00ffff', 
                                                fontSize: '18px',
                                                textShadow: desbloqueada ? '0 0 8px rgba(0,255,136,0.5)' : '0 0 8px rgba(0,255,255,0.3)'
                                            }}>
                                                {c.titulo}
                                            </h4>
                                            <span style={{ 
                                                fontSize: '12px', 
                                                padding: '3px 10px', 
                                                borderRadius: '12px', 
                                                background: desbloqueada ? 'rgba(0, 255, 136, 0.2)' : 'rgba(0, 255, 255, 0.1)',
                                                color: desbloqueada ? '#00ff88' : '#00ffff',
                                                border: desbloqueada ? '1px solid #00ff88' : '1px solid rgba(0, 255, 255, 0.3)',
                                                fontWeight: 'bold'
                                            }}>
                                                {desbloqueada ? 'DESBLOQUEADA' : 'BLOQUEADA'}
                                            </span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '14px', color: '#b0c4de', lineHeight: '1.4' }}>{c.descricao}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}