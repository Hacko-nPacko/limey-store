module.exports = {
  store_config: {
    return_limit: 100
  },
  networks: {
    development: {
     host: "127.0.0.1",
     port: 7545,
     network_id: "*"
    }
  },
  compilers: {
    solc: {
      version: "0.8.17",
    }
  },
  db: {
    enabled: false,
    host: "127.0.0.1",
  }
};