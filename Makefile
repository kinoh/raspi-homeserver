PYTHON_MODULE = homeserver

include .env
export

.PHONY: build
build:
	cd web && npm run build

.PHONY: install
install:
	python3 -m venv venv
	. venv/bin/activate && pip install -r requirements.txt

.PHONY: deploy
deploy: deploy-app deploy-web

.PHONY: deploy-app
deploy-app:
	rsync -a --exclude web --exclude .git $(PWD)/ $(PROD_HOST):$(PROD_PATH)

.PHONY: deploy-web
deploy-web:
	rsync -a $(PWD)/web/build/ $(PROD_HOST):$(PROD_PATH)/$(PYTHON_MODULE)/web_build/

.PHONY: dev
dev:
	FLASK_APP=main FLASK_ENV=development flask run --host=0.0.0.0

.PHONY: cert
cert:
	. venv/bin/activate && certbot certonly --manual --preferred-challenges dns \
		-d $(BASE_DOMAIN) -d *.$(BASE_DOMAIN) \
		--email $(EMAIL) --agree-tos --no-eff-email \
		--manual-auth-hook ./cert_hook/create_dns_record.sh \
		--manual-cleanup-hook ./cert_hook/delete_dns_record.sh

.PHONY: cert-dry-run
cert-dry-run:
	. venv/bin/activate && certbot certonly --manual --preferred-challenges dns \
		-d $(BASE_DOMAIN) -d *.$(BASE_DOMAIN) \
		--email $(EMAIL) --agree-tos --no-eff-email \
		--manual-auth-hook ./cert_hook/create_dns_record.sh \
		--manual-cleanup-hook ./cert_hook/delete_dns_record.sh \
		--dry-run

.PHONY: cert-update
cert-update:
	. venv/bin/activate && certbot certonly --manual --preferred-challenges dns \
		-d $(BASE_DOMAIN) -d *.$(BASE_DOMAIN) \
		--email $(EMAIL) --agree-tos --no-eff-email \
		--manual-auth-hook ./cert_hook/create_dns_record.sh \
		--manual-cleanup-hook ./cert_hook/delete_dns_record.sh \
		--post-hook "systemctl restart $(SERVICE_NAME)"
