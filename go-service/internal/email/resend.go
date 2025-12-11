package email

// TODO: Implement Resend email service for production
//
// When ready to implement:
// 1. Install Resend Go SDK:
//    go get github.com/resend/resend-go/v2
//
// 2. Set environment variable:
//    RESEND_API_KEY=re_xxxxx
//
// 3. Implement ResendService:
//
// type ResendService struct {
//     client *resend.Client
//     fromEmail string
//     fromName string
// }
//
// func NewResendService(config Config) *ResendService {
//     client := resend.NewClient(config.ResendAPIKey)
//     return &ResendService{
//         client: client,
//         fromEmail: config.FromEmail,
//         fromName: config.FromName,
//     }
// }
//
// func (r *ResendService) SendPasswordReset(to, resetLink string) error {
//     params := &resend.SendEmailRequest{
//         From:    fmt.Sprintf("%s <%s>", r.fromName, r.fromEmail),
//         To:      []string{to},
//         Subject: "Reset Your LoreSmith Password",
//         Html:    fmt.Sprintf(`
//             <h2>Reset Your Password</h2>
//             <p>Click the link below to reset your password (expires in 1 hour):</p>
//             <a href="%s">Reset Password</a>
//             <p>If you didn't request this, you can safely ignore this email.</p>
//         `, resetLink),
//     }
//
//     sent, err := r.client.Emails.Send(params)
//     if err != nil {
//         return fmt.Errorf("failed to send email via Resend: %w", err)
//     }
//
//     log.Printf("Email sent via Resend: %s", sent.Id)
//     return nil
// }
//
// 4. Update email.go NewEmailService() to return NewResendService(config)
// 5. Set EMAIL_PROVIDER=resend in production .env
