import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  BatchWrap as BatchWrapEvent,
  BatchUnwrap as BatchUnwrap,
  Transfer as TransferEvent,
  Unwrap as UnwrapEvent,
  Wrap as WrapEvent,
  BatchMetadataUpdate as BatchMetadataUpdateEvent,
  CryptoPepeWrapper as WrapperContract
} from "../../generated/CryptoPepeWrapper/CryptoPepeWrapper"
import { ADDRESS_ZERO,ADDRESS_WRAP } from './constants';
import {
  getOrCreateUser,
  updatePepeOwner,
  createTransfer,
  createBurn,
  createWrap,
  createUnwrap,
  createBatchWrap,
  burnPepe,
  setTokenuri,
  changeWrapState,
  getGlobal,
  createBatchUnwrap,
  decreaseUnwrappedBalance,
  increaseUnwrappedBalance,
  decreaseWrappedBalance,
  increaseWrappedBalance
} from "./helpers"



export function handleTransfer(event: TransferEvent): void {
  if (event.params.to == ADDRESS_ZERO ) {
    // UNWRAP

    // Iterate through all the logs in the receipt
    let receipt = event.receipt;
    if(receipt){
      let logLength = receipt.logs.length
      let found = false;
      for (let i = 0; i < logLength; i++){
        //Checking if BatchWrap exists
        if(receipt.logs[i].topics[0] == Bytes.fromHexString('0x8ed5d8309b0c25f09161053d417ad70cf3145b32c46b88a86cf734a8524ccdc8')){
          found = true
        }
        //Checking if Unwrap exists
        if(receipt.logs[i].topics[0] == Bytes.fromHexString('0xbe8e6aacbb5d99c99f1992d91d807f570d0acacabee02374369ed42710dc6698')){
          found = true
        }
        //Checking if Wrap exists
        if(receipt.logs[i].topics[0] == Bytes.fromHexString('0xb61d00fdfee32467c7d81db64c811ae60c104c346debf36a14afe84b8fce59e5')){
          found = true
        }
      }

      if(!found) {
        let sender = getOrCreateUser(event.params.from);
        let receiver = getOrCreateUser(event.params.to);
        if (sender != null) {
          burnPepe(event.params.tokenId, event.block.number);
          decreaseWrappedBalance(sender, BigInt.fromI32(1));
          increaseWrappedBalance(receiver, BigInt.fromI32(1));
          createBurn(
            event.transaction.hash,
            event.params.tokenId,
            sender.id,
            event.block.number,
            event.block.timestamp
          );
        }
      }
    }
  
   
  } else if(event.params.from == ADDRESS_ZERO) {
    //WRAP
  } else {
    // TRANSFER

    let sender = getOrCreateUser(event.params.from);
    let receiver = getOrCreateUser(event.params.to);

    if (sender != null && receiver != null) {
      updatePepeOwner(event.params.tokenId, receiver.id, event.block.number);
      decreaseWrappedBalance(sender, BigInt.fromI32(1));
      increaseWrappedBalance(receiver, BigInt.fromI32(1));
      createTransfer(
        event.transaction.hash,
        event.logIndex,
        event.params.tokenId,
        receiver.id,
        sender.id,
        event.block.number,
        event.block.timestamp
      );
    }
  }
}
export function handleWrap(event: WrapEvent): void {
  let sender = getOrCreateUser(event.params.sender)
  createWrap(
    event.transaction.hash,
    event.logIndex,
    event.params.tokenId,
    sender.id,
    event.block.number,
    event.block.timestamp,
  );
  changeWrapState(event.params.tokenId,true);
  decreaseUnwrappedBalance(sender, BigInt.fromI32(1));
  increaseWrappedBalance(sender, BigInt.fromI32(1));
}
export function handleBatchWrap(event: BatchWrapEvent): void {
  let sender = getOrCreateUser(event.params.sender)
  createBatchWrap(
    event.transaction.hash,
    event.logIndex,
    event.params.tokenIds,
    sender.id,
    event.block.number,
    event.block.timestamp,
  );
  let tokenIDs = event.params.tokenIds;
  for (var i = 0; i < tokenIDs.length; i ++) {
    changeWrapState(tokenIDs[i],true);
   
  }
  decreaseUnwrappedBalance(sender, BigInt.fromI32(tokenIDs.length));
  increaseWrappedBalance(sender, BigInt.fromI32(tokenIDs.length));
}
export function handleUnwrap(event: UnwrapEvent): void {
  let sender = getOrCreateUser(event.params.from)
  let receiver = getOrCreateUser(event.params.to)
  createUnwrap(
    event.transaction.hash,
    event.logIndex,
    event.params.tokenId,
    sender.id,
    receiver.id,
    event.block.number,
    event.block.timestamp,
  );
  updatePepeOwner(event.params.tokenId, receiver.id, event.block.number);
  changeWrapState(event.params.tokenId,false);
  if(receiver.id != sender.id){
      decreaseWrappedBalance(sender, BigInt.fromI32(1));
      increaseUnwrappedBalance(receiver, BigInt.fromI32(1));
  }else {
    decreaseWrappedBalance(sender, BigInt.fromI32(1));
    increaseUnwrappedBalance(sender, BigInt.fromI32(1));
  }
}

export function handleBatchUnwrap(event: BatchUnwrap): void {
  let sender = getOrCreateUser(event.params.sender)
  let receiver = getOrCreateUser(event.params.receiver)
  createBatchUnwrap(
    event.transaction.hash,
    event.logIndex,
    event.params.tokenIds,
    sender.id,
    receiver.id,
    event.block.number,
    event.block.timestamp,
  );
  let tokenIDs = event.params.tokenIds;
  for (var i = 0; i < tokenIDs.length; i ++) {
    changeWrapState(tokenIDs[i],false);
    if(receiver.id != sender.id){
      updatePepeOwner(tokenIDs[i], receiver.id, event.block.number);
    }
  }
  if(receiver.id != sender.id){
    decreaseWrappedBalance(sender, BigInt.fromI32(tokenIDs.length));
    increaseUnwrappedBalance(receiver, BigInt.fromI32(tokenIDs.length));
  }else {
    decreaseWrappedBalance(sender, BigInt.fromI32(tokenIDs.length));
    increaseUnwrappedBalance(sender, BigInt.fromI32(tokenIDs.length));
  }
 
}
  

export function handleBatchMetadataUpdate(
  event: BatchMetadataUpdateEvent
): void {
  let global = getGlobal();
  let wrapContract = WrapperContract.bind(ADDRESS_WRAP());
  let uriResponse = wrapContract.try_baseTokenURI();
  let baseURI = ""
  if(!uriResponse.reverted) {
      global.baseURI = uriResponse.value;
      baseURI= uriResponse.value;
  }
  global.save()
  for (var i = 1; i <= global.totalSupply; i ++) {
    let bigintI = BigInt.fromU32(i)
    setTokenuri(bigintI, baseURI); 
  }
}
