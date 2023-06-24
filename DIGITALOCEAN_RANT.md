# Why does this not use digitalocean tooling to deploy the function

Oh my fucking god. Have you seen the state of functions? Quite how they thought this was production ready, I have no idea.

Firstly, the docs are massively out of date. They only cover cronjob-alike functions. Not web ones.

Secondly, there's no definition of what the various `project.yml` keys mean. Some are fair enough (`web: true` seems to mean "Give me a URL"), whereas others are completely opaque (`webSecure: false`? Apparently means that you have to include a special token in the header to access. Of course, the docs disagree on what that header is)

Thirdly, what the fuck is that directory structure the init creates? The command:

```bash
$ doctl serverless init --language go lander
```

Gave me

```bash
$ lander
├── packages
│   └── sample
│       └── hello
│           └── hello.go
└── project.yml
```

What the fuck does this mean? In this instance, which is the function name? I thought it was `lander`. If it's `hello` then what the fuck is `sample`? The config file (hello again shitness) suggests `hello`:

```yaml
# lander/project.yml
parameters: {}
environment: {}
packages:
    - name: sample
      shared: false
      environment: {}
      parameters: {}
      annotations: {}
      functions:
        - name: hello
          binary: false
          main: ""
          runtime: go:default
          web: true
          webSecure: false
          parameters: {}
          environment: {}
          annotations: {}
          limits: {}
```

Fourthly, there seems to be no way of uploading a binary through the digitalocean website; digitalocean builds for you. Is that the case here? The deployment command seems to think so:

```bash
$doctl serverless deploy lander
Deploying '/home/jspc/projects/lander/lander'
  to namespace 'fn-a558965b-aa27-4890-9eec-0b659e229e39'
  on host 'https://faas-lon1-917a94a7.doserverless.co'
Submitted action 'sample/hello' for remote building and deployment in runtime go:default (id: 35ef9a9b6515400aaf9a9b6515500a77)
Transcript of remote build session for action 'sample/hello':
Output of failed build in %s
/tmp/slices/builds/fn-a558965b-aa27-4890-9eec-0b659e229e39/sample_hello/2023-06-23T16-03-26.301Z/packages/sample/hello
initializing modules
go: creating new go.mod: module exec
go: to add module requirements and sums:
        go mod tidy
building
# exec
./hello.go:10:9: undefined: foo
```

How the fuck might I deploy code which contains non-public packages? Is that what `binary` means in the config? Build locally, deploy that?

In short... the tooling from digitalocean is fucking bobbins and so, for the sake of an easy life, I'm going to just deploy manually.
