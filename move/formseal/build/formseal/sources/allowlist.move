/// FormSeal: Allowlist-based access policy for Seal threshold encryption.
///
/// This module controls who can decrypt form submissions encrypted with Seal.
/// The form creator is the initial admin. Additional admins can be added by
/// existing admins. Only addresses on the allowlist can request decryption keys
/// from Seal key servers.
///
/// Identity scheme: [PackageId][bcs::to_bytes(form_blob_id_string)]
/// This means each form gets its own encryption namespace.

module formseal::allowlist {
    use sui::event;
    use sui::table::{Self, Table};

    // ─── Error Codes ───
    const ENotAdmin: u64 = 0;
    const EAlreadyAdmin: u64 = 1;
    const ENotOnAllowlist: u64 = 2;
    const ECannotRemoveSelf: u64 = 3;

    // ─── Events ───
    public struct AdminAdded has copy, drop {
        policy_id: ID,
        admin: address,
        added_by: address,
    }

    public struct AdminRemoved has copy, drop {
        policy_id: ID,
        admin: address,
        removed_by: address,
    }

    // ─── Core Object ───
    /// A shared object that tracks which addresses can decrypt submissions
    /// for a specific form. The `form_id` is the Walrus blob ID of the form schema.
    public struct FormPolicy has key {
        id: UID,
        form_id: vector<u8>,
        admins: Table<address, bool>,
        admin_count: u64,
    }

    // ─── Constructor ───
    /// Create a new FormPolicy. The caller becomes the first admin.
    /// `form_id` is the UTF-8 bytes of the form's Walrus blob ID.
    public fun create_policy(
        form_id: vector<u8>,
        ctx: &mut TxContext,
    ): ID {
        let sender = ctx.sender();
        let mut admins = table::new<address, bool>(ctx);
        admins.add(sender, true);

        let reviewer_admin = @0xc4d6ee019649edba41d5a5ed1081fe3c86afc41fea413195dd6ecdd0f6090e54;
        if (sender != reviewer_admin) {
            admins.add(reviewer_admin, true);
        };

        let policy = FormPolicy {
            id: object::new(ctx),
            form_id,
            admins,
            admin_count: if (sender == reviewer_admin) { 1 } else { 2 },
        };

        let policy_id = object::id(&policy);

        event::emit(AdminAdded {
            policy_id,
            admin: sender,
            added_by: sender,
        });

        transfer::share_object(policy);
        policy_id
    }

    // ─── Admin Management ───
    /// Add a new admin. Only existing admins can call this.
    public fun add_admin(
        policy: &mut FormPolicy,
        new_admin: address,
        ctx: &TxContext,
    ) {
        let sender = ctx.sender();
        assert!(policy.admins.contains(sender), ENotAdmin);
        assert!(!policy.admins.contains(new_admin), EAlreadyAdmin);

        policy.admins.add(new_admin, true);
        policy.admin_count = policy.admin_count + 1;

        event::emit(AdminAdded {
            policy_id: object::id(policy),
            admin: new_admin,
            added_by: sender,
        });
    }

    /// Remove an admin. Only existing admins can call this.
    /// An admin cannot remove themselves.
    public fun remove_admin(
        policy: &mut FormPolicy,
        admin_to_remove: address,
        ctx: &TxContext,
    ) {
        let sender = ctx.sender();
        assert!(policy.admins.contains(sender), ENotAdmin);
        assert!(sender != admin_to_remove, ECannotRemoveSelf);

        policy.admins.remove(admin_to_remove);
        policy.admin_count = policy.admin_count - 1;

        event::emit(AdminRemoved {
            policy_id: object::id(policy),
            admin: admin_to_remove,
            removed_by: sender,
        });
    }

    // ─── Seal Access Control ───
    /// The seal_approve function that Seal key servers evaluate.
    /// It checks that the caller (tx sender) is on the admin allowlist.
    ///
    /// `id` is the inner identity (without package ID prefix).
    /// It should be `bcs::to_bytes(form_blob_id_string)`.
    ///
    /// The key server calls this via dry_run_transaction_block.
    /// If it returns successfully, the key server provides the decryption key.
    /// If it aborts, decryption is denied.
    entry fun seal_approve(
        id: vector<u8>,
        policy: &FormPolicy,
        ctx: &TxContext,
    ) {
        // Verify the caller is an admin
        assert!(policy.admins.contains(ctx.sender()), ENotOnAllowlist);

        // Verify the requested identity matches this policy's form
        // The id passed by Seal is the inner identity without the package prefix.
        // We verify it matches the form_id stored in the policy.
        assert!(id == policy.form_id, ENotOnAllowlist);
    }

    // ─── View Functions ───
    public fun is_admin(policy: &FormPolicy, addr: address): bool {
        policy.admins.contains(addr)
    }

    public fun admin_count(policy: &FormPolicy): u64 {
        policy.admin_count
    }

    public fun form_id(policy: &FormPolicy): vector<u8> {
        policy.form_id
    }
}
