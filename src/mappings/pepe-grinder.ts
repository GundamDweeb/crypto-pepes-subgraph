import {
 DustPepeCall
} from "../../generated/PepeGrinder/PepeGrinder"
import { ADDRESS_GRINDER } from "./constants";

import {
  getOrCreateUser,
  increaseUnwrappedBalance,
  createTransfer,
  decreaseUnwrappedBalance,
  updatePepeOwner,

} from "./helpers"
import {  BigInt } from "@graphprotocol/graph-ts";
export function handleDustPepe(call: DustPepeCall): void {
    let sender = getOrCreateUser(call.transaction.from);
    let receiver = getOrCreateUser(ADDRESS_GRINDER());
    if (sender != null && receiver != null) {
      updatePepeOwner(call.inputs._pepeId, receiver.id, call.block.number);
      decreaseUnwrappedBalance(sender, BigInt.fromI32(1));
      increaseUnwrappedBalance(receiver, BigInt.fromI32(1));
      createTransfer(
        call.transaction.hash,
        BigInt.fromI32(200),
        call.inputs._pepeId,
        receiver.id,
        sender.id,
        call.block.number,
        call.block.timestamp
      );
    }
  }
