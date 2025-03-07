import React, { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Accordion, AccordionTab } from "primereact/accordion";
import { Stepper } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import { Tree } from 'primereact/tree';
import { Button } from 'primereact/button';
import { treeTableAtv } from "../mocks/atividades";
import { atividade } from "../mocks/atividades";

const Accordions = () => {

  const stepperRef = useRef(null);
  const navigate = useNavigate();
  const [dataAtividades, setDataAtividades] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    treeTableAtv.getTreeAtividade().then((data) => setDataAtividades(data));

    const userLoggedIn = checkUserAuthentication(); 
    setIsAuthenticated(userLoggedIn);
  }, []);

  const checkUserAuthentication = () => {
    return localStorage.getItem("token") ? true : false;
  };

  const accordionHeader = (text, type) => {
    return(
      <>
        {type === 1 ? 
        <i className={`pi pi-comments`}></i>
          : type === 2 ? 
          <i className={`pi pi-check-circle`}></i>
          : type === 4 ? 
          <i className={`pi pi-crown`}></i>
          :
          <i className={`pi pi-history`}></i>
        }
        <p>{text}</p>
        <i className="pi pi-angle-down"></i>
      </>
    )
  }
  const onRowSelect = (e) => {
    const selectedAtividade = e.node;
    if(selectedAtividade.children){
      navigate(`/${selectedAtividade.slug}`);
    } else {
      let currentCategory;
      for (const category of atividade) {
        const item = category.items.find(item => item.slug === selectedAtividade.slug);
        if (item) {
          currentCategory = category;
          //currentActivity = item;
          break;
        }
      }
      if(selectedAtividade.slug !== ''){
        navigate(`/${currentCategory.slug}/${selectedAtividade.slug}`);
      }
    }
  };

  return (
    <div className='principal-accordin'>
    <Accordion collapseIcon expandIcon className="home-accordion">
        <AccordionTab header={accordionHeader('Conversando sobre TEA', 1)}>
          <p className="m-0">
            O Transtorno do Espectro Autista (TEA) é um transtorno do neurodesenvolvimento, caracterizado pelas dificuldades de comunicação e interação social e também comportamentos restritos e repetitivos. 
            <br /><br />
            Para um melhor prognóstico, é essencial que a criança com TEA seja estimulada precocemente.
            <br /><br />
            Esse App se destina a pais e cuidadores com objetivo de orientar e apresentar um Protocolo de Estimulação para crianças com TEA desenvolvido e apresentado no Programa de Pós Graduação Scritu Sensu em Distúrbios do Desenvolvimento.    
          </p>
        </AccordionTab>
        <AccordionTab header={accordionHeader('Benefícios', 4)}>
          <p className="m-0">
            Com esta ferramenta, você pode: 
            <br /><br />
            Visualizar a agenda semanal de forma clara e organizada;
            <br /><br />
            Receber orientações sobre cada atividade e como executá-la;
            <br /><br />
            Ajustar a programação junto ao terapeuta conforme as necessidades da criança.
          </p>
        </AccordionTab>
        <AccordionTab header={accordionHeader('Orientações', 2)}>
          <Stepper ref={stepperRef} style={{ flexBasis: '10rem' }} className="home-stepper">
            <StepperPanel >
              <p>Este é um App destinado a pais e terapeutas e contém 1 Protocolo  de Estimulação Psicomotora para criança com TEA a fim de estimular o desenvolvimento psicomotor. </p>
              <Button label="Próximo" icon="pi pi-arrow-right" iconPos="right" onClick={() => stepperRef.current.nextCallback()} />
            </StepperPanel>
            <StepperPanel>
              <p>As atividades estão organizadas em uma  lista, e você poderá escolher a sequencia a ser realizada ou seguir uma sugestão do App.</p>
              <Button label="Prévio" icon="pi pi-arrow-left" iconPos="left" onClick={() => stepperRef.current.prevCallback()} />
              <Button label="Próximo" icon="pi pi-arrow-right" iconPos="right" onClick={() => stepperRef.current.nextCallback()} />
            </StepperPanel>
            <StepperPanel>
              <p>Antes de iniciar as atividades, organize o material e o ambiente previamente.</p>
              <Button label="Prévio" icon="pi pi-arrow-left" iconPos="left" onClick={() => stepperRef.current.prevCallback()} />
              <Button label="Próximo" icon="pi pi-arrow-right" iconPos="right" onClick={() => stepperRef.current.nextCallback()} />
            </StepperPanel>
            <StepperPanel>
              <p>Após a preparação do ambiente, inicie as atividades e não esqueça de se divertir com seu filho. </p>
              <Button label="Prévio" icon="pi pi-arrow-left" iconPos="left" onClick={() => stepperRef.current.prevCallback()} />
            </StepperPanel>
          </Stepper>
        </AccordionTab>

        <AccordionTab header={accordionHeader('Intervenções', 3)}>
            <Tree  value={dataAtividades} className="tabela-de-atividades" selectionMode="single" onSelect={onRowSelect} showHeader={false} />
        </AccordionTab>
        
    </Accordion>
    </div>
  )
}

export default Accordions
