import { dataSource, Bytes, BigInt } from "@graphprotocol/graph-ts";
import { CryptoPepeWrapper as WrapperContract } from "../../generated/CryptoPepeWrapper/CryptoPepeWrapper";
import {
  User,
  Pepe,
  Wrap,
  Unwrap,
  BatchWrap,
  Transfer,
  Mint,
  Burn,
  Global,
  PepeNamed,
  BatchUnwrap,
} from "../../generated/schema";
import { ADDRESS_ZERO, ADDRESS_WRAP } from "./constants";
import { PepeMetadata as PepeMetadataTemplate } from "../../generated/templates";

export function getOrCreateUser(address: Bytes): User {
  let user = User.load(address.toHexString());
  if (user == null) {
    user = new User(address.toHexString());
    user.wrappedBalance = BigInt.fromI32(0);
    user.unwrappedBalance = BigInt.fromI32(0);
    user.save();
  }
  return user;
}

export function increaseWrappedBalance(user: User, amount: BigInt): void {
  let balance = user.wrappedBalance;
  user.wrappedBalance = balance.plus(amount);
  user.save();
}

export function decreaseWrappedBalance(user: User, amount: BigInt): void {
  let balance = user.wrappedBalance;
  user.wrappedBalance = balance.minus(amount);
  user.save();
}

export function increaseUnwrappedBalance(user: User, amount: BigInt): void {
    let balance = user.unwrappedBalance;
    user.unwrappedBalance = balance.plus(amount);
    user.save();
  }
  
export function decreaseUnwrappedBalance(user: User, amount: BigInt): void {
    let balance = user.unwrappedBalance;
    user.unwrappedBalance = balance.minus(amount);
    user.save();
}

function createZeroPepe(): void {
  increaseUnwrappedBalance(getOrCreateUser(ADDRESS_ZERO), BigInt.fromI32(1));
  let pepe = new Pepe(BigInt.fromI32(0).toHexString());
  pepe.mother = BigInt.fromI32(0).toHexString();
  pepe.father = BigInt.fromI32(0).toHexString();
  pepe.owner = ADDRESS_ZERO.toHexString();
  pepe.previousOwner = ADDRESS_ZERO.toHexString();
  pepe.tokenId = BigInt.fromI32(0);
  pepe.isWrapped = "Unwrapped";
  pepe.named = false;
  pepe.isGenZero = true;
  pepe.name = "Pepe #0";
  pepe.mintedAt =
    dataSource.network() == "goerli"
      ? BigInt.fromI32(8894602)
      : BigInt.fromI32(6481925);
  pepe.blockNumber =
    dataSource.network() == "goerli"
      ? BigInt.fromI32(8894602)
      : BigInt.fromI32(6481925);
  pepe.save();
}

export function createPepe(
  tokenID: BigInt,
  motherID: BigInt,
  fatherID: BigInt,
  ownerID: string,
  blockNumber: BigInt,
  timestamp: BigInt
): Pepe {
  if (tokenID == BigInt.fromI32(1)) {
    createZeroPepe();
  }
  let pepe = new Pepe(tokenID.toHexString());
  pepe.mother = motherID.toHexString();
  pepe.father = fatherID.toHexString();
  pepe.owner = ownerID;
  pepe.previousOwner = ADDRESS_ZERO.toHexString();
  pepe.isGenZero = motherID == BigInt.fromI32(0) && fatherID == BigInt.fromI32(0);
  pepe.tokenId = tokenID;
  pepe.named = false;
  pepe.name = `Pepe #${tokenID.toString()}`;
  pepe.mintedAt = timestamp;
  pepe.isWrapped = "Unwrapped";
  pepe.blockNumber = blockNumber;
  pepe.save();
  increaseGlobal();

  return pepe;
}
export function getGlobal(): Global {
  let global = Global.load("1");
  if (global == null) {
    global = new Global("1");
    let wrapContract = WrapperContract.bind(ADDRESS_WRAP());
    let uriResponse = wrapContract.try_baseTokenURI();
    if (!uriResponse.reverted) {
      global.baseURI = uriResponse.value;
    }
    global.totalSupply = 1;
    global.save();
  }

  return global;
}
export function increaseGlobal(): Global {
  let global = Global.load("1");
  if (global == null) {
    global = new Global("1");
    global.totalSupply = 1;
  } else {
    global.totalSupply = global.totalSupply + 1;
  }
  global.save();
  return global;
}
export function getPepe(tokenID: BigInt): Pepe | null {
  let pepe = Pepe.load(tokenID.toHexString());
  return pepe;
}
export function updatePepeOwner(
  tokenID: BigInt,
  ownerID: string,
  blockNumber: BigInt
): void {
  let pepe = Pepe.load(tokenID.toHexString());
  if (pepe != null) {
    let oldOwner = pepe.owner;
    pepe.previousOwner = oldOwner;
    pepe.owner = ownerID;
    pepe.save();
  }
}

