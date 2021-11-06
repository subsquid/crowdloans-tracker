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
import { CrowdloanStatus } from "../constants";
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
  const amtValue = typeof amount === "string" ? parseNumber(amount) : amount;
  const { id, paraId } = await ensureParachain(fundIdx.toNumber(), store);

  const crowdLoanData = await ensureFund(paraId, store);
  const parachainId = await getParachainId(paraId) as any;
  const parachain = await store.find(Parachain, {
    where: { id: parachainId },
    take: 1,
  });

  
    console.info( `unable to find the contribution for parachain:  ${parachain}`);
    const contribution = new Contribution({
      id,
      account: contributorId.toHex(), 
      parachain: parachain[0],
      fund: crowdLoanData,
      amount: BigInt(amtValue.toString()),
      createdAt: crowdLoanData.createdAt,
      blockNum,
    });

  const savedContributuion = await store.save(contribution);
}

export async function handleCrowdloanDissolved({
  store,
  event,
  block,
}: EventContext & StoreContext): Promise<void> {
  const { timestamp: createdAt } = block;
  const blockNum = block.height;
  const [fundId] = new typeCrowdloan.DissolvedEvent(event).params;
  await ensureFund(fundId.toNumber(), store, {
    status: CrowdloanStatus.DISSOLVED,
    isFinished: true,
    updatedAt: new Date(createdAt),
    dissolvedBlock: blockNum
  });
};
