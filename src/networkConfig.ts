import { getFullnodeUrl, SuiClient} from "@mysten/sui/client";
import { SuiGraphQLClient } from "@mysten/sui/graphql";
import { createNetworkConfig } from "@mysten/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    testnet: {
      url: getFullnodeUrl("testnet"),
      // packageID: "0x3cba1f04cd295907b4870d703e7a715bdb426b15e7e4925e9edfec06ab51ce62",
      packageID: "0xf7c27841ff6033e29a19dce3aa2fcf3e77f21ee82b397b746c53437ca347cec4",
      module:"note",
      state:"",
      store:"0x9090471064fad3308f096fb8e86c1834648c8edb5525a01f1433f51fa5336766"
    },
  });

const suiClient = new SuiClient({
  url: networkConfig.testnet.url,
});

const suiGraphQLClient = new SuiGraphQLClient({
  url: `https://sui-testnet.mystenlabs.com/graphql`,
});

export { useNetworkVariable, useNetworkVariables, networkConfig, suiClient, suiGraphQLClient };
