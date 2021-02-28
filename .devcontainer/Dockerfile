ARG ALPINE_VERSION=edge
FROM alpine:${ALPINE_VERSION}

# Alpine tag of the form 'x.y' or 'edge'.
ARG ALPINE_VERSION=edge
# Non-root user.
ARG USERNAME=non-root
ARG UID=1000
ARG GID=1000
# Docker-from-docker socket redirection. Assuming an installation with default
# values, resulting container should be run with:
# --mount source=/var/run/docker.sock,target=/var/run/docker-host.sock,type=bind
ARG SOURCE_SOCKET=/var/run/docker-host.sock
ARG TARGET_SOCKET=/var/run/docker.sock

# Compose base system from library scripts.
COPY library-scripts/* /tmp/library-scripts/
RUN apk --update-cache upgrade \
    && cd /tmp/library-scripts \
    # Install bash, init system, core services, & entrypoint handling.
    && sh alpine-foundation-installer.sh "${ALPINE_VERSION}" --username "${USERNAME}" --uid "${UID}" --gid "${GID}" \
    # Install docker-from-docker capability.
    && bash alpine-dfromd-foundation-installer.sh "${ALPINE_VERSION}" --username "${USERNAME}" --source "${SOURCE_SOCKET}" --target "${TARGET_SOCKET}" --docker-compose \
    # Install net utilities capability.
    && bash alpine-net-installer.sh "${ALPINE_VERSION}" \
    # Install git capability.
    && bash alpine-git-installer.sh "${ALPINE_VERSION}" --git-lfs \
    # Install nodejs capability.
    && bash alpine-nodejs-installer.sh "${ALPINE_VERSION}" \
    # Cleanup.
    && cd / \
    && rm -rf /tmp/library-scripts

ENTRYPOINT ["entrypoint.sh"]
