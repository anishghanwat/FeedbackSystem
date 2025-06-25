from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

conf = ConnectionConfig(
    MAIL_USERNAME = "myfeedbacksystem@gmail.com",
    MAIL_PASSWORD = "uzhm ymrx tkox zmnp",
    MAIL_FROM = "myfeedbacksystem@gmail.com",
    MAIL_PORT = 587,
    MAIL_SERVER = "smtp.gmail.com",
    MAIL_STARTTLS = True,      # Use this for most SMTP servers (like Gmail)
    MAIL_SSL_TLS = False,      # Use this for STARTTLS (port 587)
    USE_CREDENTIALS = True
)

def get_mail_conf():
    return conf

async def send_email(subject, recipients, body):
    message = MessageSchema(
        subject=subject,
        recipients=recipients,  # List of emails
        body=body,
        subtype="html"
    )
    fm = FastMail(conf)
    await fm.send_message(message) 
