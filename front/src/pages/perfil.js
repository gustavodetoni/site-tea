// eslint-disable-next-line
import '../styles/profile.scss'
import React, { useEffect, useState, useContext, useRef } from 'react'
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import midbanner from '../images/mid-banner.png'
import { Dropdown } from 'primereact/dropdown';
import { AuthContext } from '../context/authProvider';
import { fetchData } from '../components/utils';
import { TabView, TabPanel } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';
import { url } from '../url';

const Perfil = () => {
    const [isPerfil, setIsPerfil] = useState(true)
    const [isTerapeuta, setIsTerapeuta] = useState(false)
    const [paciente, setPaciente] = useState(null);
    const [listaTerapeutas, setListaTerapeutas] = useState([]);
    const [listOfRelations, setListOfRelations] = useState([])
    const [userFirstName, setUserFirstName] = useState()
    const toast = useRef()
    const navigate = useNavigate()
    const { user, token, logout } = useContext(AuthContext);
    

    // Método para buscas os pacientes disponiveis
    const fetchAllPacients = async () => {
        const endpoint = `${url}/api/pacientes`;
        try {
            const data = await fetchData(endpoint, 'GET', null, token);
            setListaTerapeutas(data);
        } catch (error) {
            console.log(error);
        }
    };    

    // Método para enviar solicitacão de amizades
    const sendRequest = async () => {
        try {
            const data = await fetchData(`${url}/api/request`, 'POST', { therapist_id: user?.id, patient_id: paciente }, token);
    
            if (data) {
                fetchAllPacients();
                countRelations();
                toast.current.show({severity:'success', summary: 'Sucesso', detail:'Solicitação enviada!', life: 3000});
            }
        } catch (error) {
            toast.current.show({severity:'error', summary: 'Erro', detail:'Erro ao enviar solicitação, verifique se ela já existe!', life: 3000});
        }
    }

    // Método para aceitar solicitacão de amizades
    const onAccept = async (idTerapeuta) => {
        try {
            const response = await fetch(`${url}/api/pacientes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ therapist_id: idTerapeuta, patient_id: user?.id }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao aceitar amizade.');
            }
        
            fetchAllPacients();
            countRelations()
            toast.current.show({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Amizade aceita com sucesso!',
                life: 3000
            });
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Erro',
                detail: error.message || 'Erro ao aceitar amizade.',
                life: 3000
            });
            console.error('Erro ao aceitar amizade:', error);
        }
    };

    const deleteFriendship = async (id) => {
        try {
            const data = await fetchData(`${url}/api/request/${id}`, 'DELETE', null, token);
    
            if (data) {
                fetchAllPacients();
                countRelations();
                toast.current.show({severity:'success', summary: 'Sucesso', detail:'Amizade deletada!', life: 3000});
            }
        } catch (error) {
            toast.current.show({severity:'error', summary: 'Erro', detail:'Erro ao cancelar amizade!', life: 3000});
        }
    }
    

    // Método para trazer as amizades
    const countRelations = async () => {
        if(user){
            try {
                const data = await fetchData(`${url}/api/pacientes/${user?.id}?user_type_id=${user?.user_type_id}`, 'GET', null, token);
                setListOfRelations(data)
            } catch (error) {
                console.log(error);
            }
        }
    };    

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        fetchAllPacients();
        if(user) countRelations();
        setUserFirstName(user?.name?.split(' ')[0])
        if(user?.user_type_id === 1){
            setIsTerapeuta(true)
        }
    }, [user])

console.log(user)
  

    return (
        <>
        <Toast ref={toast} />
        <div className='profile-container'>
            <div className='profile-container-content'>
                <img src={midbanner} />

                {isPerfil ? (
                    <>
                        <div>
                            <h1>Bem vindo, {userFirstName}</h1>

                            <InputText value={user?.name} id='responsible-name' placeholder='Nome do Responsável' disabled/>
                            <InputText value={user?.phone} id='responsible-name' placeholder='Telefone' disabled/>
                            {user?.especialidade ?
                                (
                                    <InputText value={user?.especialidade} id='responsible-name' placeholder='Especialidade' disabled/>
                                ) : (
                                    <>
                                        <InputText value={user?.child_name} id='responsible-name' placeholder='Nome da criança' disabled/>
                                        <InputText value={user?.child_birthdate} id='responsible-name' placeholder='Data de nascimento' disabled/>
                                    </>
                                )
                            }
                            <InputText value={user?.email} id='responsible-name' placeholder='Email' disabled/>
                        </div>
                        <Button
                            className='edit' 
                            label='Sair'
                            onClick={() => {logout(); navigate('/login')}}
                        />
                    </>
                ) : (
                    isTerapeuta ? (
                        <TabView className="perfil-tab">
                            <TabPanel header="Adicione pacientes" > 
                                <h1>Envie uma solicitação </h1>
                                <h5> Encontre o seu paciente no dropdown abaixo e envie uma solicitação de amizade.
                                Assim que ele aceitar, ele poderá visualizar a agenda que você criou. </h5>
                                <Dropdown
                                    value={paciente}
                                    options={listaTerapeutas}
                                    optionLabel='email'
                                    optionValue='id'
                                    onChange={(e) => setPaciente(e.value)}
                                    placeholder="Selecione um paciente"
                                    filter
                                    panelClassName="dropdown-terapeutas"
                                />
                                <Button
                                    className='edit' 
                                    label='Enviar solicitação'
                                    onClick={() => sendRequest()}
                                />
                            </TabPanel>
                            <TabPanel header='Seus pacientes'>
                                <h1>Seus pacientes</h1>
                                <h5>Aqui você pode visualizar quem é são seus atuais pacientes. </h5>
                                {listOfRelations?.length > 0 ? listOfRelations.map((item) => {
                                return (
                                    <div className='accept-card' key={item.id}>
                                        <div className='accept-card-body'>
                                            <p>Responsável: {item.nome}</p>
                                            <p>Criança: {item.child_name}</p>
                                            <p>Email: {item.email}</p>
                                        </div>
                                        <div>
                                            {item.status === "pendente" ? (
                                                <Button icon="pi pi-clock" />
                                            ) : (
                                                <>
                                                <Button icon="pi pi-times" onClick={() => deleteFriendship(item.request_id)}/>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )
                                }) : <h5><i className='pi pi-exclamation-circle'></i> Você não possui solicitações ou pacientes</h5>}
                            </TabPanel>
                        </TabView>
                    ) : (
                        <div>
                            <h1>Visualize suas solicitações </h1>
                            <h5> Encontre as solicitacão de amizade do seu terapeuta </h5>

                            {listOfRelations.length > 0 ? listOfRelations.map((item) => {
                                return (
                                    <div className='accept-card' key={item.id}>
                                        <div className='accept-card-body'>
                                            <p>Terapeuta: {item.nome}</p>
                                            <p>Email: {item.email}</p>
                                        </div>
                                        <div>
                                            {item.status === "pendente" ? (
                                                <>
                                                    <Button icon="pi pi-check" onClick={() => onAccept(item.user_id)} />
                                                    <Button icon="pi pi-times" onClick={() => deleteFriendship(item.request_id)}/>
                                                </>
                                            ) : (
                                                <>
                                                <Button icon="pi pi-times" onClick={() => deleteFriendship(item.request_id)}/>
                                                </>
                                            )}
                                            
                                        </div>
                                    </div>
                                )
                            }) : <p><i className='pi pi-exclamation-circle'></i> Você não possui solicitações</p>}
                        </div>
                        
                    )
                )}
            </div>
            <div className='selectTab'>
                <Button 
                icon="pi pi-user"
                className={isPerfil ? 'check' : ''}
                onClick={() => setIsPerfil(true)}
                />
                <Button 
                className={isPerfil ? '' : 'check'}
                icon="pi pi-calendar-plus"
                onClick={() => setIsPerfil(false)}
                />
            </div>
        </div>
        </>
  )
}

export default Perfil
