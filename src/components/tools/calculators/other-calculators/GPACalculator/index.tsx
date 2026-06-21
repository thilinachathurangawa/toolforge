'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, GraduationCap, Plus, Trash2 } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  grade: string;
  credits: string;
  type: 'regular' | 'honors' | 'ap' | 'ib';
}

const STANDARD_4_0_SCALE: { [grade: string]: number } = {
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D+': 1.3,
  'D': 1.0,
  'D-': 0.7,
  'F': 0.0
};

const COURSE_WEIGHTS: { [type: string]: number } = {
  'regular': 1.0,
  'honors': 1.05,
  'ap': 1.1,
  'ib': 1.1
};

export function GPACalculator() {
  const [gpaScale, setGpaScale] = useState<'4.0' | '5.0'>('4.0');
  const [courses, setCourses] = useState<Course[]>([
    { id: '1', name: 'Mathematics', grade: 'A', credits: '3', type: 'regular' },
    { id: '2', name: 'English', grade: 'B+', credits: '4', type: 'honors' },
  ]);
  const [previousGPA, setPreviousGPA] = useState({ gpa: '', credits: '' });
  const [results, setResults] = useState<{
    semesterGPA: number;
    cumulativeGPA: number;
    totalCredits: number;
    qualityPoints: number;
    gradeBreakdown: { [grade: string]: { count: number; credits: number } };
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const getGradePoints = useCallback((grade: string, scale: '4.0' | '5.0'): number => {
    const gradePoints = STANDARD_4_0_SCALE[grade] || 0;
    return scale === '5.0' ? gradePoints * 1.25 : gradePoints;
  }, []);

  const calculateQualityPoints = useCallback((grade: string, credits: number, type: string, scale: '4.0' | '5.0'): number => {
    const gradePoints = getGradePoints(grade, scale);
    const weight = COURSE_WEIGHTS[type] || 1.0;
    return gradePoints * credits * weight;
  }, [getGradePoints]);

  const calculateResults = useCallback(() => {
    let totalCredits = 0;
    let qualityPoints = 0;
    const gradeBreakdown: { [grade: string]: { count: number; credits: number } } = {};

    courses.forEach(course => {
      const creditsNum = parseFloat(course.credits) || 0;
      const qp = calculateQualityPoints(course.grade, creditsNum, course.type, gpaScale);
      qualityPoints += qp;
      totalCredits += creditsNum;

      if (!gradeBreakdown[course.grade]) {
        gradeBreakdown[course.grade] = { count: 0, credits: 0 };
      }
      gradeBreakdown[course.grade].count++;
      gradeBreakdown[course.grade].credits += creditsNum;
    });

    const semesterGPA = totalCredits > 0 ? qualityPoints / totalCredits : 0;

    let cumulativeGPA = semesterGPA;
    if (previousGPA.gpa && previousGPA.credits) {
      const prevGPA = parseFloat(previousGPA.gpa) || 0;
      const prevCredits = parseFloat(previousGPA.credits) || 0;
      const totalQualityPoints = qualityPoints + (prevGPA * prevCredits);
      const totalCreditsAll = totalCredits + prevCredits;
      cumulativeGPA = totalCreditsAll > 0 ? totalQualityPoints / totalCreditsAll : 0;
    }

    setResults({
      semesterGPA,
      cumulativeGPA,
      totalCredits,
      qualityPoints,
      gradeBreakdown
    });
  }, [courses, gpaScale, previousGPA, calculateQualityPoints]);

  useEffect(() => {
    calculateResults();
  }, [calculateResults]);

  const addCourse = () => {
    setCourses([
      ...courses,
      { id: Date.now().toString(), name: '', grade: 'A', credits: '3', type: 'regular' }
    ]);
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter(course => course.id !== id));
  };

  const updateCourse = (id: string, field: keyof Course, value: string | Course['type']) => {
    setCourses(courses.map(course => 
      course.id === id ? { ...course, [field]: value } : course
    ));
  };

  const handleCopy = () => {
    if (results) {
      const result = `Semester GPA: ${results.semesterGPA.toFixed(2)}\nCumulative GPA: ${results.cumulativeGPA.toFixed(2)}\nTotal Credits: ${results.totalCredits}`;
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* GPA Scale */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">GPA Scale</label>
        <div className="flex gap-2">
          {(['4.0', '5.0'] as const).map((scale) => (
            <button
              key={scale}
              onClick={() => setGpaScale(scale)}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                gpaScale === scale
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-background border border-input hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {scale} Scale
            </button>
          ))}
        </div>
      </div>

      {/* Courses */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-foreground">Courses</h3>
          <button
            onClick={addCourse}
            className="px-3 py-1 text-sm bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Course
          </button>
        </div>

        {courses.map((course) => (
          <div key={course.id} className="bg-muted/30 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 space-y-2">
                <div>
                  <label className="text-xs text-foreground/60">Course Name (optional)</label>
                  <input
                    type="text"
                    value={course.name}
                    onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                    className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    placeholder="Course name"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-foreground/60">Grade</label>
                    <select
                      value={course.grade}
                      onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                      className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    >
                      {Object.keys(STANDARD_4_0_SCALE).map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-foreground/60">Credits</label>
                    <input
                      type="number"
                      value={course.credits}
                      onChange={(e) => updateCourse(course.id, 'credits', e.target.value)}
                      className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                      min="0"
                      step="1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-foreground/60">Type</label>
                  <select
                    value={course.type}
                    onChange={(e) => updateCourse(course.id, 'type', e.target.value as Course['type'])}
                    className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  >
                    <option value="regular">Regular</option>
                    <option value="honors">Honors</option>
                    <option value="ap">AP</option>
                    <option value="ib">IB</option>
                  </select>
                </div>
              </div>
              <button
                onClick={() => removeCourse(course.id)}
                className="p-1 text-foreground/50 hover:text-destructive transition-colors"
                title="Remove course"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Previous GPA */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Previous GPA (optional)</h3>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-foreground/60">GPA</label>
            <input
              type="number"
              value={previousGPA.gpa}
              onChange={(e) => setPreviousGPA({ ...previousGPA, gpa: e.target.value })}
              className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="3.5"
              min="0"
              max="5"
              step="0.01"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-foreground/60">Credits</label>
            <input
              type="number"
              value={previousGPA.credits}
              onChange={(e) => setPreviousGPA({ ...previousGPA, credits: e.target.value })}
              className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="30"
              min="0"
              step="1"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Results
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground/60">Current Semester GPA:</span>
              <span className="text-foreground font-semibold">{results.semesterGPA.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Cumulative GPA:</span>
              <span className="text-foreground font-semibold">{results.cumulativeGPA.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Total Credits:</span>
              <span className="text-foreground">{results.totalCredits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Quality Points:</span>
              <span className="text-foreground">{results.qualityPoints.toFixed(2)}</span>
            </div>
          </div>

          {Object.keys(results.gradeBreakdown).length > 0 && (
            <div className="border-t border-foreground/10 pt-3">
              <h4 className="text-xs font-medium text-foreground/60 mb-2">Grade Breakdown</h4>
              <div className="space-y-1 text-xs">
                {Object.entries(results.gradeBreakdown).map(([grade, data]) => (
                  <div key={grade} className="flex justify-between">
                    <span className="text-foreground/60">{grade}:</span>
                    <span className="text-foreground">{data.count} course(s) ({data.credits} credits)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleCopy}
            className="w-full mt-3 px-3 py-2 text-sm bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Results'}
          </button>
        </div>
      )}
    </div>
  );
}
