import { useEffect, useState } from "react";

function TesteApi() {

    const [desafios, setDesafios] = useState([]); //pega as informações de desafio

    useEffect(() => { //executado uma unica vez para pega todos os dados do banco

        fetch("http://localhost:3000/desafios")//acessa todos os desafios disponiveis
            .then(resposta => resposta.json()) //then transforma os dados em Objeto para o JavaScript
            .then(dados => {
                console.log(dados);
                setDesafios(dados);
            })
            .catch(erro => {
                console.log(erro);
            });

    }, []);

    return (

        <div>

            <h1>Desafios</h1>

            {

                desafios.map(desafio => ( //map cria um bloco para cada desafio em fomato html

                    <div key={desafio.id_desafio}>

                        <h2>{desafio.titulo}</h2>

                        <p>{desafio.descricao}</p>

                        <hr />

                    </div>

                ))

            }

        </div>

    );

}

export default TesteApi;