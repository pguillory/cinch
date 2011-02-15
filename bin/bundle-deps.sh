#!/bin/bash
set -e
cd `dirname $0`
cd ..
rm -rf deps-temp
mkdir deps-temp
pushd deps-temp
git clone https://github.com/mozilla/narcissus.git       narcissus
find . -name .git | xargs rm -rf
popd
rm -rf deps
mv deps-temp deps
git add deps
git ls-files -d -z | xargs -0 git update-index --remove
