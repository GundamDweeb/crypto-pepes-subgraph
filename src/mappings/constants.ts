import { Address} from '@graphprotocol/graph-ts';
import { dataSource } from '@graphprotocol/graph-ts'

export let ADDRESS_ZERO: Address = Address.fromString(
  '0x0000000000000000000000000000000000000000',
);

export function ADDRESS_BASE(): Address {
  return dataSource.network() == "goerli" ? Address.fromString("0x25eCe12c9259d70405648CB9ed8711A9a5e26f7e") : Address.fromString("0x84aC94F17622241f313511B629e5E98f489AD6E4");
}

export function ADDRESS_WRAP(): Address {
  return dataSource.network() == "goerli" ? Address.fromString("0x150520100595f7c74a5346FF68eed5d360708B4e") : Address.fromString("0xe59b419fac4b9b769c4439e7c4fde22418f11c89");
}

export function ADDRESS_GRINDER(): Address {
  return dataSource.network() == "goerli" ? Address.fromString("0x0000000000000000000000000000000000000000") : Address.fromString("0xD4dd63D658f603E9a0Aa381E103e05457Cd5E609");
}