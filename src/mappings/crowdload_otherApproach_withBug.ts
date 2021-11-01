// export async function handleCrowdloanContributed({
//     store,
//     event,
//     block,
//     extrinsic
//   }: EventContext & StoreContext): Promise<void> {
//     const [contributorId, fundIdx, amount] = new TypeCrowdloan.ContributedEvent(event).params
//     const amtValue = amount.toNumber()
  
//   console.log(" fundIdx.toNumber() ::: ",fundIdx.toNumber())
//   console.log(" contributorId ::: ",contributorId.toString())
//   console.log(" amtValue ::: ",amtValue)
//    const data = await ensureFund(fundIdx.toNumber(),store).catch((err) => {
//             console.error(`Upsert Crowdloan failed ${err}`);
//           });
//   console.log(" data ::: ",data)
//   //   const contribution = await store.find(Contribution, {
//   //     where: {id: `${block.height}-${event.id}`},
//   //     take: 1
//   //   })
  
//   //   let api = await apiService();
//   //   const parachain = (await api.query.registrar.paras(fundIdx)).toJSON();
  
  
//   // ToDo: why we are not getting id in parachain & fund variable
//   // contribution[0].fund.id = fundIdx.toString();
//   // contribution[0].parachain.id = `${block.height}-${event.id}`;
  
//   // contribution[0].amount = BigInt(amtValue);
//   // contribution[0].createdAt = new Date(block.timestamp);
//   // contribution[0].blockNum = block.height;
  
//   // contribution[0].account = contributorId.toHex().toString();
//   //   await store.save(contribution);
//   };