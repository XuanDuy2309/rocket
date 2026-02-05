package config

import "os"

type Config struct {
	AppEnv   string
	HTTPAddr string

	PostgresURL string
	RedisAddr   string

	JWTSecret string

	S3Endpoint  string
	S3Region    string
	S3AccessKey string
	S3SecretKey string
	S3Bucket    string

	FCMServiceAccountPath string

	APNSTeamID   string
	APNSKeyID    string
	APNSKeyPath  string
	APNSBundleID string
	APNSSandbox  string
}

func Load() Config {
	return Config{
		AppEnv:   getEnv("APP_ENV", "development"),
		HTTPAddr: getEnv("HTTP_ADDR", ":8080"),

		PostgresURL: getEnv("POSTGRES_URL", "postgres://postgres:postgres@postgres:5432/rocket?sslmode=disable"),
		RedisAddr:   getEnv("REDIS_ADDR", "redis:6379"),

		JWTSecret: getEnv("JWT_SECRET", "change-me"),

		S3Endpoint:  getEnv("S3_ENDPOINT", ""),
		S3Region:    getEnv("S3_REGION", "auto"),
		S3AccessKey: getEnv("S3_ACCESS_KEY", ""),
		S3SecretKey: getEnv("S3_SECRET_KEY", ""),
		S3Bucket:    getEnv("S3_BUCKET", ""),

		FCMServiceAccountPath: getEnv("FCM_SERVICE_ACCOUNT_PATH", ""),

		APNSTeamID:   getEnv("APNS_TEAM_ID", ""),
		APNSKeyID:    getEnv("APNS_KEY_ID", ""),
		APNSKeyPath:  getEnv("APNS_KEY_PATH", ""),
		APNSBundleID: getEnv("APNS_BUNDLE_ID", ""),
		APNSSandbox:  getEnv("APNS_SANDBOX", "true"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
