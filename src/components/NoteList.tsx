import { useCurrentAccount } from '@mysten/dapp-kit';
import { useEffect, useState } from 'react';
import { Note } from '@/types';
import { NoteCard } from './NoteCard';
import { suiClient } from '@/lib/sui-client';

export function NoteList() {
  const account = useCurrentAccount();
  const [notes, setNotes] = useState<Note[]>([]);
  
  useEffect(() => {
    if (!account) return;
    
    const fetchNotes = async () => {
      // Fetch user notes from Sui network
      // Implementation depends on your contract structure
    };
    
    fetchNotes();
  }, [account]);
  
  if (!account) {
    return (
      <div className="text-center py-8">
        Please connect your wallet to view your notes
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}