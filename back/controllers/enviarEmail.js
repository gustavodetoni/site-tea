import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    host: "smt.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
    },
  });

export const contatoEmail = (req, res) => {
  const { name, email, subject, message } = req.body;

  const mailOptions = {
    from: email, // E-mail do usuário que preencheu o formulário
    to: process.env.EMAIL_USER, // E-mail do proprietário do site (destinatário)
    subject: subject,
    text: `Nome: ${name}\nProblema: ${message}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ message: 'Erro ao enviar o e-mail', error });
    }
    console.log('Email enviado: ' + info.response);
    res.status(200).json({ message: 'E-mail enviado com sucesso!' });
  });
};