#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

RETVAL=0
ROOT=$PWD

case "$1" in
    serve)
        hugo server --watch --source=src -d=docs --disableFastRender
        ;;
	build)
	    hugo --source=src -d=docs
	    cp -R src/public/. docs/
		;;
	deploy)
	    cp -R src/public/. docs/
	    git add --all
		git commit -m "$2"
		git push origin master
		;;
	push)
		hugo --source=src -d=docs
		cp -R src/public/. docs/
		git add --all
		git commit -m "$2"
		git push origin master
		;;
	*)  echo $"Usage: $0 {serve|build|deploy|push}"
		RETVAL=1
		;;
esac
exit $RETVAL
