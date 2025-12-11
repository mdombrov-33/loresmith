package email

import (
	"fmt"
)

type EmailService interface {
	SendPasswordReset(to, resetLink string) error
	// TODO: Add more email types when needed
	// SendWelcome(to, username string) error
	// SendVerification(to, verificationLink string) error
}

// * Config holds email service configuration
type Config struct {
	Provider string // "mailhog" or "resend"
	// MailHog config
	SMTPHost  string
	SMTPPort  int
	FromEmail string
	FromName  string
	// Resend config (for later)
	ResendAPIKey string
}

// * NewEmailService creates the appropriate email service based on config
func NewEmailService(config Config) (EmailService, error) {
	switch config.Provider {
	case "mailhog", "smtp":
		return NewSMTPService(config), nil
	case "resend":
		// TODO: Implement Resend service when ready for production
		return nil, fmt.Errorf("resend provider not yet implemented - use 'mailhog' for development")
	default:
		return nil, fmt.Errorf("unknown email provider: %s (use 'mailhog' or 'resend')", config.Provider)
	}
}
