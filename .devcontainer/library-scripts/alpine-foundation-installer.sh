#!/bin/sh

# Derived from https://raw.githubusercontent.com/microsoft/vscode-dev-containers/master/script-library/common-alpine.sh.
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License. See https://go.microsoft.com/fwlink/?linkid=2090316 for license information.

set -o errexit
set -o pipefail
set -o noclobber

# Bootstrap installer.
if [ "${ALPINE_FOUNDATION_INSTALLER_READY}" != true ]; then
  # Ensure that login shells get the correct path if the user updated the PATH
  # using ENV.
  rm -f /etc/profile.d/00-restore-env.sh
  echo "export PATH=${PATH//$(sh -lc 'echo $PATH')/\$PATH}" > /etc/profile.d/00-restore-env.sh
  chmod +x /etc/profile.d/00-restore-env.sh

  # Switch to bash.
  /bin/bash --version > /dev/null 2>&1 || apk add --no-cache bash > /dev/null 2>&1
  export ALPINE_FOUNDATION_INSTALLER_READY=true

  exec /bin/bash "${0}" "${@}"
  exit $?
fi

set -o nounset
#set -o xtrace

source ./shared-lib.sh
source ./shared-alpine-lib.sh

################################################################################
# Readonly Settings
################################################################################

readonly ALPINE_FOUNDATION_INSTALLER_PACKAGES='logrotate procps runit rsyslog sudo tini'

readonly ALPINE_FOUNDATION_INSTALLER_USERNAME_DEFAULT=non-root

readonly ALPINE_FOUNDATION_INSTALLER_UID_DEFAULT=1000

readonly ALPINE_FOUNDATION_INSTALLER_GID_DEFAULT=1000

readonly ALPINE_FOUNDATION_INSTALLER_RUNIT_PATH=/etc/runit

readonly ALPINE_FOUNDATION_INSTALLER_RUNIT_INITD_PATH="${ALPINE_FOUNDATION_INSTALLER_RUNIT_PATH}"/init.d

readonly ALPINE_FOUNDATION_INSTALLER_RUNIT_TERMD_PATH="${ALPINE_FOUNDATION_INSTALLER_RUNIT_PATH}"/term.d

readonly ALPINE_FOUNDATION_INSTALLER_ENTRYPOINT_PATH=/usr/local/bin/entrypoint.sh

readonly ALPINE_FOUNDATION_INSTALLER_ENTRYPOINTD_PATH="${ALPINE_FOUNDATION_ENTRYPOINTD_PATH}"

readonly ALPINE_FOUNDATION_INSTALLER_RUN_CONTAINER_PATH=/usr/local/bin/run-container.sh

################################################################################
# Runtime Settings
################################################################################

ALPINE_FOUNDATION_INSTALLER_ALPINE_VERSION=

ALPINE_FOUNDATION_INSTALLER_USERNAME="${ALPINE_FOUNDATION_INSTALLER_USERNAME_DEFAULT}"

ALPINE_FOUNDATION_INSTALLER_UID="${ALPINE_FOUNDATION_INSTALLER_UID_DEFAULT}"

ALPINE_FOUNDATION_INSTALLER_GID="${ALPINE_FOUNDATION_INSTALLER_GID_DEFAULT}"

################################################################################
# Options
################################################################################

# Print help.
declare -A ALPINE_FOUNDATION_INSTALLER_OPT_HELP=([NAME]=help [LONG]=help [SHORT]=h)

# Non-root username.
declare -A ALPINE_FOUNDATION_INSTALLER_OPT_USERNAME=([NAME]=username [LONG]=username [SHORT]=u)

# Non-root user ID.
declare -A ALPINE_FOUNDATION_INSTALLER_OPT_UID=([NAME]=uid [LONG]=uid [SHORT]=i)

# Non-root user group ID.
declare -A ALPINE_FOUNDATION_INSTALLER_OPT_GID=([NAME]=gid [LONG]=gid [SHORT]=g)

################################################################################
# Functions
################################################################################

