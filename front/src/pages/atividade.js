import "../styles/atividades.scss"
import { useParams, useNavigate, Link } from "react-router-dom";
import React from 'react'
import { atividade } from "../mocks/atividades";
import { Button } from 'primereact/button';
import { BreadCrumb } from 'primereact/breadcrumb';


const Atividade = () => {

  const { slug } = useParams();
  const navigate = useNavigate();

  let currentCategory, currentActivity;
  for (const category of atividade) {
    const item = category.items.find(item => item.slug === slug);
    if (item) {
      currentCategory = category;
      currentActivity = item;
      break;
    }
  }

  const allItems = atividade.flatMap(categoria => categoria.items);
  const currentIndex = allItems.findIndex(item => item.slug === slug);

  const goToNextActivity = () => {
    if (currentIndex < allItems.length - 1) {
      const nextSlug = allItems[currentIndex + 1].slug;
      navigate(`/atividades/${nextSlug}`);
    }
  };

  const goToPreviousActivity = () => {
    if (currentIndex > 0) {
      const previousSlug = allItems[currentIndex - 1].slug;
      navigate(`/atividades/${previousSlug}`);
    }
  };

  const items = [{label: currentCategory?.name, url: `/${currentCategory?.slug}` },{ label: currentActivity?.nome }];
  const home = { icon: 'pi pi-home', url: '/' }
  

  if (!currentActivity) {
    return <p>Atividade não encontrada.</p>;
  }

  return (
    <div className="activies">
        <BreadCrumb home={home} model={items}/>

        <div className="next-prev-buttons">
          {currentIndex > 0 ? 
            <Button
              label="<- Anterior"
              unstyled
              onClick={goToPreviousActivity} 
            /> : <p></p>
          }
          {currentIndex < allItems.length - 1 ? 
            <Button
              label="Próxima ->"
              unstyled
              onClick={goToNextActivity} 
            />
            : <p></p>
          }
        </div>

        <h2><Link className="current-hability" to='/#section'>{currentCategory.name}</Link>: {currentActivity.nome}</h2>
        {currentActivity.duracao && 
          <h4>Duração: {currentActivity.duracao}</h4>
        }

        <div className="activies-grid">
          <div className="box">
            <p className="title">Objetivos da Atividade</p>
            <p>{currentActivity.objetivo}</p>
          </div>

          <div className="box">
            <p className="title">Materiais</p>
            <p>{currentActivity.materiais}</p>
          </div>

          <div className="box">
            <p className="title">Descrição</p>
            <p>{currentActivity.descricao}</p>
          </div>

        </div>

        <div className="img-atividade">
          <img src={currentActivity.img} alt=""/>
        </div>
    </div>
  )
}

export default Atividade
