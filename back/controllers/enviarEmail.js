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
    subject: `📩 TEA - Novo Contato: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #333;">Nova Mensagem de Contato</h1>
        <p style="font-size: 18px;"><strong>Nome:</strong> ${name}</p>
        <p style="font-size: 18px;"><strong>E-mail:</strong> ${email}</p>
        <p style="font-size: 18px;"><strong>Assunto:</strong> ${subject}</p>
        <h2 style="margin-top: 30px;">Mensagem:</h2>
        <p style="font-size: 20px; background: #f5f5f5; padding: 15px; border-radius: 8px;">
          ${message}
        </p>
        <br/>
        <p style="font-size: 16px; color: #777;">Enviado pelo site.</p>
      </div>
    `,
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