alpine_foundation_installer_main() {
  alpine_foundation_installer_parse_args ${@}

  alpine_foundation_installer_print_header
  alpine_foundation_installer_install_packages
  alpine_foundation_installer_create_user
  alpine_foundation_installer_add_user_to_sudoers
  alpine_foundation_installer_setup_bashrc
  alpine_foundation_installer_setup_entrypoint
  alpine_foundation_installer_setup_runit
  alpine_foundation_installer_setup_cron
  alpine_foundation_installer_setup_rsyslog
  alpine_foundation_installer_setup_logrotate
}

alpine_foundation_installer_parse_args() {
  # Options parsing.
  local opts="${ALPINE_FOUNDATION_INSTALLER_OPT_HELP[SHORT]}${ALPINE_FOUNDATION_INSTALLER_OPT_USERNAME[SHORT]}:${ALPINE_FOUNDATION_INSTALLER_OPT_UID[SHORT]}:${ALPINE_FOUNDATION_INSTALLER_OPT_GID[SHORT]}:"
  local longopts="${ALPINE_FOUNDATION_INSTALLER_OPT_HELP[LONG]},${ALPINE_FOUNDATION_INSTALLER_OPT_USERNAME[LONG]}:,${ALPINE_FOUNDATION_INSTALLER_OPT_UID[LONG]}:,${ALPINE_FOUNDATION_INSTALLER_OPT_GID[LONG]}:"

  ! PARSED=$(getopt --options=${opts} --longoptions=${longopts} --name "${0}" -- "${@}")

  if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
    # getopt has complained about wrong arguments to stdout.
    alpine_foundation_installer_print_usage
    exit 2
  fi

  # Handle quoting in getopt output.
  eval set -- "${PARSED}"

  while true; do
    case "$1" in
      "-${ALPINE_FOUNDATION_INSTALLER_OPT_HELP[SHORT]}"|"--${ALPINE_FOUNDATION_INSTALLER_OPT_HELP[LONG]}")
        alpine_foundation_installer_print_help
        exit 0
        ;;
      "-${ALPINE_FOUNDATION_INSTALLER_OPT_USERNAME[SHORT]}"|"--${ALPINE_FOUNDATION_INSTALLER_OPT_USERNAME[LONG]}")
        ALPINE_FOUNDATION_INSTALLER_USERNAME="${2}"
        shift 2
        ;;
      "-${ALPINE_FOUNDATION_INSTALLER_OPT_UID[SHORT]}"|"--${ALPINE_FOUNDATION_INSTALLER_OPT_UID[LONG]}")
        ALPINE_FOUNDATION_INSTALLER_UID="${2}"
        shift 2
        ;;
      "-${ALPINE_FOUNDATION_INSTALLER_OPT_GID[SHORT]}"|"--${ALPINE_FOUNDATION_INSTALLER_OPT_GID[LONG]}")
        ALPINE_FOUNDATION_INSTALLER_GID="${2}"
        shift 2
        ;;
      --)
        shift
        break
        ;;
    esac
  done

  # Arguments parsing.
  if [ "${#}" -ne 1 ]; then
    alpine_foundation_installer_print_usage
    exit 2
  fi

  ALPINE_FOUNDATION_INSTALLER_ALPINE_VERSION="${1}"
}

