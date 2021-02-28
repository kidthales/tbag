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

readonly ALPINE_NODEJS_INSTALLER_PACKAGES='nodejs npm yarn'

################################################################################
# Runtime Settings
################################################################################

ALPINE_NODEJS_INSTALLER_ALPINE_VERSION=

################################################################################
# Options
################################################################################

# Print help.
declare -A ALPINE_NODEJS_INSTALLER_OPT_HELP=([NAME]=help [LONG]=help [SHORT]=h)

################################################################################
# Functions
################################################################################

alpine_nodejs_installer_main() {
  alpine_nodejs_installer_parse_args ${@}

  alpine_nodejs_installer_print_header
  alpine_nodejs_installer_install_packages
}

alpine_nodejs_installer_parse_args() {
  # Options parsing.
  local opts="${ALPINE_NODEJS_INSTALLER_OPT_HELP[SHORT]}"
  local longopts="${ALPINE_NODEJS_INSTALLER_OPT_HELP[LONG]}"

  ! PARSED=$(getopt --options=${opts} --longoptions=${longopts} --name "${0}" -- "${@}")

  if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
    # getopt has complained about wrong arguments to stdout.
    alpine_nodejs_installer_print_usage
    exit 1
  fi

  # Handle quoting in getopt output.
  eval set -- "${PARSED}"

  while true; do
    case "$1" in
      "-${ALPINE_NODEJS_INSTALLER_OPT_HELP[SHORT]}"|"--${ALPINE_NODEJS_INSTALLER_OPT_HELP[LONG]}")
        alpine_nodejs_installer_print_help
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
    alpine_nodejs_installer_print_usage
    exit 2
  fi

  ALPINE_NODEJS_INSTALLER_ALPINE_VERSION="${1}"
}

alpine_nodejs_installer_print_usage() {
  cat <<EOF
Usage:
  $0 <variant>
  $0 [-${ALPINE_NODEJS_INSTALLER_OPT_HELP[SHORT]}]

  Installs alpine packages for: ${ALPINE_NODEJS_INSTALLER_PACKAGES}.

  Variant argument must be an alpine docker tag of the form 'x.y' or 'edge'.

  -${ALPINE_NODEJS_INSTALLER_OPT_HELP[SHORT]}, --${ALPINE_NODEJS_INSTALLER_OPT_HELP[LONG]}
    Print help information.
EOF
}

alpine_nodejs_installer_print_help() {
  printf '\nAdd nodejs to alpine image.\n\n'
  alpine_nodejs_installer_print_usage
}

alpine_nodejs_installer_print_header() {
  shared_lib_print_header 'Alpine NodeJS Installer'
}

alpine_nodejs_installer_install_packages() {
  printf '\nInstalling packages...\n'
  shared_alpine_lib_install_packages ${ALPINE_NODEJS_INSTALLER_PACKAGES}
}

################################################################################
# Program Entry
################################################################################

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  alpine_nodejs_installer_main ${@}
fi
