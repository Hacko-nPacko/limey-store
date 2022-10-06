// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './Ownable.sol';

contract TechnoLimeStore is Ownable {

  uint returnPeriod;

  event ItemPurchased(address actor, string sku);
  event ItemReturned(address actor, string sku);

  struct Item {
    string sku;
    string name;
    uint size;
  }

  mapping(string => Item) public items;
  mapping(string => uint) public inventory;
  mapping(string => uint) purchases;

  constructor(uint _returnPeriod) {
    returnPeriod = _returnPeriod;
  }

  function addItem(Item calldata item) public onlyOwner {
    require(bytes(items[item.sku].sku).length == 0, "Cannot add an item twice");
    items[item.sku] = item;
  }

  function addInventory(string calldata sku, uint quantity) public onlyOwner {
    require(bytes(items[sku].sku).length > 0, "Item doesn't exist");
    inventory[sku] += quantity;
  }

  function purchaseItem(string calldata sku) public {
    require(bytes(items[sku].sku).length > 0, "Item doesn't exist");
    require(inventory[sku] > 0, "Item is not in stock");
    inventory[sku] -= 1;
    string memory purchaseKey = getPurchaseKey(sku);
    purchases[purchaseKey] = block.number;

    emit ItemPurchased(msg.sender, sku);
  }

  function returnItem(string calldata sku) public {
    string memory purchaseKey = getPurchaseKey(sku);
    require(purchases[purchaseKey] > 0, "Client hasn't purchased this item");
    require(purchases[purchaseKey] + returnPeriod > block.number, "The purchase is not eligable for returns anymore");
    delete purchases[purchaseKey];
    inventory[sku] += 1;

    emit ItemReturned(msg.sender, sku);
  }

  function getPurchaseKey(string calldata sku) internal view returns (string memory) {
    address from = msg.sender;
    return string(abi.encodePacked(from, sku));
  }

}

/*
- The administrator (owner) of the store should be able to add new products and the quantity of them.
- The administrator should not be able to add the same product twice, just quantity.
- Buyers (clients) should be able to see the available products and buy them by their id.
- Buyers should be able to return products if they are not satisfied (within a certain period in blocktime: 100 blocks).
- A client cannot buy the same product more than one time.
- The clients should not be able to buy a product more times than the quantity in the store unless a product is returned or added by the administrator (owner)
- Everyone should be able to see the addresses of all clients that have ever bought a given product.

await inst.addItem({"sku":"iphone15","name":"Apple iPhone 15","size":10});
await inst.addQuantity("iphone15", 10);
await inst.purchaseItem("iphone15");
*/