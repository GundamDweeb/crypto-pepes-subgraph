import { Address} from '@graphprotocol/graph-ts';
import { dataSource } from '@graphprotocol/graph-ts'

export let ADDRESS_ZERO: Address = Address.fromString(
  '0x0000000000000000000000000000000000000000',
);

export function ADDRESS_BASE(): Address {
  return dataSource.network() == "goerli" ? Address.fromString("0x74021902C88CB3a5bcC8aA68E7CfC416D8175dA5") : Address.fromString("0x84aC94F17622241f313511B629e5E98f489AD6E4");
}

export function ADDRESS_WRAP(): Address {
  return dataSource.network() == "goerli" ? Address.fromString("0x661526219293E2853302e11Da6717476aD2c7ffa") : Address.fromString("0x0000000000000000000000000000000000000002");
}

