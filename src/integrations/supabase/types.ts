export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          entity_id: string | null
          entity_type: string
          id: string
          project_id: string | null
        }
        Insert: {
          action: string
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          project_id?: string | null
        }
        Update: {
          action?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          all_day: boolean
          color: string | null
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          end_datetime: string | null
          event_type: string
          id: string
          location: string | null
          project_id: string
          responsible_person: string | null
          start_datetime: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          all_day?: boolean
          color?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_datetime?: string | null
          event_type?: string
          id?: string
          location?: string | null
          project_id: string
          responsible_person?: string | null
          start_datetime: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          all_day?: boolean
          color?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_datetime?: string | null
          event_type?: string
          id?: string
          location?: string | null
          project_id?: string
          responsible_person?: string | null
          start_datetime?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          company_size: string | null
          created_at: string
          email: string | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          phone: string | null
          updated_at: string
          vat_id: string | null
        }
        Insert: {
          address?: string | null
          company_size?: string | null
          created_at?: string
          email?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
          vat_id?: string | null
        }
        Update: {
          address?: string | null
          company_size?: string | null
          created_at?: string
          email?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
          vat_id?: string | null
        }
        Relationships: []
      }
      daily_report_attachments: {
        Row: {
          category: string | null
          company_id: string
          created_at: string
          created_by: string | null
          daily_report_id: string
          file_path: string
          file_size: number | null
          filename: string | null
          id: string
          mime_type: string | null
          project_id: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          daily_report_id: string
          file_path: string
          file_size?: number | null
          filename?: string | null
          id?: string
          mime_type?: string | null
          project_id: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          daily_report_id?: string
          file_path?: string
          file_size?: number | null
          filename?: string | null
          id?: string
          mime_type?: string | null
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_report_attachments_daily_report_id_fkey"
            columns: ["daily_report_id"]
            isOneToOne: false
            referencedRelation: "daily_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_report_attachments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_report_delays: {
        Row: {
          affected_activities: string | null
          company_id: string
          created_at: string
          created_by: string | null
          daily_report_id: string
          delay_type: string | null
          description: string | null
          id: string
          impact: string | null
          mitigation: string | null
          photos: Json | null
          project_id: string
          responsible_party: string | null
          updated_at: string
        }
        Insert: {
          affected_activities?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          daily_report_id: string
          delay_type?: string | null
          description?: string | null
          id?: string
          impact?: string | null
          mitigation?: string | null
          photos?: Json | null
          project_id: string
          responsible_party?: string | null
          updated_at?: string
        }
        Update: {
          affected_activities?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          daily_report_id?: string
          delay_type?: string | null
          description?: string | null
          id?: string
          impact?: string | null
          mitigation?: string | null
          photos?: Json | null
          project_id?: string
          responsible_party?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_report_delays_daily_report_id_fkey"
            columns: ["daily_report_id"]
            isOneToOne: false
            referencedRelation: "daily_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_report_delays_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_report_equipment: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          daily_report_id: string
          equipment_id: string | null
          equipment_name: string | null
          id: string
          notes: string | null
          operator: string | null
          project_id: string
          quantity: number | null
          status: string | null
          updated_at: string
          working_hours: number | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          daily_report_id: string
          equipment_id?: string | null
          equipment_name?: string | null
          id?: string
          notes?: string | null
          operator?: string | null
          project_id: string
          quantity?: number | null
          status?: string | null
          updated_at?: string
          working_hours?: number | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          daily_report_id?: string
          equipment_id?: string | null
          equipment_name?: string | null
          id?: string
          notes?: string | null
          operator?: string | null
          project_id?: string
          quantity?: number | null
          status?: string | null
          updated_at?: string
          working_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_report_equipment_daily_report_id_fkey"
            columns: ["daily_report_id"]
            isOneToOne: false
            referencedRelation: "daily_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_report_equipment_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_report_equipment_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_report_links: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          daily_report_id: string
          entity_id: string
          entity_type: string
          id: string
          label: string | null
          project_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          daily_report_id: string
          entity_id: string
          entity_type: string
          id?: string
          label?: string | null
          project_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          daily_report_id?: string
          entity_id?: string
          entity_type?: string
          id?: string
          label?: string | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_report_links_daily_report_id_fkey"
            columns: ["daily_report_id"]
            isOneToOne: false
            referencedRelation: "daily_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_report_links_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_report_materials: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          daily_report_id: string
          delivery_number: string | null
          id: string
          material_id: string | null
          material_name: string | null
          notes: string | null
          project_id: string
          quantity: number | null
          supplier: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          daily_report_id: string
          delivery_number?: string | null
          id?: string
          material_id?: string | null
          material_name?: string | null
          notes?: string | null
          project_id: string
          quantity?: number | null
          supplier?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          daily_report_id?: string
          delivery_number?: string | null
          id?: string
          material_id?: string | null
          material_name?: string | null
          notes?: string | null
          project_id?: string
          quantity?: number | null
          supplier?: string | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_report_materials_daily_report_id_fkey"
            columns: ["daily_report_id"]
            isOneToOne: false
            referencedRelation: "daily_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_report_materials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_report_materials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_report_photos: {
        Row: {
          category: string | null
          company_id: string
          created_at: string
          created_by: string | null
          daily_report_id: string
          description: string | null
          id: string
          project_id: string
          project_photo_id: string | null
          storage_path: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          daily_report_id: string
          description?: string | null
          id?: string
          project_id: string
          project_photo_id?: string | null
          storage_path?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          daily_report_id?: string
          description?: string | null
          id?: string
          project_id?: string
          project_photo_id?: string | null
          storage_path?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_report_photos_daily_report_id_fkey"
            columns: ["daily_report_id"]
            isOneToOne: false
            referencedRelation: "daily_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_report_photos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_report_photos_project_photo_id_fkey"
            columns: ["project_photo_id"]
            isOneToOne: false
            referencedRelation: "project_photos"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_report_signatures: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          daily_report_id: string
          id: string
          project_id: string
          role: string
          signature_data: string | null
          signed_at: string
          signer_name: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          daily_report_id: string
          id?: string
          project_id: string
          role: string
          signature_data?: string | null
          signed_at?: string
          signer_name: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          daily_report_id?: string
          id?: string
          project_id?: string
          role?: string
          signature_data?: string | null
          signed_at?: string
          signer_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_report_signatures_daily_report_id_fkey"
            columns: ["daily_report_id"]
            isOneToOne: false
            referencedRelation: "daily_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_report_signatures_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_report_visitors: {
        Row: {
          arrival: string | null
          company_id: string
          company_name: string | null
          created_at: string
          created_by: string | null
          daily_report_id: string
          departure: string | null
          id: string
          name: string | null
          notes: string | null
          project_id: string
          purpose: string | null
          updated_at: string
        }
        Insert: {
          arrival?: string | null
          company_id: string
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          daily_report_id: string
          departure?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          project_id: string
          purpose?: string | null
          updated_at?: string
        }
        Update: {
          arrival?: string | null
          company_id?: string
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          daily_report_id?: string
          departure?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          project_id?: string
          purpose?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_report_visitors_daily_report_id_fkey"
            columns: ["daily_report_id"]
            isOneToOne: false
            referencedRelation: "daily_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_report_visitors_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_report_work_performed: {
        Row: {
          area: string | null
          building_section: string | null
          company_id: string
          created_at: string
          created_by: string | null
          daily_report_id: string
          description: string | null
          floor: string | null
          id: string
          notes: string | null
          progress_pct: number | null
          project_id: string
          schedule_activity_id: string | null
          trade: string | null
          updated_at: string
        }
        Insert: {
          area?: string | null
          building_section?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          daily_report_id: string
          description?: string | null
          floor?: string | null
          id?: string
          notes?: string | null
          progress_pct?: number | null
          project_id: string
          schedule_activity_id?: string | null
          trade?: string | null
          updated_at?: string
        }
        Update: {
          area?: string | null
          building_section?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          daily_report_id?: string
          description?: string | null
          floor?: string | null
          id?: string
          notes?: string | null
          progress_pct?: number | null
          project_id?: string
          schedule_activity_id?: string | null
          trade?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_report_work_performed_daily_report_id_fkey"
            columns: ["daily_report_id"]
            isOneToOne: false
            referencedRelation: "daily_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_report_work_performed_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_report_work_performed_schedule_activity_id_fkey"
            columns: ["schedule_activity_id"]
            isOneToOne: false
            referencedRelation: "project_schedule"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_report_workforce: {
        Row: {
          company_id: string
          company_name: string | null
          created_at: string
          created_by: string | null
          daily_report_id: string
          id: string
          night_shift: boolean | null
          notes: string | null
          overtime: number | null
          own_workers: number | null
          project_id: string
          subcontractor_workers: number | null
          supervisor: string | null
          trade: string | null
          updated_at: string
          working_hours: number | null
        }
        Insert: {
          company_id: string
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          daily_report_id: string
          id?: string
          night_shift?: boolean | null
          notes?: string | null
          overtime?: number | null
          own_workers?: number | null
          project_id: string
          subcontractor_workers?: number | null
          supervisor?: string | null
          trade?: string | null
          updated_at?: string
          working_hours?: number | null
        }
        Update: {
          company_id?: string
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          daily_report_id?: string
          id?: string
          night_shift?: boolean | null
          notes?: string | null
          overtime?: number | null
          own_workers?: number | null
          project_id?: string
          subcontractor_workers?: number | null
          supervisor?: string | null
          trade?: string | null
          updated_at?: string
          working_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_report_workforce_daily_report_id_fkey"
            columns: ["daily_report_id"]
            isOneToOne: false
            referencedRelation: "daily_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_report_workforce_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_reports: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          company_id: string
          created_at: string
          created_by: string | null
          delays: string | null
          equipment_used: string | null
          feels_like: number | null
          foreman_id: string | null
          ground_condition: string | null
          humidity: number | null
          id: string
          materials_delivered: string | null
          notes: string | null
          project_id: string
          rainfall_mm: number | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          report_date: string
          safety_notes: string | null
          site_status: string | null
          snow_mm: number | null
          status: string
          subcontractors: string | null
          submitted_at: string | null
          submitted_by: string | null
          sunrise: string | null
          sunset: string | null
          temperature: number | null
          updated_at: string
          visitors: string | null
          weather_condition: string | null
          weather_notes: string | null
          wind: string | null
          wind_speed: number | null
          work_performed: string | null
          workers_count: number | null
          working_conditions: string | null
          working_hours_end: string | null
          working_hours_start: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          delays?: string | null
          equipment_used?: string | null
          feels_like?: number | null
          foreman_id?: string | null
          ground_condition?: string | null
          humidity?: number | null
          id?: string
          materials_delivered?: string | null
          notes?: string | null
          project_id: string
          rainfall_mm?: number | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          report_date?: string
          safety_notes?: string | null
          site_status?: string | null
          snow_mm?: number | null
          status?: string
          subcontractors?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          sunrise?: string | null
          sunset?: string | null
          temperature?: number | null
          updated_at?: string
          visitors?: string | null
          weather_condition?: string | null
          weather_notes?: string | null
          wind?: string | null
          wind_speed?: number | null
          work_performed?: string | null
          workers_count?: number | null
          working_conditions?: string | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          delays?: string | null
          equipment_used?: string | null
          feels_like?: number | null
          foreman_id?: string | null
          ground_condition?: string | null
          humidity?: number | null
          id?: string
          materials_delivered?: string | null
          notes?: string | null
          project_id?: string
          rainfall_mm?: number | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          report_date?: string
          safety_notes?: string | null
          site_status?: string | null
          snow_mm?: number | null
          status?: string
          subcontractors?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          sunrise?: string | null
          sunset?: string | null
          temperature?: number | null
          updated_at?: string
          visitors?: string | null
          weather_condition?: string | null
          weather_notes?: string | null
          wind?: string | null
          wind_speed?: number | null
          work_performed?: string | null
          workers_count?: number | null
          working_conditions?: string | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      defects: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          location: string | null
          photo_url: string | null
          priority: string
          project_id: string
          responsible_person: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          location?: string | null
          photo_url?: string | null
          priority?: string
          project_id: string
          responsible_person?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          location?: string | null
          photo_url?: string | null
          priority?: string
          project_id?: string
          responsible_person?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "defects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      deliveries: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          delivery_date: string | null
          delivery_number: string | null
          delivery_time: string | null
          document_url: string | null
          id: string
          notes: string | null
          project_id: string | null
          received_by: string | null
          status: string
          supplier: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          delivery_date?: string | null
          delivery_number?: string | null
          delivery_time?: string | null
          document_url?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          received_by?: string | null
          status?: string
          supplier?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          delivery_date?: string | null
          delivery_number?: string | null
          delivery_time?: string | null
          document_url?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          received_by?: string | null
          status?: string
          supplier?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_items: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          delivery_id: string
          description: string | null
          id: string
          material_id: string | null
          quantity: number
          total_price: number | null
          unit: string | null
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          delivery_id: string
          description?: string | null
          id?: string
          material_id?: string | null
          quantity?: number
          total_price?: number | null
          unit?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          delivery_id?: string
          description?: string | null
          id?: string
          material_id?: string | null
          quantity?: number
          total_price?: number | null
          unit?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_items_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_items_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      document_folders: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          name: string
          parent_folder_id: string | null
          project_id: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          parent_folder_id?: string | null
          project_id: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          parent_folder_id?: string | null
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_folders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "document_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_folders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          company_id: string
          created_at: string
          document_id: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          project_id: string
          uploaded_by: string | null
          version: number
        }
        Insert: {
          company_id: string
          created_at?: string
          document_id: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          project_id: string
          uploaded_by?: string | null
          version: number
        }
        Update: {
          company_id?: string
          created_at?: string
          document_id?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          project_id?: string
          uploaded_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "project_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_assignments: {
        Row: {
          assignment_role: string | null
          company_id: string
          created_at: string
          created_by: string | null
          employee_id: string
          end_date: string | null
          id: string
          project_id: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assignment_role?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          employee_id: string
          end_date?: string | null
          id?: string
          project_id: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assignment_role?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          employee_id?: string
          end_date?: string | null
          id?: string
          project_id?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          avatar_url: string | null
          company_id: string
          created_at: string
          created_by: string | null
          email: string | null
          employment_type: string | null
          first_name: string
          id: string
          job_title: string | null
          last_name: string
          notes: string | null
          phone: string | null
          role: string
          status: string
          trade: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          employment_type?: string | null
          first_name: string
          id?: string
          job_title?: string | null
          last_name: string
          notes?: string | null
          phone?: string | null
          role?: string
          status?: string
          trade?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          employment_type?: string | null
          first_name?: string
          id?: string
          job_title?: string | null
          last_name?: string
          notes?: string | null
          phone?: string | null
          role?: string
          status?: string
          trade?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          category: string | null
          company_id: string
          created_at: string
          created_by: string | null
          current_location: string | null
          current_project_id: string | null
          equipment_number: string | null
          id: string
          image_url: string | null
          inspection_due_date: string | null
          maintenance_due_date: string | null
          manufacturer: string | null
          model: string | null
          name: string
          notes: string | null
          purchase_date: string | null
          qr_code: string | null
          responsible_person: string | null
          serial_number: string | null
          status: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          current_location?: string | null
          current_project_id?: string | null
          equipment_number?: string | null
          id?: string
          image_url?: string | null
          inspection_due_date?: string | null
          maintenance_due_date?: string | null
          manufacturer?: string | null
          model?: string | null
          name: string
          notes?: string | null
          purchase_date?: string | null
          qr_code?: string | null
          responsible_person?: string | null
          serial_number?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          current_location?: string | null
          current_project_id?: string | null
          equipment_number?: string | null
          id?: string
          image_url?: string | null
          inspection_due_date?: string | null
          maintenance_due_date?: string | null
          manufacturer?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          purchase_date?: string | null
          qr_code?: string | null
          responsible_person?: string | null
          serial_number?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_current_project_id_fkey"
            columns: ["current_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_assignments: {
        Row: {
          assigned_to: string | null
          company_id: string
          created_at: string
          created_by: string | null
          end_date: string | null
          equipment_id: string
          id: string
          notes: string | null
          project_id: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          equipment_id: string
          id?: string
          notes?: string | null
          project_id: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          equipment_id?: string
          id?: string
          notes?: string | null
          project_id?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_assignments_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      external_contacts: {
        Row: {
          address: string | null
          company_id: string
          company_name: string | null
          contact_type: string
          created_at: string
          created_by: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          notes: string | null
          phone: string | null
          project_id: string | null
          role_description: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_id: string
          company_name?: string | null
          contact_type?: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          project_id?: string | null
          role_description?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_id?: string
          company_name?: string | null
          contact_type?: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          project_id?: string | null
          role_description?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_contacts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_locations: {
        Row: {
          address: string | null
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          location_type: string | null
          name: string
          notes: string | null
          project_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          location_type?: string | null
          name: string
          notes?: string | null
          project_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          location_type?: string | null
          name?: string
          notes?: string | null
          project_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_locations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_stock: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          location_id: string
          material_id: string
          project_id: string | null
          quantity: number
          unit: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          location_id: string
          material_id: string
          project_id?: string | null
          quantity?: number
          unit?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          location_id?: string
          material_id?: string
          project_id?: string | null
          quantity?: number
          unit?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_stock_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_stock_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_stock_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_records: {
        Row: {
          company_id: string
          cost: number | null
          created_at: string
          created_by: string | null
          description: string | null
          document_url: string | null
          equipment_id: string | null
          id: string
          next_due_date: string | null
          performed_by: string | null
          performed_date: string | null
          record_type: string
          status: string
          title: string
          tool_id: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          cost?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          document_url?: string | null
          equipment_id?: string | null
          id?: string
          next_due_date?: string | null
          performed_by?: string | null
          performed_date?: string | null
          record_type?: string
          status?: string
          title: string
          tool_id?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          cost?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          document_url?: string | null
          equipment_id?: string | null
          id?: string
          next_due_date?: string | null
          performed_by?: string | null
          performed_date?: string | null
          record_type?: string
          status?: string
          title?: string
          tool_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_records_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_records_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      material_usage: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          daily_report_id: string | null
          id: string
          material_id: string
          notes: string | null
          project_id: string
          quantity: number
          unit: string | null
          updated_at: string
          usage_date: string
          used_by: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          daily_report_id?: string | null
          id?: string
          material_id: string
          notes?: string | null
          project_id: string
          quantity?: number
          unit?: string | null
          updated_at?: string
          usage_date?: string
          used_by?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          daily_report_id?: string | null
          id?: string
          material_id?: string
          notes?: string | null
          project_id?: string
          quantity?: number
          unit?: string | null
          updated_at?: string
          usage_date?: string
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "material_usage_daily_report_id_fkey"
            columns: ["daily_report_id"]
            isOneToOne: false
            referencedRelation: "daily_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_usage_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_usage_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          archived: boolean
          category: string | null
          company_id: string
          created_at: string
          created_by: string | null
          default_price: number | null
          id: string
          material_number: string | null
          minimum_stock: number | null
          name: string
          notes: string | null
          supplier: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          archived?: boolean
          category?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          default_price?: number | null
          id?: string
          material_number?: string | null
          minimum_stock?: number | null
          name: string
          notes?: string | null
          supplier?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          archived?: boolean
          category?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          default_price?: number | null
          id?: string
          material_number?: string | null
          minimum_stock?: number | null
          name?: string
          notes?: string | null
          supplier?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_events: {
        Row: {
          company_id: string
          created_at: string
          event_type: string
          id: string
          message: string | null
          project_id: string | null
          read_at: string | null
          status: string
          title: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          event_type?: string
          id?: string
          message?: string | null
          project_id?: string | null
          read_at?: string | null
          status?: string
          title: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          event_type?: string
          id?: string
          message?: string | null
          project_id?: string | null
          read_at?: string | null
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          company_id: string
          created_at: string
          id: string
          notification_frequency: string
          notify_deadlines: boolean
          notify_delays: boolean
          notify_deliveries: boolean
          notify_milestones: boolean
          notify_schedule_changes: boolean
          project_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          notification_frequency?: string
          notify_deadlines?: boolean
          notify_delays?: boolean
          notify_deliveries?: boolean
          notify_milestones?: boolean
          notify_schedule_changes?: boolean
          project_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          notification_frequency?: string
          notify_deadlines?: boolean
          notify_delays?: boolean
          notify_deliveries?: boolean
          notify_milestones?: boolean
          notify_schedule_changes?: boolean
          project_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_revisions: {
        Row: {
          company_id: string
          created_at: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          plan_id: string
          project_id: string
          revision: string
          uploaded_by: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          plan_id: string
          project_id: string
          revision: string
          uploaded_by?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          plan_id?: string
          project_id?: string
          revision?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_revisions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_revisions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "project_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_revisions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_sets: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          discipline: string | null
          id: string
          name: string
          project_id: string
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discipline?: string | null
          id?: string
          name: string
          project_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discipline?: string | null
          id?: string
          name?: string
          project_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_sets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_sets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          language: string | null
          last_name: string | null
          phone: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          language?: string | null
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          language?: string | null
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      project_calendar: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          project_id: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          project_id: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_calendar_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_documents: {
        Row: {
          category: string
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          folder_id: string | null
          id: string
          project_id: string
          status: string
          title: string
          updated_at: string
          uploaded_by: string | null
          version: number
        }
        Insert: {
          category?: string
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          folder_id?: string | null
          id?: string
          project_id: string
          status?: string
          title: string
          updated_at?: string
          uploaded_by?: string | null
          version?: number
        }
        Update: {
          category?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          folder_id?: string | null
          id?: string
          project_id?: string
          status?: string
          title?: string
          updated_at?: string
          uploaded_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "document_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_milestones: {
        Row: {
          actual_date: string | null
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          planned_date: string | null
          project_id: string
          responsible_person: string | null
          status: string
          updated_at: string
        }
        Insert: {
          actual_date?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          planned_date?: string | null
          project_id: string
          responsible_person?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          actual_date?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          planned_date?: string | null
          project_id?: string
          responsible_person?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_photos: {
        Row: {
          category: string | null
          company_id: string
          created_at: string
          description: string | null
          id: string
          photo_url: string
          project_id: string
          taken_at: string | null
          title: string | null
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          photo_url: string
          project_id: string
          taken_at?: string | null
          title?: string | null
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          photo_url?: string
          project_id?: string
          taken_at?: string | null
          title?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_photos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_plans: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          discipline: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          plan_number: string
          plan_set_id: string | null
          project_id: string
          revision: string
          status: string
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          discipline?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          plan_number: string
          plan_set_id?: string | null
          project_id: string
          revision?: string
          status?: string
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          discipline?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          plan_number?: string
          plan_set_id?: string | null
          project_id?: string
          revision?: string
          status?: string
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_plans_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_plans_plan_set_id_fkey"
            columns: ["plan_set_id"]
            isOneToOne: false
            referencedRelation: "plan_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_plans_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_schedule: {
        Row: {
          activity_name: string
          activity_number: string | null
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          duration_days: number | null
          finish_date: string | null
          id: string
          progress_percent: number
          project_id: string
          responsible_person: string | null
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          activity_name: string
          activity_number?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_days?: number | null
          finish_date?: string | null
          id?: string
          progress_percent?: number
          project_id: string
          responsible_person?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          activity_name?: string
          activity_number?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_days?: number | null
          finish_date?: string | null
          id?: string
          progress_percent?: number
          project_id?: string
          responsible_person?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_schedule_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_team_members: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          employee_id: string | null
          end_date: string | null
          external_contact_id: string | null
          id: string
          notes: string | null
          person_type: string
          project_id: string
          project_role: string | null
          start_date: string | null
          status: string
          subcontractor_id: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          employee_id?: string | null
          end_date?: string | null
          external_contact_id?: string | null
          id?: string
          notes?: string | null
          person_type: string
          project_id: string
          project_role?: string | null
          start_date?: string | null
          status?: string
          subcontractor_id?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          employee_id?: string | null
          end_date?: string | null
          external_contact_id?: string | null
          id?: string
          notes?: string | null
          person_type?: string
          project_id?: string
          project_role?: string | null
          start_date?: string | null
          status?: string
          subcontractor_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_team_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_team_members_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_team_members_external_contact_id_fkey"
            columns: ["external_contact_id"]
            isOneToOne: false
            referencedRelation: "external_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_team_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_team_members_subcontractor_id_fkey"
            columns: ["subcontractor_id"]
            isOneToOne: false
            referencedRelation: "subcontractors"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          actual_finish: string | null
          actual_start: string | null
          architect: string | null
          archived_at: string | null
          building_category: string | null
          client: string | null
          client_contact: string | null
          company_id: string | null
          construction_phase: string | null
          contract_value: number | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          current_status: string
          description: string | null
          foreman: string | null
          gps_lat: number | null
          gps_lng: number | null
          id: string
          mep_engineer: string | null
          name: string
          notes: string | null
          planned_finish: string | null
          planned_start: string | null
          project_manager: string | null
          project_number: string
          project_type: string | null
          safety_manager: string | null
          site_address: string | null
          site_manager: string | null
          structural_engineer: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_finish?: string | null
          actual_start?: string | null
          architect?: string | null
          archived_at?: string | null
          building_category?: string | null
          client?: string | null
          client_contact?: string | null
          company_id?: string | null
          construction_phase?: string | null
          contract_value?: number | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          current_status?: string
          description?: string | null
          foreman?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          mep_engineer?: string | null
          name: string
          notes?: string | null
          planned_finish?: string | null
          planned_start?: string | null
          project_manager?: string | null
          project_number: string
          project_type?: string | null
          safety_manager?: string | null
          site_address?: string | null
          site_manager?: string | null
          structural_engineer?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_finish?: string | null
          actual_start?: string | null
          architect?: string | null
          archived_at?: string | null
          building_category?: string | null
          client?: string | null
          client_contact?: string | null
          company_id?: string | null
          construction_phase?: string | null
          contract_value?: number | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          current_status?: string
          description?: string | null
          foreman?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          mep_engineer?: string | null
          name?: string
          notes?: string | null
          planned_finish?: string | null
          planned_start?: string | null
          project_manager?: string | null
          project_number?: string
          project_type?: string | null
          safety_manager?: string | null
          site_address?: string | null
          site_manager?: string | null
          structural_engineer?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_scan_events: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          entity_id: string | null
          entity_type: string
          id: string
          notes: string | null
          project_id: string | null
          scan_result: string | null
          scanned_at: string
          scanned_by: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          notes?: string | null
          project_id?: string | null
          scan_result?: string | null
          scanned_at?: string
          scanned_by?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          notes?: string | null
          project_id?: string | null
          scan_result?: string | null
          scanned_at?: string
          scanned_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_scan_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_dependencies: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          dependency_type: string
          id: string
          lag_days: number
          predecessor_activity_id: string
          project_id: string
          successor_activity_id: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          dependency_type?: string
          id?: string
          lag_days?: number
          predecessor_activity_id: string
          project_id: string
          successor_activity_id: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          dependency_type?: string
          id?: string
          lag_days?: number
          predecessor_activity_id?: string
          project_id?: string
          successor_activity_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_dependencies_predecessor_activity_id_fkey"
            columns: ["predecessor_activity_id"]
            isOneToOne: false
            referencedRelation: "project_schedule"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_dependencies_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_dependencies_successor_activity_id_fkey"
            columns: ["successor_activity_id"]
            isOneToOne: false
            referencedRelation: "project_schedule"
            referencedColumns: ["id"]
          },
        ]
      }
      subcontractors: {
        Row: {
          address: string | null
          company_id: string
          company_name: string
          contact_person: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          insurance_status: string | null
          notes: string | null
          phone: string | null
          qualification_status: string | null
          rating: number | null
          status: string
          tax_number: string | null
          trade: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_id: string
          company_name: string
          contact_person?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          insurance_status?: string | null
          notes?: string | null
          phone?: string | null
          qualification_status?: string | null
          rating?: number | null
          status?: string
          tax_number?: string | null
          trade?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_id?: string
          company_name?: string
          contact_person?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          insurance_status?: string | null
          notes?: string | null
          phone?: string | null
          qualification_status?: string | null
          rating?: number | null
          status?: string
          tax_number?: string | null
          trade?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcontractors_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string
          project_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_assignments: {
        Row: {
          assigned_to: string | null
          company_id: string
          created_at: string
          created_by: string | null
          end_date: string | null
          id: string
          notes: string | null
          project_id: string | null
          start_date: string | null
          status: string
          tool_id: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          start_date?: string | null
          status?: string
          tool_id: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          start_date?: string | null
          status?: string
          tool_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_assignments_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          category: string | null
          company_id: string
          created_at: string
          created_by: string | null
          current_location: string | null
          current_project_id: string | null
          id: string
          image_url: string | null
          manufacturer: string | null
          model: string | null
          name: string
          notes: string | null
          qr_code: string | null
          responsible_person: string | null
          serial_number: string | null
          status: string
          tool_number: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          current_location?: string | null
          current_project_id?: string | null
          id?: string
          image_url?: string | null
          manufacturer?: string | null
          model?: string | null
          name: string
          notes?: string | null
          qr_code?: string | null
          responsible_person?: string | null
          serial_number?: string | null
          status?: string
          tool_number?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          current_location?: string | null
          current_project_id?: string | null
          id?: string
          image_url?: string | null
          manufacturer?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          qr_code?: string | null
          responsible_person?: string | null
          serial_number?: string | null
          status?: string
          tool_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tools_current_project_id_fkey"
            columns: ["current_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_company: { Args: { _user_id: string }; Returns: string }
      is_company_member: { Args: { _company_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
