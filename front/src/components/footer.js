import '../styles/main.scss'
import React from 'react'
import Container from 'react-bootstrap/Container';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer>
        <Container className='header-content'>
        <h1>EstimulaTEA</h1>
        <div>
            <Link className='footer-item' to="/"><b>Contato:</b> estimulaTEA@gmail.com</Link>
        </div>
        </Container>
    </footer>
  )
}

export default Footer
