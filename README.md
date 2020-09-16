# KristianFJones/SSH-Proxy

This is an SSH Proxy service to "reverse proxy" and audit/log all incoming SSH connections.

## Usage

TODO: Usage Docs

### Environment Variables

| ENV Variable | Description                                                           | Default     |
| ------------ | --------------------------------------------------------------------- | ----------- |
| DB_HOST      | Hostname/IP of the Database Server                                    | `Database`  |
| DB_PORT      | Port of the Database Server                                           | `5432`      |
| DB_DATABASE  | Database to use/store on the Database Server                          | `ssh-proxy` |
| DB_USER      | Username to use to login to the database server                       | `postgres`  |
| DB_PASS      | Password of the database user                                         | `pgpass`    |
| HOST         | Host to bind the server to (Not needed when running in container)     | `0.0.0.0`   |
| SSH_HOST     | Host to bind the SSH server to (Not needed when running in container) | `$HOST`     |
| SSH_PORT     | Port to run the SSH Server on                                         | `8022`      |
| PORT         | Port to run the Web server on                                         | `8080`      |
