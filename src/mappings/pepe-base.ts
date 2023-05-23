import {
  PepeBorn as PepeBornEvent,
  Transfer as TransferEvent,
  UserNamed as UserNamedEvent,
  SetPepeNameCall
} from "../../generated/PepeBase/PepeBase"

import {
  getOrCreateUser,
  updatePepeOwner,
  createTransfer,
  createMint,
  createPepe,
  getPepe,
  createPepeNamed,
  increaseUnwrappedBalance,
  decreaseUnwrappedBalance
} from "./helpers"
import {  ADDRESS_ZERO, ADDRESS_WRAP} from './constants';
import { log, BigInt } from "@graphprotocol/graph-ts";
export function handlePepeBorn(event: PepeBornEvent): void {
  let sender = getOrCreateUser(event.transaction.from);
    let pepe = createPepe(
      event.params.pepeId,
      event.params.mother,
      event.params.father,
      sender.id,
      event.block.number,
      event.block.timestamp
    );
    increaseUnwrappedBalance(sender, BigInt.fromI32(1));
    createMint(
      event.transaction.hash,
      event.logIndex,
      event.params.pepeId,
      pepe.owner,
      event.block.number,
      event.block.timestamp
    );
  }


export function handleTransfer(event: TransferEvent): void {
    let txTo = event.transaction.to;
    if(txTo) {
      if (event.params._from != ADDRESS_ZERO && txTo != ADDRESS_WRAP()) {


        let sender = getOrCreateUser(event.params._from);
        let receiver = getOrCreateUser(event.params._to);
        
        if (sender != null && receiver != null) {
          updatePepeOwner(event.params._tokenId, receiver.id, event.block.number);
          decreaseUnwrappedBalance(sender, BigInt.fromI32(1));
          increaseUnwrappedBalance(receiver, BigInt.fromI32(1));
          createTransfer(
            event.transaction.hash,
            event.logIndex,
            event.params._tokenId,
            receiver.id,
            sender.id,
            event.block.number,
            event.block.timestamp
          );
        }
      }
    }
   
}

export function handleUserNamed(event: UserNamedEvent): void {
let user = getOrCreateUser(event.params.user)
  user.username=event.params.username.toString()
  user.save()
}


export function handlePepeNamed(call: SetPepeNameCall): void {
   let pepe = getPepe(call.inputs._pepeId);
   if(pepe){
      pepe.named = true;
      pepe.name = call.inputs._name.toString()
      pepe.save()
      log.info("Pepe Named: Name: {}, ID: {}", [call.inputs._pepeId.toHexString(),call.inputs._name.toString() ])
      createPepeNamed(call.transaction.hash,
        call.inputs._pepeId,
        call.transaction.from.toHexString(),
        call.block.number,
        call.inputs._name.toString(),
        call.block.timestamp)
   }
}