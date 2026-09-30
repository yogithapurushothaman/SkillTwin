'use client';

import React, { useState } from 'react';
import { ResumeExtractionResponse, ExtractedSkillItem, ProficiencyBand } from '@/types';
import { apiService } from '@/services/api';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface ResumeUploadCardProps {
  studentId: number;
  onExtractionSuccess?: () => void;
}

export function ResumeUploadCard({ studentId, onExtractionSuccess }: ResumeUploadCardProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('paste');
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>(
`Aarav Sharma
Email: aarav.sharma@skilltwin.edu | Phone: +91 98765 43210
Education: B.Tech in Computer Science & Engineering, 2026 Batch (CGPA: 8.4)

Technical Skills:
Core Java, Object Oriented Programming, Data Structures and Algorithms (DSA), Relational Databases (SQL), Git, Problem Solving, Verbal Communication.

Projects:
1. Distributed Task Scheduling Queue: Implemented priority queue in Java with worker threads and persistent SQLite storage.
2. E-Commerce Query Optimizer: Tuned complex SQL queries, added composite B-Tree indexes, and cut query latency by 45%.

Work Experience & Internships:
Software Engineering Intern at CloudPulse Systems (May 2025 - July 2025):
- Engineered backend REST API endpoints and adhered to strict Git feature-branching conventions.
- Wrote automated unit tests and resolved memory leaks in multithreaded services.`
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<ResumeExtractionResponse | null>(null);
  const [editableSkills, setEditableSkills] = useState<ExtractedSkillItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleExtract = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      let result: ResumeExtractionResponse;
      if (activeTab === 'upload') {
        if (!file) {
          setError('Please select a PDF file first.');
          setLoading(false);
          return;
        }
        result = await apiService.extractResumePdf(file);
      } else {
        if (!resumeText.trim()) {
          setError('Please enter or paste your resume text.');
          setLoading(false);
          return;
        }
        result = await apiService.extractResumeText(resumeText);
      }

      setExtractedData(result);
      setEditableSkills(result.skills);
    } catch (err: any) {
      console.error('Resume extraction error:', err);
      setError(err.message || 'Failed to extract resume data');
    } finally {
      setLoading(false);
    }
  };

  const updateSkillLevel = (index: number, newLevel: ProficiencyBand) => {
    setEditableSkills(prev => {
      const copy = [...prev];
      const provisionalScore = newLevel === 'Advanced' ? 80 : newLevel === 'Intermediate' ? 60 : 40;
      copy[index] = {
        ...copy[index],
        claimed_level: newLevel,
        claimed_score: provisionalScore
      };
      return copy;
    });
  };

  const handleConfirmAndSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const res = await apiService.confirmExtractedSkills(studentId, editableSkills);
      setSuccessMessage(res.message);
      if (onExtractionSuccess) {
        onExtractionSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save confirmed skills');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload & Parse Box */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E7E2D9] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#E7E2D9] gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#18181B] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#D46238]" />
              Resume Skill Extraction & Normalization
            </h3>
            <p className="text-xs text-[#78716C] mt-0.5">
              Upload PDF or paste text. Canonical skills are strictly validated against curriculum dictionary.
            </p>
          </div>

          {/* Sub-tabs */}
          <div className="flex bg-[#FAF8F5] p-1 rounded-xl border border-[#E7E2D9] self-start">
            <button
              onClick={() => setActiveTab('paste')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'paste' ? 'bg-[#18181B] text-white shadow-xs' : 'text-[#68645E] hover:text-[#18181B]'
              }`}
            >
              Paste Text
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'upload' ? 'bg-[#18181B] text-white shadow-xs' : 'text-[#68645E] hover:text-[#18181B]'
              }`}
            >
              Upload PDF
            </button>
          </div>
        </div>

        {/* Input Areas */}
        <div className="mt-5">
          {activeTab === 'upload' ? (
            <div className="border-2 border-dashed border-[#DDD6CA] hover:border-[#18181B] rounded-2xl p-8 text-center transition-all bg-[#FAF8F5]/60">
              <UploadCloud className="w-10 h-10 text-[#78716C] mx-auto mb-3" />
              <p className="text-sm font-semibold text-[#18181B]">Select PDF Resume</p>
              <p className="text-xs text-[#78716C] mt-1">PyMuPDF / pypdf extracts text for structured parsing</p>
              <input
                type="file"
                accept=".pdf"
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="mt-4 text-xs text-[#78716C] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#18181B] file:text-white hover:file:bg-[#2E2E33] cursor-pointer"
              />
              {file && (
                <div className="mt-2 text-xs text-[#24482B] font-medium font-mono">Selected: {file.name}</div>
              )}
            </div>
          ) : (
            <div>
              <textarea
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                rows={8}
                placeholder="Paste plain resume text here..."
                className="w-full p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E2D9] text-[#18181B] text-xs font-mono focus:border-[#18181B] focus:bg-white focus:outline-none"
              />
            </div>
          )}

          {error && (
            <div className="mt-3 p-3 rounded-lg bg-[#FDF1EE] border border-[#F4CDC4] text-[#B0432E] text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mt-3 p-3 rounded-lg bg-[#EDF3EE] border border-[#CFDEC2] text-[#24482B] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleExtract}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#D46238] hover:bg-[#BC4E26] text-white font-semibold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Extracting & Normalizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Run SkillTwin Extraction</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Extraction Results & Review (FR-8) */}
      {extractedData && (
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E7E2D9] space-y-6 shadow-xs animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-[#E7E2D9] gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-[#18181B]">Extraction Results (Review & Confirm)</h4>
                <Badge variant="self_declared">Self-Declared (Provisional)</Badge>
              </div>
              <p className="text-xs text-[#78716C] mt-0.5">{extractedData.summary}</p>
            </div>
            <button
              onClick={handleConfirmAndSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-[#18181B] hover:bg-[#2E2E33] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : '✓ Confirm & Save to SkillTwin'}
            </button>
          </div>

          {/* Recognized Skills Review Table */}
          <div>
            <h5 className="text-xs font-mono font-bold text-[#78716C] uppercase tracking-[0.16em] mb-2.5">
              Recognized & Normalized Curriculum Skills ({editableSkills.length})
            </h5>
            <div className="overflow-x-auto rounded-xl border border-[#E7E2D9]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-[#78716C] border-b border-[#E7E2D9] font-semibold font-mono">
                  <tr>
                    <th className="py-2.5 px-4">Raw Term</th>
                    <th className="py-2.5 px-4">Canonical Skill</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4">Claimed Proficiency</th>
                    <th className="py-2.5 px-4">Provisional Score</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E2D9] text-[#18181B]">
                  {editableSkills.map((sk, idx) => (
                    <tr key={idx} className="hover:bg-[#FAF8F5]/60">
                      <td className="py-2.5 px-4 font-mono text-[#78716C]">"{sk.raw_term}"</td>
                      <td className="py-2.5 px-4 font-bold text-[#18181B]">{sk.normalized_name}</td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E7E2D9] text-[11px] text-[#57534E]">
                          {sk.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <select
                          value={sk.claimed_level}
                          onChange={e => updateSkillLevel(idx, e.target.value as ProficiencyBand)}
                          className="bg-white border border-[#DDD6CA] rounded-lg px-2 py-1 text-xs text-[#18181B] focus:outline-none focus:border-[#18181B] cursor-pointer"
                        >
                          <option value="Basic">Basic (&lt;50)</option>
                          <option value="Intermediate">Intermediate (50–74)</option>
                          <option value="Advanced">Advanced (≥75)</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-4 font-bold font-mono text-[#D46238]">{sk.claimed_score}%</td>
                      <td className="py-2.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#8A5C1E] font-medium">
                          🟡 Self-Declared
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Unmapped Buzzwords / Terms Section (AI-2, FR-6) */}
          {extractedData.unrecognized_terms.length > 0 && (
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E2D9]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#8A5C1E] mb-1">
                <AlertTriangle className="w-4 h-4 text-[#B47D1C]" />
                <span>Flagged Unmapped Terms (Not Added to DNA per AI-2)</span>
              </div>
              <p className="text-[11px] text-[#78716C] mb-2">
                The SkillTwin dictionary strictly rejects unverified buzzwords to ensure deterministic, bias-free scoring.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {extractedData.unrecognized_terms.map((term, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-full text-[11px] bg-white text-[#78716C] border border-[#DDD6CA] font-mono"
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
