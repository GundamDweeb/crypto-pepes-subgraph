import { json, Bytes, dataSource, JSONValueKind } from "@graphprotocol/graph-ts";
import { Attribute, PepeMetadata } from "../../generated/schema";

export function handleMetadata(content: Bytes): void {
  let pepeMetadata = new PepeMetadata(dataSource.stringParam());
  const value = json.fromBytes(content).toObject();
  if (value) {
    const image = value.get("image");
    const name = value.get("name");
    const description = value.get("description");
    const externalURL = value.get("external_url");
    const attributes = value.get("attributes");

    if (name && image && description && externalURL) {
      pepeMetadata.name = name.toString();
      pepeMetadata.image = image.toString();
      pepeMetadata.externalURL = externalURL.toString();
      pepeMetadata.description = description.toString();

    }
    pepeMetadata.save();
    if(attributes) {
        let attributeArray = attributes.toArray();
        let arrayLength = attributeArray.length;

        for(let i = 0; i < arrayLength; i++) {
            let attribute = new Attribute(dataSource.stringParam().concat("-").concat(i.toString()));
            let attributeObject = attributeArray[i].toObject();
            let traitType = attributeObject.get("trait_type");
            let traitValue = attributeObject.get("value");

            if(traitType && traitValue) {
                attribute.traitType = traitType.toString();
                attribute.metadata = dataSource.stringParam();
                if(traitValue.kind == JSONValueKind.STRING){
                    attribute.value = traitValue.toString();
                }
                if(traitValue.kind == JSONValueKind.NUMBER) {
                    attribute.value = traitValue.toI64().toString();
                }
                if(traitValue.kind == JSONValueKind.BOOL){
                    attribute.value = traitValue.toBool().toString();
                }
                attribute.save();   
            }
        }
    }

    pepeMetadata.save();
  }
}