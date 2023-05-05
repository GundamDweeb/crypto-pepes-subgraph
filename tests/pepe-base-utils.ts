import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  Approval,
  ApprovalForAll,
  OwnershipTransferred,
  PepeBorn,
  PepeNamed,
  Transfer,
  UserNamed
} from "../generated/PepeBase/PepeBase"

export function createApprovalEvent(
  _owner: Address,
  _approved: Address,
  _tokenId: BigInt
): Approval {
  let approvalEvent = changetype<Approval>(newMockEvent())

  approvalEvent.parameters = new Array()

  approvalEvent.parameters.push(
    new ethereum.EventParam("_owner", ethereum.Value.fromAddress(_owner))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("_approved", ethereum.Value.fromAddress(_approved))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam(
      "_tokenId",
      ethereum.Value.fromUnsignedBigInt(_tokenId)
    )
  )

  return approvalEvent
}

export function createApprovalForAllEvent(
  _owner: Address,
  _operator: Address,
  _approved: boolean
): ApprovalForAll {
  let approvalForAllEvent = changetype<ApprovalForAll>(newMockEvent())

  approvalForAllEvent.parameters = new Array()

  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("_owner", ethereum.Value.fromAddress(_owner))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("_operator", ethereum.Value.fromAddress(_operator))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("_approved", ethereum.Value.fromBoolean(_approved))
  )

  return approvalForAllEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createPepeBornEvent(
  mother: BigInt,
  father: BigInt,
  pepeId: BigInt
): PepeBorn {
  let pepeBornEvent = changetype<PepeBorn>(newMockEvent())

  pepeBornEvent.parameters = new Array()

  pepeBornEvent.parameters.push(
    new ethereum.EventParam("mother", ethereum.Value.fromUnsignedBigInt(mother))
  )
  pepeBornEvent.parameters.push(
    new ethereum.EventParam("father", ethereum.Value.fromUnsignedBigInt(father))
  )
  pepeBornEvent.parameters.push(
    new ethereum.EventParam("pepeId", ethereum.Value.fromUnsignedBigInt(pepeId))
  )

  return pepeBornEvent
}

export function createPepeNamedEvent(pepeId: BigInt): PepeNamed {
  let pepeNamedEvent = changetype<PepeNamed>(newMockEvent())

  pepeNamedEvent.parameters = new Array()

  pepeNamedEvent.parameters.push(
    new ethereum.EventParam("pepeId", ethereum.Value.fromUnsignedBigInt(pepeId))
  )

  return pepeNamedEvent
}

export function createTransferEvent(
  _from: Address,
  _to: Address,
  _tokenId: BigInt
): Transfer {
  let transferEvent = changetype<Transfer>(newMockEvent())

  transferEvent.parameters = new Array()

  transferEvent.parameters.push(
    new ethereum.EventParam("_from", ethereum.Value.fromAddress(_from))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("_to", ethereum.Value.fromAddress(_to))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam(
      "_tokenId",
      ethereum.Value.fromUnsignedBigInt(_tokenId)
    )
  )

  return transferEvent
}

export function createUserNamedEvent(
  user: Address,
  username: Bytes
): UserNamed {
  let userNamedEvent = changetype<UserNamed>(newMockEvent())

  userNamedEvent.parameters = new Array()

  userNamedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  userNamedEvent.parameters.push(
    new ethereum.EventParam("username", ethereum.Value.fromFixedBytes(username))
  )

  return userNamedEvent
}
