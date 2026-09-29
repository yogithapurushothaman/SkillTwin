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
      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-800 gap-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              Resume Skill Extraction & Normalization
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              FR-4, FR-5, FR-6: Upload PDF or paste text. Canonical skills are strictly validated against curriculum dictionary.
            </p>
          </div>

          {/* Sub-tabs */}
          <div className="flex bg-gray-900/90 p-1 rounded-xl border border-gray-700/60 self-start">
            <button
              onClick={() => setActiveTab('paste')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'paste' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Paste Resume Text
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'upload' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Upload PDF
            </button>
          </div>
        </div>

        {/* Input Areas */}
        <div className="mt-5">
          {activeTab === 'upload' ? (
            <div className="border-2 border-dashed border-gray-700 hover:border-indigo-500/60 rounded-xl p-8 text-center transition-all bg-gray-900/30">
              <UploadCloud className="w-10 h-10 text-indigo-400 mx-auto mb-3 animate-bounce" />
              <p className="text-sm font-semibold text-white">Select PDF Resume</p>
              <p className="text-xs text-gray-400 mt-1">PyMuPDF / pypdf extracts text for structured parsing</p>
              <input
                type="file"
                accept=".pdf"
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="mt-4 text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
              />
              {file && (
                <div className="mt-2 text-xs text-emerald-400 font-medium">Selected: {file.name}</div>
              )}
            </div>
          ) : (
            <div>
              <textarea
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                rows={8}
                placeholder="Paste plain resume text here..."
                className="w-full p-4 rounded-xl bg-gray-900/80 border border-gray-700 text-gray-200 text-xs font-mono focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}

          {error && (
            <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleExtract}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Extracting & Normalizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Run SkillTwin Extraction</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Extraction Results & Review (FR-8) */}
      {extractedData && (
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-800 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-white">Extraction Results (Review & Confirm)</h4>
                <Badge variant="self_declared">Self-Declared (Provisional)</Badge>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{extractedData.summary}</p>
            </div>
            <button
              onClick={handleConfirmAndSave}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : '✓ Confirm & Save to SkillTwin'}
            </button>
          </div>

          {/* Recognized Skills Review Table */}
          <div>
            <h5 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Recognized & Normalized Curriculum Skills ({editableSkills.length})
            </h5>
            <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-800/60 text-gray-400 border-b border-gray-800 font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Raw Term in Resume</th>
                    <th className="py-2.5 px-4">Canonical Skill Name</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4">Claimed Proficiency (Editable)</th>
                    <th className="py-2.5 px-4">Provisional Score</th>
                    <th className="py-2.5 px-4">Initial Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 text-gray-300">
                  {editableSkills.map((sk, idx) => (
                    <tr key={idx} className="hover:bg-gray-800/30">
                      <td className="py-2.5 px-4 font-mono text-gray-400">"{sk.raw_term}"</td>
                      <td className="py-2.5 px-4 font-bold text-white">{sk.normalized_name}</td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-gray-800 text-[11px] text-gray-300">
                          {sk.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <select
                          value={sk.claimed_level}
                          onChange={e => updateSkillLevel(idx, e.target.value as ProficiencyBand)}
                          className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                          <option value="Basic">Basic (&lt;50)</option>
                          <option value="Intermediate">Intermediate (50–74)</option>
                          <option value="Advanced">Advanced (≥75)</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-indigo-400">{sk.claimed_score}%</td>
                      <td className="py-2.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
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
            <div className="p-4 rounded-xl bg-gray-900/80 border border-amber-500/20">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Flagged Unmapped Terms (Not Added to DNA per AI-2)</span>
              </div>
              <p className="text-[11px] text-gray-400 mb-2">
                The SkillTwin dictionary strictly rejects unverified buzzwords to ensure deterministic, bias-free scoring.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {extractedData.unrecognized_terms.map((term, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-full text-[11px] bg-gray-800 text-gray-400 border border-gray-700"
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
