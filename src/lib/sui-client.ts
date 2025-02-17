import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';

export const suiClient = new SuiClient({
  url: getFullnodeUrl('testnet'),
});