alpine_foundation_installer_print_usage() {
  cat <<EOF
Usage:
  $0 [-${ALPINE_FOUNDATION_INSTALLER_OPT_USERNAME[SHORT]} <username>] [-${ALPINE_FOUNDATION_INSTALLER_OPT_UID[SHORT]} <uid>] [-${ALPINE_FOUNDATION_INSTALLER_OPT_GID[SHORT]} <gid>] <variant>
  $0 [-${ALPINE_FOUNDATION_INSTALLER_OPT_HELP[SHORT]}]

  Variant argument must be an alpine docker tag of the form 'x.y' or 'edge'.

  -${ALPINE_FOUNDATION_INSTALLER_OPT_USERNAME[SHORT]}, --${ALPINE_FOUNDATION_INSTALLER_OPT_USERNAME[LONG]}
    Non-root username. Default is '${ALPINE_FOUNDATION_INSTALLER_USERNAME_DEFAULT}'.

  -${ALPINE_FOUNDATION_INSTALLER_OPT_UID[SHORT]}, --${ALPINE_FOUNDATION_INSTALLER_OPT_UID[LONG]}
    Non-root user ID. Default is ${ALPINE_FOUNDATION_INSTALLER_UID_DEFAULT}.

  -${ALPINE_FOUNDATION_INSTALLER_OPT_GID[SHORT]}, --${ALPINE_FOUNDATION_INSTALLER_OPT_GID[LONG]}
    Non-root user group ID. Default is ${ALPINE_FOUNDATION_INSTALLER_GID_DEFAULT}.

  -${ALPINE_FOUNDATION_INSTALLER_OPT_HELP[SHORT]}, --${ALPINE_FOUNDATION_INSTALLER_OPT_HELP[LONG]}
    Print help information.
EOF
}

alpine_foundation_installer_print_help() {
  printf '\nInstall foundation to alpine image.\n\n'
  alpine_foundation_installer_print_usage
}

alpine_foundation_installer_print_header() {
  shared_lib_print_header 'Alpine Foundation Installer'
}

alpine_foundation_installer_install_packages() {
  printf '\nInstalling packages...\n'
  shared_alpine_lib_install_packages ${ALPINE_FOUNDATION_INSTALLER_PACKAGES}
}

alpine_foundation_installer_create_user() {
  local username="${ALPINE_FOUNDATION_INSTALLER_USERNAME}"
  local uid="${ALPINE_FOUNDATION_INSTALLER_UID}"
  local gid="${ALPINE_FOUNDATION_INSTALLER_GID}"

  printf "\nCreating user '%s' with uid %s & gid %s...\n" "${username}" "${uid}" "${gid}"

  addgroup "${username}" --gid "${gid}"
  adduser "${username}" --shell /bin/bash --uid "${uid}" --ingroup "${username}" --disabled-password
}

alpine_foundation_installer_add_user_to_sudoers() {
  local username="${ALPINE_FOUNDATION_INSTALLER_USERNAME}"

  printf "\nAdding user '%s' to sudoers...\n" "${username}"

  local sudoer_path=/etc/sudoers.d/"${username}"

  echo "${username}" ALL=\(root\) NOPASSWD:ALL > "${sudoer_path}"
  chmod 0440 "${sudoer_path}"
}

alpine_foundation_installer_setup_bashrc() {
  printf "\nSetting up .bashrc...\n"

  local username="${ALPINE_FOUNDATION_INSTALLER_USERNAME}"

  local rc="$(cat << EOF
export USER=\$(whoami)
export PATH=\$PATH:\$HOME/bin

parse_git_branch() {
  git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/(\1)/'
}

PS1='\\[\\033[32m\\]'           # change to green
PS1="\$PS1"'\\u@\\h '           # user@host<space>
PS1="\$PS1"'\\[\\033[35m\\]'    # change to purple
PS1="\$PS1"'\\s-\\v '           # shell-version<space>
PS1="\$PS1"'\\[\\033[33m\\]'    # change to brownish yellow
PS1="\$PS1"'\\w '               # cwd<space>
PS1="\$PS1"'\\[\\033[36m\\]'    # change to cyan
PS1="\$PS1\$(parse_git_branch)" # current git branch
PS1="\$PS1"'\\[\\033[0m\\]'     # change color
PS1="\$PS1"'\\n'                # new line
PS1="\$PS1"'\\$ '               # prompt<space>

unset parse_git_branch
EOF
)"

  echo "${rc}" > /root/.bashrc
  mkdir -p /root/bin

  local user_home=/home/"${username}"
  local user_bin="${user_home}"/bin
  local user_rc="${user_home}"/.bashrc

  echo "${rc}" > "${user_rc}"
  chown -R "${username}" "${user_rc}"
  mkdir -p "${user_bin}"
  chown -R "${username}" "${user_bin}"
}

