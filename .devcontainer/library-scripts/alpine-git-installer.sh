#!/bin/bash

set -o errexit
set -o pipefail
set -o noclobber
set -o nounset
#set -o xtrace

source ./shared-lib.sh
source ./shared-alpine-lib.sh

################################################################################
# Runtime Settings
################################################################################

ALPINE_GIT_INSTALLER_ALPINE_VERSION=

ALPINE_GIT_INSTALLER_INSTALL_GIT_LFS=false

################################################################################
# Options
################################################################################

# Print help.
declare -A ALPINE_GIT_INSTALLER_OPT_HELP=([NAME]=help [LONG]=help [SHORT]=h)

# Install git-lfs?
declare -A ALPINE_GIT_INSTALLER_OPT_INSTALL_GIT_LFS=([NAME]=install-git-lfs [LONG]=git-lfs [SHORT]=l)

################################################################################
# Functions
################################################################################

alpine_git_installer_main() {
  alpine_git_installer_parse_args ${@}

  alpine_git_installer_print_header
  alpine_git_installer_install_packages
}

alpine_git_installer_parse_args() {
  # Options parsing.
  local opts="${ALPINE_GIT_INSTALLER_OPT_HELP[SHORT]}${ALPINE_GIT_INSTALLER_OPT_INSTALL_GIT_LFS[SHORT]}"
  local longopts="${ALPINE_GIT_INSTALLER_OPT_HELP[LONG]},${ALPINE_GIT_INSTALLER_OPT_INSTALL_GIT_LFS[LONG]}"

  ! PARSED=$(getopt --options=${opts} --longoptions=${longopts} --name "${0}" -- "${@}")

  if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
    # getopt has complained about wrong arguments to stdout.
    alpine_git_installer_print_usage
    exit 1
  fi

  # Handle quoting in getopt output.
  eval set -- "${PARSED}"

  while true; do
    case "$1" in
      "-${ALPINE_GIT_INSTALLER_OPT_HELP[SHORT]}"|"--${ALPINE_GIT_INSTALLER_OPT_HELP[LONG]}")
        alpine_git_installer_print_help
        exit 0
        ;;
      "-${ALPINE_GIT_INSTALLER_OPT_INSTALL_GIT_LFS[SHORT]}"|"--${ALPINE_GIT_INSTALLER_OPT_INSTALL_GIT_LFS[LONG]}")
        ALPINE_GIT_INSTALLER_INSTALL_GIT_LFS=true
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
    alpine_git_installer_print_usage
    exit 2
  fi

  ALPINE_GIT_INSTALLER_ALPINE_VERSION="${1}"
}

alpine_git_installer_print_usage() {
  cat <<EOF
Usage:
  $0 [-${ALPINE_GIT_INSTALLER_OPT_INSTALL_GIT_LFS[SHORT]}] <variant>
  $0 [-${ALPINE_GIT_INSTALLER_OPT_HELP[SHORT]}]

  Installs git alpine package.

  Variant argument must be an alpine docker tag of the form 'x.y' or 'edge'.

  -${ALPINE_GIT_INSTALLER_OPT_INSTALL_GIT_LFS[SHORT]}, --${ALPINE_GIT_INSTALLER_OPT_INSTALL_GIT_LFS[LONG]}
    Install git-lfs along with git.

  -${ALPINE_GIT_INSTALLER_OPT_HELP[SHORT]}, --${ALPINE_GIT_INSTALLER_OPT_HELP[LONG]}
    Print help information.
EOF
}

alpine_git_installer_print_help() {
  printf '\nAdd git to alpine image.\n\n'
  alpine_git_installer_print_usage
}

alpine_git_installer_print_header() {
  shared_lib_print_header 'Alpine Git Installer'
}

alpine_git_installer_install_packages() {
  printf '\nInstalling packages...\n'

  local packages=git

  if [ "${ALPINE_GIT_INSTALLER_INSTALL_GIT_LFS}" = true ]; then
    packages="${packages} git-lfs"
  fi

  shared_alpine_lib_install_packages "${packages}"
}

################################################################################
# Program Entry
################################################################################

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  alpine_git_installer_main ${@}
fi
