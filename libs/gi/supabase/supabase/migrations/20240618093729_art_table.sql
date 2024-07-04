create type "public"."artifactMainStatKey" as enum ('hp', 'hp_', 'atk', 'atk_', 'def_', 'eleMas', 'enerRech_', 'critRate_', 'critDMG_', 'physical_dmg_', 'anemo_dmg_', 'geo_dmg_', 'electro_dmg_', 'hydro_dmg_', 'pyro_dmg_', 'cryo_dmg_', 'dendro_dmg_', 'heal_');

create type "public"."artifactSubstatKey" as enum ('hp', 'hp_', 'atk', 'atk_', 'def', 'def_', 'eleMas', 'enerRech_', 'critRate_', 'critDMG_');

create type "public"."artifactsetkey" as enum ('Adventurer', 'ArchaicPetra', 'Berserker', 'BlizzardStrayer', 'BloodstainedChivalry', 'BraveHeart', 'CrimsonWitchOfFlames', 'DeepwoodMemories', 'DefendersWill', 'DesertPavilionChronicle', 'EchoesOfAnOffering', 'EmblemOfSeveredFate', 'FlowerOfParadiseLost', 'FragmentOfHarmonicWhimsy', 'Gambler', 'GildedDreams', 'GladiatorsFinale', 'GoldenTroupe', 'HeartOfDepth', 'HuskOfOpulentDreams', 'Instructor', 'Lavawalker', 'LuckyDog', 'MaidenBeloved', 'MarechausseeHunter', 'MartialArtist', 'NighttimeWhispersInTheEchoingWoods', 'NoblesseOblige', 'NymphsDream', 'OceanHuedClam', 'PaleFlame', 'PrayersForDestiny', 'PrayersForIllumination', 'PrayersForWisdom', 'PrayersToSpringtime', 'ResolutionOfSojourner', 'RetracingBolide', 'Scholar', 'ShimenawasReminiscence', 'SongOfDaysPast', 'TenacityOfTheMillelith', 'TheExile', 'ThunderingFury', 'Thundersoother', 'TinyMiracle', 'TravelingDoctor', 'UnfinishedReverie', 'VermillionHereafter', 'ViridescentVenerer', 'VourukashasGlow', 'WanderersTroupe');

create type "public"."artifactslotkey" as enum ('flower', 'plume', 'sands', 'goblet', 'circlet');

create table "public"."accounts" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "uid" text,
    "profile" uuid not null,
    "name" text
);


alter table "public"."accounts" enable row level security;

create table "public"."artifacts" (
    "created_at" timestamp with time zone not null default now(),
    "account" uuid not null,
    "setKey" artifactsetkey not null,
    "slotKey" artifactslotkey not null,
    "level" smallint not null,
    "rarity" smallint not null,
    "id" uuid not null default gen_random_uuid(),
    "substats" jsonb[] not null,
    "lock" boolean not null default false,
    "mainStatKey" "artifactMainStatKey" not null,
    "location" text
);


alter table "public"."artifacts" enable row level security;

alter table "public"."profiles" drop column "avatar_url";

alter table "public"."profiles" drop column "full_name";

alter table "public"."profiles" drop column "website";

alter table "public"."profiles" add column "active_account" uuid;

CREATE UNIQUE INDEX accounts_pkey ON public.accounts USING btree (id);

CREATE UNIQUE INDEX artifacts_id_key ON public.artifacts USING btree (id);

CREATE UNIQUE INDEX artifacts_pkey ON public.artifacts USING btree (id);

alter table "public"."accounts" add constraint "accounts_pkey" PRIMARY KEY using index "accounts_pkey";

alter table "public"."artifacts" add constraint "artifacts_pkey" PRIMARY KEY using index "artifacts_pkey";

alter table "public"."accounts" add constraint "public_accounts_profile_fkey" FOREIGN KEY (profile) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."accounts" validate constraint "public_accounts_profile_fkey";

