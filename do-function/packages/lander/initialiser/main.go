package main

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"path"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/gofrs/uuid/v5"
)

var (
	spacesEndpoint  = "https://fra1.digitaloceanspaces.com"
	spacesKeyID     = os.Getenv("AWS_ACCESS_KEY_ID")
	spacesSecretKey = os.Getenv("AWS_SECRET_ACCESS_KEY")
	bucket          = os.Getenv("BUCKET")

	client = s3manager.NewUploader(session.New(&aws.Config{
		Credentials:      credentials.NewStaticCredentials(spacesKeyID, spacesSecretKey, ""),
		Endpoint:         aws.String(spacesEndpoint),
		Region:           aws.String("us-east-1"),
		S3ForcePathStyle: aws.Bool(false),
	}))
)

// Request grants access to the Anko ID, if known
type Request struct {
	Metadata metadata `json:"http"`
}

// ID will return the ID found in the request, or will
// mint a new ID
func (r Request) ID() string {
	id := r.Metadata.Headers.ID
	if id == "" {
		return uuid.Must(uuid.NewV4()).String()
	}

	return id
}

type metadata struct {
	Headers headers `json:"headers"`
}

type headers struct {
	ID string `json:"x-anko-id"`
}

// Response is sent back with some kind of informative
// message about the operation
type Response struct {
	Headers    map[string]string `json:"headers"`
	StatusCode int               `json:"statusCode"`
	Body       string            `json:"body"`
}

func Main(ctx context.Context, event Request) Response {
	var (
		status = http.StatusNoContent
	)

	id := event.ID()
	key := path.Join(id, "seen_at")

	if _, err := client.Upload(&s3manager.UploadInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
		Body:   nowAsReader(),
	}); err != nil {
		fmt.Println(err)

		status = http.StatusInternalServerError
	}

	return Response{
		Headers: map[string]string{
			"X-Anko-Id":  id,
			"Set-Cookie": fmt.Sprintf("AnkoID=%s; Max-Age=7890000; Version=", id),
		},
		StatusCode: status,
		Body:       id,
	}
}

func nowAsReader() io.Reader {
	b := new(bytes.Buffer)
	b.WriteString(fmt.Sprintf("%d", time.Now().Unix()))

	return b
}
