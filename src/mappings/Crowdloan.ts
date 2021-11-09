import { EventContext, StoreContext } from "@subsquid/hydra-common";
import { ensureFund, ensureParachain, get } from "./helpers/common";
import { parseNumber, getParachainId } from "./helpers/utils";
import { Contribution, Parachain, Crowdloan as CrowdloanModel  } from "../generated/model";
import { CrowdloanStatus } from "../constants";
import { Crowdloan } from "../types";

//reviewed
export async function handleCrowdloanCreated({
  store,
  event,
  block
}: EventContext & StoreContext): Promise<void> {
  console.info(` ------ [Crowdloan] [Created] Event Started.`);

  const [fundId] = new Crowdloan.DissolvedEvent(event).params;
  await ensureParachain(fundId.toNumber(), store);
  await ensureFund(fundId.toNumber(), store, { blockNum: block.height });

  console.info(` ------ [Crowdloan] [Created] Event Completed.`);
};

//reviewed
export async function handleCrowdloanContributed({
  store,
  event,
  block
}: EventContext & StoreContext): Promise<void> {
  console.info(` ------ [Crowdloan] [Contributed] Event Started.`);

  const blockNum = block.height;
  const [contributorId, fundIdx, amount] = new Crowdloan.ContributedEvent(event).params;
  await ensureParachain(fundIdx.toNumber(), store);

const fund = await ensureFund(fundIdx.toNumber(), store);
const fundId = fund.id
const parachain = fund.parachain
  const crowdLoan =await  get(store, CrowdloanModel, fundId)
  if(crowdLoan){
  const contribution = new Contribution({
    id: `${blockNum}-${event.id}`,
    account: contributorId.toString(),
    parachain,
    fund: crowdLoan,
    amount: amount.toBigInt(),
    createdAt: new Date (block.timestamp),
    blockNum
  });

  await store.save(contribution);

  console.info(` ------ [Crowdloan] [Contributed] Event Completed.`);
}
}

//reviewed
export async function handleCrowdloanDissolved({
  store,
  event,
  block
}: EventContext & StoreContext): Promise<void> {
  console.info(` ------ [Crowdloan] [Dissolved] Event Started.`);

  const { timestamp: createdAt } = block;
  const blockNum = block.height;
  const [fundId] = new Crowdloan.DissolvedEvent(event).params;
  await ensureFund(fundId.toNumber(), store, {
    status: CrowdloanStatus.DISSOLVED,
    isFinished: true,
    updatedAt: new Date(createdAt),
    dissolvedBlock: blockNum,
  });

  console.info(` ------ [Crowdloan] [Dissolved] Event Completed.`);
}