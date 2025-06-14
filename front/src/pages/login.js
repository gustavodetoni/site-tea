"use client"

import "../styles/login.scss"
import { useState, useRef, useEffect, useContext } from "react"
import { RadioButton } from "primereact/radiobutton"
import { FloatLabel } from "primereact/floatlabel"
import { Button } from "primereact/button"
import { Password } from "primereact/password"
import loginIMg from "../images/login.png"
import { Toast } from "primereact/toast"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/authProvider"
import Container from "react-bootstrap/Container"
import Input from "../components/input"
import { url } from "../url"
import { Loading } from "../components/loading"

const Login = () => {
  const [user, setUser] = useState({
    user_type_id: null,
    name: "",
    email: "",
    phone: null,
    child_name: "",
    child_gender: "",
    child_birthdate: null,
    senha: null,
  })
  const [isRegistering, setIsRegistering] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false)
  const [recoveryStep, setRecoveryStep] = useState(1) // 1: email, 2: verification code, 3: new password
  const [verificationCode, setVerificationCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

  const toast = useRef(null)
  const navigate = useNavigate()
  const { isAuthenticated, login, getUser } = useContext(AuthContext)

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/")
    }
  }, [isAuthenticated, navigate])

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${url}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email, senha: user.senha }),
      })
      if (response.ok) {
        toast.current.show({ severity: "success", summary: "Sucesso", detail: "Usuário logado", life: 3000 })
        const result = await response.json()
        login(result.token)
        getUser()
        navigate("/")
        setIsLoading(false)
      } else {
        toast.current.show({ severity: "error", summary: "Erro", detail: "Erro ao realizar login", life: 3000 })
        setLoginAttempts((prev) => prev + 1)
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Erro ao enviar dados para o backend:", error)
      setLoginAttempts((prev) => prev + 1)
      setIsLoading(false)
    }
  }

  const handleRecoverPassword = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${url}/api/recuperar-senha`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email }),
      })
      if (response.ok) {
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Email de recuperação enviado",
          life: 3000,
        })
        setVerificationCode("")
        setRecoveryStep(2)
        setIsLoading(false)
      } else {
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: "Erro ao enviar email de recuperação",
          life: 3000,
        })
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Erro ao enviar dados para o backend:", error)
      toast.current.show({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao enviar email de recuperação",
        life: 3000,
      })
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${url}/api/verificar-codigo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          codigo: verificationCode,
        }),
    })
    console.log(verificationCode)
      if (response.ok) {
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Código verificado com sucesso",
          life: 3000,
        })
        setRecoveryStep(3)
        setIsLoading(false)
      } else {
        toast.current.show({ severity: "error", summary: "Erro", detail: "Código inválido", life: 3000 })
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Erro ao verificar código:", error)
      toast.current.show({ severity: "error", summary: "Erro", detail: "Erro ao verificar código", life: 3000 })
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (newPassword !== confirmNewPassword) {
      toast.current.show({ severity: "error", summary: "Erro", detail: "As senhas não coincidem", life: 3000 })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${url}/api/redefinir-senha`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          codigo: verificationCode,
          novaSenha: newPassword,
        }),
      })
      if (response.ok) {
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Senha redefinida com sucesso",
          life: 3000,
        })
        // Reset states and return to login
        setIsRecoveringPassword(false)
        setRecoveryStep(1)
        setVerificationCode("")
        setNewPassword("")
        setConfirmNewPassword("")
        setIsLoading(false)
      } else {
        toast.current.show({ severity: "error", summary: "Erro", detail: "Erro ao redefinir senha", life: 3000 })
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Erro ao redefinir senha:", error)
      toast.current.show({ severity: "error", summary: "Erro", detail: "Erro ao redefinir senha", life: 3000 })
      setIsLoading(false)
    }
  }

  const renderLoginForm = () => (
    <>
      <h1>Faça login para começar!</h1>

      <div className="flex-row">
        <Input
          type="text"
          name="Email"
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          label="Email"
          className="login-input"
        />
      </div>
      <div className="flex-row">
        <FloatLabel>
          <Password
            className="login-input"
            id="password"
            value={user.senha}
            onChange={(e) => setUser({ ...user, senha: e.target.value })}
            toggleMask
            feedback={false}
          />
          <label htmlFor="password">Senha</label>
        </FloatLabel>
      </div>
      {loginAttempts > 0 && (
        <div className="flex-row">
          <p>
            <span
              style={{ cursor: "pointer", color: "#6f9aa7", textDecoration: "underline" }}
              onClick={() => setIsRecoveringPassword(true)}
            >
              Esqueceu sua senha? Clique aqui
            </span>
          </p>
        </div>
      )}
      <div className="flex-row">
        <p>
          Não tem uma conta?{" "}
          <strong style={{ cursor: "pointer" }} onClick={() => setIsRegistering(true)}>
            Cadastre-se
          </strong>
        </p>
      </div>
      <div className="">
        <Button label="Entrar" className="save-button" onClick={() => handleLogin()} />
      </div>
    </>
  )

  const renderRecoveryForm = () => {
    switch (recoveryStep) {
      case 1:
        return (
          <>
            <h1>Recuperação de Senha</h1>
            <div className="flex-row">
              <Input
                type="text"
                name="Email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                label="Email"
                className="login-input"
              />
            </div>
            <div className="flex-row">
              <p>Enviaremos um código de verificação para o seu email.</p>
            </div>
            <div className="flex-row">
              <Button
                label="Voltar"
                className="save-button"
                style={{ backgroundColor: "#ccc" }}
                onClick={() => setIsRecoveringPassword(false)}
              />
              <Button label="Enviar" className="save-button" onClick={handleRecoverPassword} />
            </div>
          </>
        )
      case 2:
        return (
          <>
            <h1>Verificação de Código</h1>
            <div className="flex-row">
            <Input
                type="text"
                name="Email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                label="Email enviado"
                className="login-input"
                disabled
              />
              <Input
                type="text"
                name="VerificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                label="Código de Verificação"
                className="login-input"
              />
            </div>
            <div className="flex-row">
              <p>Digite o código de verificação enviado para o seu email.</p>
            </div>
            <div className="flex-row">
              <Button
                label="Voltar"
                className="save-button"
                style={{ backgroundColor: "#ccc" }}
                onClick={() => setRecoveryStep(1)}
              />
              <Button label="Verificar" className="save-button" onClick={handleVerifyCode} />
            </div>
          </>
        )
      case 3:
        return (
          <>
            <h1>Redefinir Senha</h1>
            <div className="flex-row">
              <FloatLabel>
                <Password
                  className="login-input"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  toggleMask
                />
                <label htmlFor="newPassword">Nova Senha</label>
              </FloatLabel>
            </div>
            <div className="flex-row">
              <FloatLabel>
                <Password
                  className="login-input"
                  id="confirmNewPassword"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  toggleMask
                  feedback={false}
                />
                <label htmlFor="confirmNewPassword">Confirmar Nova Senha</label>
              </FloatLabel>
            </div>
            <div className="flex-row">
              <Button
                label="Voltar"
                className="save-button"
                style={{ backgroundColor: "#ccc" }}
                onClick={() => setRecoveryStep(2)}
              />
              <Button label="Salvar" className="save-button" onClick={handleResetPassword} />
            </div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <Container className={isRegistering ? "container-login container-cadastro" : "container-login"}>
      {isLoading && <Loading />}
      <Container className="container-login-content">
        <Toast ref={toast} />
        <section className="user-form">
          <div className="form-login">
            {!isRegistering ? (
              isRecoveringPassword ? (
                renderRecoveryForm()
              ) : (
                renderLoginForm()
              )
            ) : (
              <Cadastro
                user={user}
                setUser={setUser}
                setIsRegistering={setIsRegistering}
                toast={toast}
                setIsLoading={setIsLoading}
              />
            )}
          </div>
          <div className="img-container">
            <div className="title-login">
              <h2>Bem-vindo ao Estimula TEA</h2>
              <p>
                Um guia para pais e cuidadores na estimulação precoce de crianças com Transtorno do Espectro Autista
                (TEA).
              </p>
            </div>
            <div className="img-div">
              <img src={loginIMg || "/placeholder.svg"} alt="criança brincando" />
            </div>
          </div>
        </section>
      </Container>
    </Container>
  )
}

const Cadastro = ({ user, setUser, setIsRegistering, toast, setIsLoading }) => {
  const [isFormValid, setIsFormValid] = useState(false)
  const [hasEspeciality, setHasEspeciality] = useState(false)

  useEffect(() => {
    const areFieldsFilled = Object.entries(user).filter(([key]) => {
      if (hasEspeciality) return key !== "child_birthdate" && key !== "child_name"
      return key !== "especialidade"
    })

    const arePasswordsEqual = user.senha === user.confirmarSenha

    setIsFormValid(areFieldsFilled && arePasswordsEqual)

    user.user_type_id === "1" ? setHasEspeciality(true) : setHasEspeciality(false)
  }, [user, hasEspeciality])

  const OnSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${url}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      })
      if (response.ok) {
        toast.current.show({ severity: "success", summary: "Sucesso", detail: "Usuário cadastrado", life: 3000 })
        setIsRegistering(false)
        setIsLoading(false)
      } else {
        toast.current.show({ severity: "error", summary: "Erro", detail: "Erro ao cadastrar usuário", life: 3000 })
        setIsLoading(false)
      }
    } catch (error) {
      setIsLoading(false)
    }
  }

  return (
    <Container className="">
      <h1>Cadastre-se</h1>

      <div className="flex-row">
        <div className="radios-background">
          <p>Usuário: </p>
          <div className="radio-button">
            <RadioButton
              inputId="terapeuta"
              name="user_type"
              value="1"
              onChange={(e) => setUser({ ...user, user_type_id: e.value })}
              checked={user?.user_type === "terapeuta"}
            />
            <label htmlFor="terapeuta">Terapeuta</label>
          </div>
          <div className="radio-button">
            <RadioButton
              inputId="pais"
              name="user_type"
              value="2"
              onChange={(e) => setUser({ ...user, user_type_id: e.value })}
              checked={user?.user_type === "pais"}
            />
            <label htmlFor="pais">Pai/Mãe</label>
          </div>
          <div className="radio-button">
            <RadioButton
              inputId="cuidador"
              name="user_type"
              value="3"
              onChange={(e) => setUser({ ...user, user_type_id: e.value })}
              checked={user?.user_type === "cuidador"}
            />
            <label htmlFor="cuidador">Outro cuidador</label>
          </div>
        </div>
      </div>
      <div className="flex-row">
        <Input
          type="text"
          name="responsible-name"
          onChange={(e) => setUser({ ...user, name: e.target.value })}
          label="Nome"
        />
        <Input type="text" name="Email" onChange={(e) => setUser({ ...user, email: e.target.value })} label="Email" />
      </div>
      <div className="flex-row">
        <Input
          type="mask"
          name="tel"
          onChange={(e) => setUser({ ...user, phone: e.target.value })}
          label="Telefone"
          mask="(99)99999-9999"
        />
        {hasEspeciality && (
          <Input
            type="text"
            value={user.especialidade}
            name="Especialidade"
            onChange={(e) => setUser({ ...user, especialidade: e.target.value })}
            label="Especialidade"
          />
        )}
      </div>
      <div className="flex-row">
        <div className="radios-background">
          <p>Gênero: </p>
          <div className="radio-button">
            <RadioButton
              inputId="masculino"
              name="genero"
              value="M"
              onChange={(e) => setUser({ ...user, child_gender: e.value })}
              checked={user?.genero === "masculino"}
            />
            <label htmlFor="masculino">Masculino</label>
          </div>
          <div className="radio-button">
            <RadioButton
              inputId="feminina"
              name="genero"
              value="F"
              onChange={(e) => setUser({ ...user, child_gender: e.value })}
              checked={user?.genero === "feminina"}
            />
            <label htmlFor="feminina">Feminino</label>
          </div>
        </div>
      </div>
      {!hasEspeciality && (
        <div className="flex-row">
          <>
            <Input
              type="text"
              value={user.child_name}
              name="child_name"
              onChange={(e) => setUser({ ...user, child_name: e.target.value })}
              label="Nome da criança"
            />
            <Input
              type="number"
              value={user.child_birthdate}
              name="child_birthdate"
              onChange={(e) => setUser({ ...user, child_birthdate: e.target.value })}
              label="Idade da criança"
            />
          </>
        </div>
      )}
      <div className="flex-row">
        <FloatLabel>
          <Password id="password" onChange={(e) => setUser({ ...user, senha: e.target.value })} toggleMask />
          <label htmlFor="password">Senha</label>
        </FloatLabel>
        <FloatLabel>
          <Password
            id="password"
            onChange={(e) => setUser({ ...user, confirmarSenha: e.target.value })}
            toggleMask
            feedback={false}
          />
          <label htmlFor="password">Confirmar Senha</label>
        </FloatLabel>
      </div>
      <div className="flex-row">
        <p>
          Já tem uma conta?{" "}
          <strong style={{ cursor: "pointer" }} onClick={() => setIsRegistering(false)}>
            Faça login
          </strong>
        </p>
      </div>
      <div className="flex-row">
        <Button label={"Cadastrar"} className="save-button" onClick={OnSave} disabled={!isFormValid} />
      </div>
    </Container>
  )
}

export default Login
