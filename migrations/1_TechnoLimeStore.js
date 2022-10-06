var TechnoLimeStore = artifacts.require("TechnoLimeStore");

module.exports = function(deployer) {
  let return_limit = config.store_config.return_limit;
  deployer.deploy(TechnoLimeStore, return_limit);
};