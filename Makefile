serve:
	hugo --log --source=$(PWD)/src server --watch -d=$(PWD)/docs --disableFastRender

build:
	hugo -v --log --source=src -d=$(PWD)/docs
	cp -R src/public/ docs/

MSG ?= "Update site"
deploy: build
	git add --all
	git commit -m "$(MSG)"
