package main

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"net/mail"
	"os"
	"path"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
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

	errMissingEmailAddress = fmt.Errorf("missing email address")
	errInvalidEmailAddress = fmt.Errorf("invalid email address")
)

// SignupEvent holds the payload from lander-pages
// and contains enough information to determine cohort
// information
type SignupEvent struct {
	Metadata metadata `json:"http"`

	EmailAddress string `json:"addr"`
	Campaign     string `json:"campaign"`
}

type metadata struct {
	Headers headers `json:"headers"`
}

type headers struct {
	ID string `json:"x-anko-id"`
}

func (e SignupEvent) ID() string {
	id := e.Metadata.Headers.ID
	if id != "" {
		return id
	}

	return fmt.Sprintf("unknown_%d", time.Now().Unix())
}

// Validate ensures data is, um, valid
func (e *SignupEvent) Validate() error {
	if e.EmailAddress == "" {
		return errMissingEmailAddress
	}

	a, err := mail.ParseAddress(e.EmailAddress)
	if err != nil {
		return errInvalidEmailAddress
	}

	// Ensure address is perfectly valid
	e.EmailAddress = a.Address

	if e.Campaign == "" {
		e.Campaign = "default"
	}

	return nil
}

// Data returns an io.Reader containing the signup event formatted
// in a way we can later parse
func (e SignupEvent) Data() io.Reader {
	data := new(bytes.Buffer)

	data.WriteString(fmt.Sprintf("emailAddress=%q\n", e.EmailAddress))
	data.WriteString(fmt.Sprintf("campaign=%q\n", e.Campaign))

	return data
}

// Response is sent back with some kind of informative
// message about the operation
type Response struct {
	StatusCode int `json:"statusCode"`
}

func Main(ctx context.Context, event SignupEvent) Response {
	var status = http.StatusNoContent

	err := event.Validate()
	if err != nil {
		fmt.Println(err)
		status = http.StatusBadRequest
	}

	id := event.ID()
	key := path.Join(id, fmt.Sprint(time.Now().Unix()))

	if _, err := client.Upload(&s3manager.UploadInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
		Body:   event.Data(),
	}); err != nil {
		fmt.Println(err)

		status = http.StatusInternalServerError
	}

	return Response{
		StatusCode: status,
	}
}