alpine_foundation_installer_setup_entrypoint() {
  printf "\nSetting up entrypoint...\n"

  mkdir -p "${ALPINE_FOUNDATION_INSTALLER_ENTRYPOINTD_PATH}"

  echo "$(alpine_foundation_installer_get_entrypoint)" > "${ALPINE_FOUNDATION_INSTALLER_ENTRYPOINT_PATH}"
  chmod 755 "${ALPINE_FOUNDATION_INSTALLER_ENTRYPOINT_PATH}"
  ln -s "${ALPINE_FOUNDATION_INSTALLER_ENTRYPOINT_PATH}" /entrypoint.sh

  echo "$(alpine_foundation_installer_get_run_container)" > "${ALPINE_FOUNDATION_INSTALLER_RUN_CONTAINER_PATH}"
  chmod 755 "${ALPINE_FOUNDATION_INSTALLER_RUN_CONTAINER_PATH}"
}

alpine_foundation_installer_setup_runit() {
  printf "\nSetting up runit...\n"

  mkdir -p "${ALPINE_FOUNDATION_INSTALLER_RUNIT_INITD_PATH}"
  mkdir -p "${ALPINE_FOUNDATION_INSTALLER_RUNIT_TERMD_PATH}"

  local runit_1="${ALPINE_FOUNDATION_INSTALLER_RUNIT_PATH}"/1
  echo "$(alpine_foundation_installer_get_runit_1)" > "${runit_1}"
  chmod +x "${runit_1}"

  local runit_2="${ALPINE_FOUNDATION_INSTALLER_RUNIT_PATH}"/2
  echo "$(alpine_foundation_installer_get_runit_2)" > "${runit_2}"
  chmod +x "${runit_2}"

  local runit_3="${ALPINE_FOUNDATION_INSTALLER_RUNIT_PATH}"/3
  echo "$(alpine_foundation_installer_get_runit_3)" > "${runit_3}"
  chmod +x "${runit_3}"

  local runit_ctrlaltdel="${ALPINE_FOUNDATION_INSTALLER_RUNIT_PATH}"/ctrlaltdel
  echo "$(alpine_foundation_installer_get_runit_ctrlaltdel)" > "${runit_ctrlaltdel}"
  chmod +x "${runit_ctrlaltdel}"
}

alpine_foundation_installer_setup_cron() {
  printf "\nSetting up cron...\n"

  local sv_path=/etc/sv/crond
  local sv_run_path="${sv_path}"/run

  mkdir -p "${sv_path}"

  cat > "${sv_run_path}" <<- EOF
#!/bin/sh
exec 2>&1
exec /usr/sbin/crond -f
EOF

  chmod +x "${sv_run_path}"
  ln -s "${sv_path}" /etc/service/crond
}

alpine_foundation_installer_setup_rsyslog() {
  printf "\nSetting up rsyslog...\n"

  local sv_path=/etc/sv/rsyslogd
  local sv_run_path="${sv_path}"/run

  mkdir -p "${sv_path}"

  cat > "${sv_run_path}" <<- EOF
#!/bin/sh
exec 2>&1
exec /usr/sbin/rsyslogd -n
EOF

  chmod +x "${sv_run_path}"
  ln -s "${sv_path}" /etc/service/rsyslogd

  sed -i 's/module(load="imklog")/#module(load="imklog")/' /etc/rsyslog.conf

  sed -i 's?/etc/init.d/rsyslog --ifstarted reload >/dev/null?kill -HUP $(cat /var/run/rsyslogd.pid) \&> /dev/null?' /etc/logrotate.d/rsyslog
}

alpine_foundation_installer_setup_logrotate() {
  printf "\nSetting up logrotate...\n"
}

