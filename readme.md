# Express Production Ready App Template

This is a template project to quickly start a production application using
express and mysql. This project contains a docker-compose which starts a mysql
database, a redis database, and a production version of the app.

# How to start the application

1. Clone the repository into a directory

2. In the directory run:

```sh
npm i
```

3. Start docker with mysql and redis:

```sh
npm run docker:up
```

4. Start the dev server and builders:

```sh
npm run build:watch
npm run dev
```

5. Go to http://localhost:3000

# Mechanics

The project is set up for a simple login system using `passport.js` and
`express` to handle all the API routes. For views the project uses `ejs` which
is a simple templateing engine that works out of the box with express. All the
styles are generated using `scss` which are compiled and can be located in the
public/styles. Express serves all the static files inside the public folder.
The session data is stored inside the redis instance started by docker and all
the user data is saved to the mysql instance. The start script of the
application is located in the www folder.

# Custom NPM scripts

## dev

Start a nodemon server that will serve the server code on `localhost:3000`.

## build:watch

Start `babel` and `sass` build watchers so that when a piece of code changes it
gets rebuilt to be served. When using hot reloading for development use
`npm run dev` and `npm run build:watch`.

## docker:down

Delete all the docker containers (redis and mysql) and their data sources for a
fresh restart.

## docker:up

Bring up all the docker containers defined in the `docker-compose.yml` file.

## docker:inMySQL

Use the `mysql` cli inside the `mysql_service` container.

## docker:logs(MySQL|Redis)

Get the logs for either the MySQL container or the Redis container.
