"use client"

import "../styles/agenda.scss"
import "../styles/App.scss"
import { useState, useEffect, useContext, useRef } from "react"
import { Button } from "primereact/button"
import { atividade } from "../mocks/atividades"
import { sequencia2 } from "../mocks/sequencia"
import { Tooltip } from "primereact/tooltip"
import { ProgressBar } from "primereact/progressbar"
import { prepareDataForBackend, transformData, calcularProgresso } from "../components/utils"
import SemanaRow from "../components/semanaRow"
import { AuthContext } from "../context/authProvider.js"
import { Link } from "react-router-dom"
import { Toast } from "primereact/toast"
import { fetchData } from "../components/utils"
import { InputText } from "primereact/inputtext"
import { Dropdown } from "primereact/dropdown"
import { url } from "../url.js"
import { TabView, TabPanel } from "primereact/tabview"
import { Card } from "primereact/card"
import { Avatar } from "primereact/avatar"
import { Badge } from "primereact/badge"

const Agenda = () => {
  const [sequenciaEscolhidaBack, setSequenciaEscolhidaBack] = useState([])
  const [terapeutaAgenda, setTerapeutaAgenda] = useState([])
  const [minhaAgenda, setMinhaAgenda] = useState([])
  const [isEdit, setIsEdit] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [cronoId, setCronoId] = useState(null)
  const [mensagens, setMensagens] = useState([])
  const [mensagemEnviada, setMensagemEnviada] = useState("")
  const [pacienteID, setPacienteID] = useState(null)
  const [listadePacientes, setListadePacientes] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)
  const toast = useRef()
  const { isAuthenticated, user, token } = useContext(AuthContext)

  const validarCronograma = () => {
    const semanasNecessarias = sequencia2.map((item) => item.semana)
    const semanasComAtividades = {}
    sequenciaEscolhidaBack.forEach((item) => {
      const semana = Object.keys(item)[0]
      if (item[semana]?.length > 0) {
        semanasComAtividades[semana] = true
      }
    })

    const semanasIncompletas = semanasNecessarias.filter((semana) => !semanasComAtividades[semana])
    if (semanasIncompletas.length > 0) {
      toast.current.show({
        severity: "error",
        summary: "Erro",
        detail: `Semanas incompletas: ${semanasIncompletas.join(", ")}. Adicione atividades para todas as semanas.`,
        life: 5000,
      })
      return false
    }
    return true
  }

  const updateProgress = (semana, atividadeId, isChecked) => {
    console.log("Updating progress:", semana, atividadeId, isChecked);
    const novaSequencia = [...sequenciaEscolhidaBack];
    const semanaIndex = novaSequencia.findIndex((item) => Object.keys(item)[0] === semana);
  
    if (semanaIndex !== -1) {
      const semanaObj = { ...novaSequencia[semanaIndex] };
      const atividades = [...semanaObj[semana]];
      const atividadeIndex = atividades.findIndex((a) => a.id === atividadeId);
  
      if (atividadeIndex !== -1) {
        atividades[atividadeIndex] = {
          ...atividades[atividadeIndex],
          check: !atividades[atividadeIndex].check,
        };
        semanaObj[semana] = atividades;
        novaSequencia[semanaIndex] = semanaObj;
        setSequenciaEscolhidaBack(novaSequencia);
        console.log("Progress updated:", novaSequencia);
      }
    }
  };

  const onSaveSequencia = async (isPaciente = false) => {
    try {
      if (!isPaciente && user.user_type_id === 1 && !validarCronograma()) {
        return
      }

      const fromTherapist = user.user_type_id === 1 ? 1 : activeIndex === 1 ? 1 : 0
      const userId = user.user_type_id === 1 ? pacienteID?.user_id : user.id

      if (user.user_type_id === 1 && !pacienteID?.user_id) {
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: "Selecione um paciente primeiro.",
          life: 3000,
        })
        return
      }

      // Determine proper agenda ID based on user type and current view
      let currentAgendaId = null;
      
      // For therapist user or patient viewing therapist's agenda
      if (user.user_type_id === 1 || activeIndex === 1) {
        // Get therapist's agenda ID
        const agendaTerapeuta = await fetch(`${url}/api/cronograma/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (agendaTerapeuta.ok) {
          const data = await agendaTerapeuta.json();
          const item = data.find((d) => d.fromTherapist === 1);
          if (item) currentAgendaId = item.id;
        }
      } 
      // For patient viewing their own agenda
      else {
        // Get patient's personal agenda ID
        const agendaPaciente = await fetch(`${url}/api/cronograma/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (agendaPaciente.ok) {
          const data = await agendaPaciente.json();
          const item = data.find((d) => d.fromTherapist === 0);
          if (item) currentAgendaId = item.id;
        }
      }

      // Process messages if needed
      let mensagensAtualizadas = [...mensagens]
      if (mensagemEnviada?.trim()) {
        const novaMensagem = {
          texto: mensagemEnviada,
          remetente: user.user_type_id === 1 ? "Terapeuta" : "Paciente",
          data: new Date().toISOString(),
        }
        mensagensAtualizadas = [...mensagens, novaMensagem]
        console.log("Sending mensagens to backend:", mensagensAtualizadas)
      }

      const requestBody = {
        user_id: userId,
        ...prepareDataForBackend(sequenciaEscolhidaBack),
        mensagem: JSON.stringify(mensagensAtualizadas),
        fromTherapist: fromTherapist,
      }

      // If we have an agenda ID, it's an update
      if (currentAgendaId) {
        requestBody.id = currentAgendaId;
      }

      const response = await fetch(`${url}/api/cronograma`, {
        method: currentAgendaId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        if (!isPaciente && user.user_type_id !== 1) {
          setEditMode(false)
        }
        setMensagemEnviada("")
        if (mensagemEnviada.trim()) {
          setMensagens(mensagensAtualizadas)
        }
        fetchSchedules()
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: isPaciente
            ? "Progresso salvo com sucesso. Seu terapeuta poderá acompanhar sua jornada!"
            : "Agenda " + (currentAgendaId ? "atualizada" : "adicionada") + " com sucesso!",
          life: 3000,
        })
      } else {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error("Erro ao enviar cronograma:", error)
      toast.current.show({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao processar sua solicitação.",
        life: 3000,
      })
    }
  }

  const fetchSchedules = async () => {
    if (!user || (user.user_type_id === 1 && !pacienteID?.user_id)) {
      console.log("Skipping fetchSchedules: missing user or pacienteID")
      return
    }

    const endpoint =
      user.user_type_id === 1
        ? `${url}/api/cronograma/${pacienteID?.user_id}`
        : `${url}/api/cronograma/${user.id}`

    try {
      console.log("Fetching schedules for:", endpoint)
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()
      console.log("API response:", data)

      if (data?.length > 0) {
        const agendasTerapeuta = data.filter((agenda) => agenda.fromTherapist === 1)
        const agendasPai = data.filter((agenda) => agenda.fromTherapist === 0)

        // Set agendas based on their type
        if (agendasTerapeuta.length > 0) {
          const agendaTerapeuta = transformData(agendasTerapeuta[0])
          setTerapeutaAgenda(agendaTerapeuta)
          
          // If user is therapist or viewing therapist's agenda tab
          if (user.user_type_id === 1 || activeIndex === 1) {
            setCronoId(agendasTerapeuta[0].id)
            setIsEdit(true)
            
            // Parse messages from therapist's agenda
            try {
              const mensagensData = agendasTerapeuta[0].mensagem
                ? JSON.parse(agendasTerapeuta[0].mensagem)
                : []
              setMensagens(Array.isArray(mensagensData) ? mensagensData : [])
              console.log("Loaded messages:", mensagensData)
            } catch (e) {
              console.error("Failed to parse mensagens:", e)
              setMensagens([])
            }
          }
        } else {
          setTerapeutaAgenda([])
        }

        if (agendasPai.length > 0) {
          const agendaPai = transformData(agendasPai[0])
          setMinhaAgenda(agendaPai)
          
          // If patient is viewing their own agenda tab
          if (user.user_type_id !== 1 && activeIndex === 0) {
            setCronoId(agendasPai[0].id)
            setIsEdit(true)
            setSequenciaEscolhidaBack(agendaPai)
          }
        } else {
          setMinhaAgenda([])
        }

        // Set the sequenciaEscolhidaBack based on user type and active tab
        if (user.user_type_id === 1) {
          // For therapist, use therapist's agenda if available
          setSequenciaEscolhidaBack(agendasTerapeuta.length > 0 ? transformData(agendasTerapeuta[0]) : [])
        } else {
          // For patient, use appropriate agenda based on active tab
          if (activeIndex === 0) {
            setSequenciaEscolhidaBack(agendasPai.length > 0 ? transformData(agendasPai[0]) : [])
          } else {
            setSequenciaEscolhidaBack(agendasTerapeuta.length > 0 ? transformData(agendasTerapeuta[0]) : [])
            
            // Make sure to load messages when switching to therapist's agenda tab
            if (agendasTerapeuta.length > 0) {
              try {
                const mensagensData = agendasTerapeuta[0].mensagem
                  ? JSON.parse(agendasTerapeuta[0].mensagem)
                  : []
                setMensagens(Array.isArray(mensagensData) ? mensagensData : [])
              } catch (e) {
                console.error("Failed to parse mensagens in tab change:", e)
                setMensagens([])
              }
            }
          }
        }
      } else {
        setTerapeutaAgenda([])
        setMinhaAgenda([])
        setSequenciaEscolhidaBack([])
        setMensagens([])
        setCronoId(null)
        setIsEdit(false)
      }
    } catch (error) {
      console.error("Fetch schedules error:", error)
      toast.current.show({
        severity: "error",
        summary: "Erro",
        detail: "Não foi possível carregar as agendas.",
        life: 3000,
      })
      setTerapeutaAgenda([])
      setMinhaAgenda([])
      setSequenciaEscolhidaBack([])
      setMensagens([])
      setCronoId(null)
      setIsEdit(false)
    }
  }

  const fetchAllPacients = async () => {
    try {
      const data = await fetchData(
        `${url}/api/pacientes/${user?.id}?user_type_id=${user?.user_type_id}`,
        "GET",
        null,
        token,
      )
      setListadePacientes(data.filter((item) => item.status === "check"))
    } catch (error) {
      console.error("Fetch patients error:", error)
      toast.current.show({
        severity: "error",
        summary: "Erro",
        detail: "Não foi possível carregar a lista de pacientes.",
        life: 3000,
      })
    }
  }

  useEffect(() => {
    if (user?.user_type_id === 1) {
      if (!pacienteID) {
        fetchAllPacients()
      } else {
        fetchSchedules()
      }
    } else {
      fetchSchedules()
    }
  }, [user, pacienteID])

  // Update sequenciaEscolhidaBack and messages when tab changes
  useEffect(() => {
    if (user?.user_type_id !== 1) {
      if (activeIndex === 0) {
        setSequenciaEscolhidaBack(minhaAgenda.length > 0 ? minhaAgenda : [])
      } else {
        setSequenciaEscolhidaBack(terapeutaAgenda.length > 0 ? terapeutaAgenda : [])
        
        // Load messages from therapist's agenda when switching to that tab
        const agendasTerapeuta = terapeutaAgenda.length > 0 ? [terapeutaAgenda] : []
        if (agendasTerapeuta.length > 0) {
          try {
            // We need to get the original agenda data with messages
            fetch(`${url}/api/cronograma/${user.id}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }).then(response => {
              if (response.ok) {
                response.json().then(data => {
                  const therapistAgendaData = data.find(agenda => agenda.fromTherapist === 1);
                  if (therapistAgendaData && therapistAgendaData.mensagem) {
                    try {
                      const mensagensData = JSON.parse(therapistAgendaData.mensagem);
                      setMensagens(Array.isArray(mensagensData) ? mensagensData : []);
                      console.log("Loaded messages on tab change:", mensagensData);
                    } catch (e) {
                      console.error("Failed to parse mensagens on tab change:", e);
                      setMensagens([]);
                    }
                  }
                });
              }
            });
          } catch (e) {
            console.error("Error loading messages on tab change:", e);
          }
        }
      }
    }
  }, [activeIndex, minhaAgenda, terapeutaAgenda, user?.user_type_id])

  const formatarData = (dataString) => {
    const data = new Date(dataString)
    return data.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const toggleEditMode = () => {
    setEditMode(!editMode)
  }


  return (
    <>
      <Toast ref={toast} />
      {isAuthenticated ? (
        <>
          {user?.user_type_id === 1 && (
            <div className="dropdown-paciente-agenda">
              <p>Seus pacientes</p>
              <Dropdown
                value={pacienteID}
                options={listadePacientes}
                optionLabel="email"
                optionValue="id"
                onChange={(e) => setPacienteID(e.value)}
                placeholder="Selecione um paciente"
                filter
                className="paciente-dropdown"
                style={{ width: "100%" }}
              />
            </div>
          )}

          <div className="tabela-de-sequencia">
            {user?.user_type_id !== 1 ? (
              <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Minha Agenda">
                  {/* Botão para alternar entre modo de edição e visualização */}
                  <div className="edit-mode-controls">
                    <Button
                      label={editMode ? "Sair do Modo de Edição" : "Editar Minha Agenda"}
                      icon={editMode ? "pi pi-eye" : "pi pi-pencil"}
                      onClick={toggleEditMode}
                      className="p-button-outlined mb-3"
                    />
                  </div>

                  <table>
                    <thead>
                      <tr>
                        <th>
                          Minha Agenda de Atividades
                          <i
                            className="question pi pi-question-circle"
                            data-pr-tooltip={
                              editMode
                                ? "Adicione ou remova atividades para personalizar sua agenda."
                                : "Clique nas atividades que já foram realizadas para marcar como concluídas."
                            }
                            data-pr-position="left"
                          />
                          <Tooltip target=".question" className="tooltip-question" />
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
                            pacienteView={!editMode} // Modo paciente quando não está em edição
                            readOnly={false} // IMPORTANTE: Alterado para false para permitir marcar como concluído
                            onAtividadeClick={(semana, atividadeId, isChecked) => {
                              // Sempre permitir atualizar o progresso quando não está em modo de edição
                              if (!editMode) {
                                updateProgress(semana, atividadeId, isChecked);
                              }
                            }}
                          />
                        )
                      })}
                    </tbody>
                  </table>

                  <div className="progress-container">
                    <h3>Seu Progresso</h3>
                    <ProgressBar value={calcularProgresso(sequenciaEscolhidaBack)}></ProgressBar>
                  </div>

                  {editMode ? (
                    // Botão para salvar a agenda editada
                    <Button
                      label="Salvar Agenda"
                      icon="pi pi-save"
                      onClick={() => onSaveSequencia(false)}
                      className="p-button-success"
                    />
                  ) : (
                    // Botão para salvar o progresso
                    <Button label="Salvar Progresso" icon="pi pi-check" onClick={() => onSaveSequencia(true)} />
                  )}
                </TabPanel>

                <TabPanel header="Agenda do Terapeuta">
                  <table>
                    <thead>
                      <tr>
                        <th>
                          Agenda Recomendada pelo Terapeuta
                          <i
                            className="question pi pi-question-circle"
                            data-pr-tooltip="Esta é a agenda recomendada pelo seu terapeuta. Você pode marcar as atividades concluídas."
                            data-pr-position="left"
                          />
                          <Tooltip target=".question" className="tooltip-question" />
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
                            pacienteView={true}
                            readOnly={false} // IMPORTANTE: Alterado para false para permitir marcar como concluído
                            onAtividadeClick={(semana, atividadeId, isChecked) => {
                              updateProgress(semana, atividadeId, isChecked);
                            }}
                          />
                        )
                      })}
                    </tbody>
                  </table>

                  {/* Mostrar o card de mensagens apenas na aba da Agenda do Terapeuta */}
                  <Card className="mensagens-card">
                    <div className="mensagens-header">
                      <h3>Mensagens</h3>
                      <Badge value={mensagens.length} severity="info" />
                    </div>

                    <div className="mensagens-container">
                      {mensagens && mensagens.length > 0 ? (
                        mensagens.map((msg, index) => (
                          <div
                            key={index}
                            className={`mensagem-item ${msg.remetente === "Terapeuta" ? "terapeuta" : "paciente"}`}
                          >
                            <div className="mensagem-cabecalho">
                              <Avatar
                                icon={msg.remetente === "Terapeuta" ? "pi pi-user-doctor" : "pi pi-user"}
                                size="small"
                                shape="circle"
                                style={{ backgroundColor: msg.remetente === "Terapeuta" ? "#0A6894" : "#4caf50" }}
                              />
                              <span className="remetente-nome">{msg.remetente}</span>
                              <span className="mensagem-data">{msg.data ? formatarData(msg.data) : ""}</span>
                            </div>
                            <div className="mensagem-texto">{msg.texto}</div>
                          </div>
                        ))
                      ) : (
                        <div className="sem-mensagens">Nenhuma mensagem trocada ainda.</div>
                      )}
                    </div>

                    <div className="chat-container">
                      <InputText
                        className="input-chat"
                        placeholder="Digite uma mensagem para enviar ao Terapeuta"
                        value={mensagemEnviada}
                        onChange={(e) => setMensagemEnviada(e.target.value)}
                      />
                      <Button label="Enviar" icon="pi pi-send" onClick={() => onSaveSequencia(true)} />
                    </div>
                  </Card>

                  <div className="progress-container">
                    <h3>Seu Progresso</h3>
                    <ProgressBar value={calcularProgresso(sequenciaEscolhidaBack)}></ProgressBar>
                  </div>
                  <Button
                    label="Salvar Progresso"
                    onClick={() => {
                      onSaveSequencia(true)
                    }}
                  />
                </TabPanel>
              </TabView>
            ) : (
              // Código para o terapeuta
              <>
                <table>
                  <thead>
                    <tr>
                      <th>
                        Agenda de Atividades
                        <i
                          className="question pi pi-question-circle"
                          data-pr-tooltip="Para montar sua agenda semanal, clique no ícone de mais (+) ao lado da semana e escolha as atividades que deseja adicionar. Fácil e rápido!"
                          data-pr-position="left"
                        />
                        <Tooltip target=".question" className="tooltip-question" />
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
                          pacienteView={false}
                        />
                      )
                    })}
                  </tbody>
                </table>

                <Card className="mensagens-card">
                  <div className="mensagens-header">
                    <h3>Mensagens</h3>
                    <Badge value={mensagens.length} severity="info" />
                  </div>

                  <div className="mensagens-container">
                    {mensagens && mensagens.length > 0 ? (
                      mensagens.map((msg, index) => (
                        <div
                          key={index}
                          className={`mensagem-item ${msg.remetente === "Terapeuta" ? "terapeuta" : "paciente"}`}
                        >
                          <div className="mensagem-cabecalho">
                            <Avatar
                              icon={msg.remetente === "Terapeuta" ? "pi pi-user-doctor" : "pi pi-user"}
                              size="small"
                              shape="circle"
                              style={{ backgroundColor: msg.remetente === "Terapeuta" ? "#0A6894" : "#4caf50" }}
                            />
                            <span className="remetente-nome">{msg.remetente}</span>
                            <span className="mensagem-data">{msg.data ? formatarData(msg.data) : ""}</span>
                          </div>
                          <div className="mensagem-texto">{msg.texto}</div>
                        </div>
                      ))
                    ) : (
                      <div className="sem-mensagens">Nenhuma mensagem trocada ainda.</div>
                    )}
                  </div>

                  <div className="chat-container">
                    <InputText
                      className="input-chat"
                      placeholder="Digite uma mensagem para enviar ao Paciente"
                      value={mensagemEnviada}
                      onChange={(e) => setMensagemEnviada(e.target.value)}
                    />
                    <Button label="Enviar" icon="pi pi-send" onClick={() => onSaveSequencia(true)} />
                  </div>
                </Card>

                <div className="progress-container">
                  <h3>Progresso do paciente</h3>
                  <ProgressBar value={calcularProgresso(sequenciaEscolhidaBack)}></ProgressBar>
                </div>
                <Button
                  label={isEdit ? "Atualizar Cronograma" : "Salvar Cronograma"}
                  onClick={() => onSaveSequencia(false)}
                  disabled={!pacienteID}
                />
              </>
            )}
          </div>
        </>
      ) : (
        <div className="not-logged">
          <i className="pi pi-exclamation-circle"></i>
          <p>
            Está seção é destinada para montagem e visualização das agendas. Para ter acesso você deve fazer{" "}
            <Link to="/login">login</Link>
          </p>
        </div>
      )}
    </>
  )
}

export default Agenda