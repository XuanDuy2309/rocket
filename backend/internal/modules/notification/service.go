package notification

import "context"

type Service struct{}

func NewService() *Service {
	return &Service{}
}

func (s *Service) Send(ctx context.Context, token, title, body string) error {
	return nil
}
