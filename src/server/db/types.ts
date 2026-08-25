import type {
  adminUsers,
  auditLog,
  contentRevisions,
  faqItems,
  invitations,
  leadEvents,
  leads,
  pageViews,
  legalPages,
  loginAttempts,
  media,
  pricingPlans,
  processSteps,
  projects,
  sections,
  services,
  siteSettings,
  testimonials,
} from "../../../drizzle/schema";

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type AuditLogEntry = typeof auditLog.$inferSelect;
export type NewAuditLogEntry = typeof auditLog.$inferInsert;
export type LoginAttempt = typeof loginAttempts.$inferSelect;

export type SiteSettings = typeof siteSettings.$inferSelect;
export type Section = typeof sections.$inferSelect;
export type NewSection = typeof sections.$inferInsert;
export type Service = typeof services.$inferSelect;
export type ProcessStep = typeof processSteps.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type PricingPlan = typeof pricingPlans.$inferSelect;
export type FaqItem = typeof faqItems.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;
export type PageView = typeof pageViews.$inferSelect;
export type NewPageView = typeof pageViews.$inferInsert;
export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
export type ContentRevision = typeof contentRevisions.$inferSelect;
export type LegalPage = typeof legalPages.$inferSelect;

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type LeadEvent = typeof leadEvents.$inferSelect;
