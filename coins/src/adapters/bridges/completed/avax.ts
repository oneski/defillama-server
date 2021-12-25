import { fetch, formatExtraTokens } from "../../utils"

export default async function bridge() {
    const [bridgeTokensOld, bridgeTokensNew, bridgeTokenDetails] = await Promise.all([
        fetch(
            "https://raw.githubusercontent.com/0xngmi/bridge-tokens/main/data/penultimate.json"
        ),
        fetch(
            "https://raw.githubusercontent.com/ava-labs/avalanche-bridge-resources/main/avalanche_contract_address.json"
        ).then((r) => Object.entries(r.data)),
        fetch(
            "https://raw.githubusercontent.com/ava-labs/avalanche-bridge-resources/main/token_list.json"
        ),
    ]);

    const oldTokens = formatExtraTokens("avax", bridgeTokensOld.data.map((token: any) => [
        token["Avalanche Token Address"],
        "ethereum:" + token["Ethereum Token Address"],
        token["Avalanche Token Symbol"],
        token["Avalanche Token Decimals"]
    ]));
    const newTokens = bridgeTokensNew.map(newBridgeToken => {
        const tokenName = newBridgeToken[0].split(".")[0];
        const tokenData = bridgeTokenDetails.data[tokenName];
        if (tokenData.nativeNetwork !== "ethereum") {
            return null
        }
        return {
            from: `avax:${newBridgeToken[1]}`,
            to: `${tokenData.nativeNetwork}:${tokenData.nativeContractAddress}`,
            symbol: newBridgeToken[0],
            decimals: tokenData.denomination
        }
    }).filter(t => t !== null)

    return newTokens.concat(oldTokens)
}