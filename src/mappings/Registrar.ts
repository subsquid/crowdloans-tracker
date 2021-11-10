import { EventContext, StoreContext } from "@subsquid/hydra-common";
import { Parachain } from "../generated/model";
import { Registrar } from "../types";
import { apiService } from "./helpers/api";
import { getOrCreate } from "./helpers/common";

//Reviewed
export async function handleParachainRegistered({
  store,
  event,
  block,
}: EventContext & StoreContext): Promise<void> {
  console.info(` ------ [Registrar] [Registered] Event Started.`);
  
  const [paraId, managerId] = new Registrar.RegisteredEvent(event).params;
  const parachain = await getOrCreate( store, Parachain, `${paraId}-${managerId.toString()}` );
  const api = await apiService();
  const { deposit } = (await api.query.registrar.paras.at(block.hash,paraId)).toJSON() || ({ deposit: 0 } as any);
  
  parachain.paraId = paraId.toNumber();
  parachain.createdAt = new Date(block.timestamp);
  parachain.manager = managerId.toString();
  parachain.deposit = deposit;
  parachain.creationBlock = block.height;
  parachain.deregistered = false;

  await store.save(parachain);

  console.info(`new Parachain saved: ${JSON.stringify(parachain, null, 2)}`);
}
