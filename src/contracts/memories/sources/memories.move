module memories::note {
    use std::string::{Self, String};
    use sui::table::{Self, Table};
    use sui::clock::{Self, Clock};
    use sui::vec_map::{Self, VecMap};

    // 错误码
    const ENO_PERMISSION: u64 = 0;
    // const ENOTE_NOT_FOUND: u64 = 1;

    // 记事本条目结构
    public struct Note has key, store, drop {
        id: UID,
        title: String,
        content: String,
        image_url: String,
        created_at: u64,
        updated_at: u64,
        tags: vector<String>,
        owner: address
    }

    // 全局存储结构
    public struct NotesStorage has key {
        id: UID,
        notes: Table<address, Note>,
        note_counter: u64,
        user_counter: u64,
        user_notes: Table<address, vector<address>>
    }

    // 初始化函数，只在部署时调用一次
    fun init(ctx: &mut TxContext) {
        let storage = NotesStorage {
            id: object::new(ctx),
            notes: table::new(ctx),
            note_counter: 0,
            user_counter: 0,
            user_notes: table::new(ctx)
        };
        transfer::share_object(storage);
    }

    // 创建新记事
    public entry fun create_note(
        storage: &mut NotesStorage,
        title: String,
        content: String,
        image_url: String,
        tags: vector<String>,
        clock: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // 创建新记事
        let note = Note {
            id: object::new(ctx),
            title: title,
            content: content,
            image_url: image_url,
            created_at: clock,
            updated_at: clock,
            tags,
            owner: sender
        };
        let note_id = object::uid_to_address(&note.id);
        // 存储记事
        table::add(&mut storage.notes, note_id, note);
        
        // 更新用户的记事列表
        if (!table::contains(&storage.user_notes, sender)) {
            table::add(&mut storage.user_notes, sender, vector::empty<address>());
        };
        let user_notes = table::borrow_mut(&mut storage.user_notes, sender);
        vector::push_back(user_notes, note_id);
        
        // 增加计数器
        storage.note_counter = storage.note_counter + 1;
    }

    // 更新记事
    public entry fun update_note(
        storage: &mut NotesStorage,
        note_id: address,
        title: String,
        content: String,
        image_url: String,
        tags: vector<String>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let note = table::borrow_mut(&mut storage.notes, note_id);
        
        // 验证所有权
        assert!(note.owner == sender, ENO_PERMISSION);
        
        // 更新记事内容
        note.title = title;
        note.content = content;
        note.image_url = image_url;
        note.tags = tags;
        note.updated_at = clock::timestamp_ms(clock);
    }

    // 删除记事
    public entry fun delete_note(
        storage: &mut NotesStorage,
        note_id: address,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let note = table::borrow(&storage.notes, note_id);
        
        // 验证所有权
        assert!(note.owner == sender, ENO_PERMISSION);
        
        // 从用户的记事列表中移除
        let user_notes = table::borrow_mut(&mut storage.user_notes, sender);
        let (exists, index) = vector::index_of(user_notes, &note_id);
        if (exists) {
            vector::remove(user_notes, index);
        };
        
        // 从存储中移除记事
        table::remove(&mut storage.notes, note_id);
    }

    // 获取用户的所有记事ID
    public fun get_user_notes(storage: &NotesStorage, user: address): vector<address> {
        if (table::contains(&storage.user_notes, user)) {
            *table::borrow(&storage.user_notes, user)
        } else {
            vector::empty()
        }
    }

    // 获取记事详情
    public fun get_note(storage: &NotesStorage, note_id: address): &Note {
        table::borrow(&storage.notes, note_id)
    }

    // 检查记事是否存在
    public fun note_exists(storage: &NotesStorage, note_id: address): bool {
        table::contains(&storage.notes, note_id)
    }

    // 获取记事总数
    public fun get_note_count(storage: &NotesStorage): u64 {
        storage.note_counter
    }
}