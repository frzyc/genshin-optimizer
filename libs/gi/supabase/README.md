# gi-supabase

This library was generated with [Nx](https://nx.dev).
This hosts a local supabase instance, for local/dev development, for `gi-frontend`.
Requires Docker to be installed and running.

# initialize supabase

cd to `/libs/gi/supabase`

```
npx supabase init
```

# starting supabase

```
nx start gi-supabase
```

# Once supabase is started

Access the studio via http://127.0.0.1:54323

Copy the `API_URL` and `anon key` into `apps/gi-frontend/src/.env.local` as envvar for `gi-frontend`:

```
NEXT_PUBLIC_SUPABASE_URL=<API_URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

# stopping supabase

```
nx stop gi-supabase
```

# generate types

```
nx gen-types gi-supabase
```
