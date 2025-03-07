import '../styles/contato.scss';
import React, { useState, useRef } from 'react';
import { url } from '../url';
import { Toast } from 'primereact/toast';


const Contato = () => {
    const toast = useRef()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [loading, setLoading] = useState(false); 

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${url}/api/contato`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Email enviado com sucesso',
                    life: 3000
                });
                setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    message: ''
                });
            } else {
                toast.current.show({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao enviar o email',
                    life: 3000
                });
            }
        } catch (error) {
            alert('Erro ao enviar o e-mail. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Toast ref={toast} />
            <div className="contact-form-container">
                <h2>Entre em Contato</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="name">Nome</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="email">E-mail</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="subject">Assunto</label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="message">Mensagem</label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? 'Enviando...' : 'Enviar'}
                    </button>
                </form>
            </div>
        </>
    );
};

export default Contato;
