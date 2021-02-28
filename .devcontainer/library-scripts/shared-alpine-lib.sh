export readonly ALPINE_FOUNDATION_ENTRYPOINTD_PATH=/usr/local/share/entrypoint.d

shared_alpine_lib_install_packages() {
  apk add --no-cache ${@}
}

shared_alpine_lib_install_docker_packages() {
  local packages=docker

  if [ "${1}" = true ]; then
    packages="${packages} docker-compose"
  fi

  shared_alpine_lib_install_packages ${packages}
}

shared_alpine_lib_setup_docker_users() {
  local username="${1}"

  if [ "${username}" != root ]; then
    addgroup "${username}" docker
  fi

  addgroup root docker
}
