package email

import (
	"fmt"
	"net/smtp"
)

// * SMTPService sends emails via SMTP (MailHog for dev, or any SMTP server)
type SMTPService struct {
	host      string
	port      int
	fromEmail string
	fromName  string
}

func NewSMTPService(config Config) *SMTPService {
	return &SMTPService{
		host:      config.SMTPHost,
		port:      config.SMTPPort,
		fromEmail: config.FromEmail,
		fromName:  config.FromName,
	}
}

func (s *SMTPService) SendPasswordReset(to, resetLink string) error {
	subject := "Reset Your LoreSmith Password"
	body := fmt.Sprintf(`
Hi there,

You requested to reset your password for LoreSmith.

Click the link below to reset your password (expires in 1 hour):
%s

If you didn't request this, you can safely ignore this email.

Thanks,
The LoreSmith Team
`, resetLink)

	return s.send(to, subject, body)
}

func (s *SMTPService) send(to, subject, body string) error {
	//* Construct email message
	from := fmt.Sprintf("%s <%s>", s.fromName, s.fromEmail)
	msg := []byte(fmt.Sprintf("From: %s\r\n"+
		"To: %s\r\n"+
		"Subject: %s\r\n"+
		"\r\n"+
		"%s\r\n", from, to, subject, body))

	//* Connect to SMTP server
	addr := fmt.Sprintf("%s:%d", s.host, s.port)

	// For MailHog (no auth needed)
	// For production SMTP, we would need to add authentication
	// auth := smtp.PlainAuth("", username, password, host)
	// err := smtp.SendMail(addr, auth, fromEmail, []string{to}, msg)

	err := smtp.SendMail(addr, nil, s.fromEmail, []string{to}, msg)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	return nil
}

// TODO: When switching to production SMTP (e.g., SendGrid, AWS SES):
// 1. Add SMTP_USERNAME and SMTP_PASSWORD to env vars
// 2. Uncomment auth in send() method:
//    auth := smtp.PlainAuth("", s.username, s.password, s.host)
//    err := smtp.SendMail(addr, auth, s.fromEmail, []string{to}, msg)
// 3. Update Config struct to include username/password
