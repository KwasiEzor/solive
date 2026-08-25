import "server-only";
import { and, count, countDistinct, desc, gte, isNotNull, sql } from "drizzle-orm";
import { getDb } from "@/server/db";
import { pageViews } from "../../../drizzle/schema";

const DAY = 86_400_000;

export interface AnalyticsData {
  totals: { views: number; visitors: number };
  byDay: { day: string; views: number; visitors: number }[];
  byCountry: { country: string | null; views: number }[];
  byPage: { path: string; views: number }[];
  byCampaign: {
    source: string | null;
    medium: string | null;
    campaign: string | null;
    views: number;
    visitors: number;
  }[];
  byReferrer: { host: string | null; views: number }[];
  byDevice: { device: string | null; views: number }[];
}

export async function getAnalytics(days: number): Promise<AnalyticsData> {
  const db = getDb();
  const since = new Date(Date.now() - days * DAY);
  const inRange = gte(pageViews.createdAt, since);
  const views = count();
  const visitors = countDistinct(pageViews.visitorHash);
  const dayExpr = sql<string>`(${pageViews.createdAt} at time zone 'utc')::date`;

  const [totals, byDay, byCountry, byPage, byCampaign, byReferrer, byDevice] =
    await Promise.all([
      db
        .select({ views, visitors })
        .from(pageViews)
        .where(inRange)
        .then((r) => r[0] ?? { views: 0, visitors: 0 }),
      db
        .select({ day: dayExpr, views, visitors })
        .from(pageViews)
        .where(inRange)
        .groupBy(dayExpr)
        .orderBy(dayExpr),
      db
        .select({ country: pageViews.country, views })
        .from(pageViews)
        .where(inRange)
        .groupBy(pageViews.country)
        .orderBy(desc(views))
        .limit(12),
      db
        .select({ path: pageViews.path, views })
        .from(pageViews)
        .where(inRange)
        .groupBy(pageViews.path)
        .orderBy(desc(views))
        .limit(12),
      db
        .select({
          source: pageViews.utmSource,
          medium: pageViews.utmMedium,
          campaign: pageViews.utmCampaign,
          views,
          visitors,
        })
        .from(pageViews)
        .where(and(inRange, isNotNull(pageViews.utmSource)))
        .groupBy(
          pageViews.utmSource,
          pageViews.utmMedium,
          pageViews.utmCampaign,
        )
        .orderBy(desc(views))
        .limit(12),
      db
        .select({ host: pageViews.referrerHost, views })
        .from(pageViews)
        .where(and(inRange, isNotNull(pageViews.referrerHost)))
        .groupBy(pageViews.referrerHost)
        .orderBy(desc(views))
        .limit(12),
      db
        .select({ device: pageViews.device, views })
        .from(pageViews)
        .where(inRange)
        .groupBy(pageViews.device)
        .orderBy(desc(views)),
    ]);

  return {
    totals: { views: totals.views, visitors: totals.visitors },
    byDay: byDay.map((d) => ({ day: String(d.day), views: d.views, visitors: d.visitors })),
    byCountry,
    byPage,
    byCampaign,
    byReferrer,
    byDevice,
  };
}
