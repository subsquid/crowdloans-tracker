const{ ApiPromise, WsProvider } = require('polkApi')

export async function service(): Promise<any> {
    const provider = new WsProvider('wss://kusama-rpc.polkadot.io/')
    // console.log(" provider ::::: ",provider)
    const api = await ApiPromise.create({ provider })
    // console.log(" api ::::: ",api)
    return api
}
