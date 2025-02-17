import { ConnectButton } from '@mysten/dapp-kit';
import { NoteList } from '@/components/NoteList';
import { CreateNoteButton } from '@/components/CreateNoteButton';

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Memories</h1>
        <ConnectButton />
      </div>
      <div className="flex justify-end mb-4">
        <CreateNoteButton />
      </div>
      <NoteList />
    </main>
  );
}