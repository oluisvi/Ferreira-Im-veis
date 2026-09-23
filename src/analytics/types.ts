export type AnalyticsEvent = 'property_view' | 'property_gallery_open' | 'property_gallery_interaction' | 'property_share' | 'whatsapp_click' | 'phone_click' | 'filter_use' | 'property_search' | 'contact_submit'
export type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>
