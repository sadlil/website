serve:
	./hack/bin/hugo --log --source=src server -d=$(PWD)/docs --watch

build:
	./hack/bin/hugo -v --log --source=src -d=$(PWD)/docs --gc --forceSyncStatic --cleanDestinationDir
	cp -R downloads/ docs/downloads
	cp -R tools/ docs/tools
	cp -R redirects/samples docs/samples
	cp CNAME docs/CNAME
	cp .nojekyll docs/.nojekyll

MSG ?= "Update site"
deploy: build
	git add --all
	git commit -m '$(MSG)'
	git push
