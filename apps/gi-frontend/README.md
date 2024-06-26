# gi-frontend

A NextJS project for Genshin Optimizer, using apps router and supabase. This App is just the NextJS framework.

# Running the stack in local development

Make sure `gi-supabase` is running:
For more details, visit [gi-supbase README.md](../../libs/gi/supabase/README.md)

```
nx start gi-supabase
```

and create a .env.local that mimics .env, with URL and ANON_KEY from the local supabase docker

Once supabase and envvars are set, run the nextJS dev server:

```
nx dev gi-frontend
```
