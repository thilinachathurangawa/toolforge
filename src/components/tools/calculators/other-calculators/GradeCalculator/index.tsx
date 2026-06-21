'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, GraduationCap, Plus, Trash2 } from 'lucide-react';

interface Assignment {
  id: string;
  name: string;
  grade: string;
  weight: string;
}

interface Category {
  id: string;
  name: string;
  weight: string;
  assignments: Assignment[];
  dropLowest: boolean;
}

const STANDARD_GRADING_SCALE: { [letter: string]: { min: number; max: number } } = {
  'A+': { min: 97, max: 100 },
  'A': { min: 93, max: 96.99 },
  'A-': { min: 90, max: 92.99 },
  'B+': { min: 87, max: 89.99 },
  'B': { min: 83, max: 86.99 },
  'B-': { min: 80, max: 82.99 },
  'C+': { min: 77, max: 79.99 },
  'C': { min: 73, max: 76.99 },
  'C-': { min: 70, max: 72.99 },
  'D+': { min: 67, max: 69.99 },
  'D': { min: 63, max: 66.99 },
  'D-': { min: 60, max: 62.99 },
  'F': { min: 0, max: 59.99 }
};

export function GradeCalculator() {
  const [categories, setCategories] = useState<Category[]>([
    {
      id: '1',
      name: 'Tests',
      weight: '40',
      assignments: [
        { id: '1', name: 'Midterm', grade: '85', weight: '20' },
        { id: '2', name: 'Final', grade: '92', weight: '20' },
      ],
      dropLowest: false
    },
    {
      id: '2',
      name: 'Homework',
      weight: '30',
      assignments: [
        { id: '3', name: 'HW 1', grade: '95', weight: '10' },
      ],
      dropLowest: false
    }
  ]);
  const [results, setResults] = useState<{
    overallGrade: number;
    letterGrade: string;
    categoryBreakdown: { [category: string]: { grade: number; weight: number } };
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const calculateCategoryAverage = useCallback((assignments: Assignment[], dropLowest: boolean): { average: number; totalWeight: number } => {
    if (assignments.length === 0) return { average: 0, totalWeight: 0 };

    let sortedAssignments = [...assignments].map(a => ({
      ...a,
      gradeNum: parseFloat(a.grade) || 0,
      weightNum: parseFloat(a.weight) || 0
    }));

    if (dropLowest && sortedAssignments.length > 1) {
      sortedAssignments.sort((a, b) => a.gradeNum - b.gradeNum);
      sortedAssignments = sortedAssignments.slice(1);
    }

    let totalWeight = 0;
    let weightedSum = 0;

    sortedAssignments.forEach(assignment => {
      weightedSum += assignment.gradeNum * assignment.weightNum;
      totalWeight += assignment.weightNum;
    });

    const average = totalWeight > 0 ? weightedSum / totalWeight : 0;
    return { average, totalWeight };
  }, []);

  const percentageToLetterGrade = useCallback((percentage: number): string => {
    for (const [letter, range] of Object.entries(STANDARD_GRADING_SCALE)) {
      if (percentage >= range.min && percentage <= range.max) {
        return letter;
      }
    }
    return 'F';
  }, []);

  const calculateResults = useCallback(() => {
    let overallWeightedSum = 0;
    let totalWeight = 0;
    const categoryBreakdown: { [category: string]: { grade: number; weight: number } } = {};

    categories.forEach(category => {
      const { average } = calculateCategoryAverage(category.assignments, category.dropLowest);
      const weightNum = parseFloat(category.weight) || 0;

      overallWeightedSum += average * weightNum;
      totalWeight += weightNum;

      categoryBreakdown[category.name] = {
        grade: average,
        weight: weightNum
      };
    });

    const overallGrade = totalWeight > 0 ? overallWeightedSum / totalWeight : 0;
    const letterGrade = percentageToLetterGrade(overallGrade);

    setResults({
      overallGrade,
      letterGrade,
      categoryBreakdown
    });
  }, [categories, calculateCategoryAverage, percentageToLetterGrade]);

  useEffect(() => {
    calculateResults();
  }, [calculateResults]);

  const addCategory = () => {
    setCategories([
      ...categories,
      { id: Date.now().toString(), name: '', weight: '10', assignments: [], dropLowest: false }
    ]);
  };

  const removeCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const updateCategory = (id: string, field: keyof Category, value: string | boolean) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, [field]: value } : cat
    ));
  };

  const addAssignment = (categoryId: string) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? { 
            ...cat, 
            assignments: [...cat.assignments, { id: Date.now().toString(), name: '', grade: '', weight: '10' }]
          } 
        : cat
    ));
  };

  const removeAssignment = (categoryId: string, assignmentId: string) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, assignments: cat.assignments.filter(a => a.id !== assignmentId) }
        : cat
    ));
  };

  const updateAssignment = (categoryId: string, assignmentId: string, field: keyof Assignment, value: string) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? { 
            ...cat, 
            assignments: cat.assignments.map(a => 
              a.id === assignmentId ? { ...a, [field]: value } : a
            )
          } 
        : cat
    ));
  };

  const handleCopy = () => {
    if (results) {
      const result = `Current Grade: ${results.overallGrade.toFixed(2)}%\nLetter Grade: ${results.letterGrade}`;
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Categories */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-foreground">Categories</h3>
          <button
            onClick={addCategory}
            className="px-3 py-1 text-sm bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>

        {categories.map((category) => (
          <div key={category.id} className="bg-muted/30 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-foreground/60">Category Name</label>
                    <input
                      type="text"
                      value={category.name}
                      onChange={(e) => updateCategory(category.id, 'name', e.target.value)}
                      className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                      placeholder="Tests"
                    />
                  </div>
                  <div className="w-20">
                    <label className="text-xs text-foreground/60">Weight %</label>
                    <input
                      type="number"
                      value={category.weight}
                      onChange={(e) => updateCategory(category.id, 'weight', e.target.value)}
                      className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                      placeholder="40"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={category.dropLowest}
                    onChange={(e) => updateCategory(category.id, 'dropLowest', e.target.checked)}
                    className="w-4 h-4 rounded border-input bg-background text-accent focus:ring-accent/20"
                  />
                  <span className="text-xs text-foreground/60">Drop lowest grade</span>
                </label>

                {/* Assignments */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-foreground/60">Assignments</label>
                    <button
                      onClick={() => addAssignment(category.id)}
                      className="text-xs text-accent hover:text-accent/80"
                    >
                      + Add
                    </button>
                  </div>
                  {category.assignments.map((assignment) => (
                    <div key={assignment.id} className="flex gap-2 items-center">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={assignment.name}
                          onChange={(e) => updateAssignment(category.id, assignment.id, 'name', e.target.value)}
                          className="w-full px-2 py-1 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                          placeholder="Assignment name"
                        />
                      </div>
                      <div className="w-16">
                        <input
                          type="number"
                          value={assignment.grade}
                          onChange={(e) => updateAssignment(category.id, assignment.id, 'grade', e.target.value)}
                          className="w-full px-2 py-1 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                          placeholder="85"
                          min="0"
                          max="100"
                        />
                      </div>
                      <div className="w-16">
                        <input
                          type="number"
                          value={assignment.weight}
                          onChange={(e) => updateAssignment(category.id, assignment.id, 'weight', e.target.value)}
                          className="w-full px-2 py-1 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                          placeholder="10"
                          min="0"
                        />
                      </div>
                      <button
                        onClick={() => removeAssignment(category.id, assignment.id)}
                        className="p-1 text-foreground/50 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => removeCategory(category.id)}
                className="p-1 text-foreground/50 hover:text-destructive transition-colors"
                title="Remove category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
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
              <span className="text-foreground/60">Current Grade:</span>
              <span className="text-foreground font-semibold">{results.overallGrade.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Letter Grade:</span>
              <span className="text-foreground font-semibold">{results.letterGrade}</span>
            </div>
          </div>

          {Object.keys(results.categoryBreakdown).length > 0 && (
            <div className="border-t border-foreground/10 pt-3">
              <h4 className="text-xs font-medium text-foreground/60 mb-2">Category Breakdown</h4>
              <div className="space-y-1 text-xs">
                {Object.entries(results.categoryBreakdown).map(([name, data]) => (
                  <div key={name} className="flex justify-between">
                    <span className="text-foreground/60">{name}:</span>
                    <span className="text-foreground">{data.grade.toFixed(2)}% ({data.weight}%)</span>
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
