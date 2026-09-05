// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import styles from './Cadastro.module.css'
// // import backgroundImage from '../../../assets/imgFundoBranco.jpeg'
// function Cadastro() {
//     const navigate = useNavigate()
//     const [nome, setNome] = useState('');
//     // const [sobrenome, setSobrenome] = useState(''); //CRIAR no back e mysql
//     const [username, setUsername] = useState('');
//     const [data_nascimento, setDataNascimento] = useState('');
//     /*const [telefone, setTelefone] = useState(''); //CRIAR no back e mysql*/
//     const [email, setEmail] = useState('');
//     const [senha, setSenha] = useState('');
//     const [confirmarSenha, setConfirmarSenha] = useState('');
//     const [termosAceitos, setTermosAceitos] = useState(false);
//     const [error, setError] = useState('');
//     const [loading, setLoading] = useState(false);
//     const handleSubmit = async (e) => {
//        try {
//           e.preventDefault();
//           setLoading(true);
//           setError('');
//           const response = await fetch('http://localhost:3000/usuarios/cadastro', {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({ nome, username, data_nascimento, email, senha }),
//           });
//           const data = await response.json();

//           if(senha != confirmarSenha){
//             alert("Repita a mesma senha que você colocou!");
//             return;
//           }

//           if (response.ok) {
//               localStorage.setItem('usuario', JSON.stringify(data.usuario));
//               alert(`Cadastro realizado com sucesso!\n\n Realize o login da sua nova conta!`);
//               navigate(-1);
//           }
         
//         else {
//             setError(data.mensagem);
//         }
//       } catch (error) {
//         console.error(error);
//         setError("Não foi possível conectar ao servidor.");

//       } finally {
//       setLoading(false);
//       }
//     };
//       return(
//         <div className={styles.container}>
//             {/* <div className={styles.bckground}>
//                 <img src={backgroundImage} alt="Background" className={styles.bckground} />
//             </div> */}
//             <input type="text" value={nome} onChange={(e)=>setNome(e.target.value)} placeholder='   Nome' className={styles.input}/>
//             <input type="text" placeholder='   Sobrenome' className={styles.input}/>
//             <input type='text' value={username} onChange={(e)=>setUsername(e.target.value)} placeholder='   Username' className={styles.input}/>
//             <input type="date" value={data_nascimento} onChange={(e)=>setDataNascimento(e.target.value)} placeholder='   Data de Nascimento' className={styles.input}/>
//             <input type='tel' placeholder='   (00) 00000-0000' className={styles.input}/>
//             <input  type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="   E-mail" className={styles.input} />
//             <input type="password" value={senha} onChange={(e)=>setSenha(e.target.value)} placeholder="   Senha" className={styles.input} />
//             <input type='password' value={confirmarSenha} onChange={(e)=>setConfirmarSenha(e.target.value)} placeholder='   Confirme a senha'  className={styles.input} />
//             <div className={styles.containerTerms}>
//                 <input type='checkbox' className={styles.inputTerms} />
//                 <h10 className={styles.terms}> Li e aceito os termos de uso</h10>
//                 {error && <p className={styles.error}>{error}</p>} {/*mensagem de erro da controler*/}
//                     {loading && <p className={styles.loading}>Criando conta...</p>}
//             </div>
//             <button type='submit' className={`${styles.confirmarButton} ${styles.styleButton}`} onClick={handleSubmit} disabled={loading}>Confirmar</button>
//             <button className={`${styles.cancelarButton} ${styles.styleButton}`} onClick={() => navigate(-1)}>Cancelar</button>
//         </div>
        
          
        
//       )
//     };
//     export default Cadastro;

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Cadastro.module.css'
import backgroundImage from '../../../assets/imgFundo.jpeg'

function Cadastro() {
    const navigate = useNavigate()
    const [nome, setNome] = useState('');
    const [username, setUsername] = useState('');
    const [data_nascimento, setDataNascimento] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (senha !== confirmarSenha) {
            setError("As senhas não coincidem.");
            return;
        }
        try {
            setLoading(true);
            setError('');
            const response = await fetch('http://localhost:3000/usuarios/cadastro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, username, data_nascimento, email, senha }),
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
                alert(`Cadastro realizado com sucesso!\n\nRealize o login da sua nova conta!`);
                navigate(-1);
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

    return (
        <div className={styles.page}>
            <div className={styles.bckground}>
                <img src={backgroundImage} alt="Background" className={styles.bckgroundImg} />
            </div>

            <form className={styles.card} onSubmit={handleSubmit}>
                <div className={styles.iconBadge}>🔧</div>
                <h1 className={styles.cardTitle}>Criar conta</h1>
                <p className={styles.cardSubtitle}>Preencha seus dados para começar</p>

                <div className={styles.grid}>
                    <div className={styles.field}>
                        <label className={styles.fieldLabel}>Nome</label>
                        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" className={styles.input} />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.fieldLabel}>Sobrenome</label>
                        <input type="text" placeholder="Seu sobrenome" className={styles.input} />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.fieldLabel}>Username</label>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Nome de usuário" className={styles.input} />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.fieldLabel}>Data de nascimento</label>
                        <input type="date" value={data_nascimento} onChange={(e) => setDataNascimento(e.target.value)} className={styles.input} />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.fieldLabel}>Telefone</label>
                        <input type="tel" placeholder="(00) 00000-0000" className={styles.input} />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.fieldLabel}>E-mail</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@exemplo.com" className={styles.input} />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.fieldLabel}>Senha</label>
                        <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" className={styles.input} />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.fieldLabel}>Confirme a senha</label>
                        <input type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} placeholder="••••••••" className={styles.input} />
                    </div>
                </div>

                <div className={styles.termsRow}>
                    <input type="checkbox" className={styles.inputTerms} id="termos" aria-label="Li e aceito os termos de uso" />
                    <label htmlFor="termos" className={styles.terms}>Li e aceito os termos de uso</label>
                </div>

                {error && <p className={styles.error}>{error}</p>}
                {loading && <p className={styles.loading}>Criando conta...</p>}

                <button type="submit" className={styles.confirmarButton} disabled={loading}>
                    {loading ? 'Criando conta...' : 'Confirmar'}
                </button>
                <button type="button" className={styles.cancelarButton} onClick={() => navigate(-1)}>
                    Cancelar
                </button>
            </form>
        </div>
    );
}
export default Cadastro;