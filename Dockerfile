FROM node:6.2.2

RUN apt-get update && apt-get install -y \
  libudev-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /project
VOLUME ["/project"]

ENTRYPOINT ["/usr/local/bin/npm"]
CMD ["--help"]
