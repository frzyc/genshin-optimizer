import mongoose from "mongoose";
import { allAdditiveReactions, allAmpReactions, allCharacterKeys, allHitModes, allInfusionAuraElements, HitModeKey } from "../../src/Types/consts"

const talentType = {
  type: Number,
  validate: {
    validator: Number.isInteger,
    message: '{VALUE} is not an integer value'
  },
  min: [1, "Talents are between 1-15, inclusive"],
  max: [15, "Talents are between 1-15, inclusive"],
  default: 1
} as const

const talentSchema = new mongoose.Schema({
  auto: talentType,
  skill: talentType,
  burst: talentType,
})

const targetSchema = new mongoose.Schema({
  weight: {
    type: Number,
    default: 1
  },
  path: {
    type: [String]
  },
  hitMode: {
    type: String,
    enum: allHitModes,
    default: "avgHit"
  },
  reaction: {
    type: String,
    enum: [...allAmpReactions, ...allAdditiveReactions],
  },
  infusionAura: {
    type: String,
    enum: ["", ...allInfusionAuraElements],
    default: "",
  },
  bonusStats: { // TODO: validate keys as enums?
    type: Map,
    of: Number,
    default: {},
  },
})
const multiTargetSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "Multi-target config"
  },
  targets: {
    type: [targetSchema],
    default: []
  }
})
const characterKeySchema = new mongoose.Schema({
  type: "String",
  enum: allCharacterKeys
})
export const Character = mongoose.model(
  "Character",
  new mongoose.Schema({
    database: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Database",
      required: true,
    },
    key: {
      type: String,
      enum: allCharacterKeys,
      required: true,
    },
    level: {
      type: Number,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value'
      },
      min: [1, "Level is between 1-90, inclusive"],
      max: [90, "Level is between 1-90, inclusive"],
      default: 1
    },
    constellation: {
      type: Number,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value'
      },
      min: [0, "Constellation is between 1-90, inclusive"],
      max: [6, "Constellation is between 1-90, inclusive"],
      default: 1
    },
    talent: {
      type: talentSchema,
      default: { auto: 1, skill: 1, burst: 1 }
    },
    hitMode: {
      type: String,
      enum: allHitModes,
      default: "avgHit"
    },
    reaction: {
      type: String,
      enum: [...allAmpReactions, ...allAdditiveReactions],
    },
    conditional: { // TODO: validation?
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    bonusStats: { // TODO: validate keys as enums?
      type: Map,
      of: Number,
      default: {},
    },
    enemyOverride: { // TODO: validate keys as enums?
      type: Map,
      of: Number,
      default: {},
    },
    infusionAura: {
      type: String,
      enum: ["", ...allInfusionAuraElements],
      default: "",
    },
    compareData: {
      type: Boolean,
      default: false
    },
    customMultiTarget: {
      type: [multiTargetSchema],
      default: [],
    },
    team: {
      type: [characterKeySchema],
      default: []
    },
    teamConditional: { // TODO: validation?
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  })
);
