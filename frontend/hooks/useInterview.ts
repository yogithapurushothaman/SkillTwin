'use client';

import { useState, useEffect } from 'react';
import { InterviewQuestion, InterviewResponse } from '@/types';
import { apiService } from '@/services/api';

export function useInterview(studentId?: number | null, onInterviewComplete?: () => void) {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion | null>(null);
  const [answerText, setAnswerText] = useState<string>('');
  const [evaluation, setEvaluation] = useState<InterviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadQuestions = async (type?: 'technical' | 'hr') => {
    try {
      setLoading(true);
      const data = await apiService.getInterviewQuestions(type);
      setQuestions(data);
      if (data.length > 0) {
        setSelectedQuestion(data[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load interview questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const submitAnswer = async () => {
    if (!studentId || !selectedQuestion || !answerText.trim()) return;
    try {
      setSubmitting(true);
      setError(null);
      const res = await apiService.submitInterview({
        student_id: studentId,
        question_id: selectedQuestion.id,
        interview_type: selectedQuestion.type,
        student_answer: answerText
      });
      setEvaluation(res);
      if (onInterviewComplete) {
        onInterviewComplete();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to evaluate interview answer');
    } finally {
      setSubmitting(false);
    }
  };

  const selectQuestionById = (id: number) => {
    const q = questions.find(item => item.id === id);
    if (q) {
      setSelectedQuestion(q);
      setAnswerText('');
      setEvaluation(null);
    }
  };

  return {
    questions,
    selectedQuestion,
    answerText,
    setAnswerText,
    evaluation,
    loading,
    submitting,
    error,
    loadQuestions,
    selectQuestionById,
    submitAnswer,
    resetEvaluation: () => {
      setEvaluation(null);
      setAnswerText('');
    }
  };
}
