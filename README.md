# gold-eagle-web

## Local development setup

### 1. Setup environment file

In the root of the project copy `.env.example` into a file named `.env`. Speak to another team member to get required values.

### 2. Run the application

This project uses private NPM packages. It's important to be logged in to NPM with a user that is on the EA org in NPM. If you're in doubt, ask your line manager.
To login to npm run: `npm login`

### 3. Run the application

First install the dependencies:

``` 
npm install
```

Then you can run the application:

```
npm run dev
```

## Running tests

Gold Eagle web app has 2 sets of tests. Real end-to-end tests and component tests.
The end-to-end tests are using Cypress and are testing page composition and page behaviour. The tests run against real endpoints to it's important to be connected to the VPN to run the tests.
The unit tests are using jest and are testing individual components

End-to-end tests:

```
npm run test:e2e

or for watch mode
npm run test:e2e:watch
```

Because the end-to-end tests run against real endpoints, they need users to sign in and get licensing assigned.
There are two users (cypress-fully-licensed and cypress-partially-licensed) in the env file that are used to sign in.

Unit tests:

```
npm run test:components

or for watch mode
npm run test:components:watch
```

## Build pipeline

Any branches will run a test suite on commits pushed to the branch. As a default, old commits gets canceled if a newer commit is pushed before the old finishes.
The test pipleline runs the eslint, unit tests and end-to-end tests.
The coverage of the unit tests are uploaded to an S3 bucket https://gold-eagle-web-test-coverage.s3.eu-west-2.amazonaws.com/BRANCH_NAME_GOES_HERE/index.html
e.g: https://gold-eagle-web-test-coverage.s3.eu-west-2.amazonaws.com/develop/index.html

## Development build

Code pushed to the `develop` branch will be deployed to https://dev-beta.energyaspects.com

## Staging build

Code pushed to the `master` branch is currently not deployed anywhere

## Production build 

Tagged releases will be deployed to https://beta.energyaspects.com

## IntelliJ IDEA

- Mark folder "/public" as resource root to prevent warnings in relation to not being able to identify any assets from the public folder


## Install and setup NVM
Whole guide is here: https://github.com/nvm-sh/nvm

Specific part on automatically using the .nvmrc file here: 
https://github.com/nvm-sh/nvm#calling-nvm-use-automatically-in-a-directory-with-a-nvmrc-file

## Patches
`@auth0/nextjs-auth0` custom store implementation and folder needs to transpiled to es5

`entities` transient dependency needs a patch to support IE11 https://github.com/manish-kothari/entities/pull/1/files
