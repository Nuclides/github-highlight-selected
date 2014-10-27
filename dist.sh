#!/bin/bash

PACKAGED_PATH=`pwd`
APP_NAME="github-highlight-selected"

rm -rf /tmp/`basename $PACKAGED_PATH`
cd /tmp
cp -r $PACKAGED_PATH .
cd `basename $PACKAGED_PATH`
rm -rf .git
rm dist.sh
rm .gitignore
rm -rf Assets
rm .DS_Store
cd /tmp
zip -r $APP_NAME.zip `basename $PACKAGED_PATH`
rm -rf $APP_NAME
mv $APP_NAME.zip ~/Desktop
