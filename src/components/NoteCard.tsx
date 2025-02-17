import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Note } from '@/types';
import { formatDate } from '@/lib/utils';

interface NoteCardProps {
  note: Note;
}

export function NoteCard({ note, onUpdate }: NoteCardProps & { onUpdate: () => void }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{note.title}</CardTitle>
          <div className="flex gap-2">
            <EditNoteDialog note={note} onUpdate={onUpdate} />
            <DeleteNoteButton noteId={note.id} onDelete={onUpdate} />
          </div>
        </div>
        <div className="flex gap-2">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {note.imageUrl && (
          <img
            src={note.imageUrl}
            alt={note.title}
            className="w-full h-48 object-cover rounded-md mb-4"
          />
        )}
        <p className="text-muted-foreground">{note.content}</p>
        <div className="mt-4 text-sm text-muted-foreground">
          Created: {formatDate(note.createdAt)}
          {note.updatedAt !== note.createdAt && (
            <> · Updated: {formatDate(note.updatedAt)}</>
          )}
        </div>
      </CardContent>
    </Card>
  );
}