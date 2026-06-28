'use client';

import React, { useState, useMemo } from 'react';
import { Copy, Check, Search, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FunctionInfo {
  name: string;
  category: string;
  description: string;
  syntax: string;
  arguments: Array<{ name: string; description: string }>;
}

// Import the same function database from Excel Formula Explainer
const EXCEL_FUNCTIONS: Record<string, FunctionInfo> = {
  // Lookup & Reference
  VLOOKUP: {
    name: 'VLOOKUP',
    category: 'Lookup & Reference',
    description: 'Searches for a value in the first column of a table and returns a value in the same row from a specified column.',
    syntax: 'VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])',
    arguments: [
      { name: 'lookup_value', description: 'The value to search for in the first column' },
      { name: 'table_array', description: 'The range of cells containing the data' },
      { name: 'col_index_num', description: 'The column number in the table from which to retrieve the value' },
      { name: 'range_lookup', description: 'TRUE for approximate match, FALSE for exact match (optional)' },
    ],
  },
  HLOOKUP: {
    name: 'HLOOKUP',
    category: 'Lookup & Reference',
    description: 'Searches for a value in the top row of a table and returns a value in the same column from a specified row.',
    syntax: 'HLOOKUP(lookup_value, table_array, row_index_num, [range_lookup])',
    arguments: [
      { name: 'lookup_value', description: 'The value to search for in the first row' },
      { name: 'table_array', description: 'The range of cells containing the data' },
      { name: 'row_index_num', description: 'The row number in the table from which to retrieve the value' },
      { name: 'range_lookup', description: 'TRUE for approximate match, FALSE for exact match (optional)' },
    ],
  },
  INDEX: {
    name: 'INDEX',
    category: 'Lookup & Reference',
    description: 'Returns the value of a cell in a specified row and column of a range.',
    syntax: 'INDEX(array, row_num, [column_num])',
    arguments: [
      { name: 'array', description: 'The range of cells or array' },
      { name: 'row_num', description: 'The row number in the array' },
      { name: 'column_num', description: 'The column number in the array (optional)' },
    ],
  },
  MATCH: {
    name: 'MATCH',
    category: 'Lookup & Reference',
    description: 'Searches for a specified item in a range of cells and returns the relative position.',
    syntax: 'MATCH(lookup_value, lookup_array, [match_type])',
    arguments: [
      { name: 'lookup_value', description: 'The value to search for' },
      { name: 'lookup_array', description: 'The range of cells to search' },
      { name: 'match_type', description: '1 for less than, 0 for exact match, -1 for greater than (optional)' },
    ],
  },
  XLOOKUP: {
    name: 'XLOOKUP',
    category: 'Lookup & Reference',
    description: 'Searches a range or array for a specified value and returns the corresponding value from another range.',
    syntax: 'XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode])',
    arguments: [
      { name: 'lookup_value', description: 'The value to search for' },
      { name: 'lookup_array', description: 'The array or range to search' },
      { name: 'return_array', description: 'The array or range to return values from' },
      { name: 'if_not_found', description: 'Value to return if no match is found (optional)' },
      { name: 'match_mode', description: '0 for exact match, -1 for exact or next smaller, 1 for exact or next larger (optional)' },
      { name: 'search_mode', description: '1 for first-to-last, -1 for last-to-first (optional)' },
    ],
  },
  XMATCH: {
    name: 'XMATCH',
    category: 'Lookup & Reference',
    description: 'Returns the relative position of an item in an array.',
    syntax: 'XMATCH(lookup_value, lookup_array, [match_mode], [search_mode])',
    arguments: [
      { name: 'lookup_value', description: 'The value to search for' },
      { name: 'lookup_array', description: 'The array or range to search' },
      { name: 'match_mode', description: '0 for exact match, -1 for exact or next smaller, 1 for exact or next larger (optional)' },
      { name: 'search_mode', description: '1 for first-to-last, -1 for last-to-first (optional)' },
    ],
  },
  INDIRECT: {
    name: 'INDIRECT',
    category: 'Lookup & Reference',
    description: 'Returns the reference specified by a text string.',
    syntax: 'INDIRECT(ref_text, [a1])',
    arguments: [
      { name: 'ref_text', description: 'A reference to a cell containing an A1-style reference or R1C1-style reference' },
      { name: 'a1', description: 'TRUE for A1-style reference, FALSE for R1C1-style (optional)' },
    ],
  },
  OFFSET: {
    name: 'OFFSET',
    category: 'Lookup & Reference',
    description: 'Returns a reference to a range that is offset from a starting cell or range.',
    syntax: 'OFFSET(reference, rows, cols, [height], [width])',
    arguments: [
      { name: 'reference', description: 'The starting cell or range' },
      { name: 'rows', description: 'Number of rows to offset (positive for down, negative for up)' },
      { name: 'cols', description: 'Number of columns to offset (positive for right, negative for left)' },
      { name: 'height', description: 'Height of the returned range in rows (optional)' },
      { name: 'width', description: 'Width of the returned range in columns (optional)' },
    ],
  },

  // Logical
  IF: {
    name: 'IF',
    category: 'Logical',
    description: 'Returns one value if a condition is true and another value if it is false.',
    syntax: 'IF(logical_test, value_if_true, [value_if_false])',
    arguments: [
      { name: 'logical_test', description: 'The condition to evaluate' },
      { name: 'value_if_true', description: 'Value to return if condition is true' },
      { name: 'value_if_false', description: 'Value to return if condition is false (optional)' },
    ],
  },
  AND: {
    name: 'AND',
    category: 'Logical',
    description: 'Returns TRUE if all arguments are true, and FALSE otherwise.',
    syntax: 'AND(logical1, [logical2], ...)',
    arguments: [
      { name: 'logical1', description: 'First condition to evaluate' },
      { name: 'logical2', description: 'Additional conditions to evaluate (optional)' },
    ],
  },
  OR: {
    name: 'OR',
    category: 'Logical',
    description: 'Returns TRUE if any argument is true, and FALSE otherwise.',
    syntax: 'OR(logical1, [logical2], ...)',
    arguments: [
      { name: 'logical1', description: 'First condition to evaluate' },
      { name: 'logical2', description: 'Additional conditions to evaluate (optional)' },
    ],
  },
  NOT: {
    name: 'NOT',
    category: 'Logical',
    description: 'Reverses the logic of its argument.',
    syntax: 'NOT(logical)',
    arguments: [
      { name: 'logical', description: 'The value or condition to reverse' },
    ],
  },
  IFERROR: {
    name: 'IFERROR',
    category: 'Logical',
    description: 'Returns a value you specify if a formula evaluates to an error; otherwise returns the result of the formula.',
    syntax: 'IFERROR(value, value_if_error)',
    arguments: [
      { name: 'value', description: 'The argument to check for an error' },
      { name: 'value_if_error', description: 'Value to return if an error is found' },
    ],
  },
  IFNA: {
    name: 'IFNA',
    category: 'Logical',
    description: 'Returns the value you specify if the expression resolves to #N/A; otherwise returns the result of the expression.',
    syntax: 'IFNA(value, value_if_na)',
    arguments: [
      { name: 'value', description: 'The argument to check for #N/A' },
      { name: 'value_if_na', description: 'Value to return if #N/A is found' },
    ],
  },
  IFS: {
    name: 'IFS',
    category: 'Logical',
    description: 'Checks whether one or more conditions are met and returns a value that corresponds to the first TRUE condition.',
    syntax: 'IFS(logical_test1, value_if_true1, [logical_test2, value_if_true2], ...)',
    arguments: [
      { name: 'logical_test1', description: 'First condition to evaluate' },
      { name: 'value_if_true1', description: 'Value to return if first condition is true' },
      { name: 'logical_test2', description: 'Second condition to evaluate (optional)' },
      { name: 'value_if_true2', description: 'Value to return if second condition is true (optional)' },
    ],
  },
  SWITCH: {
    name: 'SWITCH',
    category: 'Logical',
    description: 'Evaluates an expression against a list of values and returns the result corresponding to the first matching value.',
    syntax: 'SWITCH(expression, value1, result1, [default_or_value2, result2], ...)',
    arguments: [
      { name: 'expression', description: 'The expression to evaluate' },
      { name: 'value1', description: 'First value to compare against expression' },
      { name: 'result1', description: 'Result to return if expression matches value1' },
      { name: 'default_or_value2', description: 'Default result or second value to compare (optional)' },
      { name: 'result2', description: 'Result to return if expression matches value2 (optional)' },
    ],
  },

  // Text
  CONCATENATE: {
    name: 'CONCATENATE',
    category: 'Text',
    description: 'Joins two or more text strings into one string.',
    syntax: 'CONCATENATE(text1, [text2], ...)',
    arguments: [
      { name: 'text1', description: 'First text string to join' },
      { name: 'text2', description: 'Additional text strings to join (optional)' },
    ],
  },
  LEFT: {
    name: 'LEFT',
    category: 'Text',
    description: 'Returns the specified number of characters from the start of a text string.',
    syntax: 'LEFT(text, [num_chars])',
    arguments: [
      { name: 'text', description: 'The text string to extract from' },
      { name: 'num_chars', description: 'Number of characters to extract (optional, defaults to 1)' },
    ],
  },
  RIGHT: {
    name: 'RIGHT',
    category: 'Text',
    description: 'Returns the specified number of characters from the end of a text string.',
    syntax: 'RIGHT(text, [num_chars])',
    arguments: [
      { name: 'text', description: 'The text string to extract from' },
      { name: 'num_chars', description: 'Number of characters to extract (optional, defaults to 1)' },
    ],
  },
  MID: {
    name: 'MID',
    category: 'Text',
    description: 'Returns a specific number of characters from a text string, starting at a specified position.',
    syntax: 'MID(text, start_num, num_chars)',
    arguments: [
      { name: 'text', description: 'The text string to extract from' },
      { name: 'start_num', description: 'Position of the first character to extract' },
      { name: 'num_chars', description: 'Number of characters to extract' },
    ],
  },
  LEN: {
    name: 'LEN',
    category: 'Text',
    description: 'Returns the number of characters in a text string.',
    syntax: 'LEN(text)',
    arguments: [
      { name: 'text', description: 'The text string to count characters in' },
    ],
  },
  TRIM: {
    name: 'TRIM',
    category: 'Text',
    description: 'Removes all spaces from text except for single spaces between words.',
    syntax: 'TRIM(text)',
    arguments: [
      { name: 'text', description: 'The text string to remove extra spaces from' },
    ],
  },
  UPPER: {
    name: 'UPPER',
    category: 'Text',
    description: 'Converts text to uppercase.',
    syntax: 'UPPER(text)',
    arguments: [
      { name: 'text', description: 'The text string to convert to uppercase' },
    ],
  },
  LOWER: {
    name: 'LOWER',
    category: 'Text',
    description: 'Converts text to lowercase.',
    syntax: 'LOWER(text)',
    arguments: [
      { name: 'text', description: 'The text string to convert to lowercase' },
    ],
  },
  PROPER: {
    name: 'PROPER',
    category: 'Text',
    description: 'Capitalizes the first letter of each word and converts all other letters to lowercase.',
    syntax: 'PROPER(text)',
    arguments: [
      { name: 'text', description: 'The text string to convert to proper case' },
    ],
  },
  TEXT: {
    name: 'TEXT',
    category: 'Text',
    description: 'Converts a value to text in a specified number format.',
    syntax: 'TEXT(value, format_text)',
    arguments: [
      { name: 'value', description: 'The value to convert to text' },
      { name: 'format_text', description: 'The format code to apply' },
    ],
  },
  SUBSTITUTE: {
    name: 'SUBSTITUTE',
    category: 'Text',
    description: 'Replaces existing text with new text in a text string.',
    syntax: 'SUBSTITUTE(text, old_text, new_text, [instance_num])',
    arguments: [
      { name: 'text', description: 'The text string to modify' },
      { name: 'old_text', description: 'The text to replace' },
      { name: 'new_text', description: 'The replacement text' },
      { name: 'instance_num', description: 'Which occurrence to replace (optional, replaces all if omitted)' },
    ],
  },
  REPLACE: {
    name: 'REPLACE',
    category: 'Text',
    description: 'Replaces part of a text string based on the number of characters you specify.',
    syntax: 'REPLACE(old_text, start_num, num_chars, new_text)',
    arguments: [
      { name: 'old_text', description: 'The text string to modify' },
      { name: 'start_num', description: 'Position of the first character to replace' },
      { name: 'num_chars', description: 'Number of characters to replace' },
      { name: 'new_text', description: 'The replacement text' },
    ],
  },
  FIND: {
    name: 'FIND',
    category: 'Text',
    description: 'Returns the starting position of one text string within another (case-sensitive).',
    syntax: 'FIND(find_text, within_text, [start_num])',
    arguments: [
      { name: 'find_text', description: 'The text to find' },
      { name: 'within_text', description: 'The text to search within' },
      { name: 'start_num', description: 'Character position to start from (optional)' },
    ],
  },
  SEARCH: {
    name: 'SEARCH',
    category: 'Text',
    description: 'Returns the starting position of one text string within another (not case-sensitive).',
    syntax: 'SEARCH(find_text, within_text, [start_num])',
    arguments: [
      { name: 'find_text', description: 'The text to find' },
      { name: 'within_text', description: 'The text to search within' },
      { name: 'start_num', description: 'Character position to start from (optional)' },
    ],
  },

  // Math & Trig
  SUM: {
    name: 'SUM',
    category: 'Math & Trig',
    description: 'Adds all the numbers in a range of cells.',
    syntax: 'SUM(number1, [number2], ...)',
    arguments: [
      { name: 'number1', description: 'First number or range to add' },
      { name: 'number2', description: 'Additional numbers or ranges to add (optional)' },
    ],
  },
  SUMIF: {
    name: 'SUMIF',
    category: 'Math & Trig',
    description: 'Adds the values in a range that meet criteria you specify.',
    syntax: 'SUMIF(range, criteria, [sum_range])',
    arguments: [
      { name: 'range', description: 'The range of cells to evaluate against criteria' },
      { name: 'criteria', description: 'The condition that determines which cells to sum' },
      { name: 'sum_range', description: 'The actual cells to sum (optional, uses range if omitted)' },
    ],
  },
  SUMIFS: {
    name: 'SUMIFS',
    category: 'Math & Trig',
    description: 'Adds the values in a range that meet multiple criteria.',
    syntax: 'SUMIFS(sum_range, criteria_range1, criteria1, [criteria_range2, criteria2], ...)',
    arguments: [
      { name: 'sum_range', description: 'The range of cells to sum' },
      { name: 'criteria_range1', description: 'First range to evaluate' },
      { name: 'criteria1', description: 'First condition to meet' },
      { name: 'criteria_range2', description: 'Second range to evaluate (optional)' },
      { name: 'criteria2', description: 'Second condition to meet (optional)' },
    ],
  },
  AVERAGE: {
    name: 'AVERAGE',
    category: 'Math & Trig',
    description: 'Returns the average (arithmetic mean) of the arguments.',
    syntax: 'AVERAGE(number1, [number2], ...)',
    arguments: [
      { name: 'number1', description: 'First number or range to average' },
      { name: 'number2', description: 'Additional numbers or ranges to average (optional)' },
    ],
  },
  AVERAGEIF: {
    name: 'AVERAGEIF',
    category: 'Math & Trig',
    description: 'Returns the average of all the cells in a range that meet a given criteria.',
    syntax: 'AVERAGEIF(range, criteria, [average_range])',
    arguments: [
      { name: 'range', description: 'The range of cells to evaluate against criteria' },
      { name: 'criteria', description: 'The condition that determines which cells to average' },
      { name: 'average_range', description: 'The actual cells to average (optional, uses range if omitted)' },
    ],
  },
  AVERAGEIFS: {
    name: 'AVERAGEIFS',
    category: 'Math & Trig',
    description: 'Returns the average of cells that meet multiple criteria.',
    syntax: 'AVERAGEIFS(average_range, criteria_range1, criteria1, [criteria_range2, criteria2], ...)',
    arguments: [
      { name: 'average_range', description: 'The range of cells to average' },
      { name: 'criteria_range1', description: 'First range to evaluate' },
      { name: 'criteria1', description: 'First condition to meet' },
      { name: 'criteria_range2', description: 'Second range to evaluate (optional)' },
      { name: 'criteria2', description: 'Second condition to meet (optional)' },
    ],
  },
  COUNT: {
    name: 'COUNT',
    category: 'Math & Trig',
    description: 'Counts the number of cells that contain numbers.',
    syntax: 'COUNT(value1, [value2], ...)',
    arguments: [
      { name: 'value1', description: 'First item, cell reference, or range to count' },
      { name: 'value2', description: 'Additional items, cell references, or ranges (optional)' },
    ],
  },
  COUNTA: {
    name: 'COUNTA',
    category: 'Math & Trig',
    description: 'Counts the number of cells that are not empty.',
    syntax: 'COUNTA(value1, [value2], ...)',
    arguments: [
      { name: 'value1', description: 'First item, cell reference, or range to count' },
      { name: 'value2', description: 'Additional items, cell references, or ranges (optional)' },
    ],
  },
  COUNTIF: {
    name: 'COUNTIF',
    category: 'Math & Trig',
    description: 'Counts the number of cells within a range that meet a given condition.',
    syntax: 'COUNTIF(range, criteria)',
    arguments: [
      { name: 'range', description: 'The range of cells to count' },
      { name: 'criteria', description: 'The condition that determines which cells to count' },
    ],
  },
  COUNTIFS: {
    name: 'COUNTIFS',
    category: 'Math & Trig',
    description: 'Counts the number of cells within a range that meet multiple conditions.',
    syntax: 'COUNTIFS(criteria_range1, criteria1, [criteria_range2, criteria2], ...)',
    arguments: [
      { name: 'criteria_range1', description: 'First range to evaluate' },
      { name: 'criteria1', description: 'First condition to meet' },
      { name: 'criteria_range2', description: 'Second range to evaluate (optional)' },
      { name: 'criteria2', description: 'Second condition to meet (optional)' },
    ],
  },
  ROUND: {
    name: 'ROUND',
    category: 'Math & Trig',
    description: 'Rounds a number to a specified number of digits.',
    syntax: 'ROUND(number, num_digits)',
    arguments: [
      { name: 'number', description: 'The number to round' },
      { name: 'num_digits', description: 'Number of digits to round to (positive for decimals, negative for whole numbers)' },
    ],
  },
  ROUNDUP: {
    name: 'ROUNDUP',
    category: 'Math & Trig',
    description: 'Rounds a number up, away from zero.',
    syntax: 'ROUNDUP(number, num_digits)',
    arguments: [
      { name: 'number', description: 'The number to round up' },
      { name: 'num_digits', description: 'Number of digits to round up to' },
    ],
  },
  ROUNDDOWN: {
    name: 'ROUNDDOWN',
    category: 'Math & Trig',
    description: 'Rounds a number down, toward zero.',
    syntax: 'ROUNDDOWN(number, num_digits)',
    arguments: [
      { name: 'number', description: 'The number to round down' },
      { name: 'num_digits', description: 'Number of digits to round down to' },
    ],
  },
  INT: {
    name: 'INT',
    category: 'Math & Trig',
    description: 'Rounds a number down to the nearest integer.',
    syntax: 'INT(number)',
    arguments: [
      { name: 'number', description: 'The number to round down to an integer' },
    ],
  },
  MOD: {
    name: 'MOD',
    category: 'Math & Trig',
    description: 'Returns the remainder after division.',
    syntax: 'MOD(number, divisor)',
    arguments: [
      { name: 'number', description: 'The number to divide' },
      { name: 'divisor', description: 'The number to divide by' },
    ],
  },
  ABS: {
    name: 'ABS',
    category: 'Math & Trig',
    description: 'Returns the absolute value of a number.',
    syntax: 'ABS(number)',
    arguments: [
      { name: 'number', description: 'The number to get the absolute value of' },
    ],
  },
  POWER: {
    name: 'POWER',
    category: 'Math & Trig',
    description: 'Returns the result of a number raised to a power.',
    syntax: 'POWER(number, power)',
    arguments: [
      { name: 'number', description: 'The base number' },
      { name: 'power', description: 'The exponent' },
    ],
  },
  SQRT: {
    name: 'SQRT',
    category: 'Math & Trig',
    description: 'Returns a positive square root.',
    syntax: 'SQRT(number)',
    arguments: [
      { name: 'number', description: 'The number to get the square root of' },
    ],
  },

  // Date & Time
  TODAY: {
    name: 'TODAY',
    category: 'Date & Time',
    description: 'Returns the current date.',
    syntax: 'TODAY()',
    arguments: [],
  },
  NOW: {
    name: 'NOW',
    category: 'Date & Time',
    description: 'Returns the current date and time.',
    syntax: 'NOW()',
    arguments: [],
  },
  DATE: {
    name: 'DATE',
    category: 'Date & Time',
    description: 'Returns the serial number of a particular date.',
    syntax: 'DATE(year, month, day)',
    arguments: [
      { name: 'year', description: 'The year of the date' },
      { name: 'month', description: 'The month of the date' },
      { name: 'day', description: 'The day of the date' },
    ],
  },
  TIME: {
    name: 'TIME',
    category: 'Date & Time',
    description: 'Returns the serial number of a particular time.',
    syntax: 'TIME(hour, minute, second)',
    arguments: [
      { name: 'hour', description: 'The hour of the time (0-23)' },
      { name: 'minute', description: 'The minute of the time (0-59)' },
      { name: 'second', description: 'The second of the time (0-59)' },
    ],
  },
  DATEDIF: {
    name: 'DATEDIF',
    category: 'Date & Time',
    description: 'Calculates the number of days, months, or years between two dates.',
    syntax: 'DATEDIF(start_date, end_date, unit)',
    arguments: [
      { name: 'start_date', description: 'The starting date' },
      { name: 'end_date', description: 'The ending date' },
      { name: 'unit', description: 'The unit of time: "Y" for years, "M" for months, "D" for days' },
    ],
  },
  EOMONTH: {
    name: 'EOMONTH',
    category: 'Date & Time',
    description: 'Returns the serial number of the last day of the month before or after a specified number of months.',
    syntax: 'EOMONTH(start_date, months)',
    arguments: [
      { name: 'start_date', description: 'The starting date' },
      { name: 'months', description: 'Number of months before (negative) or after (positive) the start date' },
    ],
  },
  EDATE: {
    name: 'EDATE',
    category: 'Date & Time',
    description: 'Returns the serial number of the date that is the indicated number of months before or after the start date.',
    syntax: 'EDATE(start_date, months)',
    arguments: [
      { name: 'start_date', description: 'The starting date' },
      { name: 'months', description: 'Number of months before (negative) or after (positive) the start date' },
    ],
  },
  YEAR: {
    name: 'YEAR',
    category: 'Date & Time',
    description: 'Returns the year of a date.',
    syntax: 'YEAR(serial_number)',
    arguments: [
      { name: 'serial_number', description: 'The date to extract the year from' },
    ],
  },
  MONTH: {
    name: 'MONTH',
    category: 'Date & Time',
    description: 'Returns the month of a date (1-12).',
    syntax: 'MONTH(serial_number)',
    arguments: [
      { name: 'serial_number', description: 'The date to extract the month from' },
    ],
  },
  DAY: {
    name: 'DAY',
    category: 'Date & Time',
    description: 'Returns the day of a date (1-31).',
    syntax: 'DAY(serial_number)',
    arguments: [
      { name: 'serial_number', description: 'The date to extract the day from' },
    ],
  },
  HOUR: {
    name: 'HOUR',
    category: 'Date & Time',
    description: 'Returns the hour of a time value (0-23).',
    syntax: 'HOUR(serial_number)',
    arguments: [
      { name: 'serial_number', description: 'The time to extract the hour from' },
    ],
  },
  MINUTE: {
    name: 'MINUTE',
    category: 'Date & Time',
    description: 'Returns the minute of a time value (0-59).',
    syntax: 'MINUTE(serial_number)',
    arguments: [
      { name: 'serial_number', description: 'The time to extract the minute from' },
    ],
  },
  SECOND: {
    name: 'SECOND',
    category: 'Date & Time',
    description: 'Returns the second of a time value (0-59).',
    syntax: 'SECOND(serial_number)',
    arguments: [
      { name: 'serial_number', description: 'The time to extract the second from' },
    ],
  },

  // Financial
  PV: {
    name: 'PV',
    category: 'Financial',
    description: 'Calculates the present value of an investment or loan.',
    syntax: 'PV(rate, nper, pmt, [fv], [type])',
    arguments: [
      { name: 'rate', description: 'Interest rate per period' },
      { name: 'nper', description: 'Total number of payment periods' },
      { name: 'pmt', description: 'Payment made each period' },
      { name: 'fv', description: 'Future value (optional, defaults to 0)' },
      { name: 'type', description: 'Payment timing: 0 for end of period, 1 for beginning (optional)' },
    ],
  },
  FV: {
    name: 'FV',
    category: 'Financial',
    description: 'Calculates the future value of an investment.',
    syntax: 'FV(rate, nper, pmt, [pv], [type])',
    arguments: [
      { name: 'rate', description: 'Interest rate per period' },
      { name: 'nper', description: 'Total number of payment periods' },
      { name: 'pmt', description: 'Payment made each period' },
      { name: 'pv', description: 'Present value (optional, defaults to 0)' },
      { name: 'type', description: 'Payment timing: 0 for end of period, 1 for beginning (optional)' },
    ],
  },
  PMT: {
    name: 'PMT',
    category: 'Financial',
    description: 'Calculates the payment for a loan or investment.',
    syntax: 'PMT(rate, nper, pv, [fv], [type])',
    arguments: [
      { name: 'rate', description: 'Interest rate per period' },
      { name: 'nper', description: 'Total number of payment periods' },
      { name: 'pv', description: 'Present value (loan amount)' },
      { name: 'fv', description: 'Future value (optional, defaults to 0)' },
      { name: 'type', description: 'Payment timing: 0 for end of period, 1 for beginning (optional)' },
    ],
  },
  RATE: {
    name: 'RATE',
    category: 'Financial',
    description: 'Calculates the interest rate per period of an annuity.',
    syntax: 'RATE(nper, pmt, pv, [fv], [type], [guess])',
    arguments: [
      { name: 'nper', description: 'Total number of payment periods' },
      { name: 'pmt', description: 'Payment made each period' },
      { name: 'pv', description: 'Present value' },
      { name: 'fv', description: 'Future value (optional, defaults to 0)' },
      { name: 'type', description: 'Payment timing: 0 for end of period, 1 for beginning (optional)' },
      { name: 'guess', description: 'Your guess for the rate (optional, defaults to 0.1)' },
    ],
  },
  NPER: {
    name: 'NPER',
    category: 'Financial',
    description: 'Calculates the number of periods for an investment or loan.',
    syntax: 'NPER(rate, pmt, pv, [fv], [type])',
    arguments: [
      { name: 'rate', description: 'Interest rate per period' },
      { name: 'pmt', description: 'Payment made each period' },
      { name: 'pv', description: 'Present value' },
      { name: 'fv', description: 'Future value (optional, defaults to 0)' },
      { name: 'type', description: 'Payment timing: 0 for end of period, 1 for beginning (optional)' },
    ],
  },
  NPV: {
    name: 'NPV',
    category: 'Financial',
    description: 'Calculates the net present value of an investment.',
    syntax: 'NPV(rate, value1, [value2], ...)',
    arguments: [
      { name: 'rate', description: 'Discount rate over one period' },
      { name: 'value1', description: 'First cash flow' },
      { name: 'value2', description: 'Additional cash flows (optional)' },
    ],
  },
  IRR: {
    name: 'IRR',
    category: 'Financial',
    description: 'Calculates the internal rate of return for a series of cash flows.',
    syntax: 'IRR(values, [guess])',
    arguments: [
      { name: 'values', description: 'Array or range of cash flows' },
      { name: 'guess', description: 'Your guess for the IRR (optional, defaults to 0.1)' },
    ],
  },

  // Statistical
  MAX: {
    name: 'MAX',
    category: 'Statistical',
    description: 'Returns the maximum value in a set of values.',
    syntax: 'MAX(number1, [number2], ...)',
    arguments: [
      { name: 'number1', description: 'First number or range' },
      { name: 'number2', description: 'Additional numbers or ranges (optional)' },
    ],
  },
  MIN: {
    name: 'MIN',
    category: 'Statistical',
    description: 'Returns the minimum value in a set of values.',
    syntax: 'MIN(number1, [number2], ...)',
    arguments: [
      { name: 'number1', description: 'First number or range' },
      { name: 'number2', description: 'Additional numbers or ranges (optional)' },
    ],
  },
  MEDIAN: {
    name: 'MEDIAN',
    category: 'Statistical',
    description: 'Returns the median of the given numbers.',
    syntax: 'MEDIAN(number1, [number2], ...)',
    arguments: [
      { name: 'number1', description: 'First number or range' },
      { name: 'number2', description: 'Additional numbers or ranges (optional)' },
    ],
  },
  MODE: {
    name: 'MODE',
    category: 'Statistical',
    description: 'Returns the most frequently occurring value in a set of data.',
    syntax: 'MODE(number1, [number2], ...)',
    arguments: [
      { name: 'number1', description: 'First number or range' },
      { name: 'number2', description: 'Additional numbers or ranges (optional)' },
    ],
  },
  STDEV: {
    name: 'STDEV',
    category: 'Statistical',
    description: 'Estimates standard deviation based on a sample.',
    syntax: 'STDEV(number1, [number2], ...)',
    arguments: [
      { name: 'number1', description: 'First number or range' },
      { name: 'number2', description: 'Additional numbers or ranges (optional)' },
    ],
  },
  VAR: {
    name: 'VAR',
    category: 'Statistical',
    description: 'Estimates variance based on a sample.',
    syntax: 'VAR(number1, [number2], ...)',
    arguments: [
      { name: 'number1', description: 'First number or range' },
      { name: 'number2', description: 'Additional numbers or ranges (optional)' },
    ],
  },
  RANK: {
    name: 'RANK',
    category: 'Statistical',
    description: 'Returns the rank of a number in a list of numbers.',
    syntax: 'RANK(number, ref, [order])',
    arguments: [
      { name: 'number', description: 'The number to rank' },
      { name: 'ref', description: 'The array or range of numbers' },
      { name: 'order', description: '0 for descending, 1 for ascending (optional)' },
    ],
  },
  PERCENTILE: {
    name: 'PERCENTILE',
    category: 'Statistical',
    description: 'Returns the k-th percentile of values in a range.',
    syntax: 'PERCENTILE(array, k)',
    arguments: [
      { name: 'array', description: 'The array or range of data' },
      { name: 'k', description: 'The percentile value (0-1)' },
    ],
  },

  // Information
  ISNUMBER: {
    name: 'ISNUMBER',
    category: 'Information',
    description: 'Returns TRUE if the value is a number.',
    syntax: 'ISNUMBER(value)',
    arguments: [
      { name: 'value', description: 'The value to test' },
    ],
  },
  ISTEXT: {
    name: 'ISTEXT',
    category: 'Information',
    description: 'Returns TRUE if the value is text.',
    syntax: 'ISTEXT(value)',
    arguments: [
      { name: 'value', description: 'The value to test' },
    ],
  },
  ISBLANK: {
    name: 'ISBLANK',
    category: 'Information',
    description: 'Returns TRUE if the value is blank.',
    syntax: 'ISBLANK(value)',
    arguments: [
      { name: 'value', description: 'The value to test' },
    ],
  },
  ISERROR: {
    name: 'ISERROR',
    category: 'Information',
    description: 'Returns TRUE if the value is any error value.',
    syntax: 'ISERROR(value)',
    arguments: [
      { name: 'value', description: 'The value to test' },
    ],
  },
  TYPE: {
    name: 'TYPE',
    category: 'Information',
    description: 'Returns a number indicating the data type of a value.',
    syntax: 'TYPE(value)',
    arguments: [
      { name: 'value', description: 'The value to check the type of' },
    ],
  },
  CELL: {
    name: 'CELL',
    category: 'Information',
    description: 'Returns information about the formatting, location, or contents of a cell.',
    syntax: 'CELL(info_type, [reference])',
    arguments: [
      { name: 'info_type', description: 'The type of information to return (e.g., "address", "col", "row")' },
      { name: 'reference', description: 'The cell to get information about (optional)' },
    ],
  },
};

const CATEGORIES = [
  'All',
  'Lookup & Reference',
  'Logical',
  'Text',
  'Math & Trig',
  'Date & Time',
  'Financial',
  'Statistical',
  'Information',
];

export function ExcelFunctionReference() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFunction, setSelectedFunction] = useState<FunctionInfo | null>(null);
  const [copied, setCopied] = useState(false);

  const filteredFunctions = useMemo(() => {
    return Object.values(EXCEL_FUNCTIONS).filter((func) => {
      const matchesSearch =
        func.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        func.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        func.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory =
        selectedCategory === 'All' || func.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleCopy = () => {
    if (selectedFunction) {
      navigator.clipboard.writeText(selectedFunction.syntax);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getRelatedFunctions = (currentFunc: FunctionInfo) => {
    return Object.values(EXCEL_FUNCTIONS)
      .filter((f) => f.category === currentFunc.category && f.name !== currentFunc.name)
      .slice(0, 3);
  };

  return (
    <div className="w-full space-y-6">
      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search functions by name or keyword..."
            className="w-full pl-10 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'px-3 py-1 text-sm rounded-md transition-colors',
                selectedCategory === category
                  ? 'bg-accent text-white'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Function List */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {filteredFunctions.length} function{filteredFunctions.length !== 1 ? 's' : ''} found
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredFunctions.map((func) => (
            <button
              key={func.name}
              onClick={() => setSelectedFunction(func)}
              className={cn(
                'p-3 text-left rounded-md transition-colors border',
                selectedFunction?.name === func.name
                  ? 'bg-accent text-white border-accent'
                  : 'bg-background border-input hover:bg-muted/50'
              )}
            >
              <div className="font-medium">{func.name}</div>
              <div className="text-xs opacity-80">{func.category}</div>
              <div className="text-xs opacity-70 mt-1 line-clamp-2">{func.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Function Details */}
      {selectedFunction && (
        <div className="p-4 bg-muted/50 rounded-lg space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">{selectedFunction.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedFunction.category}</p>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Syntax'}
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-foreground">{selectedFunction.description}</p>
            <div className="p-2 bg-background rounded-md">
              <code className="text-sm font-mono">{selectedFunction.syntax}</code>
            </div>
          </div>

          {selectedFunction.arguments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Arguments</h4>
              <div className="space-y-1">
                {selectedFunction.arguments.map((arg, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-mono font-medium">{arg.name}</span>
                    <span className="text-muted-foreground">: {arg.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Functions */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Related Functions</h4>
            <div className="flex flex-wrap gap-2">
              {getRelatedFunctions(selectedFunction).map((func) => (
                <button
                  key={func.name}
                  onClick={() => setSelectedFunction(func)}
                  className="px-2 py-1 text-xs bg-background border border-input rounded-md hover:bg-muted/50 transition-colors"
                >
                  {func.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
