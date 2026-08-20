import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import {
  faqItems,
  pricingPlans,
  processSteps,
  projects,
  services,
  testimonials,
} from "../../../drizzle/schema";

export type FieldType =
  | "text"
  | "textarea"
  | "list"
  | "number"
  | "boolean"
  | "json";

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
}

export interface CollectionConfig {
  key: string;
  table: PgTable;
  singular: string;
  plural: string;
  titleField: string;
  fields: Field[];
  listColumns: string[];
  publishable: boolean;
  orderable: boolean;
  /** Tag revalidated on the public site after a publish. */
  contentTag: string;
}

export const COLLECTIONS: Record<string, CollectionConfig> = {
  services: {
    key: "services",
    table: services,
    singular: "service",
    plural: "Services",
    titleField: "title",
    contentTag: "content:services",
    publishable: true,
    orderable: true,
    listColumns: ["lotLabel", "title"],
    fields: [
      { name: "lotLabel", label: "Lot", type: "text" },
      { name: "title", label: "Titre", type: "text", required: true },
      { name: "summary", label: "Résumé", type: "textarea" },
      { name: "bullets", label: "Points (un par ligne)", type: "list" },
    ],
  },
  "process-steps": {
    key: "process-steps",
    table: processSteps,
    singular: "étape",
    plural: "Méthode (étapes)",
    titleField: "title",
    contentTag: "content:process_steps",
    publishable: true,
    orderable: true,
    listColumns: ["number", "title"],
    fields: [
      { name: "number", label: "Numéro", type: "text", required: true },
      { name: "title", label: "Titre", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "duration", label: "Durée", type: "text" },
    ],
  },
  projects: {
    key: "projects",
    table: projects,
    singular: "réalisation",
    plural: "Travaux (études de cas)",
    titleField: "title",
    contentTag: "content:projects",
    publishable: true,
    orderable: true,
    listColumns: ["sector", "title"],
    fields: [
      { name: "slug", label: "Slug (URL)", type: "text", required: true },
      { name: "title", label: "Titre", type: "text", required: true },
      { name: "sector", label: "Secteur", type: "text" },
      { name: "clientName", label: "Client", type: "text" },
      { name: "metricValue", label: "Métrique (ex. ×3)", type: "text" },
      { name: "metricLabel", label: "Légende métrique", type: "text" },
      { name: "stack", label: "Stack (un par ligne)", type: "list" },
      {
        name: "body",
        label: "Étude de cas (paragraphes)",
        type: "json",
        help: "Un paragraphe par ligne vide.",
      },
      { name: "isFeatured", label: "Mise en avant", type: "boolean" },
    ],
  },
  "pricing-plans": {
    key: "pricing-plans",
    table: pricingPlans,
    singular: "offre",
    plural: "Tarifs",
    titleField: "name",
    contentTag: "content:pricing_plans",
    publishable: true,
    orderable: true,
    listColumns: ["name", "priceLabel"],
    fields: [
      { name: "name", label: "Nom", type: "text", required: true },
      { name: "priceLabel", label: "Prix", type: "text" },
      { name: "priceNote", label: "Note de prix", type: "text" },
      { name: "includes", label: "Inclus (un par ligne)", type: "list" },
      { name: "isHighlighted", label: "Le plus demandé", type: "boolean" },
    ],
  },
  faq: {
    key: "faq",
    table: faqItems,
    singular: "question",
    plural: "FAQ",
    titleField: "question",
    contentTag: "content:faq_items",
    publishable: true,
    orderable: true,
    listColumns: ["question"],
    fields: [
      { name: "question", label: "Question", type: "text", required: true },
      { name: "answer", label: "Réponse", type: "json" },
    ],
  },
  testimonials: {
    key: "testimonials",
    table: testimonials,
    singular: "témoignage",
    plural: "Témoignages",
    titleField: "author",
    contentTag: "content:testimonials",
    publishable: true,
    orderable: true,
    listColumns: ["author", "company", "sector"],
    fields: [
      { name: "author", label: "Auteur", type: "text", required: true },
      { name: "role", label: "Fonction", type: "text" },
      { name: "company", label: "Société", type: "text" },
      { name: "sector", label: "Secteur", type: "text" },
      { name: "quote", label: "Citation", type: "textarea", required: true },
      { name: "rating", label: "Note (1–5)", type: "number" },
      { name: "projectSlug", label: "Slug étude de cas liée", type: "text" },
      { name: "isFeatured", label: "Mise en avant", type: "boolean" },
    ],
  },
};

/** Serializable subset safe to pass to Client Components (no Drizzle table). */
export type CollectionMeta = Omit<CollectionConfig, "table">;

export function meta(cfg: CollectionConfig): CollectionMeta {
  const { table: _table, ...rest } = cfg;
  void _table;
  return rest;
}

export function listCollections(): CollectionMeta[] {
  return Object.values(COLLECTIONS).map(meta);
}

export function getCollection(key: string): CollectionConfig | null {
  return COLLECTIONS[key] ?? null;
}

/** Access a Drizzle column on a config's table by field name. */
export function column(cfg: CollectionConfig, name: string): PgColumn {
  return (cfg.table as unknown as Record<string, PgColumn>)[name]!;
}

/** Fields stored as jsonb (persisted as a JSON string value). */
export function isJsonField(cfg: CollectionConfig, name: string): boolean {
  return cfg.fields.some((f) => f.name === name && f.type === "json");
}
