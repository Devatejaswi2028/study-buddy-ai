# Database

Postgres on Supabase. Six tables, all protected by Row Level Security so a user
can only ever touch their own rows.

## ER diagram

```
auth.users
   │ 1
   ├──1─ profiles (id = auth.users.id)
   │
   ├──*─ documents ──*─ document_chunks
   │         │
   │         ├──*─ study_outputs
   │         └──*─ flashcards
   │
   └──*─ quiz_attempts ──0..1─ documents
```

## Tables

### `profiles`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | references `auth.users(id)` on delete cascade |
| `display_name` | text | filled from sign-up metadata or email prefix |
| `created_at` | timestamptz | default `now()` |

Created automatically by the `handle_new_user` trigger on `auth.users` insert.

### `documents`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `user_id` | uuid | owner |
| `title` | text | file name |
| `subject` | text | default `'General'` |
| `page_count` | int | pages in the PDF |
| `size_bytes` | bigint | file size |
| `char_count` | int | extracted characters |
| `status` | text | `processing` → `ready` |
| `created_at` | timestamptz | |

Index: `(user_id, created_at DESC)`

### `document_chunks`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `document_id` | uuid | cascade delete |
| `user_id` | uuid | owner |
| `chunk_index` | int | order within the document |
| `content` | text | ~1400 characters, 180 overlap |

Index: `(document_id, chunk_index)`

### `study_outputs`
Cached AI results so the same generation is not paid for twice.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `document_id` / `user_id` | uuid | |
| `kind` | text | `summary` \| `revision` \| `explain` \| `mcq` \| `exam` \| `ask` |
| `params` | jsonb | e.g. `{ subject, exam, marks, question }` |
| `content` | text | the generated text or JSON |

Index: `(document_id, kind, created_at DESC)`

### `flashcards`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `document_id` / `user_id` | uuid | |
| `front` / `back` | text | question / answer |

### `quiz_attempts`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `user_id` | uuid | |
| `document_id` | uuid null | set null if the document is deleted |
| `topic` | text | document title, or `'General'` |
| `score` / `total` | int | |

Index: `(user_id, created_at DESC)`

## Row Level Security

Every table follows the same pattern:

```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON public.<table> TO authenticated;
GRANT ALL ON public.<table> TO service_role;
ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;
CREATE POLICY "<table>_own" ON public.<table>
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

`profiles` uses `auth.uid() = id` instead of `user_id`. No `anon` grants exist
— nothing in the schema is publicly readable.

## Trigger

```sql
CREATE FUNCTION public.handle_new_user() ... SECURITY DEFINER;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
```

The `REVOKE` matters: a `SECURITY DEFINER` function callable by anyone is a
privilege-escalation risk, so only the trigger may run it.

## Migrations

SQL lives in `supabase/migrations/`, applied in filename order.
