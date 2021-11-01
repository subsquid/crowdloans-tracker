import { EventContext, StoreContext } from "@subsquid/hydra-common";
import { IgnoreParachainIds } from "../constants";
import { Auction, Chronicle, Contribution, Crowdloan, ParachainLeases } from "../generated/model";
import { Slots, Crowdloan as TypeCrowdloan } from "../types";
import { apiService } from "./helpers/api";
import { ensureFund, ensureParachain, getOrCreate, getOrUpdate, isFundAddress } from "./helpers/common";
import { CrowdloanStatus } from "./helpers/types";
import { parseNumber } from "./helpers/utils";



// export async function handleCrowdloanContributed({
//   store,
//   event,
//   block,
//   extrinsic
// }: EventContext & StoreContext): Promise<void> {
//   const data = new TypeCrowdloan.ContributedEvent(event).params
//   const [contributorId, fundIdx, amount] = new TypeCrowdloan.ContributedEvent(event).params
//   const amtValue = amount.toNumber()

//   const contribution = await store.find(Contribution, {
//     where: {id: `${block.height}-${event.id}`},
//     take: 1
//   })

//   let api = await apiService();
//   const parachain = (await api.query.registrar.paras(fundIdx)).toJSON();

//   contribution[0].account = contributorId.toHex();
//   // ToDo: why we are not getting id in parachain & fund variable
//   contribution[0].fund.id = fundIdx.toString();
//   contribution[0].parachain.id = parachain.id;
//   contribution[0].amount = BigInt(amtValue);
//   contribution[0].createdAt = new Date(block.timestamp);
//   contribution[0].blockNum = block.height;

//   await store.save(contribution);
// };


export async function handleCrowdloanDissolved({
  store,
  event,
  block,
}: EventContext & StoreContext): Promise<void> {
  const [fundId] = new TypeCrowdloan.DissolvedEvent(event).params;

  const crowdloan = await store.find(Crowdloan, {where: { id: fundId.toString() }, take: 1});

  crowdloan[0].status = 'Dissolved';
  crowdloan[0].isFinished = true;
  crowdloan[0].updatedAt = new Date(block.timestamp);
  crowdloan[0].dissolvedBlock = block.height;

  await store.save(crowdloan);
};