import { relations } from "drizzle-orm";
import {
  adminUsers,
  contentRevisions,
  invitations,
  leadEvents,
  leads,
  media,
  projects,
} from "./schema";

export const adminUsersRelations = relations(adminUsers, ({ many }) => ({
  invitationsSent: many(invitations),
  uploads: many(media),
  revisions: many(contentRevisions),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  invitedByUser: one(adminUsers, {
    fields: [invitations.invitedBy],
    references: [adminUsers.id],
  }),
}));

export const mediaRelations = relations(media, ({ one, many }) => ({
  uploader: one(adminUsers, {
    fields: [media.uploadedBy],
    references: [adminUsers.id],
  }),
  coverFor: many(projects),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  coverMedia: one(media, {
    fields: [projects.coverMediaId],
    references: [media.id],
  }),
  ogMedia: one(media, {
    fields: [projects.ogMediaId],
    references: [media.id],
  }),
}));

export const leadsRelations = relations(leads, ({ many }) => ({
  events: many(leadEvents),
}));

export const leadEventsRelations = relations(leadEvents, ({ one }) => ({
  lead: one(leads, {
    fields: [leadEvents.leadId],
    references: [leads.id],
  }),
  actor: one(adminUsers, {
    fields: [leadEvents.actorId],
    references: [adminUsers.id],
  }),
}));
