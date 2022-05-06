NAME          := grafana-prometheus-alertmanager-datasource
VERSION       := $(shell git describe --always)

## install: Install node dependencies
.PHONY: install
install:
	yarn install

## build: Build plugin
.PHONY: build
build:
	yarn run build

## sign: Sign plugin
.PHONY: sign
sign:
	yarn sign

## release: Make a release of the plugin
.PHONY: release
release: install build sign
	mkdir build
	mv dist/ build-camptocamp-prometheus-alertmanager-datasource
	zip -r build/camptocamp-prometheus-alertmanager-datasource-${VERSION}.zip ./build-camptocamp-prometheus-alertmanager-datasource
	md5sum build/camptocamp-prometheus-alertmanager-datasource-${VERSION}.zip > build/camptocamp-prometheus-alertmanager-datasource-${VERSION}.zip.md5
	rm -r build-camptocamp-prometheus-alertmanager-datasource

## run-dev: Build and run Docker dev container on port 3000
.PHONY: run-dev
run-dev: build
	docker run -d \
    -e GF_DEFAULT_APP_MODE=development \
    -p 3000:3000 \
    -v ${PWD}:/var/lib/grafana/plugins \
    grafana/grafana:8.5.2


.PHONY: help
all: help
help: Makefile
	@echo
	@echo " Choose a command to run in "$(NAME)":"
	@echo
	@sed -n 's/^##//p' $< | column -t -s ':' |  sed -e 's/^/ /'
	@echo