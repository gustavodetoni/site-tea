import React from 'react'
import { useParams, useNavigate, Link } from "react-router-dom";
import { atividade } from "../mocks/atividades";
import Container from 'react-bootstrap/esm/Container';
import '../styles/habilidades.scss'

const Habilidades = () => {

  const { slug } = useParams();
  const navigate = useNavigate()

  const encontrarNomePorSlug = () => {
    const atual = atividade.find(atv => atv.slug === slug);
    return atual ? atual : null;
  };

  const nomeAtividade = encontrarNomePorSlug();


  return (
    <Container className='habilidades-container'>
      <h1>{nomeAtividade.name}</h1>
      <h3>{nomeAtividade.descricao}</h3>

    <div className='atividades'>
      {nomeAtividade?.items?.map((item) => {
        return(
            <div className='atividade' onClick={() => navigate(`/${nomeAtividade.slug}/${item.slug}`)}>
                {item.nome}
            </div>
        )
      })}
    </div>
    </Container>
  )
}

export default Habilidades
