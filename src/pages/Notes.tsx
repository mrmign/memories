import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { suiClient, networkConfig } from "@/networkConfig";
import { Transaction } from "@mysten/sui/transactions";

type Note = {
  index: number;
  title: string;
  content: string;
  create_at: string;
  update_at: string;
};

const Notes = () => {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const currentUser = useCurrentAccount();
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const handleAddNote = async () => {
    if (!currentUser) return;

    const tx = new Transaction();

    tx.moveCall({
      package: networkConfig.testnet.packageID,
      module: networkConfig.testnet.module,
      function: "add_note",
      arguments: [
        tx.object(networkConfig.testnet.store),
        tx.pure.string(title),
        tx.pure.string(content),
      ],
    });

    await signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: () => {
          setTitle("");
          setContent("");
          fetchNotes();
        },
      },
    );
  };

  const handleUpdateNote = async () => {
    if (!currentUser || !selectedNote) return;

    const tx = new Transaction();
    tx.moveCall({
      package: networkConfig.testnet.packageID,
      module: networkConfig.testnet.module,
      function: "update_note",
      arguments: [
        tx.object(networkConfig.testnet.store),
        tx.pure.u64(selectedNote.index),
        tx.pure.string(title),
        tx.pure.string(content),
      ],
    });

    await signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: () => {
          setSelectedNote(null);
          setTitle("");
          setContent("");
          fetchNotes();
        },
      },
    );
  };

  const fetchNotes = async () => {
    if (!currentUser) return;

    try {
      const tx = new Transaction();
      tx.moveCall({
        package: networkConfig.testnet.packageID,
        module: networkConfig.testnet.module,
        function: "note_list",
        arguments: [
          tx.object(networkConfig.testnet.store),
          //   tx.pure.address(currentUser.address),
        ],
      });

      const result = await suiClient.devInspectTransactionBlock({
        transactionBlock: tx,
        sender: currentUser.address,
      });
      console.log("fetchNotes");
      if (result.results?.[0]?.returnValues?.[0]) {
        const rawData = result.results[0].returnValues[0];
        // Parse the raw data into the correct Note structure
        const parsedNotes = (rawData as any[]).map((item: any) => ({
          index: item[0],
          title: item[1],
          content: item[2],
          create_at: item[3],
          update_at: item[4],
        }));
        console.log(parsedNotes);
        setNotes(parsedNotes);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [currentUser]);

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Add/Update Note</h2>
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
          {selectedNote ? (
            <Button onClick={handleUpdateNote}>Update Note</Button>
          ) : (
            <Button onClick={handleAddNote}>Add Note</Button>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Your Notes</h2>
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.index}
                className="p-4 border rounded-lg hover:border-blue-500 cursor-pointer"
                onClick={() => {
                  setSelectedNote(note);
                  setTitle(note.title);
                  setContent(note.content);
                }}
              >
                <h3 className="font-bold">{note.title}</h3>
                <p className="text-gray-600">{note.content}</p>
                <div className="text-sm text-gray-400 mt-2">
                  Created:{" "}
                  {new Date(parseInt(note.create_at) * 1000).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes;
