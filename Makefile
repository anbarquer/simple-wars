# Makefile for simplewars
.PHONY: help \
		debug \
		install \
		load \
		start \
		editor \
		stop


.EXPORT_ALL_VARIABLES:
SHELL 			:= /bin/bash
UNAME           := $(shell uname -s)

define PRINT_HELP_PYSCRIPT
import re, sys

for line in sys.stdin:
	match = re.match(r'^([a-zA-Z_-]+):.*?## (.*)$$', line)
	if match:
		target, help = match.groups()
		print("* %-20s %s" % (target, help))
endef

help:  ## Display help message
	@python -c "$$PRINT_HELP_PYSCRIPT" < $(MAKEFILE_LIST)

debug: ## Debug Makefile itself
	@echo ${UNAME}

install:  ## Install game
	@docker-compose -f docker/simplewars-local.yml up --build -d

load:  ## Restore game data
	@docker exec docker_db_1 ./dump

start:  ## Run game
	@docker-compose -f docker/simplewars-local.yml up --build -d && echo "Open http://0.0.0.0:8000/simplewars" && echo "username / pass: simplewarsuser / 123456a"

editor:  ## Run maps editor app
	@echo "Open http://0.0.0.0:8000/simplewars/map-creator" && echo "username / pass: simplewarsadmin / 123456"

stop:  ## Stop game
	@docker-compose -f docker/simplewars-local.yml down