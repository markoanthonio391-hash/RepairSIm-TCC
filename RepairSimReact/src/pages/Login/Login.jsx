import styles from './Login.module.css';
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { salvarUsuario } from '../../services/auth'
//import backgroundImage from '../../assets/imgFundo.jpeg'

function Login() {

    const navigate = useNavigate()
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async (e) => {
       try {
          e.preventDefault();
          setLoading(true);
          setError('');
          const response = await fetch('http://localhost:3000/usuarios/login', {
            method: 'POST',
            credentials: 'include', // permite receber o cookie de login
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha }),
            });
          const data = await response.json();
          if (response.ok) {
              salvarUsuario(data.usuario);
              alert(`Login realizado com sucesso!\n\nOlá ${data.usuario.username}!`);
              navigate('/');
          } else {
              setError(data.mensagem);
        }
      } catch (error) {
        console.error(error);
        setError("Não foi possível conectar ao servidor.");

      } finally {
        setLoading(false);
      }
    };
      
    const [particulas, setParticulas] = useState([]);

    useEffect(() => {
        const count = 60; // Total de partículas do seu código original
        const novasParticulas = Array.from({ length: count }).map((_, i) => {
        const size = Math.random() * 2.2 + 1; // Sua fórmula exata de tamanho
        const dur = (Math.random() * 3 + 2).toFixed(2); // Sua fórmula exata de duração
        const delay = (Math.random() * 4).toFixed(2); // Sua fórmula exata de atraso

        return {
            id: i,
            width: `${size}px`,
            height: `${size}px`,
            left: `${Math.random() * 100}vw`, // Posição horizontal do seu código
            top: `${Math.random() * 100}vh`,  // Posição vertical do seu código
            animationDuration: `${dur}s`,
            animationDelay: `${delay}s`
        };
        });
        
        setParticulas(novasParticulas);
    }, []);

    return(
        <div className={styles.page}>

            <div className={styles.stage}>
            <div className={styles.grid}></div>
            <div className={`${styles.hex} ${styles.bl}`}></div>
            <div className={`${styles.hex} ${styles.tr}`}></div>

            <svg className={styles.circuits} viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
                {/* Circuitos superiores esquerdos */}
                <path id="pathA" className={styles['circuit-line']} d="M -20,20 L 60,20 L 130,90 L 300,90 L 340,130" />
                <path id="pathB" className={`${styles['circuit-line']} ${styles.bright}`} d="M -20,110 L 40,110 L 100,170 L 260,170 L 300,210" />
                <path id="pathC" className={styles['circuit-line']} d="M -20,220 L 70,220 L 150,300 L 360,300 L 420,360" />
                <path id="pathD" className={styles['circuit-line']} d="M -20,330 L 90,330 L 160,400 L 260,400" />

                {/* Circuitos inferiores direitos */}
                <path id="pathE" className={`${styles['circuit-line']} ${styles.bright}`} d="M 1620,560 L 1500,560 L 1440,500 L 1300,500 L 1230,570 L 1130,570" />
                <path id="pathF" className={styles['circuit-line']} d="M 1620,660 L 1520,660 L 1460,600 L 1350,600 L 1300,650" />
                <path id="pathG" className={styles['circuit-line']} d="M 1620,780 L 1480,780 L 1420,720 L 1330,720 L 1280,770 L 1160,770" />
                <path id="pathH" className={`${styles['circuit-line']} ${styles.bright}`} d="M 1620,880 L 1500,880 L 1440,820 L 1360,820" />

                {/* Nós de conexão piscantes */}
                <circle className={`${styles.node} ${styles.pulse}`} cx="60" cy="20" r="3" style={{ animationDelay: '0s' }} />
                <circle className={`${styles.node} ${styles.pulse}`} cx="130" cy="90" r="3" style={{ animationDelay: '0.4s' }} />
                <circle className={`${styles.node} ${styles.pulse}`} cx="300" cy="90" r="3" style={{ animationDelay: '0.8s' }} />
                <circle className={`${styles.node} ${styles.pulse}`} cx="100" cy="170" r="3" style={{ animationDelay: '1.1s' }} />
                <circle className={`${styles.node} ${styles.pulse}`} cx="260" cy="170" r="3" style={{ animationDelay: '0.3s' }} />
                <circle className={`${styles.node} ${styles.pulse}`} cx="150" cy="300" r="3" style={{ animationDelay: '0.6s' }} />
                <circle className={`${styles.node} ${styles.pulse}`} cx="360" cy="300" r="3" style={{ animationDelay: '1.4s' }} />
                <circle className={`${styles.node} ${styles.pulse}`} cx="1500" cy="560" r="3" style={{ animationDelay: '0.2s' }} />
                <circle className={`${styles.node} ${styles.pulse}`} cx="1300" cy="500" r="3" style={{ animationDelay: '0.9s' }} />
                <circle className={`${styles.node} ${styles.pulse}`} cx="1230" cy="570" r="3" style={{ animationDelay: '1.3s' }} />
                <circle className={`${styles.node} ${styles.pulse}`} cx="1350" cy="600" r="3" style={{ animationDelay: '0.5s' }} />
                <circle className={`${styles.node} ${styles.pulse}`} cx="1420" cy="720" r="3" style={{ animationDelay: '0.7s' }} />
                <circle className={`${styles.node} ${styles.pulse}`} cx="1280" cy="770" r="3" style={{ animationDelay: '1.6s' }} />

                {/* Pulsos de energia móveis guiados */}
                <circle className={styles.traveler} r="3.2">
                <animateMotion dur="5.2s" repeatCount="indefinite" rotate="auto" calcMode="linear" keyPoints="0;1;0" keyTimes="0;0.5;1">
                    <mpath href="#pathA" />
                </animateMotion>
                </circle>
                <circle className={styles.traveler} r="3.2">
                <animateMotion dur="6.4s" repeatCount="indefinite" begin="0.8s" calcMode="linear" keyPoints="0;1;0" keyTimes="0;0.5;1">
                    <mpath href="#pathB" />
                </animateMotion>
                </circle>
                <circle className={styles.traveler} r="3.2">
                <animateMotion dur="5.8s" repeatCount="indefinite" begin="1.6s" calcMode="linear" keyPoints="0;1;0" keyTimes="0;0.5;1">
                    <mpath href="#pathC" />
                </animateMotion>
                </circle>
                <circle className={styles.traveler} r="2.8">
                <animateMotion dur="4.6s" repeatCount="indefinite" begin="0.3s" calcMode="linear" keyPoints="0;1;0" keyTimes="0;0.5;1">
                    <mpath href="#pathD" />
                </animateMotion>
                </circle>
                <circle className={styles.traveler} r="3.2">
                <animateMotion dur="5.6s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;0" keyTimes="0;0.5;1">
                    <mpath href="#pathE" />
                </animateMotion>
                </circle>
                <circle className={styles.traveler} r="3">
                <animateMotion dur="6.8s" repeatCount="indefinite" begin="1s" calcMode="linear" keyPoints="0;1;0" keyTimes="0;0.5;1">
                    <mpath href="#pathF" />
                </animateMotion>
                </circle>
                <circle className={styles.traveler} r="3.2">
                <animateMotion dur="6s" repeatCount="indefinite" begin="0.5s" calcMode="linear" keyPoints="0;1;0" keyTimes="0;0.5;1">
                    <mpath href="#pathG" />
                </animateMotion>
                </circle>
                <circle className={styles.traveler} r="2.8">
                <animateMotion dur="5s" repeatCount="indefinite" begin="1.8s" calcMode="linear" keyPoints="0;1;0" keyTimes="0;0.5;1">
                    <mpath href="#pathH" />
                </animateMotion>
                </circle>
            </svg>

                {/* Elemento de container das partículas injetadas */}
            <div className={styles.particlesContainer}>
                {particulas.map((p) => (
                <div
                    key={p.id}
                    className={styles.particle}
                    style={{
                    top: p.top,
                    left: p.left,
                    width: p.width,
                    height: p.height,
                    animationDelay: p.animationDelay,
                    animationDuration: p.animationDuration
                    }}
                />
                ))}
                </div>
            </div>  
            <form className={styles.card} onSubmit={handleSubmit}>
                <div className={styles.iconBadge}>🔧</div>
                <h1 className={styles.cardTitle}>Bem-vindo de volta</h1>
                <p className={styles.cardSubtitle}>Entre com seus dados para acessar sua conta</p>

                <label className={styles.fieldLabel} htmlFor="email">E-mail</label>
                <input
                    id="email"
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    className={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <label className={styles.fieldLabel} htmlFor="senha">Senha</label>
                <input
                    id="senha"
                    type="password"
                    placeholder="••••••••"
                    className={styles.input}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                />

                {error && <p className={styles.error}>{error}</p>}
                {loading && <p className={styles.loading}>Carregando...</p>}

                <button type="submit" className={styles.loginButton} disabled={loading}>
                    {loading ? 'Entrando...' : 'Entrar'}
                </button>

                <button type="button" className={styles.cancelarButton} onClick={() => navigate(-1)}>
                    Cancelar
                </button>

                <button type="button" className={styles.cadButton} onClick={() => navigate('/cadastro')}>
                    Não tem uma conta? <span className={styles.cadLink}>Cadastre-se</span>
                </button>
            </form>
        </div>
            // <label>
            //   <div className={styles.container}>
            //     <input  type="email" placeholder="   E-mail" className={styles.input}  value={email} onChange={(e)=>setEmail(e.target.value)} />
            //     <input type="password" placeholder="   Senha" className={styles.input}  value={senha} onChange={(e)=>setSenha(e.target.value)} />
            //     {error && <p className={styles.error}>{error}</p>}
            //           {loading && <p className={styles.loading}>Carregando...</p>}
            //           <div className={styles.containerButtons}>
            //             <button type="submit" className={`${styles.loginButton} ${styles.styleButton}`} onClick={handleSubmit} disabled={loading}  >
            //               Entrar
            //             </button>
            //             <button className={`${styles.cancelarButton} ${styles.styleButton}`} onClick={() => navigate(-1)}>
            //               Cancelar
            //             </button>
            //           </div>
            //         <button className={styles.cadButton} onClick={() => navigate('/cadastro')}>Clique aqui para cadastro.</button>
            //   </div>
            // </label>
      );
    }
    export default Login;
