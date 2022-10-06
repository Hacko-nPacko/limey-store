const TechnoLimeStore = artifacts.require("./TechnoLimeStore.sol");

/*
await inst.addItem({"sku":"iphone15","name":"Apple iPhone 15","size":10});
await inst.addQuantity("iphone15", 10);
await inst.purchaseItem("iphone15");
*/
contract("TechnoLimeStore", accounts => {
  it("...should add & inventory by owner 'Techno Store'.", async () => {
    const inst = await TechnoLimeStore.deployed();

    await inst.addItem({"sku":"iphone15","name":"Apple iPhone 15","size":10});
    let item = await inst.items("iphone15");
    assert.equal(item.name, "Apple iPhone 15", "The name of the item is not stored");

    await inst.addInventory("iphone15", 20);
    let inventory = await inst.inventory("iphone15");
    assert.equal(inventory, 20, "The inventory is not stored");
  });

  it("...should not add the same product twice 'Techno Store'.", async () => {
    const inst = await TechnoLimeStore.deployed();

    await inst.addItem({"sku":"double","name":"Apple iPhone 15","size":10}, { from: accounts[0] });
    try {
        await inst.addItem({"sku":"double","name":"Apple iPhone 15","size":10}, { from: accounts[0] });
    } catch(err) {
        assert.include(err.message, "Cannot add an item twice", "revert message should contain twice");
    }
  });

  it("...should not add item by not owner 'Techno Store'.", async () => {
    const inst = await TechnoLimeStore.deployed();

    try {
        await inst.addItem({"sku":"not_owner","name":"Apple iPhone 15","size":10}, { from: accounts[1] });
    } catch(err) {
        assert.include(err.message, "Not invoked by the owner", "revert message should contain owner");
    }
  });

  it("...should not add inventory by not owner 'Techno Store'.", async () => {
    const inst = await TechnoLimeStore.deployed();

    await inst.addItem({"sku":"iventory_not_owner","name":"Apple iPhone 15","size":10});
    try {
        await inst.addInventory("iventory_not_owner", 20, { from: accounts[1] });
    } catch(err) {
        assert.include(err.message, "Not invoked by the owner", "revert message should contain owner");
    }
  });

  it("...should not be able to purchase if not in stock 'Techno Store'.", async () => {
    const inst = await TechnoLimeStore.deployed();

    await inst.addItem({"sku":"purchase_not_in_stock","name":"Apple iPhone 15","size":10});
    try {
        await inst.purchaseItem("purchase_not_in_stock");
    } catch(err) {
        assert.include(err.message, "Item is not in stock", "revert message should contain owner");
    }
  });

  it("...should be able to purchase in 'Techno Store'.", async () => {
    const inst = await TechnoLimeStore.deployed();

    await inst.addItem({"sku":"purchase","name":"Apple iPhone 15","size":10});
    await inst.addInventory("purchase", 10);

    let tx = await inst.purchaseItem("purchase", { from: accounts[1] });
    assert.equal(tx.receipt.logs[0].event, "ItemPurchased", "Event should be emited");
    let inventory = await inst.inventory("purchase", { from: accounts[1] });
    assert.equal(inventory, 9, "The inventory should decrease");
  });


  it("...should be able to return in 'Techno Store'.", async () => {
    const inst = await TechnoLimeStore.deployed();

    await inst.addItem({"sku":"return","name":"Apple iPhone 15","size":10});
    await inst.addInventory("return", 10);
    
    await inst.purchaseItem("return", { from: accounts[1] });

    let tx = await inst.returnItem("return", { from: accounts[1] });
    assert.equal(tx.receipt.logs[0].event, "ItemReturned", "Event should be emited");
    
    let inventory = await inst.inventory("return");
    assert.equal(inventory, 10, "The inventory should not change");
  });

  it("...should not be able to return later in 'Techno Store'.", async () => {
    const inst = await TechnoLimeStore.deployed();

    await inst.addItem({"sku":"return_later","name":"Apple iPhone 15","size":10});
    await inst.addInventory("return_later", 10);

    await inst.purchaseItem("return_later", { from: accounts[1] });

    let return_limit = config.store_config.return_limit;
    for (i = 0; i < return_limit; i++) {
        await web3.currentProvider.send({
            jsonrpc: "2.0",
            method: "evm_mine",
            id: new Date().getTime()
        }, (err, result) => {
            if (err) { throw err; }
            const newBlockHash = web3.eth.getBlock('latest').hash;

            return newBlockHash
        });
    }

    try {
        await inst.returnItem("return_later", { from: accounts[1] });
    } catch(err) {
        assert.include(err.message, "The purchase is not eligable for returns anymore", "revert message should contain not eligable");
    }

  });


});