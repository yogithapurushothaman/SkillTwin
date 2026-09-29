import {
  User,
  Student,
  SkillDNAResponse,
  ResumeExtractionResponse,
  IndustryRole,
  RoleMatchResponse,
  AssessmentQuestion,
  AssessmentResultResponse,
  InterviewQuestion,
  InterviewResponse,
  PlacementReadinessResponse,
  SkillHistoryResponse,
  BatchAnalyticsResponse,
  CandidateMatchItem
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    },
    ...options
  });

  if (!res.ok) {
    const errorText = await res.text();
    let detail = errorText;
    try {
      const parsed = JSON.parse(errorText);
      detail = parsed.detail || errorText;
    } catch {}
    throw new Error(detail || `API request failed with status ${res.status}`);
  }

  return res.json();
}

export const apiService = {
  // Auth & Personas
  async getPersonas(): Promise<User[]> {
    return fetchJson<User[]>('/api/auth/personas');
  },

  async login(email: string): Promise<{ user: User; student_id?: number | null; token: string }> {
    return fetchJson('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  // Student Profile & Skill DNA
  async getStudent(studentId: number): Promise<Student> {
    return fetchJson<Student>(`/api/students/${studentId}`);
  },

  async getSkillDna(studentId: number): Promise<SkillDNAResponse> {
    return fetchJson<SkillDNAResponse>(`/api/students/${studentId}/dna`);
  },

  async getSkillHistory(studentId: number): Promise<SkillHistoryResponse> {
    return fetchJson<SkillHistoryResponse>(`/api/students/${studentId}/history`);
  },

  async getInternships(studentId: number): Promise<any[]> {
    return fetchJson<any[]>(`/api/students/${studentId}/internships`);
  },

  async addInternship(studentId: number, data: any): Promise<any> {
    return fetchJson(`/api/students/${studentId}/internships`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Resume Processing
  async extractResumeText(text: string): Promise<ResumeExtractionResponse> {
    return fetchJson<ResumeExtractionResponse>('/api/resume/extract-text', {
      method: 'POST',
      body: JSON.stringify({ text })
    });
  },

  async extractResumePdf(file: File): Promise<ResumeExtractionResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/api/resume/extract-pdf`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Failed to extract PDF');
    }

    return res.json();
  },

  async confirmExtractedSkills(studentId: number, skills: any[]): Promise<{ status: string; message: string }> {
    return fetchJson(`/api/resume/confirm/${studentId}`, {
      method: 'POST',
      body: JSON.stringify({ skills })
    });
  },

  // Blueprints
  async getBlueprints(): Promise<IndustryRole[]> {
    return fetchJson<IndustryRole[]>('/api/blueprints');
  },

  async getBlueprint(roleId: number): Promise<IndustryRole> {
    return fetchJson<IndustryRole>(`/api/blueprints/${roleId}`);
  },

  async createBlueprint(data: {
    title: string;
    company: string;
    description?: string;
    skills: Array<{ skill_name: string; required_score: number; weight: number }>;
  }): Promise<IndustryRole> {
    return fetchJson<IndustryRole>('/api/blueprints', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async cloneBlueprint(roleId: number): Promise<IndustryRole> {
    return fetchJson<IndustryRole>(`/api/blueprints/${roleId}/clone`, {
      method: 'POST'
    });
  },

  // Gap Engine
  async evaluateGap(studentId: number, roleId: number): Promise<RoleMatchResponse> {
    return fetchJson<RoleMatchResponse>(`/api/gap/${studentId}/${roleId}`);
  },

  // Assessment
  async startAssessment(
    studentId: number,
    targetRoleId?: number,
    focusSkillNames?: string[]
  ): Promise<{ assessment_id: number; student_id: number; questions: AssessmentQuestion[] }> {
    return fetchJson('/api/assessment/start', {
      method: 'POST',
      body: JSON.stringify({
        student_id: studentId,
        target_role_id: targetRoleId,
        focus_skill_names: focusSkillNames
      })
    });
  },

  async submitAssessment(
    assessmentId: number,
    studentId: number,
    answers: Array<{ question_id: number; selected_option_id: string }>
  ): Promise<AssessmentResultResponse> {
    return fetchJson<AssessmentResultResponse>('/api/assessment/submit', {
      method: 'POST',
      body: JSON.stringify({
        assessment_id: assessmentId,
        student_id: studentId,
        answers
      })
    });
  },

  // Interview
  async getInterviewQuestions(type?: 'technical' | 'hr'): Promise<InterviewQuestion[]> {
    const q = type ? `?interview_type=${type}` : '';
    return fetchJson<InterviewQuestion[]>(`/api/interview/questions${q}`);
  },

  async submitInterview(data: {
    student_id: number;
    question_id: number;
    interview_type: 'technical' | 'hr';
    student_answer: string;
  }): Promise<InterviewResponse> {
    return fetchJson<InterviewResponse>('/api/interview/submit', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Placement Readiness
  async getPlacementReadiness(studentId: number): Promise<PlacementReadinessResponse> {
    return fetchJson<PlacementReadinessResponse>(`/api/placement/${studentId}/readiness`);
  },

  // Institution Batch Analytics
  async getBatchAnalytics(params?: {
    department?: string;
    year?: number;
    role_id?: number;
  }): Promise<BatchAnalyticsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.department) searchParams.append('department', params.department);
    if (params?.year) searchParams.append('year', params.year.toString());
    if (params?.role_id) searchParams.append('role_id', params.role_id.toString());
    const q = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return fetchJson<BatchAnalyticsResponse>(`/api/institution/batch-analytics${q}`);
  },

  // Industry Recruiter Candidate Discovery
  async getCandidatesForRole(params: {
    role_id: number;
    min_match_score?: number;
    min_readiness_score?: number;
    department?: string;
  }): Promise<CandidateMatchItem[]> {
    const searchParams = new URLSearchParams();
    searchParams.append('role_id', params.role_id.toString());
    if (params.min_match_score !== undefined) {
      searchParams.append('min_match_score', params.min_match_score.toString());
    }
    if (params.min_readiness_score !== undefined) {
      searchParams.append('min_readiness_score', params.min_readiness_score.toString());
    }
    if (params.department) {
      searchParams.append('department', params.department);
    }
    return fetchJson<CandidateMatchItem[]>(`/api/industry/candidates?${searchParams.toString()}`);
  },

  async toggleShortlist(roleId: number, studentId: number): Promise<{ status: string; is_shortlisted: boolean; message: string }> {
    return fetchJson('/api/industry/shortlist', {
      method: 'POST',
      body: JSON.stringify({ role_id: roleId, student_id: studentId })
    });
  }
};
