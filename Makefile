include .env
export

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
