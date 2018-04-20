#!/usr/bin/env bash

npm config set //registry.npmjs.org/:_authToken $NPM_TOKEN
npm run publish:all
