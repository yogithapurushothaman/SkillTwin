export type UserRole = 'student' | 'academician' | 'industry' | 'admin';

export type SkillCategory = 'Technical' | 'Problem Solving' | 'Soft Skills';

export type VerificationStatus = 'verified' | 'self_declared' | 'gap';

export type ProficiencyBand = 'Basic' | 'Intermediate' | 'Advanced';

export type EvidenceSourceType = 
  | 'resume'
  | 'assessment'
  | 'tech_interview'
  | 'hr_interview'
  | 'internship'
  | 'project';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  student_id?: number | null;
  department?: string | null;
  year?: number | null;
}

export interface Student {
  id: number;
  user_id: number;
  name: string;
  email: string;
  department: string;
  year: number;
  cgpa: number;
  bio?: string | null;
  created_at: string;
}

export interface SkillEvidence {
  id: number;
  student_id: number;
  skill_id: number;
  skill_name: string;
  source: EvidenceSourceType;
  score: number;
  details_json?: any;
  ai_assisted: boolean;
  created_at: string;
}

export interface SkillDNAItem {
  skill_id: number;
  skill_name: string;
  category: SkillCategory;
  score: number;
  claimed_score: number;
  assessment_score?: number | null;
  interview_score?: number | null;
  internship_score?: number | null;
  proficiency_level: ProficiencyBand;
  verification_status: VerificationStatus;
  evidence_count: number;
  evidence_items: SkillEvidence[];
  last_updated: string;
}

export interface SkillDNAResponse {
  student_id: number;
  student_name: string;
  skills: SkillDNAItem[];
  technical_skills: SkillDNAItem[];
  problem_solving_skills: SkillDNAItem[];
  soft_skills: SkillDNAItem[];
  verified_count: number;
  self_declared_count: number;
  gap_count: number;
}

export interface ExtractedSkillItem {
  raw_term: string;
  normalized_name: string;
  category: SkillCategory;
  claimed_level: ProficiencyBand;
  claimed_score: number;
  is_recognized: boolean;
}

export interface ResumeExtractionResponse {
  student_name?: string;
  education: Array<{ degree: string; institution: string; year: string; gpa: string }>;
  projects: Array<{ title: string; description: string }>;
  certifications: string[];
  internships: Array<{ company: string; role: string; duration: string; summary: string }>;
  skills: ExtractedSkillItem[];
  unrecognized_terms: string[];
  summary: string;
}

export interface RoleSkillRequirement {
  skill_id: number;
  skill_name: string;
  category: SkillCategory;
  required_score: number;
  weight: number;
}

export interface IndustryRole {
  id: number;
  title: string;
  company: string;
  description?: string;
  is_seed: boolean;
  skills: RoleSkillRequirement[];
}

export interface SkillGapItem {
  skill_id: number;
  skill_name: string;
  category: SkillCategory;
  required_score: number;
  actual_score: number;
  deficit: number;
  weight: number;
  is_critical_gap: boolean;
  is_met: boolean;
  verification_status: VerificationStatus;
  evidence_sources: EvidenceSourceType[];
}

export interface GapCalculationStep {
  skill_name: string;
  actual: number;
  required: number;
  ratio: number;
  clamped_ratio: number;
  weight: number;
  weighted_contribution: number;
}

export interface RoleMatchResponse {
  role_id: number;
  role_title: string;
  company: string;
  overall_match_score: number;
  skills_met_count: number;
  total_skills_count: number;
  critical_gaps: SkillGapItem[];
  strong_areas: SkillGapItem[];
  all_gaps: SkillGapItem[];
  calculation_breakdown: GapCalculationStep[];
  formula_explanation: string;
  recommended_assessments: string[];
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface AssessmentQuestion {
  id: number;
  skill_id: number;
  skill_name: string;
  topic: string;
  difficulty: string;
  marks: number;
  question_text: string;
  options: QuestionOption[];
}

export interface TopicScore {
  topic: string;
  skill_name: string;
  score: number;
  total_questions: number;
  correct_questions: number;
}

export interface AssessmentResultResponse {
  assessment_id: number;
  student_id: number;
  total_score: number;
  max_score: number;
  percentage: number;
  topic_scores: TopicScore[];
  skill_updates: Array<{
    skill_id: number;
    skill_name: string;
    assessed_score: number;
    old_score: number;
    new_score: number;
    improvement: number;
  }>;
  feedback: string;
}

export interface InterviewQuestion {
  id: number;
  type: 'technical' | 'hr';
  skill: string;
  topic: string;
  question: string;
  expected_keywords: string[];
}

export interface InterviewResponse {
  id: number;
  student_id: number;
  interview_type: string;
  skill_name: string;
  question_text: string;
  student_answer: string;
  rubric_scores: {
    correctness: number;
    depth: number;
    example: number;
    clarity: number;
  };
  total_score: number;
  feedback: string;
  ai_assisted: boolean;
  created_at: string;
}

export interface PlacementComponentScore {
  name: string;
  weight: number;
  raw_score: number;
  weighted_score: number;
  status: string;
  description: string;
}

export interface PlacementReadinessResponse {
  student_id: number;
  overall_readiness_score: number;
  readiness_band: 'Industry Ready' | 'Needs Development' | 'Critical Gaps';
  readiness_band_color: string;
  components: PlacementComponentScore[];
  top_strengths: string[];
  priority_gaps: string[];
  recommended_actions: Array<{
    action: string;
    impact: string;
    urgency: string;
  }>;
  formula_explanation: string;
}

export interface SkillHistoryItem {
  id: number;
  skill_id: number;
  skill_name: string;
  old_score: number;
  new_score: number;
  delta: number;
  change_reason: string;
  created_at: string;
}

export interface SkillHistoryResponse {
  student_id: number;
  history: SkillHistoryItem[];
  progress_summary: Array<{
    skill: string;
    initial_score: number;
    current_score: number;
    improvement: number;
  }>;
}

export interface ReadinessBandCount {
  band: string;
  count: number;
  percentage: number;
  color: string;
}

export interface SkillGapRankItem {
  skill_name: string;
  category: SkillCategory;
  students_below_threshold_count: number;
  total_students: number;
  gap_percentage: number;
  average_score: number;
  industry_demand_score: number;
}

export interface BatchAnalyticsResponse {
  total_students: number;
  readiness_distribution: ReadinessBandCount[];
  common_skill_gaps: SkillGapRankItem[];
  departments: string[];
  reassessment_improvement: {
    average_improvement: number;
    students_reassessed: number;
    gap_reduction_rate: string;
    sample_trend: Array<{
      milestone: string;
      DSA: number;
      Java: number;
      SQL: number;
      Match: number;
    }>;
  };
}

export interface CandidateMatchItem {
  student_id: number;
  student_name: string;
  department: string;
  year: number;
  cgpa: number;
  match_score: number;
  readiness_score: number;
  readiness_band: string;
  verified_skills_count: number;
  total_skills_count: number;
  top_verified_skills: Array<{ name: string; score: number; status: string }>;
  critical_gaps: string[];
  is_shortlisted: boolean;
}
