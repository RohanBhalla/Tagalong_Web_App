
# using SendGrid's Python Library
# https://github.com/sendgrid/sendgrid-python
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

def formatEmail(recipient, subject, message):
    message = Mail(
        from_email='nms9607@nyu.edu',
        to_emails=recipient,
        subject=subject,
        html_content='<div style="max-width:500px;min-width:200px;margin-left:auto;margin-right:auto;display:block;"><div style="width:100%;height:20px;"></div><div style="width:100%;height:35px;"><p style="font-family: \'Arial\', sans-serif;font-size:24px;line-height:35px;margin-top:0;color:#1e1e1e;float:left;">Tag<span style="color:#53AA51;">along.</span></p><a style="float:right;padding-left:15px;padding-right:15px;background-color:#f3f3f3;color:#6e6e6e;text-align:center;font-size:15px;line-height:20px;padding-top:5px;padding-bottom:5px;margin-top:2.5px;display:block;text-decoration:none;border-radius:15px;font-family:\'Arial\', sans-serif;" href="tagalong.com">Visit Us</a></div><div style="width:100%;height:20px;display:block;"></div><p style="margin-top:4px;word-wrap:break-word;word-break:break-word;text-align:left;font-family:\'Arial\', sans-serif;font-weight:400;font-size:15px;">'+message+'</p><hr style="width:100%;border:none;height:1px;background-color:#f3f3f3;margin-top:10px;margin-bottom:10px;"><p style="font-family:\'Arial\', sans-serif;font-weight:500;font-size:15px;line-height:20px;">The Tagalong Team</p></div>'
    )
    return message

def sendEmail(recipient, subject, message):
    message = formatEmail(recipient, subject, message)

    try:
        sg = SendGridAPIClient('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')
        response = sg.send(message)
        print(response.status_code)
        print(response.body)
        print(response.headers)
    except Exception as e:
        print(e)