export function burnPepe(tokenID: BigInt, blockNumber: BigInt): void {
  let pepe = Pepe.load(tokenID.toHexString());
  if (pepe != null) {
    let oldOwner = pepe.owner;
    pepe.previousOwner = oldOwner;
    pepe.owner = ADDRESS_ZERO.toHexString();
    pepe.removed = blockNumber;
    pepe.save();
  }
}
export function changeWrapState(tokenID: BigInt, isWrap: boolean): void {
  let pepe = getPepe(tokenID);
  if (pepe != null) {
    if (isWrap == true) {
      pepe.isWrapped = "Wrapped";
    } else {
      pepe.isWrapped = "Unwrapped";
    }
    pepe.save();
  }
}
export function createWrap(
  txHash: Bytes,
  logIndex: BigInt,
  tokenID: BigInt,
  senderID: string,
  blockNumber: BigInt,
  timestamp: BigInt
): void {
  let wrap = new Wrap(
    txHash
      .toHexString()
      .concat("-")
      .concat(logIndex.toHexString())
  );
  wrap.sender = senderID;
  wrap.pepe = tokenID.toHexString();
  wrap.timestamp = timestamp;
  wrap.blockNumber = blockNumber;
  wrap.save();
}
export function createUnwrap(
  txHash: Bytes,
  logIndex: BigInt,
  tokenID: BigInt,
  senderID: string,
  receiverID: string,
  blockNumber: BigInt,
  timestamp: BigInt
): void {
  let unwrap = new Unwrap(
    txHash
      .toHexString()
      .concat("-")
      .concat(logIndex.toHexString())
  );
  unwrap.sender = senderID;
  unwrap.receiver = receiverID;
  unwrap.pepe = tokenID.toHexString();
  unwrap.timestamp = timestamp;
  unwrap.blockNumber = blockNumber;
  unwrap.save();
}
export function createBatchWrap(
  txHash: Bytes,
  logIndex: BigInt,
  tokenIDs: BigInt[],
  senderID: string,
  blockNumber: BigInt,
  timestamp: BigInt
): void {
  let batchWrap = new BatchWrap(
    txHash
      .toHexString()
      .concat("-")
      .concat(logIndex.toHexString())
  );
  batchWrap.sender = senderID;
  let pepeArray: Array<string> = [];
  for (var i = 0; i < tokenIDs.length; i++) {
    pepeArray.push(tokenIDs[i].toHexString());
    batchWrap.pepes = pepeArray;
  }
  batchWrap.timestamp = timestamp;
  batchWrap.receiver = senderID;
  batchWrap.blockNumber = blockNumber;
  batchWrap.save();
}
export function createBatchUnwrap(
  txHash: Bytes,
  logIndex: BigInt,
  tokenIDs: BigInt[],
  senderID: string,
  receiverID: string,
  blockNumber: BigInt,
  timestamp: BigInt
): void {
  let batchWrap = new BatchUnwrap(
    txHash
      .toHexString()
      .concat("-")
      .concat(logIndex.toHexString())
  );
  batchWrap.sender = senderID;
  let pepeArray: Array<string> = [];
  for (var i = 0; i < tokenIDs.length; i++) {
    pepeArray.push(tokenIDs[i].toHexString());
    batchWrap.pepes = pepeArray;
  }
  batchWrap.timestamp = timestamp;
  batchWrap.receiver = receiverID;
  batchWrap.blockNumber = blockNumber;
  batchWrap.save();
}
export function createMint(
  txHash: Bytes,
  logIndex: BigInt,
  tokenID: BigInt,
  receiverID: string,
  blockNumber: BigInt,
  timestamp: BigInt
): void {
  let mint = new Mint(
    txHash
      .toHexString()
      .concat("-")
      .concat(logIndex.toHexString())
  );
  mint.pepe = tokenID.toHexString();
  mint.timestamp = timestamp;
  mint.blockNumber = blockNumber;
  mint.receiver = receiverID;
  mint.sender = receiverID;
  mint.save();
}

export function createPepeNamed(
  txHash: Bytes,
  tokenID: BigInt,
  receiverID: string,
  blockNumber: BigInt,
  name: string,
  timestamp: BigInt
): void {
  let pepeNamed = new PepeNamed(txHash.toHexString());
  pepeNamed.pepe = tokenID.toHexString();
  pepeNamed.timestamp = timestamp;
  pepeNamed.blockNumber = blockNumber;
  pepeNamed.sender = receiverID;
  pepeNamed.name = name;
  pepeNamed.save();
}

export function createTransfer(
  txHash: Bytes,
  logIndex: BigInt,
  tokenID: BigInt,
  receiverID: string,
  senderID: string,
  blockNumber: BigInt,
  timestamp: BigInt
): void {
  let transfer = new Transfer(
    txHash
      .toHexString()
      .concat("-")
      .concat(logIndex.toHexString())
  );
  transfer.pepe = tokenID.toHexString();
  transfer.timestamp = timestamp;
  transfer.blockNumber = blockNumber;
  transfer.receiver = receiverID;
  transfer.sender = senderID;
  transfer.save();
}

export function createBurn(
  txHash: Bytes,
  tokenID: BigInt,
  senderID: string,
  blockNumber: BigInt,
  timestamp: BigInt
): void {
  let burn = new Burn(txHash.toHexString());
  burn.pepe = tokenID.toHexString();
  burn.timestamp = timestamp;
  burn.blockNumber = blockNumber;
  burn.sender = senderID;
  burn.save();
}

export function setTokenuri(tokenID: BigInt) : void{
  let wrapContract = WrapperContract.bind(ADDRESS_WRAP());
  let pepe = getPepe(tokenID);
  if(pepe != null) {
    if(pepe.isWrapped == "Wrapped"){
      let uriResponse = wrapContract.try_tokenURI(tokenID);
      let uriIPFS = "";
      if(!uriResponse.reverted) {
          pepe.uri = uriResponse.value;
          uriIPFS = uriResponse.value.replace("ipfs://", "");
          pepe.metadata = uriIPFS;
      }
      pepe.save()
      PepeMetadataTemplate.create(uriIPFS);
    }
   
  }
}