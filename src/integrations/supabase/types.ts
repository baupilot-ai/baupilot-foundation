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
      acceptance_records: {
        Row: {
          acceptance_date: string | null
          acceptance_number: string | null
          acceptance_type: string
          client_contact: string | null
          company_id: string
          contractor: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          location: string | null
          notes: string | null
          project_id: string
          result: string | null
          signature_url: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          acceptance_date?: string | null
          acceptance_number?: string | null
          acceptance_type?: string
          client_contact?: string | null
          company_id: string
          contractor?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          project_id: string
          result?: string | null
          signature_url?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          acceptance_date?: string | null
          acceptance_number?: string | null
          acceptance_type?: string
          client_contact?: string | null
          company_id?: string
          contractor?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          project_id?: string
          result?: string | null
          signature_url?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "acceptance_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceptance_records_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      accident_reports: {
        Row: {
          accident_date: string | null
          accident_number: string | null
          accident_time: string | null
          company_id: string
          corrective_action: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          immediate_action: string | null
          injured_person: string | null
          location: string | null
          photo_url: string | null
          project_id: string
          severity: string
          status: string
          updated_at: string
          witnesses: string | null
        }
        Insert: {
          accident_date?: string | null
          accident_number?: string | null
          accident_time?: string | null
          company_id: string
          corrective_action?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          immediate_action?: string | null
          injured_person?: string | null
          location?: string | null
          photo_url?: string | null
          project_id: string
          severity?: string
          status?: string
          updated_at?: string
          witnesses?: string | null
        }
        Update: {
          accident_date?: string | null
          accident_number?: string | null
          accident_time?: string | null
          company_id?: string
          corrective_action?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          immediate_action?: string | null
          injured_person?: string | null
          location?: string | null
          photo_url?: string | null
          project_id?: string
          severity?: string
          status?: string
          updated_at?: string
          witnesses?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accident_reports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accident_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
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
      audit_events: {
        Row: {
          action: string
          actor_id: string | null
          changed_fields: string[]
          company_id: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
          new_data: Json | null
          old_data: Json | null
          project_id: string | null
          summary: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          changed_fields?: string[]
          company_id: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
          new_data?: Json | null
          old_data?: Json | null
          project_id?: string | null
          summary?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          changed_fields?: string[]
          company_id?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
          new_data?: Json | null
          old_data?: Json | null
          project_id?: string | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_project_id_fkey"
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
      corrective_actions: {
        Row: {
          company_id: string
          completion_date: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string
          project_id: string
          proof_photo_url: string | null
          responsible_person: string | null
          source_id: string | null
          source_type: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          completion_date?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id: string
          proof_photo_url?: string | null
          responsible_person?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          completion_date?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id?: string
          proof_photo_url?: string | null
          responsible_person?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "corrective_actions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corrective_actions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
      delay_events: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          detected_at: string
          id: string
          impact_days: number | null
          notes: string | null
          project_id: string
          reason: string | null
          resolved_at: string | null
          responsible_party: string | null
          status: string
          task_id: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          detected_at?: string
          id?: string
          impact_days?: number | null
          notes?: string | null
          project_id: string
          reason?: string | null
          resolved_at?: string | null
          responsible_party?: string | null
          status?: string
          task_id?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          detected_at?: string
          id?: string
          impact_days?: number | null
          notes?: string | null
          project_id?: string
          reason?: string | null
          resolved_at?: string | null
          responsible_party?: string | null
          status?: string
          task_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delay_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delay_events_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_schedule"
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
      ncr_reports: {
        Row: {
          company_id: string
          corrective_action: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          location: string | null
          ncr_number: string | null
          photo_url: string | null
          preventive_action: string | null
          priority: string
          project_id: string
          responsible_person: string | null
          root_cause: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          corrective_action?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          location?: string | null
          ncr_number?: string | null
          photo_url?: string | null
          preventive_action?: string | null
          priority?: string
          project_id: string
          responsible_person?: string | null
          root_cause?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          corrective_action?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          location?: string | null
          ncr_number?: string | null
          photo_url?: string | null
          preventive_action?: string | null
          priority?: string
          project_id?: string
          responsible_person?: string | null
          root_cause?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ncr_reports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ncr_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
      progress_updates: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          note: string | null
          progress_percent: number
          project_id: string
          task_id: string
          update_date: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          note?: string | null
          progress_percent: number
          project_id: string
          task_id: string
          update_date?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          note?: string | null
          progress_percent?: number
          project_id?: string
          task_id?: string
          update_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_updates_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_schedule"
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
          deleted_at: string | null
          description: string | null
          id: string
          name: string
          notes: string | null
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
          deleted_at?: string | null
          description?: string | null
          id?: string
          name: string
          notes?: string | null
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
          deleted_at?: string | null
          description?: string | null
          id?: string
          name?: string
          notes?: string | null
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
          actual_end_date: string | null
          actual_start_date: string | null
          baseline_end_date: string | null
          baseline_start_date: string | null
          building_section: string | null
          company_id: string
          company_name: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          duration_days: number | null
          finish_date: string | null
          float_days: number | null
          floor: string | null
          id: string
          is_critical: boolean
          location: string | null
          priority: string
          progress_percent: number
          project_id: string
          responsible_person: string | null
          room: string | null
          sort_order: number | null
          start_date: string | null
          status: string
          trade: string | null
          updated_at: string
        }
        Insert: {
          activity_name: string
          activity_number?: string | null
          actual_end_date?: string | null
          actual_start_date?: string | null
          baseline_end_date?: string | null
          baseline_start_date?: string | null
          building_section?: string | null
          company_id: string
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          duration_days?: number | null
          finish_date?: string | null
          float_days?: number | null
          floor?: string | null
          id?: string
          is_critical?: boolean
          location?: string | null
          priority?: string
          progress_percent?: number
          project_id: string
          responsible_person?: string | null
          room?: string | null
          sort_order?: number | null
          start_date?: string | null
          status?: string
          trade?: string | null
          updated_at?: string
        }
        Update: {
          activity_name?: string
          activity_number?: string | null
          actual_end_date?: string | null
          actual_start_date?: string | null
          baseline_end_date?: string | null
          baseline_start_date?: string | null
          building_section?: string | null
          company_id?: string
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          duration_days?: number | null
          finish_date?: string | null
          float_days?: number | null
          floor?: string | null
          id?: string
          is_critical?: boolean
          location?: string | null
          priority?: string
          progress_percent?: number
          project_id?: string
          responsible_person?: string | null
          room?: string | null
          sort_order?: number | null
          start_date?: string | null
          status?: string
          trade?: string | null
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
      punch_list_items: {
        Row: {
          comment: string | null
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
          punch_list_id: string
          responsible_person: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
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
          punch_list_id: string
          responsible_person?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
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
          punch_list_id?: string
          responsible_person?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "punch_list_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "punch_list_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "punch_list_items_punch_list_id_fkey"
            columns: ["punch_list_id"]
            isOneToOne: false
            referencedRelation: "punch_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      punch_lists: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          location: string | null
          project_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          location?: string | null
          project_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          location?: string | null
          project_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "punch_lists_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "punch_lists_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
      quality_checklist_items: {
        Row: {
          checklist_id: string
          comment: string | null
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          photo_url: string | null
          project_id: string
          responsible_person: string | null
          result: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          checklist_id: string
          comment?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          photo_url?: string | null
          project_id: string
          responsible_person?: string | null
          result?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          checklist_id?: string
          comment?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          photo_url?: string | null
          project_id?: string
          responsible_person?: string | null
          result?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quality_checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "quality_checklists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_checklist_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_checklist_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_checklists: {
        Row: {
          assigned_to: string | null
          checklist_type: string
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          project_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          checklist_type?: string
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          project_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          checklist_type?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          project_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quality_checklists_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_checklists_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_inspections: {
        Row: {
          checklist_id: string | null
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          inspection_date: string | null
          inspection_number: string | null
          inspection_type: string
          inspector: string | null
          location: string | null
          notes: string | null
          project_id: string
          result: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          checklist_id?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          inspection_date?: string | null
          inspection_number?: string | null
          inspection_type?: string
          inspector?: string | null
          location?: string | null
          notes?: string | null
          project_id: string
          result?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          checklist_id?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          inspection_date?: string | null
          inspection_number?: string | null
          inspection_type?: string
          inspector?: string | null
          location?: string | null
          notes?: string | null
          project_id?: string
          result?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quality_inspections_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "quality_checklists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_inspections_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_inspections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_safety_signatures: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          entity_id: string
          entity_type: string
          id: string
          project_id: string
          signature_url: string | null
          signed_at: string
          signer_name: string
          signer_role: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          entity_id: string
          entity_type: string
          id?: string
          project_id: string
          signature_url?: string | null
          signed_at?: string
          signer_name: string
          signer_role?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          project_id?: string
          signature_url?: string | null
          signed_at?: string
          signer_name?: string
          signer_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quality_safety_signatures_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_safety_signatures_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_allocations: {
        Row: {
          allocation_date: string | null
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          notes: string | null
          project_id: string
          quantity: number | null
          resource_name: string | null
          resource_type: string
          task_id: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          allocation_date?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          notes?: string | null
          project_id: string
          quantity?: number | null
          resource_name?: string | null
          resource_type: string
          task_id: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          allocation_date?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          notes?: string | null
          project_id?: string
          quantity?: number | null
          resource_name?: string | null
          resource_type?: string
          task_id?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_allocations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_allocations_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_schedule"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_inspections: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          inspection_date: string | null
          inspection_number: string | null
          inspector: string | null
          location: string | null
          notes: string | null
          project_id: string
          result: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          inspection_date?: string | null
          inspection_number?: string | null
          inspector?: string | null
          location?: string | null
          notes?: string | null
          project_id: string
          result?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          inspection_date?: string | null
          inspection_number?: string | null
          inspector?: string | null
          location?: string | null
          notes?: string | null
          project_id?: string
          result?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "safety_inspections_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_inspections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_observations: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          location: string | null
          observation_type: string
          photo_url: string | null
          project_id: string
          responsible_person: string | null
          severity: string
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
          observation_type?: string
          photo_url?: string | null
          project_id: string
          responsible_person?: string | null
          severity?: string
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
          observation_type?: string
          photo_url?: string | null
          project_id?: string
          responsible_person?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "safety_observations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_observations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_baselines: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          project_id: string
          snapshot: Json
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          project_id: string
          snapshot?: Json
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          project_id?: string
          snapshot?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_baselines_project_id_fkey"
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
      task_assignments: {
        Row: {
          assignee_name: string | null
          assignee_user_id: string | null
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          project_id: string
          role: string | null
          task_id: string
          updated_at: string
        }
        Insert: {
          assignee_name?: string | null
          assignee_user_id?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          project_id: string
          role?: string | null
          task_id: string
          updated_at?: string
        }
        Update: {
          assignee_name?: string | null
          assignee_user_id?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          project_id?: string
          role?: string | null
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_schedule"
            referencedColumns: ["id"]
          },
        ]
      }
      task_attachments: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          file_name: string
          file_size: number | null
          id: string
          mime_type: string | null
          project_id: string
          storage_path: string
          task_id: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          file_name: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          project_id: string
          storage_path: string
          task_id: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          file_name?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          project_id?: string
          storage_path?: string
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_attachments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_attachments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_schedule"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          body: string
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          project_id: string
          task_id: string
          updated_at: string
        }
        Insert: {
          body: string
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          project_id: string
          task_id: string
          updated_at?: string
        }
        Update: {
          body?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          project_id?: string
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_schedule"
            referencedColumns: ["id"]
          },
        ]
      }
      task_history: {
        Row: {
          change_type: string
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          field_name: string | null
          id: string
          new_value: string | null
          old_value: string | null
          project_id: string
          task_id: string
          updated_at: string
        }
        Insert: {
          change_type?: string
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          project_id: string
          task_id: string
          updated_at?: string
        }
        Update: {
          change_type?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          project_id?: string
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_history_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_schedule"
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
      toolbox_talks: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          date: string | null
          id: string
          notes: string | null
          participants_count: number | null
          project_id: string
          signature_url: string | null
          title: string
          topic: string | null
          trainer: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          date?: string | null
          id?: string
          notes?: string | null
          participants_count?: number | null
          project_id: string
          signature_url?: string | null
          title: string
          topic?: string | null
          trainer?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          date?: string | null
          id?: string
          notes?: string | null
          participants_count?: number | null
          project_id?: string
          signature_url?: string | null
          title?: string
          topic?: string | null
          trainer?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "toolbox_talks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "toolbox_talks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
      audit_changed_fields: {
        Args: { new_row: Json; old_row: Json }
        Returns: string[]
      }
      can_delete_records: { Args: { company_id: string }; Returns: boolean }
      can_manage_company: { Args: { company_id: string }; Returns: boolean }
      can_manage_projects: { Args: { company_id: string }; Returns: boolean }
      can_manage_resources: { Args: { company_id: string }; Returns: boolean }
      can_manage_site_operations: {
        Args: { company_id: string }
        Returns: boolean
      }
      can_manage_team: { Args: { company_id: string }; Returns: boolean }
      can_read_company: { Args: { company_id: string }; Returns: boolean }
      can_write_documents: { Args: { company_id: string }; Returns: boolean }
      get_user_company: { Args: { _user_id: string }; Returns: string }
      get_user_role: { Args: { user_id?: string }; Returns: string }
      has_company_role: {
        Args: { allowed_roles: string[]; company_id: string }
        Returns: boolean
      }
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
