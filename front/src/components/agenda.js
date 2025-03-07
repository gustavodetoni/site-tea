import '../styles/agenda.scss'
import '../styles/App.scss'
import React, { useState, useEffect, useContext, useRef } from "react";
import { Button } from 'primereact/button';
import { atividade } from "../mocks/atividades";
import { sequencia2 } from "../mocks/sequencia";
import { Tooltip } from 'primereact/tooltip';
import { ProgressBar } from 'primereact/progressbar';
import { prepareDataForBackend, transformData, calcularProgresso } from '../components/utils'
import SemanaRow from "../components/semanaRow";
import { AuthContext } from "../context/authProvider.js"
import { Link } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { fetchData } from '../components/utils';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { url } from '../url.js';

const Agenda = () => {

    const [sequenciaEscolhidaBack, setSequenciaEscolhidaBack] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [cronoId, setCronoId] = useState(false);
    const [mensagemRecebida, setMensagemRecebida] = useState();
    const [mensagemEnviada, setMensagemEnviada] = useState();
    const [pacienteID, setPacienteID] = useState(null);
    const [listadePacientes, setListadePacientes] = useState([]);
    const toast = useRef()
    const { isAuthenticated, user, token } = useContext(AuthContext);
    
    const onSaveSequencia = async (isPaciente = false) => {
      try {
        console.log(prepareDataForBackend(sequenciaEscolhidaBack), user.user_type_id === 1 ? pacienteID.user_id : user.id)
          const response = await fetch(`${url}/api/cronograma/`, {
              method: isEdit ? 'PUT' : 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                user_id: !isEdit && user.user_type_id === 1 ? pacienteID.user_id : user.id,
                ...prepareDataForBackend(sequenciaEscolhidaBack),
                mensagem: mensagemEnviada || '',
                id: cronoId,
                
              })
            });
            fetchSchedules();
  
          if (response.ok) {
              fetchSchedules()
              toast.current.show({
                severity: 'success',
                summary: 'Sucesso',
                detail: !!isPaciente ? 'Progresso salvo com sucesso. Seu terapeuta poderá acompanhar sua jornada!' : 'Agenda adicionada com sucesso!',
                life: 3000
            });

          } else {
              console.error('Erro ao enviar cronograma:', response.status);
              toast.current.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao adicionar agenda.',
                life: 3000
            });

          }
      } catch (error) {
          console.error('Erro ao enviar cronograma:', error);
      }
    };
  
    const fetchSchedules = async () => {
      if(user){
        const endpoint = user?.user_type_id === 1 ? `${url}/api/cronograma/${pacienteID?.user_id}` : `${url}/api/cronograma/${user?.id}`
        try {
            const response = await fetch(endpoint, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
          });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            setIsEdit(true)
            setMensagemEnviada('')
            const data = await response.json();
            setCronoId(data[0].id)
            setMensagemRecebida(data[0].mensagem)
            setSequenciaEscolhidaBack(transformData(data[0]));
        } catch (error) {
          console.log(error)
        }
      }
    }

    const fetchAllPacients = async () => {
      try {
          const data = await fetchData(`${url}/api/pacientes/${user?.id}?user_type_id=${user?.user_type_id}`, 'GET', null, token);
          setListadePacientes(data.filter(item => item.status === 'check'))
      } catch (error) {
          console.log(error);
      }
    };    

    useEffect(() => {
      if(user?.user_type_id === 1){
        if(!pacienteID){
          fetchAllPacients()
        } else{
          fetchSchedules()
        }
      } else{
        fetchSchedules()
      }
    }, [user, pacienteID])

  
  
  return (
    <>
      <Toast ref={toast} />
      {isAuthenticated ?
      <>

        {user?.user_type_id === 1 &&
          <div className='dropdown-paciente-agenda'>
            <p>Seus pacientes</p>
            <Dropdown
                value={pacienteID}
                options={listadePacientes}
                optionLabel='email'
                optionValue='id'
                onChange={(e) => setPacienteID(e.value)}
                placeholder="Selecione um paciente"
                filter
                panelClassName="dropdown-terapeutas"
            />
          </div>
        }
        {(sequenciaEscolhidaBack.length > 0 || user?.user_type_id === 1 ? 
        <div className="tabela-de-sequencia">
              <table>
                <thead>
                  <tr>
                    <th>
                      Agenda de Atividades
                      <i className="question pi pi-question-circle" 
                        data-pr-tooltip={
                          user?.user_type_id === 1 ?
                          "Para montar sua agenda semanal, clique no ícone de mais (+) ao lado da semana e escolha as atividades que deseja adicionar. Fácil e rápido!"
                          :
                          "Clique nas atividades que já foram realizadas, e acompanhe sua evolução na barra de progresso."
                        }
                        data-pr-position="left"
                      />
                      <Tooltip target=".question" className="tooltip-question"/>
                    </th>
                  </tr>
                </thead>
                <tbody>
                    {sequencia2.map((data, index) => {
                        return (
                            <SemanaRow
                              key={index} 
                              data={data} 
                              atividade={atividade}
                              sequenciaEscolhida={sequenciaEscolhidaBack}
                              setSequenciaEscolhida={setSequenciaEscolhidaBack}
                              pacienteView={user?.user_type_id === 3 || user?.user_type_id === 2}
                            />
                        );
                    })}

                    {mensagemRecebida && 
                      <div className='chat-container'>
                        <InputText className='input-chat' value={mensagemRecebida} disabled />
                      </div>
                    }
                    <div className='chat-container'>
                      <InputText className='input-chat' placeholder={user?.user_type_id === 1 ? 'Digite uma mensagem para enviar ao Paciente' : 'Digite uma mensagem para enviar ao Terapeuta'} value={mensagemEnviada} onChange={(e) => setMensagemEnviada(e.target.value)}/>
                      <Button label="Enviar mensagem" onClick={() => {onSaveSequencia(true)}}/>
                    </div>
                </tbody>
              </table>
              <div className='progress-container'>
                {user?.user_type_id === 1 ? <h3>Progresso do paciente</h3> : <h3>Seu Progresso</h3>}
                <ProgressBar value={calcularProgresso(sequenciaEscolhidaBack)}></ProgressBar>
              </div>
              {user?.user_type_id === 1 ? (
                <Button 
                  label={isEdit ? "Editar Cronograma" : "Salvar Cronograma"}
                  onClick={() => onSaveSequencia(false)}
                  disabled={pacienteID === null}
                />
              ) : (
                <Button 
                  label={"Salvar Progresso"}
                  onClick={() => {onSaveSequencia(true)}}
                />
              )}
        </div> : 
        <div className='not-logged'>
          <i className='pi pi-exclamation-circle'></i>
          <p>Você ainda não possui uma agenda, entre em contato com seu terapeuta para visualizar.</p>
        </div>)}
      </>
      :
      <div className='not-logged'>
        <i className='pi pi-exclamation-circle'></i>
        <p>Está seção é destinada para montagem e visualização das agendas. Para ter acesso você deve fazer <Link to='/login'>login</Link></p>
      </div>
      }
    </>
  )
}

export default Agenda
