module.exports = {
    networks: {
      development: {
        host: "127.0.0.1",     // Localhost (default: none)
        port: 8545,            // Standard Ganache port (default: none)
        network_id: "*",       // Any network (default: none)
        from : "0x651D23aCbF45E528b111DE168D7783C496fc813f",
      },
    },
    compilers: {
      solc: {
        version: "0.8.10",    // Fetch exact version from solc-bin (default: truffle's version)
      },
    },
  };
  