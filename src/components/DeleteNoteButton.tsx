import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { STORAGE_OBJECT_ID, CONTRACT_ADDRESS } from '@/lib/contract';

interface DeleteNoteButtonProps {
  noteId: string;
  onDelete: () => void;
}

export function DeleteNoteButton({ noteId, onDelete }: DeleteNoteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const account = useCurrentAccount();
  const suiClient = useSuiClient();

  const handleDelete = async () => {
    if (!account) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    setIsDeleting(true);

    try {
      // 创建交易
      const tx = new TransactionBlock();
      
      // 调用合约的删除函数
      tx.moveCall({
        target: `${CONTRACT_ADDRESS}::note::delete_note`,
        arguments: [
          tx.object(STORAGE_OBJECT_ID),
          tx.pure(noteId)
        ],
      });

      // 执行交易
      const response = await suiClient.signAndExecuteTransaction({
        signer: account.address,
        transactionBlock: tx,
        options: {
          showEvents: true,
          showEffects: true,
        },
      });

      // 检查交易结果
      if (response.effects?.status.status === 'success') {
        toast({
          title: 'Success',
          description: 'Note deleted successfully',
        });
        setIsOpen(false);
        onDelete(); // 刷新笔记列表
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Delete note error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete note',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="sm"
          className="flex items-center gap-2"
        >
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Note</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this note? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <LoadingSpinner className="h-4 w-4" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
