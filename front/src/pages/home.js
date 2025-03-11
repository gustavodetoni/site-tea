import "../styles/App.scss";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { Link } from 'react-router-dom';
import React, {useContext}  from "react";
import banner from '../images/logoteasemf.png';
import midbanner from '../images/diariotea.png';
import Accordions from "../components/accordions";
import Agenda from "../components/agenda";
import QuemSomos from "../components/quemsomos";
import { AuthContext } from "../context/authProvider";

function Home() {
    const { isAuthenticated} = useContext(AuthContext);

  return (
    <>
      <div className='banner'>
        <div>
          <img src={banner} alt="banner" />
        </div>
        <div className="cardbanner">
          <div>
            <h1>Estimulando criança com TEA</h1>
          </div>
          <div>
            <h3>Acesse e acompanhe a programação desenvolvida especialmente para apoiar o desenvolvimento do seu filho!</h3>
          </div>
          {!isAuthenticated && <div className="buttoncenter"><Link className='button button-primary' to="/login">EXPERIMENTE GRÁTIS</Link></div>}
          <div className="buttoncenter"><Link className='button button-secondary' to="/contato">CONVERSAR COM A GENTE</Link></div>
        </div>
      </div>

      <Accordions />

      <div id="quemsomos">
        <QuemSomos />
      </div>

      <div className='midbanner'>
        <div>
          <img src={midbanner} alt="midbanner" width={350} />
        </div>
        <div className="midcardbanner">
          <div>
            <h1>Acesse a sua agenda de atividades</h1>
          </div>
          <div>
            <h3>Facilitamos o dia a dia dos pais de crianças com TEA com a ferramenta "Agenda de
              Atividades". Com o auxílio do terapeuta, a agenda é personalizada com atividades
              específcas para apoiar o desenvolvimento da criança. Os pais podem acessar e
              visualizar facilmente a programação planejada, garantindo que cada atividade seja
              realizada de forma adequada e no momento certo.
            </h3>
          </div>
          {!isAuthenticated && <div><Link className='midbutton midbutton-primary' to="/login">EXPERIMENTE GRÁTIS</Link></div>}
        </div>
      </div>

      <div id="agenda">
        <Agenda />
      </div>
    </>
  );
}

export default Home;
