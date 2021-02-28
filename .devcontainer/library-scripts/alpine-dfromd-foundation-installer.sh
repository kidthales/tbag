#!/bin/bash

# Derived from https://raw.githubusercontent.com/microsoft/vscode-dev-containers/master/script-library/docker-debian.sh.
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License. See https://go.microsoft.com/fwlink/?linkid=2090316 for license information.

set -o errexit
set -o pipefail
set -o noclobber
set -o nounset
#set -o xtrace

source ./shared-lib.sh
source ./shared-alpine-lib.sh

################################################################################
# Readonly Settings
################################################################################

readonly ALPINE_DFROMD_FOUNDATION_INSTALLER_ENTRYPOINT_PATH="${ALPINE_FOUNDATION_ENTRYPOINTD_PATH}"/dfromd-entrypoint.sh

readonly ALPINE_DFROMD_FOUNDATION_INSTALLER_ADDITIONAL_PACKAGES=grep

readonly ALPINE_DFROMD_FOUNDATION_INSTALLER_DEFAULT_SOURCE_SOCKET=/var/run/docker-host.sock

readonly ALPINE_DFROMD_FOUNDATION_INSTALLER_DEFAULT_TARGET_SOCKET=/var/run/docker.sock

################################################################################
# Runtime Settings
################################################################################

ALPINE_DFROMD_FOUNDATION_INSTALLER_ALPINE_VERSION=

ALPINE_DFROMD_FOUNDATION_INSTALLER_USERNAME=root

ALPINE_DFROMD_FOUNDATION_INSTALLER_SOURCE_SOCKET="${ALPINE_DFROMD_FOUNDATION_INSTALLER_DEFAULT_SOURCE_SOCKET}"

ALPINE_DFROMD_FOUNDATION_INSTALLER_TARGET_SOCKET="${ALPINE_DFROMD_FOUNDATION_INSTALLER_DEFAULT_TARGET_SOCKET}"

ALPINE_DFROMD_FOUNDATION_INSTALLER_INSTALL_DOCKER_COMPOSE=false

################################################################################
# Options
################################################################################

# Print help.
declare -A ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_HELP=([NAME]=help [LONG]=help [SHORT]=h)

# Username.
declare -A ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_USERNAME=([NAME]=username [LONG]=username [SHORT]=u)

# Source socket.
declare -A ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_SOURCE_SOCKET=([NAME]=source-socket [LONG]=source [SHORT]=s)

# Target socket.
declare -A ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_TARGET_SOCKET=([NAME]=target-socket [LONG]=target [SHORT]=t)

# Install docker-compose?
declare -A ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_INSTALL_DOCKER_COMPOSE=([NAME]=install-docker-compose [LONG]=docker-compose [SHORT]=c)

################################################################################
# Functions
################################################################################

alpine_dfromd_foundation_installer_main() {
  alpine_dfromd_foundation_installer_parse_args ${@}

  alpine_dfromd_foundation_installer_print_header
  alpine_dfromd_foundation_installer_install_packages
  alpine_dfromd_foundation_installer_setup_users
  alpine_dfromd_foundation_installer_setup_entrypoint
}

alpine_dfromd_foundation_installer_parse_args() {
  # Options parsing.
  local opts="${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_HELP[SHORT]}${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_USERNAME[SHORT]}${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_SOURCE_SOCKET[SHORT]}${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_TARGET_SOCKET[SHORT]}${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_INSTALL_DOCKER_COMPOSE[SHORT]}"
  local longopts="${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_HELP[LONG]},${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_USERNAME[LONG]}:,${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_SOURCE_SOCKET[LONG]}:,${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_TARGET_SOCKET[LONG]}:,${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_INSTALL_DOCKER_COMPOSE[LONG]}"

  ! PARSED=$(getopt --options=${opts} --longoptions=${longopts} --name "${0}" -- "${@}")

  if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
    # getopt has complained about wrong arguments to stdout.
    alpine_dfromd_foundation_installer_print_usage
    exit 1
  fi

  # Handle quoting in getopt output.
  eval set -- "${PARSED}"

  while true; do
    case "$1" in
      "-${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_HELP[SHORT]}"|"--${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_HELP[LONG]}")
        alpine_dfromd_foundation_installer_print_help
        exit 0
        ;;
      "-${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_USERNAME[SHORT]}"|"--${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_USERNAME[LONG]}")
        ALPINE_DFROMD_FOUNDATION_INSTALLER_USERNAME="${2}"
        shift 2
        ;;
      "-${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_SOURCE_SOCKET[SHORT]}"|"--${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_SOURCE_SOCKET[LONG]}")
        ALPINE_DFROMD_FOUNDATION_INSTALLER_SOURCE_SOCKET="${2}"
        shift 2
        ;;
      "-${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_TARGET_SOCKET[SHORT]}"|"--${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_TARGET_SOCKET[LONG]}")
        ALPINE_DFROMD_FOUNDATION_INSTALLER_TARGET_SOCKET="${2}"
        shift 2
        ;;
      "-${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_INSTALL_DOCKER_COMPOSE[SHORT]}"|"--${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_INSTALL_DOCKER_COMPOSE[LONG]}")
        ALPINE_DFROMD_FOUNDATION_INSTALLER_INSTALL_DOCKER_COMPOSE=true
        shift
        ;;
      --)
        shift
        break
        ;;
    esac
  done

  # Arguments parsing.
  if [ "${#}" -ne 1 ]; then
    alpine_dfromd_foundation_installer_print_usage
    exit 2
  fi

  ALPINE_DFROMD_FOUNDATION_INSTALLER_ALPINE_VERSION="${1}"
}

