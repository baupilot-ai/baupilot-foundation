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
      daily_reports: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          delays: string | null
          equipment_used: string | null
          id: string
          materials_delivered: string | null
          notes: string | null
          project_id: string
          report_date: string
          safety_notes: string | null
          site_status: string | null
          subcontractors: string | null
          temperature: number | null
          updated_at: string
          visitors: string | null
          weather_condition: string | null
          wind: string | null
          work_performed: string | null
          workers_count: number | null
          working_hours_end: string | null
          working_hours_start: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          delays?: string | null
          equipment_used?: string | null
          id?: string
          materials_delivered?: string | null
          notes?: string | null
          project_id: string
          report_date?: string
          safety_notes?: string | null
          site_status?: string | null
          subcontractors?: string | null
          temperature?: number | null
          updated_at?: string
          visitors?: string | null
          weather_condition?: string | null
          wind?: string | null
          work_performed?: string | null
          workers_count?: number | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          delays?: string | null
          equipment_used?: string | null
          id?: string
          materials_delivered?: string | null
          notes?: string | null
          project_id?: string
          report_date?: string
          safety_notes?: string | null
          site_status?: string | null
          subcontractors?: string | null
          temperature?: number | null
          updated_at?: string
          visitors?: string | null
          weather_condition?: string | null
          wind?: string | null
          work_performed?: string | null
          workers_count?: number | null
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
