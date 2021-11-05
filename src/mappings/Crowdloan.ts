import { EventContext, StoreContext } from "@subsquid/hydra-common";
import { IgnoreParachainIds } from "../constants";
import { Auction, Chronicle, Contribution,  ParachainLeases, Crowdloan as modelCrowdloan } from "../generated/model";
import { Slots, Crowdloan as typeCrowdloan  } from "../types";
import { apiService } from "./helpers/api";
import { ensureFund, ensureParachain, getOrCreate, getOrUpdate, isFundAddress } from "./helpers/common";
import { CrowdloanStatus } from "./helpers/types";
import { parseNumber } from "./helpers/utils";



export async function handleCrowdloanContributed({
  store,
  event,
  block,
  extrinsic
}: EventContext & StoreContext): Promise<void> {
  const [contributorId, fundIdx, amount] = new typeCrowdloan.ContributedEvent(event).params
  const amtValue = amount.toNumber()
  // const contribution = await ensureParachain(fundIdx, store)


  const data = await ensureParachain(fundIdx.toNumber(), store);


  const paradata = await ensureFund(fundIdx.toNumber(), store, data);

  // const contribution = await store.find(Contribution, {
  //   where: {blockNum: block.height},
  //   // where: {id: `${block.height}-${event.id}`},
  //   take: 1
  // })
  // let api = await apiService();
  // const parachain = (await api.query.registrar.paras(fundIdx)).toJSON() as any;
  // if(contribution.length != 0) {
  //   contribution[0].account = contributorId.toHex();
  //   // ToDo: why we are not getting id in parachain & fund variable
  //   contribution[0].fund.id = fundIdx.toString();
  //   contribution[0].parachain.id = parachain.id;
  //   contribution[0].amount = BigInt(amtValue);
  //   contribution[0].createdAt = new Date(block.timestamp);
  //   contribution[0].blockNum = block.height;
  //   await store.save(contribution);
  // } else {
  //     console.info(`unable to find the contribution for parachain:  ${parachain}`)
  // }

};


export async function handleCrowdloanDissolved({
  store,
  event,
  block,
}: EventContext & StoreContext): Promise<void> {
  const [fundId] = new typeCrowdloan.DissolvedEvent(event).params;

  const crowdloan = await store.find(modelCrowdloan, {where: { id: fundId.toString() }, take: 1});

  crowdloan[0].status = 'Dissolved';
  crowdloan[0].isFinished = true;
  crowdloan[0].updatedAt = new Date(block.timestamp);
  crowdloan[0].dissolvedBlock = block.height;

  await store.save(crowdloan);
};