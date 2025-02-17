import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TransactionBlock } from '@mysten/sui.js/transactions';

export const CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS';
export const STORAGE_OBJECT_ID = 'YOUR_STORAGE_OBJECT_ID';

// 查询函数
export function useUserNotes() {
    const account = useCurrentAccount();
    const suiClient = useSuiClient();

    return useQuery({
        queryKey: ['userNotes', account?.address],
        queryFn: async () => {
            if (!account) return [];

            // 获取用户的笔记ID列表
            const storageObject = await suiClient.getObject({
                id: STORAGE_OBJECT_ID,
                options: { showContent: true }
            });

            if (!storageObject.data?.content) return [];

            // 从存储对象中获取用户的笔记ID
            const userNotes = // 实现从存储对象中获取用户笔记ID的逻辑

            // 获取所有笔记的详细信息
            const notes = await Promise.all(userNotes.map(async (noteId) => {
                const noteData = // 实现获取笔记详情的逻辑
                return noteData;
            }));

            return notes;
        },
        enabled: !!account
    });
}

export async function createNote(
  title: string,
  content: string,
  imageUrl: string,
  tags: string[],
) {
  const tx = new TransactionBlock();
  
  // Get clock object for timestamp
  const [clock] = tx.moveCall({
    target: '0x2::clock::Clock',
  });
  
  tx.moveCall({
    target: `${CONTRACT_ADDRESS}::note::create_note`,
    arguments: [
      tx.pure(title),
      tx.pure(content),
      tx.pure(imageUrl),
      tx.pure(tags),
      clock,
    ],
  });
  
  return tx;
}

export async function updateNote(
  noteId: string,
  title: string,
  content: string,
  imageUrl: string,
  tags: string[],
) {
  const tx = new TransactionBlock();
  
  const [clock] = tx.moveCall({
    target: '0x2::clock::Clock',
  });
  
  tx.moveCall({
    target: `${CONTRACT_ADDRESS}::note::update_note`,
    arguments: [
      tx.pure(noteId),
      tx.pure(title),
      tx.pure(content),
      tx.pure(imageUrl),
      tx.pure(tags),
      clock,
    ],
  });
  
  return tx;
}

export async function deleteNote(noteId: string) {
  const tx = new TransactionBlock();
  
  tx.moveCall({
    target: `${CONTRACT_ADDRESS}::note::delete_note`,
    arguments: [tx.pure(noteId)],
  });
  
  return tx;
}