#!/bin/bash

cd "${0%/*}"

docker run --rm -v `pwd`:/project stargate01/f90wasm bash -c 'cd /project && VERBOSE=1 EM_CACHE=/project/bin/.emscripten_cache make build'

docker kill testserver
docker rm testserver
docker run --name testserver -p 8080:3000 -v `pwd`/bin:/app/public:ro -d tobilg/mini-webserver