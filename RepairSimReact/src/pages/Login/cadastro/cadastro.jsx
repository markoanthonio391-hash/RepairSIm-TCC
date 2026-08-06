import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Cadastro.module.css'
// import backgroundImage from '../../../assets/imgFundoBranco.jpeg'
function cadastro() {

      return(
        <div className={styles.container}>
            {/* <div className={styles.bckground}>
                <img src={backgroundImage} alt="Background" className={styles.bckground} />
            </div> */}
            <input type="text" placeholder='   Nome' className={styles.input}/>
            <input type="text" placeholder='   Sobrenome' className={styles.input}/>
            <input type='text' placeholder='   Username' className={styles.input}/>
            <input type="date" placeholder='   Data de Nascimento' className={styles.input}/>
            <input type="tel" placeholder='   Telefone' className={styles.input}/>
            <input  type="email" placeholder="   E-mail" className={styles.input} />
            <input type="password" placeholder="   Senha" className={styles.input} />
            <input type='password'  placeholder='   Confirme a senha'  className={styles.input} />
            <div className={styles.containerTerms}>
                <input type='checkbox' className={styles.inputTerms} />
                <h10 className={styles.terms}> Li e aceito os termos de uso</h10>
            </div>
        </div>
      )
    };
    export default cadastro;