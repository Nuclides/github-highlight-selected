#!/bin/bash

echo Distributing the extension...
zip -r ~/Desktop/github-highlight-selected.zip . -x '.*/*' '.*' 'Assets/*'
echo Distribution file created at ~/Desktop/github-highlight-selected.zip
