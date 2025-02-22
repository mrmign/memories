#[allow(unused_let_mut)]
module memories::note {
    use sui::dynamic_field as df;
    use std::string::String;
    use sui::event;
    use sui::table::{Self,Table};

    
    /// Represents a single note in the memory store
    public struct Note has store,copy,drop {
        index: u64,
        title: String,
        content: String,
        create_at: u64,
        update_at: u64,
    }

    /// Main storage for the notepad application
    public struct NoteStore has key {
        id: UID,
        count: u64,
        owner: address
    }

    public struct NoteCreateEvent has copy, drop{
        index: u64,
        user: address,
    }

    /// Initialize a new memory store
    fun init(ctx: &mut TxContext) {
        let mut store = NoteStore {
            id: object::new(ctx),
            count: 0,
            owner: tx_context::sender(ctx)
        };
        let ids = table::new<address, vector<u64>>(ctx);
        let index = b"index".to_string();
        df::add(&mut store.id, index, ids);
        transfer::share_object(store);
    }

    /// Add a new note to the store
    public entry fun add_note(store: &mut NoteStore, title:String, content: String, ctx: &mut TxContext) {
        let note = Note {
            index: store.count,
            title,
            content,
            create_at: tx_context::epoch(ctx),
            update_at: tx_context::epoch(ctx)
        };
        let user = tx_context::sender(ctx);
        if (df::exists_(&store.id, user)) {
            let notes = df::borrow_mut<address, Table<u64, Note>>(&mut store.id, user);
            table::add(notes, store.count, note);
        } else {
            let mut notes = table::new<u64, Note>(ctx);
            table::add(&mut notes, store.count, note);
            df::add(&mut store.id, user, notes);
        };
        let ids = df::borrow_mut<String, Table<address, vector<u64>>>(&mut store.id, b"index".to_string());
        if (!table::contains(ids, user)) {
            let mut user_ids = vector::empty<u64>();
            vector::push_back(&mut user_ids, store.count);
            table::add(ids, user, user_ids);
        } else {
            let user_ids = table::borrow_mut<address, vector<u64>>(ids, user);
            vector::push_back(user_ids, store.count);
        };
        event::emit(NoteCreateEvent {
           index: store.count,
            user: user,
        });
        store.count = store.count + 1;
    }

    /// Get a note by its index
    public fun get_note(store: &NoteStore, index: u64, ctx: &TxContext): &Note {
        let user = tx_context::sender(ctx);
        let notes = df::borrow<address, Table<u64,Note>>(&store.id, user);
        table::borrow(notes, index)
    }

    /// Update an existing note
    public entry fun update_note(store: &mut NoteStore, index: u64, title: String, new_content: String, ctx: &mut TxContext) {
        let user = tx_context::sender(ctx);
        let notes = df::borrow_mut<address, Table<u64,Note>>(&mut store.id, user);
        let note =table::borrow_mut(notes, index);
        note.content = new_content;
        note.title = title;
        note.update_at = tx_context::epoch(ctx);
    }

    public entry fun note_list(store: &NoteStore, ctx: & TxContext): vector<Note> {
        let user = tx_context::sender(ctx);
        let user_notes = df::borrow<address, Table<u64, Note>>(&store.id, user);
        let mut notes = vector::empty<Note>();
        let ids = df::borrow<String, Table<address, vector<u64>>>(& store.id, b"index".to_string());
        if (!table::contains(ids, user)) {
            return notes
        };
        let user_ids = table::borrow<address, vector<u64>>(ids, user);
        if(vector::length(user_ids) == 0) {
            return notes
        };
        let mut i = 0;
        let len = vector::length(user_ids);
        while (i < len) {
            let note_index = *vector::borrow(user_ids, i);
            let note = table::borrow<u64, Note>(user_notes, note_index);
            vector::push_back(&mut notes, *note);
            i = i + 1;
        };
        notes
    }

    // Delete a note
    // public entry fun delete_note(store: &mut NoteStore, addr: address, _ctx: &mut TxContext) {
    //     let index = df::borrow<address, u64>(&store.id, addr);

    //     let Note { id: _uid, title: _, content: _, create_at: _, update_at: _ } = df::remove(&mut store.id, *index);

    //     let _a = df::remove<address, u64>(&mut store.id, addr);
    // }
}