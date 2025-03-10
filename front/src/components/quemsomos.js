import 'primeicons/primeicons.css';
import midbanner from '../images/mid-banner.png'

const QuemSomos = () => {
    return (
        <div className="p-quemsomos">
            <div className="p-text-quemsomos">
                <h1>Quem somos</h1>
                <p>Somos um grupo de profissionais apaixonados pelo desenvolvimento infantil, comprometidos em oferecer recursos e ferramentas para auxiliar pais e cuidadores no acompanhamento e estimulação de crianças com Transtorno do Espectro Autista (TEA). Nosso aplicativo foi desenvolvido com base em um Protocolo de Estimulação Psicomotora, apresentado no Programa de Pós-Graduação Stricto Sensu em Distúrbios do Desenvolvimento, visando promover o desenvolvimento psicomotor e uma melhor qualidade de vida para as crianças com TEA.
                </p><p>Nossa missão é tornar o processo de estimulação mais acessível, organizado e, acima de tudo, prazeroso tanto para as crianças quanto para os pais. Acreditamos que, com o ambiente adequado e atividades bem direcionadas, o potencial de cada criança pode ser estimulado de forma positiva e significativa.
                </p>

                <div className='d-flex'>
                    <div className='card-quem-somos'>
                        <img src={midbanner} alt="midbanner" />
                        <div>
                            <p>Equipe Estimula TEA</p>
                            <p>institutotea7@gmail.com</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuemSomos;