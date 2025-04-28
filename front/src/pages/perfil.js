"use client"

// eslint-disable-next-line
import "../styles/profile.scss"
import { useEffect, useState, useContext, useRef } from "react"
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import midbanner from "../images/mid-banner.png"
import { Dropdown } from "primereact/dropdown"
import { AuthContext } from "../context/authProvider"
import { fetchData } from "../components/utils"
import { Toast } from "primereact/toast"
import { useNavigate } from "react-router-dom"
import { url } from "../url"
import { Loading } from "../components/loading"
import { Dialog } from "primereact/dialog"
import { InputMask } from "primereact/inputmask"
import { Password } from "primereact/password"

const Perfil = () => {
  const [activeTab, setActiveTab] = useState("profile")
  const [isTerapeuta, setIsTerapeuta] = useState(false)
  const [paciente, setPaciente] = useState(null)
  const [listaTerapeutas, setListaTerapeutas] = useState([])
  const [listOfRelations, setListOfRelations] = useState([])
  const [userFirstName, setUserFirstName] = useState("")
  const [editDialogVisible, setEditDialogVisible] = useState(false)
  const [editUserData, setEditUserData] = useState({
    name: "",
    phone: "",
    especialidade: "",
    child_name: "",
    child_birthdate: "",
    email: "",
  })
  const toast = useRef()
  const navigate = useNavigate()
  const { user, token, logout, getUser } = useContext(AuthContext)
  const [isLoading, setIsLoading] = useState(false)

  // Adicionar estado para controle de senha
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordError, setPasswordError] = useState("")

  // Update the fetchAllPacients method to filter out patients who already have connections
  const fetchAllPacients = async () => {
    const endpoint = `${url}/api/pacientes`
    try {
      const data = await fetchData(endpoint, "GET", null, token)

      // Get the list of patients who already have connections (pending or accepted)
      const connectedPatientIds = listOfRelations.map((relation) =>
        relation.user_type_id === 2 ? relation.user_id : relation.patient_id,
      )

      // Filter out patients who already have connections
      const filteredPatients = data.filter((patient) => !connectedPatientIds.includes(patient.id))

      setListaTerapeutas(filteredPatients)
    } catch (error) {
      console.log(error)
    }
  }

  // Update countRelations to return a promise
  const countRelations = async () => {
    if (user) {
      setIsLoading(true)
      try {
        const data = await fetchData(
          `${url}/api/pacientes/${user?.id}?user_type_id=${user?.user_type_id}`,
          "GET",
          null,
          token,
        )
        setListOfRelations(data)
        setIsLoading(false)
        return data // Return the data for chaining
      } catch (error) {
        console.log(error)
        setIsLoading(false)
        return [] // Return empty array in case of error
      }
    }
    return [] // Return empty array if no user
  }

  // Update the sendRequest method to refresh the patient list after sending a request
  const sendRequest = async () => {
    if (!paciente) {
      toast.current.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Selecione um paciente primeiro",
        life: 3000,
      })
      return
    }

    setIsLoading(true)
    try {
      const data = await fetchData(
        `${url}/api/request`,
        "POST",
        { therapist_id: user?.id, patient_id: paciente },
        token,
      )

      if (data) {
        // First update relations, then fetch patients to ensure proper filtering
        await countRelations()
        fetchAllPacients()
        setPaciente(null)
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Solicitação enviada com sucesso!",
          life: 3000,
        })
      }
      setIsLoading(false)
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao enviar solicitação, verifique se ela já existe!",
        life: 3000,
      })
      setIsLoading(false)
    }
  }

  // Método para aceitar solicitacão de amizades
  const onAccept = async (idTerapeuta) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${url}/api/pacientes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ therapist_id: idTerapeuta, patient_id: user?.id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erro ao aceitar amizade.")
      }

      fetchAllPacients()
      countRelations()
      toast.current.show({
        severity: "success",
        summary: "Sucesso",
        detail: "Amizade aceita com sucesso!",
        life: 3000,
      })
      setIsLoading(false)
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Erro",
        detail: error.message || "Erro ao aceitar amizade.",
        life: 3000,
      })
      console.error("Erro ao aceitar amizade:", error)
      setIsLoading(false)
    }
  }

  const deleteFriendship = async (id) => {
    setIsLoading(true)
    try {
      const data = await fetchData(`${url}/api/request/${id}`, "DELETE", null, token)

      if (data) {
        fetchAllPacients()
        countRelations()
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Amizade removida com sucesso!",
          life: 3000,
        })
        setIsLoading(false)
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao cancelar amizade!",
        life: 3000,
      })
      setIsLoading(false)
    }
  }

  // Obter a primeira letra do nome para o avatar
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?"
  }

  // Abrir o diálogo de edição e preencher com os dados atuais
  const openEditDialog = () => {
    setEditUserData({
      name: user?.name || "",
      phone: user?.phone || "",
      especialidade: user?.especialidade || "",
      child_name: user?.child_name || "",
      child_birthdate: user?.child_birthdate || "",
      email: user?.email || "",
    })
    setEditDialogVisible(true)
  }

  // Modificar a função updateUserProfile para incluir a senha
  const updateUserProfile = async () => {
    setIsLoading(true)

    // Verificar se está alterando a senha e validar
    if (showPasswordFields) {
      if (!passwordData.currentPassword) {
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: "Digite sua senha atual",
          life: 3000,
        })
        setIsLoading(false)
        return
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: "As senhas não coincidem",
          life: 3000,
        })
        setIsLoading(false)
        return
      }

      if (passwordData.newPassword.length < 6) {
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: "A senha deve ter pelo menos 6 caracteres",
          life: 3000,
        })
        setIsLoading(false)
        return
      }
    }

    try {
      // Preparar dados para envio, incluindo senha se necessário
      const dataToSend = { ...editUserData }
      if (showPasswordFields) {
        dataToSend.senha = passwordData.newPassword
      }

      const response = await fetch(`${url}/api/usuario/${user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      })

      if (response.ok) {
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Perfil atualizado com sucesso!",
          life: 3000,
        })
        setEditDialogVisible(false)
        // Resetar estados de senha
        setShowPasswordFields(false)
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
        setPasswordError("")
        // Atualizar os dados do usuário no contexto
        getUser()
        setIsLoading(false)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erro ao atualizar perfil.")
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Erro",
        detail: error.message || "Erro ao atualizar perfil.",
        life: 3000,
      })
      setIsLoading(false)
    }
  }

  // Update useEffect to call fetchAllPacients after countRelations
  useEffect(() => {
    if (user) {
      countRelations().then(() => {
        fetchAllPacients()
      })
      setUserFirstName(user?.name?.split(" ")[0])
      if (user?.user_type_id === 1) {
        setIsTerapeuta(true)
      }
    }
  }, [user])

  // Modificar a função renderEditForm para incluir os campos de senha
  const renderEditForm = () => {
    return (
      <div className="edit-form">
        <div className="info-field">
          <label>Nome Completo</label>
          <InputText
            value={editUserData.name}
            onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
          />
        </div>

        <div className="info-field">
          <label>Telefone</label>
          <InputMask
            mask="(99)99999-9999"
            value={editUserData.phone}
            onChange={(e) => setEditUserData({ ...editUserData, phone: e.target.value })}
          />
        </div>

        {isTerapeuta ? (
          <div className="info-field">
            <label>Especialidade</label>
            <InputText
              value={editUserData.especialidade}
              onChange={(e) => setEditUserData({ ...editUserData, especialidade: e.target.value })}
            />
          </div>
        ) : (
          <>
            <div className="info-field">
              <label>Nome da Criança</label>
              <InputText
                value={editUserData.child_name}
                onChange={(e) => setEditUserData({ ...editUserData, child_name: e.target.value })}
              />
            </div>

            <div className="info-field">
              <label>Idade da Criança</label>
              <InputText
                value={editUserData.child_birthdate}
                onChange={(e) => setEditUserData({ ...editUserData, child_birthdate: e.target.value })}
              />
            </div>
          </>
        )}

        <div className="info-field">
          <label>Email</label>
          <InputText
            value={editUserData.email}
            onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
            disabled
          />
        </div>

        <div className="info-field password-toggle">
          <Button
            label={showPasswordFields ? "Cancelar alteração de senha" : "Alterar senha"}
            icon={showPasswordFields ? "pi pi-times" : "pi pi-lock"}
            className="p-button-text"
            onClick={() => setShowPasswordFields(!showPasswordFields)}
          />
        </div>

        {showPasswordFields && (
          <>
            <div className="info-field">
              <label>Senha Atual</label>
              <Password
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                feedback={false}
                toggleMask
              />
            </div>

            <div className="info-field">
              <label>Nova Senha</label>
              <Password
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                toggleMask
              />
            </div>

            <div className="info-field">
              <label>Confirmar Nova Senha</label>
              <Password
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                feedback={false}
                toggleMask
              />
            </div>

            {passwordError && (
              <div className="info-field password-error">
                <p className="error-message">{passwordError}</p>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  // Rodapé do diálogo com botões de ação
  const dialogFooter = (
    <div className="dialog-footer">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        className="p-button-text"
        onClick={() => setEditDialogVisible(false)}
      />
      <Button label="Salvar" icon="pi pi-check" onClick={updateUserProfile} />
    </div>
  )

  return (
    <>
      {isLoading && <Loading />}
      <Toast ref={toast} />

      <div className="profile-container">
        <div className="profile-container-header">
          <div className="header-bg"></div>
          <img src={midbanner || "/placeholder.svg"} alt="Perfil" className="profile-image" />

          <div className="tab-buttons">
            <button
              className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <i className="pi pi-user"></i>
              Perfil
            </button>
            <button
              className={`tab-button ${activeTab === "connections" ? "active" : ""}`}
              onClick={() => setActiveTab("connections")}
            >
              <i className="pi pi-users"></i>
              {isTerapeuta ? "Pacientes" : "Terapeutas"}
            </button>
          </div>
        </div>

        <div className="profile-container-content">
          {activeTab === "profile" ? (
            <>
              <div className="welcome-header">
                <h1>Olá, {userFirstName}!</h1>
                <p>Bem-vindo ao seu perfil. Aqui você pode gerenciar suas informações.</p>
              </div>

              <div className="profile-info">
                <div className="info-field">
                  <label>Nome Completo</label>
                  <InputText value={user?.name} disabled />
                </div>

                <div className="info-field">
                  <label>Telefone</label>
                  <InputText value={user?.phone} disabled />
                </div>

                {user?.especialidade ? (
                  <div className="info-field">
                    <label>Especialidade</label>
                    <InputText value={user?.especialidade} disabled />
                  </div>
                ) : (
                  <>
                    <div className="info-field">
                      <label>Nome da Criança</label>
                      <InputText value={user?.child_name} disabled />
                    </div>

                    <div className="info-field">
                      <label>Data de Nascimento</label>
                      <InputText value={user?.child_birthdate} disabled />
                    </div>
                  </>
                )}

                <div className="info-field">
                  <label>Email</label>
                  <InputText value={user?.email} disabled />
                </div>
              </div>

              <div className="action-buttons">
                <Button label="Editar Perfil" icon="pi pi-pencil" className="primary" onClick={openEditDialog} />
                <Button
                  label="Sair"
                  icon="pi pi-sign-out"
                  className="secondary"
                  onClick={() => {
                    logout()
                    navigate("/login")
                  }}
                />
              </div>
            </>
          ) : (
            <div className="tab-content connections-tab">
              {isTerapeuta ? (
                <>
                  <h2>Gerenciar Pacientes</h2>
                  <p>Adicione novos pacientes ou gerencie os existentes.</p>

                  <div className="patient-selection-container">
                    <label>Selecione um paciente para enviar solicitação</label>
                    <Dropdown
                      value={paciente}
                      options={listaTerapeutas}
                      optionLabel="email"
                      optionValue="id"
                      onChange={(e) => setPaciente(e.value)}
                      placeholder="Buscar paciente por email"
                      filter
                      className="patient-dropdown"
                    />
                  </div>

                  <div className="action-buttons">
                    <Button
                      label="Enviar solicitação"
                      icon="pi pi-send"
                      className="primary"
                      onClick={sendRequest}
                      disabled={listaTerapeutas.length === 0}
                    />
                  </div>

                  <h2 style={{ marginTop: "40px" }}>Seus Pacientes</h2>
                  <p>Lista de pacientes e solicitações pendentes.</p>

                  <div className="connection-list">
                    {listOfRelations?.length > 0 ? (
                      listOfRelations.map((item) => (
                        <div
                          className={`connection-card ${item.status === "pendente" ? "pending" : "accepted"}`}
                          key={item.id}
                        >
                          <div className="connection-avatar">{getInitial(item.nome)}</div>

                          <div className="connection-info">
                            <h3>{item.nome}</h3>
                            <p>Email: {item.email}</p>
                            {item.child_name && <p>Criança: {item.child_name}</p>}
                            <p className={`status ${item.status === "pendente" ? "pending" : "accepted"}`}>
                              <i className={`pi ${item.status === "pendente" ? "pi-clock" : "pi-check-circle"}`}></i>{" "}
                              {item.status === "pendente" ? "Pendente" : "Conectado"}
                            </p>
                          </div>

                          <div className="connection-actions">
                            {item.status === "pendente" ? (
                              <Button
                                icon="pi pi-clock"
                                className="pending"
                                tooltip="Aguardando resposta"
                                tooltipOptions={{ position: "top" }}
                              />
                            ) : null}

                            <Button
                              icon="pi pi-times"
                              className="reject"
                              onClick={() => deleteFriendship(item.request_id)}
                              tooltip="Remover conexão"
                              tooltipOptions={{ position: "top" }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <i className="pi pi-users"></i>
                        <p>Você não possui pacientes ou solicitações pendentes</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h2>Solicitações de Terapeutas</h2>
                  <p>Gerencie as solicitações de conexão dos seus terapeutas.</p>

                  <div className="connection-list">
                    {listOfRelations.length > 0 ? (
                      listOfRelations.map((item) => (
                        <div
                          className={`connection-card ${item.status === "pendente" ? "pending" : "accepted"}`}
                          key={item.id}
                        >
                          <div className="connection-avatar">{getInitial(item.nome)}</div>

                          <div className="connection-info">
                            <h3>{item.nome}</h3>
                            <p>Email: {item.email}</p>
                            {item.especialidade && <p>Especialidade: {item.especialidade}</p>}
                            <p className={`status ${item.status === "pendente" ? "pending" : "accepted"}`}>
                              <i className={`pi ${item.status === "pendente" ? "pi-clock" : "pi-check-circle"}`}></i>{" "}
                              {item.status === "pendente" ? "Pendente" : "Conectado"}
                            </p>
                          </div>

                          <div className="connection-actions">
                            {item.status === "pendente" ? (
                              <>
                                <Button
                                  icon="pi pi-check"
                                  className="accept"
                                  onClick={() => onAccept(item.user_id)}
                                  tooltip="Aceitar solicitação"
                                  tooltipOptions={{ position: "top" }}
                                />
                                <Button
                                  icon="pi pi-times"
                                  className="reject"
                                  onClick={() => deleteFriendship(item.request_id)}
                                  tooltip="Recusar solicitação"
                                  tooltipOptions={{ position: "top" }}
                                />
                              </>
                            ) : (
                              <Button
                                icon="pi pi-times"
                                className="reject"
                                onClick={() => deleteFriendship(item.request_id)}
                                tooltip="Remover conexão"
                                tooltipOptions={{ position: "top" }}
                              />
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <i className="pi pi-users"></i>
                        <p>Você não possui solicitações de terapeutas</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Diálogo de edição de perfil */}
      <Dialog
        header="Editar Perfil"
        visible={editDialogVisible}
        style={{ width: "90%", maxWidth: "600px" }}
        footer={dialogFooter}
        onHide={() => setEditDialogVisible(false)}
        className="edit-profile-dialog"
      >
        {renderEditForm()}
      </Dialog>
    </>
  )
}

export default Perfil
