#!/bin/bash

# Stop and remove containers if any exist
if [ "$(docker ps -aq)" ]; then
    docker rm -f $(docker ps -aq)
fi

# Remove images if any exist
if [ "$(docker images -aq)" ]; then
    docker rmi -f $(docker images -aq)
fi

# Rebuild and start the containers
docker compose build && docker compose up
