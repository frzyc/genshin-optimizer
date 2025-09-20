export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          created_at: string
          id: string
          name: string | null
          profile: string
          uid: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          profile: string
          uid?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          profile?: string
          uid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'public_accounts_profile_fkey'
            columns: ['profile']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      artifacts: {
        Row: {
          account_id: string
          character_id: string | null
          created_at: string
          id: string
          level: number
          lock: boolean
          mainStatKey: Database['public']['Enums']['artifactMainStatKey']
          rarity: number
          setKey: Database['public']['Enums']['artifactsetkey']
          slotKey: Database['public']['Enums']['artifactslotkey']
        }
        Insert: {
          account_id: string
          character_id?: string | null
          created_at?: string
          id?: string
          level: number
          lock?: boolean
          mainStatKey: Database['public']['Enums']['artifactMainStatKey']
          rarity: number
          setKey: Database['public']['Enums']['artifactsetkey']
          slotKey: Database['public']['Enums']['artifactslotkey']
        }
        Update: {
          account_id?: string
          character_id?: string | null
          created_at?: string
          id?: string
          level?: number
          lock?: boolean
          mainStatKey?: Database['public']['Enums']['artifactMainStatKey']
          rarity?: number
          setKey?: Database['public']['Enums']['artifactsetkey']
          slotKey?: Database['public']['Enums']['artifactslotkey']
        }
        Relationships: [
          {
            foreignKeyName: 'public_artifacts_account_fkey'
            columns: ['account_id']
            isOneToOne: false
            referencedRelation: 'accounts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'public_artifacts_character_id_fkey'
            columns: ['character_id']
            isOneToOne: false
            referencedRelation: 'characters'
            referencedColumns: ['id']
          },
        ]
      }
      characters: {
        Row: {
          account_id: string
          ascension: number
          constellation: number
          created_at: string
          id: string
          key: Database['public']['Enums']['characterKey']
          level: number
          talent_auto: number
          talent_burst: number
          talent_skill: number
        }
        Insert: {
          account_id: string
          ascension: number
          constellation: number
          created_at?: string
          id?: string
          key: Database['public']['Enums']['characterKey']
          level: number
          talent_auto: number
          talent_burst: number
          talent_skill: number
        }
        Update: {
          account_id?: string
          ascension?: number
          constellation?: number
          created_at?: string
          id?: string
          key?: Database['public']['Enums']['characterKey']
          level?: number
          talent_auto?: number
          talent_burst?: number
          talent_skill?: number
        }
        Relationships: [
          {
            foreignKeyName: 'public_characters_account_fkey'
            columns: ['account_id']
            isOneToOne: false
            referencedRelation: 'accounts'
            referencedColumns: ['id']
          },
        ]
      }
      loadouts: {
        Row: {
          account_id: string
          character_id: string
          character_key: Database['public']['Enums']['characterKey']
          created_at: string
          description: string | null
          id: string
          name: string | null
        }
        Insert: {
          account_id: string
          character_id: string
          character_key: Database['public']['Enums']['characterKey']
          created_at?: string
          description?: string | null
          id?: string
          name?: string | null
        }
        Update: {
          account_id?: string
          character_id?: string
          character_key?: Database['public']['Enums']['characterKey']
          created_at?: string
          description?: string | null
          id?: string
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'public_loadouts_account_id_fkey'
            columns: ['account_id']
            isOneToOne: false
            referencedRelation: 'accounts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'public_loadouts_character_id_fkey'
            columns: ['character_id']
            isOneToOne: false
            referencedRelation: 'characters'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          active_account: string | null
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          active_account?: string | null
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          active_account?: string | null
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'public_profiles_active_account_fkey'
            columns: ['active_account']
            isOneToOne: false
            referencedRelation: 'accounts'
            referencedColumns: ['id']
          },
        ]
      }
      substats: {
        Row: {
          artifact_id: string
          id: number
          index: number
          key: Database['public']['Enums']['artifactSubstatKey']
          value: number
        }
        Insert: {
          artifact_id: string
          id?: number
          index: number
          key: Database['public']['Enums']['artifactSubstatKey']
          value: number
        }
        Update: {
          artifact_id?: string
          id?: number
          index?: number
          key?: Database['public']['Enums']['artifactSubstatKey']
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: 'public_unactivatedSubstats_artifact_id_fkey'
            columns: ['artifact_id']
            isOneToOne: false
            referencedRelation: 'artifacts'
            referencedColumns: ['id']
          },
        ]
      }
      unactivatedSubstats: {
        Row: {
          artifact_id: string
          id: number
          index: number
          key: Database['public']['Enums']['artifactSubstatKey']
          value: number
        }
        Insert: {
          artifact_id: string
          id?: number
          index: number
          key: Database['public']['Enums']['artifactSubstatKey']
          value: number
        }
        Update: {
          artifact_id?: string
          id?: number
          index?: number
          key?: Database['public']['Enums']['artifactSubstatKey']
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: 'public_substats_artifact_id_fkey'
            columns: ['artifact_id']
            isOneToOne: false
            referencedRelation: 'artifacts'
            referencedColumns: ['id']
          },
        ]
      }
      team_loadouts: {
        Row: {
          build_type: Database['public']['Enums']['buildtypekey']
          created_at: string
          id: number
          index: number
          loadout_id: string
          team_id: string
        }
        Insert: {
          build_type?: Database['public']['Enums']['buildtypekey']
          created_at?: string
          id?: number
          index: number
          loadout_id: string
          team_id: string
        }
        Update: {
          build_type?: Database['public']['Enums']['buildtypekey']
          created_at?: string
          id?: number
          index?: number
          loadout_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'public_team_loadouts_loadout_id_fkey'
            columns: ['loadout_id']
            isOneToOne: false
            referencedRelation: 'loadouts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'public_team_loadouts_team_id_fkey'
            columns: ['team_id']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          },
        ]
      }
      teams: {
        Row: {
          account_id: string
          created_at: string
          description: string | null
          id: string
          name: string | null
        }
        Insert: {
          account_id: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'public_teams_account_id_fkey'
            columns: ['account_id']
            isOneToOne: false
            referencedRelation: 'accounts'
            referencedColumns: ['id']
          },
        ]
      }
      weapons: {
        Row: {
          account_id: string
          ascension: number
          character_id: string | null
          created_at: string
          id: string
          key: Database['public']['Enums']['weaponKey']
          level: number
          lock: boolean
          refinement: number
        }
        Insert: {
          account_id: string
          ascension: number
          character_id?: string | null
          created_at?: string
          id?: string
          key: Database['public']['Enums']['weaponKey']
          level: number
          lock?: boolean
          refinement: number
        }
        Update: {
          account_id?: string
          ascension?: number
          character_id?: string | null
          created_at?: string
          id?: string
          key?: Database['public']['Enums']['weaponKey']
          level?: number
          lock?: boolean
          refinement?: number
        }
        Relationships: [
          {
            foreignKeyName: 'public_weapons_account_fkey'
            columns: ['account_id']
            isOneToOne: false
            referencedRelation: 'accounts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'public_weapons_character_id_fkey'
            columns: ['character_id']
            isOneToOne: false
            referencedRelation: 'characters'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      artifactMainStatKey:
        | 'hp'
        | 'hp_'
        | 'atk'
        | 'atk_'
        | 'def_'
        | 'eleMas'
        | 'enerRech_'
        | 'critRate_'
        | 'critDMG_'
        | 'physical_dmg_'
        | 'anemo_dmg_'
        | 'geo_dmg_'
        | 'electro_dmg_'
        | 'hydro_dmg_'
        | 'pyro_dmg_'
        | 'cryo_dmg_'
        | 'dendro_dmg_'
        | 'heal_'
      artifactsetkey:
        | 'Adventurer'
        | 'ArchaicPetra'
        | 'Berserker'
        | 'BlizzardStrayer'
        | 'BloodstainedChivalry'
        | 'BraveHeart'
        | 'CrimsonWitchOfFlames'
        | 'DeepwoodMemories'
        | 'DefendersWill'
        | 'DesertPavilionChronicle'
        | 'EchoesOfAnOffering'
        | 'EmblemOfSeveredFate'
        | 'FlowerOfParadiseLost'
        | 'FragmentOfHarmonicWhimsy'
        | 'Gambler'
        | 'GildedDreams'
        | 'GladiatorsFinale'
        | 'GoldenTroupe'
        | 'HeartOfDepth'
        | 'HuskOfOpulentDreams'
        | 'Instructor'
        | 'Lavawalker'
        | 'LuckyDog'
        | 'MaidenBeloved'
        | 'MarechausseeHunter'
        | 'MartialArtist'
        | 'NighttimeWhispersInTheEchoingWoods'
        | 'NoblesseOblige'
        | 'NymphsDream'
        | 'OceanHuedClam'
        | 'PaleFlame'
        | 'PrayersForDestiny'
        | 'PrayersForIllumination'
        | 'PrayersForWisdom'
        | 'PrayersToSpringtime'
        | 'ResolutionOfSojourner'
        | 'RetracingBolide'
        | 'Scholar'
        | 'ShimenawasReminiscence'
        | 'SongOfDaysPast'
        | 'TenacityOfTheMillelith'
        | 'TheExile'
        | 'ThunderingFury'
        | 'Thundersoother'
        | 'TinyMiracle'
        | 'TravelingDoctor'
        | 'UnfinishedReverie'
        | 'VermillionHereafter'
        | 'ViridescentVenerer'
        | 'VourukashasGlow'
        | 'WanderersTroupe'
      artifactslotkey: 'flower' | 'plume' | 'sands' | 'goblet' | 'circlet'
      artifactSubstatKey:
        | 'hp'
        | 'hp_'
        | 'atk'
        | 'atk_'
        | 'def'
        | 'def_'
        | 'eleMas'
        | 'enerRech_'
        | 'critRate_'
        | 'critDMG_'
      buildtypekey: 'equipped' | 'real' | 'tc'
      characterKey:
        | 'Albedo'
        | 'Alhaitham'
        | 'Aloy'
        | 'Amber'
        | 'AratakiItto'
        | 'Arlecchino'
        | 'Baizhu'
        | 'Barbara'
        | 'Beidou'
        | 'Bennett'
        | 'Candace'
        | 'Charlotte'
        | 'Chevreuse'
        | 'Chiori'
        | 'Chongyun'
        | 'Clorinde'
        | 'Collei'
        | 'Cyno'
        | 'Dehya'
        | 'Diluc'
        | 'Diona'
        | 'Dori'
        | 'Eula'
        | 'Faruzan'
        | 'Fischl'
        | 'Freminet'
        | 'Furina'
        | 'Gaming'
        | 'Ganyu'
        | 'Gorou'
        | 'HuTao'
        | 'Jean'
        | 'KaedeharaKazuha'
        | 'Kaeya'
        | 'KamisatoAyaka'
        | 'KamisatoAyato'
        | 'Kaveh'
        | 'Keqing'
        | 'Kirara'
        | 'Klee'
        | 'KujouSara'
        | 'KukiShinobu'
        | 'Layla'
        | 'Lisa'
        | 'Lynette'
        | 'Lyney'
        | 'Mika'
        | 'Mona'
        | 'Nahida'
        | 'Navia'
        | 'Neuvillette'
        | 'Nilou'
        | 'Ningguang'
        | 'Noelle'
        | 'Qiqi'
        | 'RaidenShogun'
        | 'Razor'
        | 'Rosaria'
        | 'SangonomiyaKokomi'
        | 'Sayu'
        | 'Sethos'
        | 'Shenhe'
        | 'ShikanoinHeizou'
        | 'Somnia'
        | 'Sucrose'
        | 'Tartaglia'
        | 'Thoma'
        | 'Tighnari'
        | 'Venti'
        | 'Wanderer'
        | 'Wriothesley'
        | 'Xiangling'
        | 'Xianyun'
        | 'Xiao'
        | 'Xingqiu'
        | 'Xinyan'
        | 'YaeMiko'
        | 'Yanfei'
        | 'Yaoyao'
        | 'Yelan'
        | 'Yoimiya'
        | 'YunJin'
        | 'Zhongli'
        | 'TravelerAnemo'
        | 'TravelerGeo'
        | 'TravelerElectro'
        | 'TravelerDendro'
        | 'TravelerHydro'
        | 'TravelerPyro'
      weaponKey:
        | 'Absolution'
        | 'AmenomaKageuchi'
        | 'AquilaFavonia'
        | 'BlackcliffLongsword'
        | 'CinnabarSpindle'
        | 'CoolSteel'
        | 'DarkIronSword'
        | 'DullBlade'
        | 'FavoniusSword'
        | 'FesteringDesire'
        | 'FilletBlade'
        | 'FinaleOfTheDeep'
        | 'FleuveCendreFerryman'
        | 'FreedomSworn'
        | 'HaranGeppakuFutsu'
        | 'HarbingerOfDawn'
        | 'IronSting'
        | 'KagotsurubeIsshin'
        | 'KeyOfKhajNisut'
        | 'LightOfFoliarIncision'
        | 'LionsRoar'
        | 'MistsplitterReforged'
        | 'PrimordialJadeCutter'
        | 'PrototypeRancour'
        | 'RoyalLongsword'
        | 'SacrificialSword'
        | 'SapwoodBlade'
        | 'SilverSword'
        | 'SkyriderSword'
        | 'SkywardBlade'
        | 'SplendorOfTranquilWaters'
        | 'SummitShaper'
        | 'SwordOfDescension'
        | 'SwordOfNarzissenkreuz'
        | 'TheAlleyFlash'
        | 'TheBlackSword'
        | 'TheDockhandsAssistant'
        | 'TheFlute'
        | 'ToukabouShigure'
        | 'TravelersHandySword'
        | 'UrakuMisugiri'
        | 'WolfFang'
        | 'XiphosMoonlight'
        | 'Akuoumaru'
        | 'BeaconOfTheReedSea'
        | 'BlackcliffSlasher'
        | 'BloodtaintedGreatsword'
        | 'DebateClub'
        | 'FavoniusGreatsword'
        | 'FerrousShadow'
        | 'ForestRegalia'
        | 'KatsuragikiriNagamasa'
        | 'LithicBlade'
        | 'LuxuriousSeaLord'
        | 'MailedFlower'
        | 'MakhairaAquamarine'
        | 'OldMercsPal'
        | 'PortablePowerSaw'
        | 'PrototypeArchaic'
        | 'Rainslasher'
        | 'RedhornStonethresher'
        | 'RoyalGreatsword'
        | 'SacrificialGreatsword'
        | 'SerpentSpine'
        | 'SkyriderGreatsword'
        | 'SkywardPride'
        | 'SnowTombedStarsilver'
        | 'SongOfBrokenPines'
        | 'TalkingStick'
        | 'TheBell'
        | 'TheUnforged'
        | 'TidalShadow'
        | 'UltimateOverlordsMegaMagicSword'
        | 'Verdict'
        | 'WasterGreatsword'
        | 'Whiteblind'
        | 'WhiteIronGreatsword'
        | 'WolfsGravestone'
        | 'BalladOfTheFjords'
        | 'BeginnersProtector'
        | 'BlackcliffPole'
        | 'BlackTassel'
        | 'CalamityQueller'
        | 'CrescentPike'
        | 'CrimsonMoonsSemblance'
        | 'Deathmatch'
        | 'DialoguesOfTheDesertSages'
        | 'DragonsBane'
        | 'DragonspineSpear'
        | 'EngulfingLightning'
        | 'FavoniusLance'
        | 'Halberd'
        | 'IronPoint'
        | 'KitainCrossSpear'
        | 'LithicSpear'
        | 'MissiveWindspear'
        | 'Moonpiercer'
        | 'PrimordialJadeWingedSpear'
        | 'ProspectorsDrill'
        | 'PrototypeStarglitter'
        | 'RightfulReward'
        | 'RoyalSpear'
        | 'SkywardSpine'
        | 'StaffOfHoma'
        | 'StaffOfTheScarletSands'
        | 'TheCatch'
        | 'VortexVanquisher'
        | 'WavebreakersFin'
        | 'WhiteTassel'
        | 'AlleyHunter'
        | 'AmosBow'
        | 'AquaSimulacra'
        | 'BlackcliffWarbow'
        | 'Cloudforged'
        | 'CompoundBow'
        | 'ElegyForTheEnd'
        | 'EndOfTheLine'
        | 'FadingTwilight'
        | 'FavoniusWarbow'
        | 'Hamayumi'
        | 'HuntersBow'
        | 'HuntersPath'
        | 'IbisPiercer'
        | 'KingsSquire'
        | 'Messenger'
        | 'MitternachtsWaltz'
        | 'MouunsMoon'
        | 'PolarStar'
        | 'Predator'
        | 'PrototypeCrescent'
        | 'RangeGauge'
        | 'RavenBow'
        | 'RecurveBow'
        | 'RoyalBow'
        | 'Rust'
        | 'SacrificialBow'
        | 'ScionOfTheBlazingSun'
        | 'SeasonedHuntersBow'
        | 'SharpshootersOath'
        | 'SkywardHarp'
        | 'Slingshot'
        | 'SongOfStillness'
        | 'TheFirstGreatMagic'
        | 'TheStringless'
        | 'TheViridescentHunt'
        | 'ThunderingPulse'
        | 'WindblumeOde'
        | 'ApprenticesNotes'
        | 'AThousandFloatingDreams'
        | 'BalladOfTheBoundlessBlue'
        | 'BlackcliffAgate'
        | 'CashflowSupervision'
        | 'CranesEchoingCall'
        | 'DodocoTales'
        | 'EmeraldOrb'
        | 'EverlastingMoonglow'
        | 'EyeOfPerception'
        | 'FavoniusCodex'
        | 'FlowingPurity'
        | 'Frostbearer'
        | 'FruitOfFulfillment'
        | 'HakushinRing'
        | 'JadefallsSplendor'
        | 'KagurasVerity'
        | 'LostPrayerToTheSacredWinds'
        | 'MagicGuide'
        | 'MappaMare'
        | 'MemoryOfDust'
        | 'OathswornEye'
        | 'OtherworldlyStory'
        | 'PocketGrimoire'
        | 'PrototypeAmber'
        | 'QuantumCatalyst'
        | 'RoyalGrimoire'
        | 'SacrificialFragments'
        | 'SacrificialJade'
        | 'SkywardAtlas'
        | 'SolarPearl'
        | 'TheWidsith'
        | 'ThrillingTalesOfDragonSlayers'
        | 'TomeOfTheEternalFlow'
        | 'TulaytullahsRemembrance'
        | 'TwinNephrite'
        | 'WanderingEvenstar'
        | 'WineAndSong'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'objects_bucketId_fkey'
            columns: ['bucket_id']
            isOneToOne: false
            referencedRelation: 'buckets'
            referencedColumns: ['id']
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: 's3_multipart_uploads_bucket_id_fkey'
            columns: ['bucket_id']
            isOneToOne: false
            referencedRelation: 'buckets'
            referencedColumns: ['id']
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: 's3_multipart_uploads_parts_bucket_id_fkey'
            columns: ['bucket_id']
            isOneToOne: false
            referencedRelation: 'buckets'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 's3_multipart_uploads_parts_upload_id_fkey'
            columns: ['upload_id']
            isOneToOne: false
            referencedRelation: 's3_multipart_uploads'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
        }
        Returns: {
          key: string
          id: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          start_after?: string
          next_token?: string
        }
        Returns: {
          name: string
          id: string
          metadata: Json
          updated_at: string
        }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
        PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never