alpine_dfromd_foundation_installer_print_usage() {
  cat <<EOF
Usage:
  $0 [-${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_USERNAME[SHORT]} <username>] [-${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_SOURCE_SOCKET[SHORT]} <source>] [-${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_TARGET_SOCKET[SHORT]} <target>] [-${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_INSTALL_DOCKER_COMPOSE[SHORT]}] <variant>
  $0 [-${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_HELP[SHORT]}]

  Installs docker, enables user access, and adds entrypoint functionality to
  monitor a host machine's (mounted) docker socket.

  Variant argument must be an alpine docker tag of the form 'x.y' or 'edge'.

  Assuming an installation with default values, resulting container should be
  run with: --mount source=${ALPINE_DFROMD_FOUNDATION_INSTALLER_DEFAULT_TARGET_SOCKET},target=${ALPINE_DFROMD_FOUNDATION_INSTALLER_DEFAULT_SOURCE_SOCKET},type=bind

  -${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_USERNAME[SHORT]} <username>, --${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_USERNAME[LONG]} <username>
    Allow non-root user access to docker for specified username.

  -${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_SOURCE_SOCKET[SHORT]} <source>, --${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_SOURCE_SOCKET[LONG]} <source>
    Source docker socket. Default is '${ALPINE_DFROMD_FOUNDATION_INSTALLER_DEFAULT_SOURCE_SOCKET}'.

  -${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_TARGET_SOCKET[SHORT]} <target>, --${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_TARGET_SOCKET[LONG]} <target>
    Target docker socket. Default is '${ALPINE_DFROMD_FOUNDATION_INSTALLER_DEFAULT_TARGET_SOCKET}'.

  -${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_INSTALL_DOCKER_COMPOSE[SHORT]}, --${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_INSTALL_DOCKER_COMPOSE[LONG]}
    Install docker-compose along with docker.

  -${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_HELP[SHORT]}, --${ALPINE_DFROMD_FOUNDATION_INSTALLER_OPT_HELP[LONG]}
    Print help information.
EOF
}

alpine_dfromd_foundation_installer_print_help() {
  printf '\nInstall docker-from-docker foundation to alpine-foundation based image.\n\n'
  alpine_dfromd_foundation_installer_print_usage
}

alpine_dfromd_foundation_installer_print_header() {
  shared_lib_print_header 'Alpine Docker-From-Docker Foundation Installer'
}

alpine_dfromd_foundation_installer_install_packages() {
  printf '\nInstalling packages...\n'

  shared_alpine_lib_install_docker_packages "${ALPINE_DFROMD_FOUNDATION_INSTALLER_INSTALL_DOCKER_COMPOSE}"
  shared_alpine_lib_install_packages ${ALPINE_DFROMD_FOUNDATION_INSTALLER_ADDITIONAL_PACKAGES}
}

alpine_dfromd_foundation_installer_setup_users() {
  printf '\nSetting up users...\n'
  shared_alpine_lib_setup_docker_users "${ALPINE_DFROMD_FOUNDATION_INSTALLER_USERNAME}"
}

