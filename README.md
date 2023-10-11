# React + NestJS Blog App

Minimalistic but fully functional blog application with WYSIWYG editor

Currently supports:
- Authorization via email/password pair
- Writing posts with WYSIWYG editor (headers, bullet lists, images, code blocks, quotes, bold, italic, underlined text)
- Saving posts to favourites

## Technologies

- React (Frontend)
- Next (BFF)
- NestJS (Backend)
- Prisma (ORM)
- PostgreSQL (DB)
- Nginx (Exposing both frontend and backend services in single domain space (and also static files serving))
- Docker Compose/Kubernetes for container orchestration

### Overall structure

<img width="1637" alt="image" src="https://github.com/len0xx/blog-react-nest/assets/21990466/c548712d-573b-422a-8139-e67fd31b8c32">


### Screenshot

![image](https://github.com/len0xx/blog-react-nest/assets/21990466/260c9d79-5976-40cc-b04b-983d54a26e37)


## Getting started

### Docker Compose

To launch this project you need to have Docker and Docker Compose installed on your machine: [Get it here](https://docs.docker.com/get-docker/)

> **Note**: Currently this project uses `http://blog.local` as an entrypoint to an application by default.
> 
> To make it work on your machine locally you have to add the following line: `127.0.0.1 blog.local` to the hosts file on your system. On Linux/MacOS this file is located at `/etc/hosts`. On Windows it is usually `C:\Windows\System32\drivers\etc\hosts`
> 
> Or you can just change `blog.local` to `localhost` in `frontend/Dockerfile`. This way you won't have to configure anything else, just access the application at `http://localhost:80`

After you got Docker Compose installed, run this command:
```bash
# *nix system
docker compose up

# Windows system
docker-compose up
```

Then open your browser and go to the address, the application is running on. (Read note above for details)

### Kubernetes

> To launch this application using k8s, you obviously need a k8s cluster running.

**Apply all the manifests** to setup the application: `kubectl apply -f manifests/db.yml`

To expose the cluster to the network you can use this `nginx` config:
```
server {
	server_name blog blog.local;
	listen 80;

	location / {
		proxy_pass http://localhost:31555;
		proxy_set_header Host $http_host;
	}

	location /api {
		proxy_pass http://localhost:31333/api;
		proxy_set_header Host $http_host;
	}

	location /api/images {
		proxy_pass http://localhost:31666/api;
		proxy_set_header Host $http_host;
	}
}
```

## Roadmap
- [x] Basic authorization
- [x] WYSIWYG editor
- [x] Swagger REST API Docs
- [x] Image uploading
- [x] Kubernetes support
- [ ] Authorization via Telegram
- [ ] Stack multiple images into a gallery
- [ ] User profile picture
- [ ] Post comments
- [ ] Headless admin panel
