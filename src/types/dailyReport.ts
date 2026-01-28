
export interface DailyReportData {
  title: string;
  description?: string;
  asset?: string;
  activity_id?: string;
  report_date: string;
  deviation_type?: string;
  responsible?: string;
}

export interface DailyReportPhoto {
  photo_url: string;
  caption?: string;
}

export interface DailyReport {
  id: string;
  title: string;
  description?: string;
  asset?: string;
  report_date: string;
  created_at: string;
  deviation_type?: string;
  responsible?: string;
  user_id: string;
  activity_id?: string;
  activities?: { title: string } | null;
  daily_report_photos: Array<{
    id: string;
    photo_url: string;
    caption?: string;
  }>;
  author?: {
    name: string;
    role: string;
  } | null;
}
