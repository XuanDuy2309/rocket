package notification

import "context"

type Consumer struct{}

func NewConsumer() *Consumer {
	return &Consumer{}
}

func (c *Consumer) Run(ctx context.Context) error {
	return nil
}