alter table "public"."artifacts" add constraint "artifacts_id_key" UNIQUE using index "artifacts_id_key";

alter table "public"."artifacts" add constraint "artifacts_level_check" CHECK (((level >= 0) AND (level <= 20))) not valid;

alter table "public"."artifacts" validate constraint "artifacts_level_check";

alter table "public"."artifacts" add constraint "artifacts_rarity_check" CHECK (((rarity >= 1) AND (rarity <= 5))) not valid;

alter table "public"."artifacts" validate constraint "artifacts_rarity_check";

alter table "public"."artifacts" add constraint "public_artifacts_account_fkey" FOREIGN KEY (account) REFERENCES accounts(id) ON DELETE CASCADE not valid;

alter table "public"."artifacts" validate constraint "public_artifacts_account_fkey";

alter table "public"."profiles" add constraint "public_profiles_active_account_fkey" FOREIGN KEY (active_account) REFERENCES accounts(id) ON DELETE SET NULL not valid;

alter table "public"."profiles" validate constraint "public_profiles_active_account_fkey";

grant delete on table "public"."accounts" to "anon";

grant insert on table "public"."accounts" to "anon";

grant references on table "public"."accounts" to "anon";

grant select on table "public"."accounts" to "anon";

grant trigger on table "public"."accounts" to "anon";

grant truncate on table "public"."accounts" to "anon";

grant update on table "public"."accounts" to "anon";

grant delete on table "public"."accounts" to "authenticated";

grant insert on table "public"."accounts" to "authenticated";

grant references on table "public"."accounts" to "authenticated";

grant select on table "public"."accounts" to "authenticated";

grant trigger on table "public"."accounts" to "authenticated";

grant truncate on table "public"."accounts" to "authenticated";

grant update on table "public"."accounts" to "authenticated";

grant delete on table "public"."accounts" to "service_role";

grant insert on table "public"."accounts" to "service_role";

grant references on table "public"."accounts" to "service_role";

grant select on table "public"."accounts" to "service_role";

grant trigger on table "public"."accounts" to "service_role";

grant truncate on table "public"."accounts" to "service_role";

grant update on table "public"."accounts" to "service_role";

grant delete on table "public"."artifacts" to "anon";

grant insert on table "public"."artifacts" to "anon";

grant references on table "public"."artifacts" to "anon";

grant select on table "public"."artifacts" to "anon";

grant trigger on table "public"."artifacts" to "anon";

grant truncate on table "public"."artifacts" to "anon";

grant update on table "public"."artifacts" to "anon";

grant delete on table "public"."artifacts" to "authenticated";

grant insert on table "public"."artifacts" to "authenticated";

grant references on table "public"."artifacts" to "authenticated";

grant select on table "public"."artifacts" to "authenticated";

grant trigger on table "public"."artifacts" to "authenticated";

grant truncate on table "public"."artifacts" to "authenticated";

grant update on table "public"."artifacts" to "authenticated";

grant delete on table "public"."artifacts" to "service_role";

grant insert on table "public"."artifacts" to "service_role";

grant references on table "public"."artifacts" to "service_role";

grant select on table "public"."artifacts" to "service_role";

grant trigger on table "public"."artifacts" to "service_role";

grant truncate on table "public"."artifacts" to "service_role";

grant update on table "public"."artifacts" to "service_role";

create policy "Public accounts are viewable by everyone."
on "public"."accounts"
as permissive
for select
to public
using (true);


create policy "Users can insert their own accounts."
on "public"."accounts"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = profile));


create policy "Users can update own accounts."
on "public"."accounts"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = profile));


create policy "Public artifacts are viewable by everyone."
on "public"."artifacts"
as permissive
for select
to public
using (true);


create policy "Users can insert their own artifacts."
on "public"."artifacts"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = ( SELECT accounts.profile
   FROM accounts
  WHERE (accounts.id = artifacts.account))));
