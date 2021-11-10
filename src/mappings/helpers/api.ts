import { ApiPromise, WsProvider } from "@polkadot/api"
let api: ApiPromise | undefined
export const apiService =  async () => {
    if (api) return api;
    api = await ApiPromise.create({ provider: new WsProvider('wss://rpc.polkadot.io/') })
    return api
}