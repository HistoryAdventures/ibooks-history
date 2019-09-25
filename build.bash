#!/bin/bash

npm run build

cp -rf scene1 scene1-$1
mv scene1-$1 ../scene-$1.wdgt
