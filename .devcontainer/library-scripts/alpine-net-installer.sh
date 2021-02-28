#!/bin/bash

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

readonly ALPINE_NET_INSTALLER_PACKAGES='ca-certificates curl iputils openssh openssh-client openssh-keygen openssh-keysign wget'

################################################################################
# Runtime Settings
################################################################################

ALPINE_NET_INSTALLER_ALPINE_VERSION=

################################################################################
# Options
################################################################################

# Print help.
declare -A ALPINE_NET_INSTALLER_OPT_HELP=([NAME]=help [LONG]=help [SHORT]=h)

################################################################################
# Functions
################################################################################

alpine_net_installer_main() {
  alpine_net_installer_parse_args ${@}

  alpine_net_installer_print_header
  alpine_net_installer_install_packages
}

alpine_net_installer_parse_args() {
  # Options parsing.
  local opts="${ALPINE_NET_INSTALLER_OPT_HELP[SHORT]}"
  local longopts="${ALPINE_NET_INSTALLER_OPT_HELP[LONG]}"

  ! PARSED=$(getopt --options=${opts} --longoptions=${longopts} --name "${0}" -- "${@}")

  if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
    # getopt has complained about wrong arguments to stdout.
    alpine_net_installer_print_usage
    exit 1
  fi

  # Handle quoting in getopt output.
  eval set -- "${PARSED}"

  while true; do
    case "$1" in
      "-${ALPINE_NET_INSTALLER_OPT_HELP[SHORT]}"|"--${ALPINE_NET_INSTALLER_OPT_HELP[LONG]}")
        alpine_net_installer_print_help
        exit 0
        ;;
      --)
        shift
        break
        ;;
    esac
  done

  # Arguments parsing.
  if [ "${#}" -ne 1 ]; then
    alpine_net_installer_print_usage
    exit 2
  fi

  ALPINE_NET_INSTALLER_ALPINE_VERSION="${1}"
}

alpine_net_installer_print_usage() {
  cat <<EOF
Usage:
  $0 <variant>
  $0 [-${ALPINE_NET_INSTALLER_OPT_HELP[SHORT]}]

  Installs alpine packages for: ${ALPINE_NET_INSTALLER_PACKAGES}.

  Variant argument must be an alpine docker tag of the form 'x.y' or 'edge'.

  -${ALPINE_NET_INSTALLER_OPT_HELP[SHORT]}, --${ALPINE_NET_INSTALLER_OPT_HELP[LONG]}
    Print help information.
EOF
}

alpine_net_installer_print_help() {
  printf '\nAdd net utilities to alpine image.\n\n'
  alpine_net_installer_print_usage
}

alpine_net_installer_print_header() {
  shared_lib_print_header 'Alpine Net Installer'
}

alpine_net_installer_install_packages() {
  printf '\nInstalling packages...\n'
  shared_alpine_lib_install_packages ${ALPINE_NET_INSTALLER_PACKAGES}
}

################################################################################
# Program Entry
################################################################################

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  alpine_net_installer_main ${@}
fi
