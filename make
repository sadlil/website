#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

RETVAL=0
ROOT=$PWD

case "$1" in
    serve)
        hugo server --watch --source=src
        popd
        ;;
	build)
	    hugo --source=src
	    cp -R src/public/. .
		;;
	deploy)
	    cp -R src/public/. .git add --all
		git commit -m "$2"
		git push origin master
		;;
	push)
		hugo --source=src
		cp -R src/public/. .
		git add --all
		git commit -m "$2"
		git push origin master
		;;
	*)  echo $"Usage: $0 {serve|build|deploy|push}"
		RETVAL=1
		;;
esac
exit $RETVAL
