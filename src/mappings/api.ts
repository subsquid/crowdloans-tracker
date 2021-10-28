const{ ApiPromise, WsProvider } = require('polkApi')

export async function service(): Promise<any> {
    const provider = new WsProvider('wss://kusama.api.onfinality.io/ws?apikey=1c46075d-bd1e-4cc7-84a0-e19d28ae7c13')
    // console.log(" provider ::::: ",provider)
    const api = await ApiPromise.create({ provider })
    // console.log(" api ::::: ",api)
    return api
}