alpine_dfromd_foundation_installer_setup_entrypoint() {
  printf '\nSetting up entrypoint...\n'

  local src_sock="${ALPINE_DFROMD_FOUNDATION_INSTALLER_SOURCE_SOCKET}"
  local trg_sock="${ALPINE_DFROMD_FOUNDATION_INSTALLER_TARGET_SOCKET}"

  local username="${ALPINE_DFROMD_FOUNDATION_INSTALLER_USERNAME}"
  local entrypoint="${ALPINE_DFROMD_FOUNDATION_INSTALLER_ENTRYPOINT_PATH}"

  # By default, make the source and target sockets the same.
  if [ "${src_sock}" != "${trg_sock}" ]; then
    touch "${src_sock}"
    ln -s "${src_sock}" "${trg_sock}"
  fi

  if [ "${username}" = root ]; then
    # Add a stub if not adding non-root user access, user is root.
    touch "${entrypoint}"
    return
  fi

  # If enabling non-root access and specified user is found, setup socat and add
  # script.
  chown -h "${username}":root "${trg_sock}"
  shared_alpine_lib_install_packages socat
  echo "$(alpine_dfromd_foundation_installer_get_entrypoint)" > "${entrypoint}"
  chmod +x "${entrypoint}"
  chown "${username}":root "${entrypoint}"
}

alpine_dfromd_foundation_installer_get_entrypoint() {
  local SOURCE_SOCKET="${ALPINE_DFROMD_FOUNDATION_INSTALLER_SOURCE_SOCKET}"
  local TARGET_SOCKET="${ALPINE_DFROMD_FOUNDATION_INSTALLER_TARGET_SOCKET}"

  local USERNAME="${ALPINE_DFROMD_FOUNDATION_INSTALLER_USERNAME}"

  cat <<EOF
#!/bin/bash

# Derived from https://raw.githubusercontent.com/microsoft/vscode-dev-containers/master/script-library/docker-debian.sh.
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License. See https://go.microsoft.com/fwlink/?linkid=2090316 for license information.

set -o errexit
set -o pipefail
set -o noclobber
set -o nounset
#set -o xtrace

SOCAT_PATH_BASE=/tmp/vscr-dind-socat
SOCAT_LOG=\${SOCAT_PATH_BASE}.log
SOCAT_PID=\${SOCAT_PATH_BASE}.pid

# Wrapper function to only use sudo if not already root.
sudo_if() {
  if [ "\$(id -u)" -ne 0 ]; then
    sudo "\${@}"
  else
    "\${@}"
  fi
}

# Log messages.
log() {
  echo -e "[\$(date)] \$@" | sudo_if tee -a \${SOCAT_LOG} > /dev/null
}

echo -e "\n** \$(date) **" | sudo_if tee -a \${SOCAT_LOG} > /dev/null
log "Ensuring ${USERNAME} has access to ${SOURCE_SOCKET} via ${TARGET_SOCKET}"

# If enabled, try to add a docker group with the right GID. If the group is
# root, fall back on using socat to forward the docker socket to another unix
# socket so that we can set permissions on it without affecting the host.
if [ "${SOURCE_SOCKET}" != "${TARGET_SOCKET}" ] && [ "${USERNAME}" != "root" ] && [ "${USERNAME}" != "0" ]; then
  SOCKET_GID=\$(stat -c '%g' ${SOURCE_SOCKET})

  if [ "\${SOCKET_GID}" != "0" ]; then
    log "Adding user to group with GID \${SOCKET_GID}."

    if [ "\$(cat /etc/group | grep :\${SOCKET_GID}:)" = "" ]; then
      sudo_if addgroup -g \${SOCKET_GID} docker-host
    fi

    # Add user to group if not already in it.
    if [ "\$(id ${USERNAME} | grep -E 'groups=.+\${SOCKET_GID}\(')" = "" ]; then
      sudo_if addgroup ${USERNAME} docker-host
    fi
  else
    # Enable proxy if not already running.
    if [ ! -f "\${SOCAT_PID}" ] || ! ps -p \$(cat \${SOCAT_PID}) > /dev/null; then
      log "Enabling socket proxy."
      log "Proxying ${SOURCE_SOCKET} to ${TARGET_SOCKET}"

      sudo_if rm -rf ${TARGET_SOCKET}
      (sudo_if socat UNIX-LISTEN:${TARGET_SOCKET},fork,mode=660,user=${USERNAME} UNIX-CONNECT:${SOURCE_SOCKET} 2>&1 | sudo_if tee -a \${SOCAT_LOG} > /dev/null & echo "\$!" | sudo_if tee \${SOCAT_PID} > /dev/null)
    else
      log "Socket proxy already running."
    fi
  fi

  log "Success"
fi
EOF
}

################################################################################
# Program Entry
################################################################################

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  alpine_dfromd_foundation_installer_main ${@}
fi
