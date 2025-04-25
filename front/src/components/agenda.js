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
  const [isEdit, setIsEdit] = useState(false)
  const [cronoId, setCronoId] = useState(false)
  const [mensagens, setMensagens] = useState([])
  const [mensagemEnviada, setMensagemEnviada] = useState("")
  const [pacienteID, setPacienteID] = useState(null)
  const [listadePacientes, setListadePacientes] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [terapeutaAgenda, setTerapeutaAgenda] = useState([])
  const toast = useRef()
  const { isAuthenticated, user, token } = useContext(AuthContext)

  const validarCronograma = () => {
    const semanasNecessarias = sequencia2.map((item) => item.semana)

    const semanasComAtividades = {}
    sequenciaEscolhidaBack.forEach((item) => {
      const semana = Object.keys(item)[0]
      if (item[semana] && item[semana].length > 0) {
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

  const onSaveSequencia = async (isPaciente = false) => {
    try {
      if (!isPaciente && user.user_type_id === 1 && !validarCronograma()) {
        return
      }

      const novaMensagem = mensagemEnviada.trim()
        ? {
            texto: mensagemEnviada,
            remetente: user.user_type_id === 1 ? "Terapeuta" : "Paciente",
            data: new Date().toISOString(),
          }
        : null

      const mensagensAtualizadas = novaMensagem ? [...mensagens, novaMensagem] : mensagens

      const response = await fetch(`${url}/api/cronograma/`, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: !isEdit && user.user_type_id === 1 ? pacienteID.user_id : user.id,
          ...prepareDataForBackend(sequenciaEscolhidaBack),
          mensagem: JSON.stringify(mensagensAtualizadas),
          id: cronoId,
        }),
      })

      if (response.ok) {
        fetchSchedules()
        setMensagemEnviada("")
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: !!isPaciente
            ? "Progresso salvo com sucesso. Seu terapeuta poderá acompanhar sua jornada!"
            : "Agenda adicionada com sucesso!",
          life: 3000,
        })
      } else {
        console.error("Erro ao enviar cronograma:", response.status)
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: "Erro ao adicionar agenda.",
          life: 3000,
        })
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
    if (user) {
      const endpoint =
        user?.user_type_id === 1 ? `${url}/api/cronograma/${pacienteID?.user_id}` : `${url}/api/cronograma/${user?.id}`

      try {
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        setIsEdit(true)
        const data = await response.json()

        if (data && data.length > 0) {
          setCronoId(data[0].id)

          try {
            const mensagensData = JSON.parse(data[0].mensagem || "[]")
            setMensagens(Array.isArray(mensagensData) ? mensagensData : [])
          } catch (e) {
            if (data[0].mensagem) {
              setMensagens([
                {
                  texto: data[0].mensagem,
                  remetente: user?.user_type_id === 1 ? "Paciente" : "Terapeuta",
                  data: new Date().toISOString(),
                },
              ])
            } else {
              setMensagens([])
            }
          }

          setSequenciaEscolhidaBack(transformData(data[0]))
        }
      } catch (error) {
        console.log(error)
      }
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
      console.log(error)
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
                panelClassName="dropdown-terapeutas"
              />
            </div>
          )}

          {sequenciaEscolhidaBack.length > 0 || user?.user_type_id === 1 ? (
            <div className="tabela-de-sequencia">
              {user?.user_type_id !== 1 ? (
                <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                  <TabPanel header="Minha Agenda">
                    <table>
                      <thead>
                        <tr>
                          <th>
                            Minha Agenda de Atividades
                            <i
                              className="question pi pi-question-circle"
                              data-pr-tooltip="Clique nas atividades que já foram realizadas, e acompanhe sua evolução na barra de progresso."
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
                            />
                          )
                        })}
                      </tbody>
                    </table>
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

                  <TabPanel header="Agenda do Terapeuta">
                    <table>
                      <thead>
                        <tr>
                          <th>
                            Agenda Recomendada pelo Terapeuta
                            <i
                              className="question pi pi-question-circle"
                              data-pr-tooltip="Esta é a agenda recomendada pelo seu terapeuta. Você pode usá-la como referência."
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
                              sequenciaEscolhida={terapeutaAgenda}
                              setSequenciaEscolhida={() => {}}
                              pacienteView={true}
                              readOnly={true}
                            />
                          )
                        })}
                      </tbody>
                    </table>
                  </TabPanel>
                </TabView>
              ) : (
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
              )}

              <Card className="mensagens-card">
                <div className="mensagens-header">
                  <h3>Mensagens</h3>
                  <Badge value={mensagens.length} severity="info" />
                </div>

                <div className="mensagens-container">
                  {mensagens.length > 0 ? (
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
                    placeholder={
                      user?.user_type_id === 1
                        ? "Digite uma mensagem para enviar ao Paciente"
                        : "Digite uma mensagem para enviar ao Terapeuta"
                    }
                    value={mensagemEnviada}
                    onChange={(e) => setMensagemEnviada(e.target.value)}
                  />
                  <Button label="Enviar" icon="pi pi-send" onClick={() => onSaveSequencia(true)} />
                </div>
              </Card>

              {user?.user_type_id === 1 && (
                <>
                  <div className="progress-container">
                    <h3>Progresso do paciente</h3>
                    <ProgressBar value={calcularProgresso(sequenciaEscolhidaBack)}></ProgressBar>
                  </div>
                  <Button
                    label={isEdit ? "Atualizar Cronograma" : "Salvar Cronograma"}
                    onClick={() => onSaveSequencia(false)}
                    disabled={pacienteID === null}
                  />
                </>
              )}
            </div>
          ) : (
            <div className="not-logged">
              <i className="pi pi-exclamation-circle"></i>
              <p>Você ainda não possui uma agenda, entre em contato com seu terapeuta para visualizar.</p>
            </div>
          )}
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
