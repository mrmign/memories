import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { STORAGE_OBJECT_ID, CONTRACT_ADDRESS } from '@/lib/contract';
import { uploadToWalrus } from '@/lib/walrus';
import { TransactionBlock } from '@mysten/sui.js/transactions';

interface CreateNoteFormData {
  title: string;
  content: string;
  tags: string;
  image: File | null;
}

const initialFormData: CreateNoteFormData = {
  title: '',
  content: '',
  tags: '',
  image: null,
};

export function CreateNoteButton({ onNoteCreated }: { onNoteCreated: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateNoteFormData>(initialFormData);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const { toast } = useToast();
  const account = useCurrentAccount();
  const suiClient = useSuiClient();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. 如果有图片，先上传到 Walrus
      let imageUrl = '';
      if (formData.image) {
        const uploadResponse = await uploadToWalrus(formData.image);
        imageUrl = uploadResponse;
      }

      // 2. 创建交易
      const tx = new TransactionBlock();
      
      // 获取时钟对象
      const [clock] = tx.moveCall({
        target: '0x2::clock::Clock',
      });
      
      // 处理标签
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // 调用合约的创建函数
      tx.moveCall({
        target: `${CONTRACT_ADDRESS}::note::create_note`,
        arguments: [
          tx.object(STORAGE_OBJECT_ID),
          tx.pure(formData.title),
          tx.pure(formData.content),
          tx.pure(imageUrl),
          tx.pure(tags),
          clock,
        ],
      });

      // 3. 执行交易
      const response = await suiClient.signAndExecuteTransactionBlock({
        signer: account.address,
        transaction: tx,
        options: {
          showEvents: true,
          showEffects: true,
        },
      });

      // 4. 检查交易结果
      if (response.effects?.status.status === 'success') {
        toast({
          title: 'Success',
          description: 'Note created successfully',
        });
        setIsOpen(false);
        resetForm();
        onNoteCreated(); // 刷新笔记列表
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Create note error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create note',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Note
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Note</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter note title"
              required
              maxLength={100}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Enter note content"
              required
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="tag1, tag2, tag3"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image">Image (optional)</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="cursor-pointer"
            />
            {imagePreview && (
              <div className="relative mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="rounded-md max-h-48 w-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, image: null }));
                    setImagePreview(null);
                  }}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner className="h-4 w-4" />
                  Creating...
                </>
              ) : (
                'Create Note'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}