alpine_foundation_installer_get_entrypoint() {
  cat <<EOF
#!/bin/bash

# Derived from https://github.com/docker-suite/Install-Scripts/tree/master/alpine-runit
# Copyright (c) 2019 Docker-Suite
# Licensed under the MIT License. See https://github.com/docker-suite/Install-Scripts/blob/master/License.md for license information.

set -o errexit
set -o pipefail
set -o noclobber
set -o nounset
#set -o xtrace

export ALPINE_FOUNDATION_RUNNING_AS_DAEMON=true

if [ \${#} -ne 0 ]; then
  ALPINE_FOUNDATION_RUNNING_AS_DAEMON=false
fi

for file in \$(find ${ALPINE_FOUNDATION_INSTALLER_ENTRYPOINTD_PATH}/ -name '*.sh' -type f | sort -u ); do
  source "\${file}"
done

unset file

if [ "\${ALPINE_FOUNDATION_RUNNING_AS_DAEMON}" = false ]; then
  exec tini -- "\${@}"
fi

exec tini -- ${ALPINE_FOUNDATION_INSTALLER_RUN_CONTAINER_PATH}
EOF
}

alpine_foundation_installer_get_run_container() {
  cat <<EOF
#!/bin/bash

# Derived from https://github.com/docker-suite/Install-Scripts/tree/master/alpine-runit
# Copyright (c) 2019 Docker-Suite
# Licensed under the MIT License. See https://github.com/docker-suite/Install-Scripts/blob/master/License.md for license information.

set -o errexit
set -o pipefail
set -o noclobber
set -o nounset
#set -o xtrace

RUNSVDIR=

# Wrapper function to only use sudo if not already root.
sudo_if() {
  if [ "\$(id -u)" -ne 0 ]; then
    sudo "\${@}"
  else
    "\${@}"
  fi
}

shutdown_container() {
  sudo_if ${ALPINE_FOUNDATION_INSTALLER_RUNIT_PATH}/3

  if ps -p \${RUNSVDIR} &> /dev/null; then
    kill -HUP \${RUNSVDIR}
    wait \${RUNSVDIR}
  fi

  sleep 1

  for _pid in \$(ps -eo pid | grep -v PID  | tr -d ' ' | grep -v '^1\$' | head -n -6); do
    timeout 5 /bin/sh -c "kill \${_pid} && wait \${_pid} || kill -9 \${_pid}"
  done

  exit 0
}

sudo_if ${ALPINE_FOUNDATION_INSTALLER_RUNIT_PATH}/1

sudo_if ${ALPINE_FOUNDATION_INSTALLER_RUNIT_PATH}/2 &

RUNSVDIR=\${!}

trap shutdown_container SIGTERM SIGINT SIGHUP

wait \${RUNSVDIR}
shutdown_container
}
EOF
}

alpine_foundation_installer_get_runit_1() {
  cat <<EOF
#!/bin/bash

# Derived from https://github.com/docker-suite/Install-Scripts/tree/master/alpine-runit
# Copyright (c) 2019 Docker-Suite
# Licensed under the MIT License. See https://github.com/docker-suite/Install-Scripts/blob/master/License.md for license information.

set -o errexit
set -o pipefail
set -o noclobber
set -o nounset
#set -o xtrace

# Wrapper function to only use sudo if not already root.
sudo_if() {
  if [ "\$(id -u)" -ne 0 ]; then
    sudo "\${@}"
  else
    "\${@}"
  fi
}

if [ -n "\$(ls -A ${ALPINE_FOUNDATION_INSTALLER_RUNIT_INITD_PATH})" ]; then
  for init_script in ${ALPINE_FOUNDATION_INSTALLER_RUNIT_INITD_PATH}/*; do
    if [ -x "\${init_script}" ] && [ ! -e ${ALPINE_FOUNDATION_INSTALLER_RUNIT_PATH}/stopall ]; then
      sudo_if \${init_script}

      \$rtn=\${?}

      if [ \${rtn} != 0 ]; then
        sudo_if touch ${ALPINE_FOUNDATION_INSTALLER_RUNIT_PATH}/stopall
        exit 100
      fi
    else
      :
    fi
  done
fi

sudo_if touch ${ALPINE_FOUNDATION_INSTALLER_RUNIT_PATH}/runit
sudo_if touch ${ALPINE_FOUNDATION_INSTALLER_RUNIT_PATH}/stopit
sudo_if chmod 0 ${ALPINE_FOUNDATION_INSTALLER_RUNIT_PATH}/stopit

unset init_script
EOF
}

alpine_foundation_installer_get_runit_2() {
  cat <<EOF
#!/bin/bash

# Derived from https://github.com/docker-suite/Install-Scripts/tree/master/alpine-runit
# Copyright (c) 2019 Docker-Suite
# Licensed under the MIT License. See https://github.com/docker-suite/Install-Scripts/blob/master/License.md for license information.

set -o errexit
set -o pipefail
set -o noclobber
set -o nounset
#set -o xtrace

export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

exec env - PATH=\${PATH} /sbin/runsvdir -P /etc/service
EOF
}

alpine_foundation_installer_get_runit_3() {
  cat <<EOF
#!/bin/bash

# Derived from https://github.com/docker-suite/Install-Scripts/tree/master/alpine-runit
# Copyright (c) 2019 Docker-Suite
# Licensed under the MIT License. See https://github.com/docker-suite/Install-Scripts/blob/master/License.md for license information.

set -o errexit
set -o pipefail
set -o noclobber
set -o nounset
#set -o xtrace

# Wrapper function to only use sudo if not already root.
sudo_if() {
  if [ "\$(id -u)" -ne 0 ]; then
    sudo "\${@}"
  else
    "\${@}"
  fi
}

# Runlevels 0: Halt
LAST=0
# Runlevels 6: Reboot
test -x ${ALPINE_FOUNDATION_INSTALLER_RUNIT_PATH}/reboot && LAST=6

# Stop every services : http://smarden.org/runit/sv.8.html
if [ -n "\$(ls -A /etc/service)" ]; then
  # First try to stop services by the reverse order.
  for srv in \$(ls -r1 /etc/service); do
    sudo_if sv -w196 force-stop "\${srv}" 2>/dev/null
  done

  # Then force stop all service if any remains.
  sudo_if sv -w196 force-stop /etc/service/* 2>/dev/null
fi

# Run every scripts in ${ALPINE_FOUNDATION_INSTALLER_RUNIT_TERMD_PATH}
# before shutting down runit.
if [ -n "\$(ls -A ${ALPINE_FOUNDATION_INSTALLER_RUNIT_TERMD_PATH})" ]; then
  # Iterate throwall script in ${ALPINE_FOUNDATION_INSTALLER_RUNIT_TERMD_PATH}/
  # and run them if the scripts are executable.
  for term_script in ${ALPINE_FOUNDATION_INSTALLER_RUNIT_TERMD_PATH}/*; do
    if [ -x "\${term_script}" ]; then
      sudo_if \${term_script}
    else
      :
    fi
  done
fi

# Just to make sure that runit will start
# at next start up
sudo_if rm -f ${ALPINE_FOUNDATION_INSTALLER_RUNIT_PATH}/stopall

# Change the runlevel
[ -x /etc/init.d/rc ] && sudo_if /etc/init.d/rc \${LAST}

unset term_script srv
EOF
}

alpine_foundation_installer_get_runit_ctrlaltdel() {
  cat <<EOF
#!/bin/bash

# Derived from https://github.com/docker-suite/Install-Scripts/tree/master/alpine-runit
# Copyright (c) 2019 Docker-Suite
# Licensed under the MIT License. See https://github.com/docker-suite/Install-Scripts/blob/master/License.md for license information.

set -o errexit
set -o pipefail
set -o noclobber
set -o nounset
#set -o xtrace

PATH=/bin:/usr/bin
msg="System is going down in 8 seconds..."

# Tell runit to shutdown the system: http://smarden.org/runit/runit.8.html#sect7
sudo_if touch ${ALPINE_FOUNDATION_INSTALLER_RUNIT_PATH}/stopit
sudo_if chmod 100 ${ALPINE_FOUNDATION_INSTALLER_RUNIT_PATH}/stopit && printf '%s' "\$msg" | wall

# Wait before shuting down
/bin/sleep 8

unset msg
EOF
}

################################################################################
# Program Entry
################################################################################

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  alpine_foundation_installer_main ${@}
fi
