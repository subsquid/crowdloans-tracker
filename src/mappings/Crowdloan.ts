import { EventContext, StoreContext } from "@subsquid/hydra-common";
import { IgnoreParachainIds } from "../constants";
import {
  Auction,
  Chronicle,
  Contribution,
  ParachainLeases,
  Parachain,
  Crowdloan as modelCrowdloan,
} from "../generated/model";
import { Slots, Crowdloan as typeCrowdloan } from "../types";
import { apiService } from "./helpers/api";
import {
  ensureFund,
  ensureParachain,
  getOrCreate,
  getOrUpdate,
  isFundAddress,
} from "./helpers/common";
import { CrowdloanStatus } from "./helpers/types";
import { parseNumber, fetchCrowdloan, getParachainId } from "./helpers/utils";

export async function handleCrowdloanContributed({
  store,
  event,
  block,
  extrinsic,
}: EventContext & StoreContext): Promise<void> {
  // const idx = event.id;

  const blockNum = block.height;
  const [contributorId, fundIdx, amount] = new typeCrowdloan.ContributedEvent(
    event
  ).params;
  // const [contributor, fundIdx, amount] = event.data.toJSON() as [string, number, number | string];
  const amtValue = typeof amount === "string" ? parseNumber(amount) : amount;
  const { id, paraId } = await ensureParachain(fundIdx.toNumber(), store);

  const res = await ensureFund(paraId, store);
  const fund = await fetchCrowdloan(paraId) as any;
  const parachainId = await getParachainId(paraId) as any;
  const parachain = await store.find(Parachain, {
    where: { id: parachainId },
    take: 1,
  });

  
    console.info(
      `unable to find the contribution for parachain:  ${parachain}`
    );
    const contribution = new Contribution({
      // id: `${blockNum}-${idx}`,
      id,
      account: contributorId.toHex(), 
      parachain: parachain[0],
      fund,
      amount: BigInt(amtValue.toString()),
      createdAt: res.createdAt,
      blockNum,
    });

  console.log(" final contribution ::: ", contribution);
  const savedContributuion = await store.save(contribution);
  console.log(" savedContributuion ::: ", savedContributuion);

}


export async function handleCrowdloanDissolved({
  store,
  event,
  block,
}: EventContext & StoreContext): Promise<void> {
  const [fundId] = new typeCrowdloan.DissolvedEvent(event).params;

  const crowdloan = await store.find(modelCrowdloan, {
    where: { id: fundId.toString() },
    take: 1,
  });

  crowdloan[0].status = "Dissolved";
  crowdloan[0].isFinished = true;
  crowdloan[0].updatedAt = new Date(block.timestamp);
  crowdloan[0].dissolvedBlock = block.height;

  await store.save(crowdloan);
}
