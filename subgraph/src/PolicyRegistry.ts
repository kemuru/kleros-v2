import { PolicyUpdate } from "../generated/PolicyRegistry/PolicyRegistry";
import { Court } from "../generated/schema";
import { ipfs, json, Bytes, TypedMap, JSONValue } from "@graphprotocol/graph-ts";

export function handlePolicyUpdate(event: PolicyUpdate): void {
  const courtID = event.params._courtID.toString();
  const court = Court.load(courtID);
  if (court) {
    court.policy = event.params._policy;
    court.name = event.params._courtName;
    court.save();

    const jsonObj = getJsonObj(event.params._policy);
    if (!jsonObj) return;

    court.name = tryGetValue(jsonObj, "name");
    court.description = tryGetValue(jsonObj, "description");
    court.requiredSkills = tryGetValue(jsonObj, "requiredSkills");
    court.save();
  }
}

function tryGetValue(jsonObj: TypedMap<string, JSONValue>, key: string): string | null {
  const value = jsonObj.get(key);
  return value ? value.toString() : null;
}

function getJsonObj(CID: string): TypedMap<string, JSONValue> | null {
  const jsonStr = ipfs.cat(CID);
  if (!jsonStr) return null;

  const jsonObjValueAndSuccess = json.try_fromBytes(jsonStr as Bytes);
  if (!jsonObjValueAndSuccess.isOk) return null;

  const jsonObj = jsonObjValueAndSuccess.value.toObject();
  if (!jsonObj) return null;

  return jsonObj;
}
