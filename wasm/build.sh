#!/bin/bash

cd "${0%/*}"

docker run --rm -v `pwd`:/project stargate01/f90wasm bash -c 'cd /project && VERBOSE=1 EM_CACHE=/project/bin/.emscripten_cache make build'

cp `pwd`/bin/assembly.js `pwd`/../wasmpack/
cp `pwd`/bin/assembly.wasm `pwd`/../public/static/js/
echo "export {Module};" >> `pwd`/../wasmpack/assembly.js
