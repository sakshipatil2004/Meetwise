import smtplib
import os
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
print(EMAIL_ADDRESS, EMAIL_PASSWORD)

def send_email_with_pdf(to_email: str, pdf_path: str):

    if not os.path.exists(pdf_path):
        raise Exception("PDF file not found")

    msg = EmailMessage()
    msg["Subject"] = "Your Meeting Report - MeetWise"
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = to_email
    msg.set_content("Hello,\n\nPlease find your meeting report attached.\n\nRegards,\nMeetWise")

    with open(pdf_path, "rb") as f:
        file_data = f.read()
        file_name = os.path.basename(pdf_path)

    msg.add_attachment(
        file_data,
        maintype="application",
        subtype="pdf",
        filename=file_name,
    )

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        smtp.send_message(msg)