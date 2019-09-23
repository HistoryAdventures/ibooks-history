#!/bin/bash

npm run build

cp -rf $(pwd) $(pwd)-$1
rm -rf $(pwd)-$1/node_modules
rm -rf $(pwd)-$1/wdgts
mv $(pwd)-$1 ../scene-$1.wdgt

