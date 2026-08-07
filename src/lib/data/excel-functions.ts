/**
 * Shared Excel / Google Sheets function database.
 *
 * Single source of truth for both the Excel Formula Explainer and the Excel
 * Function Reference tools. Previously each component carried its own
 * copy-pasted 82-entry object; they are now one list.
 *
 * Entries are authored in the compact `RawDef` shape and normalized once into
 * `EXCEL_FUNCTIONS`. The normalized shape carries what the explainer needs
 * beyond a description: a parameter model that understands optional and
 * repeating arguments, argument-count bounds, an optional plain-English
 * narrative template, and availability / volatility flags.
 */

export type ExcelCategory =
  | 'Lookup & Reference'
  | 'Logical'
  | 'Text'
  | 'Math & Trig'
  | 'Date & Time'
  | 'Financial'
  | 'Statistical'
  | 'Information'
  | 'Dynamic Array'
  | 'Google Sheets';

export const EXCEL_CATEGORIES: ExcelCategory[] = [
  'Lookup & Reference',
  'Logical',
  'Text',
  'Math & Trig',
  'Date & Time',
  'Financial',
  'Statistical',
  'Information',
  'Dynamic Array',
  'Google Sheets',
];

/** Which application the function exists in. */
export type Availability = 'both' | 'excel' | 'sheets';

export interface ExcelParam {
  name: string;
  description: string;
  optional: boolean;
}

export interface ExcelFunctionDef {
  name: string;
  category: ExcelCategory;
  description: string;
  syntax: string;
  params: ExcelParam[];
  /** Minimum number of arguments Excel accepts. */
  minArgs: number;
  /** Maximum number of arguments; `Infinity` for variadic functions. */
  maxArgs: number;
  /** Index in `params` where the repeating group starts, if any. */
  repeatFrom?: number;
  /** How many parameters make up one repetition of the group. */
  repeatSize?: number;
  /**
   * Parameters at the end of the list that always come last, after any
   * repetitions — LET's `calculation`, LAMBDA's body. Without this the
   * repeating expansion would swallow them.
   */
  tailParams?: number;
  /**
   * Plain-English sentence template. `{0}`, `{1}`… are replaced with the
   * rendered argument text; `{2?text}` only emits `text` when argument 2 was
   * supplied, with `$` inside standing for the argument itself.
   */
  narrative?: string;
  availability: Availability;
  /** First version that shipped the function, when it is not universal. */
  since?: string;
  /** Recalculates on every worksheet change. */
  volatile?: boolean;
  /** Superseded by a modern equivalent. */
  legacy?: { replacement: string; note: string };
  /** Compatibility alias so existing UI that reads `arguments` keeps working. */
  arguments: Array<{ name: string; description: string }>;
}

type RawParam = [name: string, description: string, optional?: 1];

interface RawDef {
  c: ExcelCategory;
  d: string;
  s: string;
  p: RawParam[];
  /** Repeat group: [startIndex, size]. Implies `maxArgs = Infinity`. */
  r?: [number, number];
  /** Number of trailing parameters that always come last. */
  t?: number;
  min?: number;
  max?: number;
  n?: string;
  av?: Availability;
  since?: string;
  vol?: true;
  legacy?: [replacement: string, note: string];
}

const RAW: Record<string, RawDef> = {
  // ---------------------------------------------------------------- Lookup
  VLOOKUP: {
    c: 'Lookup & Reference',
    d: 'Searches for a value in the first column of a table and returns a value in the same row from a specified column.',
    s: 'VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])',
    p: [
      ['lookup_value', 'The value to search for in the first column'],
      ['table_array', 'The range of cells containing the data'],
      ['col_index_num', 'The column number in the table from which to retrieve the value'],
      ['range_lookup', 'TRUE for approximate match, FALSE for exact match', 1],
    ],
    n: 'look up {0} in the first column of {1} and return the matching value from column {2}',
  },
  HLOOKUP: {
    c: 'Lookup & Reference',
    d: 'Searches for a value in the top row of a table and returns a value in the same column from a specified row.',
    s: 'HLOOKUP(lookup_value, table_array, row_index_num, [range_lookup])',
    p: [
      ['lookup_value', 'The value to search for in the first row'],
      ['table_array', 'The range of cells containing the data'],
      ['row_index_num', 'The row number in the table from which to retrieve the value'],
      ['range_lookup', 'TRUE for approximate match, FALSE for exact match', 1],
    ],
    n: 'look up {0} across the first row of {1} and return the value from row {2}',
    legacy: ['XLOOKUP', 'XLOOKUP handles both row and column lookups and defaults to exact match'],
  },
  INDEX: {
    c: 'Lookup & Reference',
    d: 'Returns the value of a cell in a specified row and column of a range.',
    s: 'INDEX(array, row_num, [column_num])',
    p: [
      ['array', 'The range of cells or array'],
      ['row_num', 'The row number in the array'],
      ['column_num', 'The column number in the array', 1],
    ],
    n: 'return the value at row {1}{2? and column $} of {0}',
  },
  MATCH: {
    c: 'Lookup & Reference',
    d: 'Searches for a specified item in a range of cells and returns its relative position.',
    s: 'MATCH(lookup_value, lookup_array, [match_type])',
    p: [
      ['lookup_value', 'The value to search for'],
      ['lookup_array', 'The range of cells to search'],
      ['match_type', '1 for less than, 0 for exact match, -1 for greater than', 1],
    ],
    n: 'find the position of {0} within {1}',
  },
  XLOOKUP: {
    c: 'Lookup & Reference',
    d: 'Searches a range or array for a value and returns the corresponding item from a second range or array.',
    s: 'XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode])',
    p: [
      ['lookup_value', 'The value to search for'],
      ['lookup_array', 'The array or range to search'],
      ['return_array', 'The array or range to return values from'],
      ['if_not_found', 'Value to return if no match is found', 1],
      ['match_mode', '0 exact, -1 exact or next smaller, 1 exact or next larger, 2 wildcard', 1],
      ['search_mode', '1 first-to-last, -1 last-to-first, 2/-2 binary search', 1],
    ],
    n: 'find {0} in {1} and return the matching item from {2}{3?, or $ if there is no match}',
    since: 'Excel 2021 / Microsoft 365',
  },
  XMATCH: {
    c: 'Lookup & Reference',
    d: 'Returns the relative position of an item in an array or range.',
    s: 'XMATCH(lookup_value, lookup_array, [match_mode], [search_mode])',
    p: [
      ['lookup_value', 'The value to search for'],
      ['lookup_array', 'The array or range to search'],
      ['match_mode', '0 exact, -1 exact or next smaller, 1 exact or next larger, 2 wildcard', 1],
      ['search_mode', '1 first-to-last, -1 last-to-first, 2/-2 binary search', 1],
    ],
    since: 'Excel 2021 / Microsoft 365',
  },
  INDIRECT: {
    c: 'Lookup & Reference',
    d: 'Returns the reference specified by a text string.',
    s: 'INDIRECT(ref_text, [a1])',
    p: [
      ['ref_text', 'A cell reference written as text, such as "Sheet2!A1"'],
      ['a1', 'TRUE for A1-style references, FALSE for R1C1-style', 1],
    ],
    n: 'treat the text {0} as a cell reference and return what that cell contains',
    vol: true,
  },
  OFFSET: {
    c: 'Lookup & Reference',
    d: 'Returns a reference to a range that is offset from a starting cell or range.',
    s: 'OFFSET(reference, rows, cols, [height], [width])',
    p: [
      ['reference', 'The starting cell or range'],
      ['rows', 'Number of rows to move (positive down, negative up)'],
      ['cols', 'Number of columns to move (positive right, negative left)'],
      ['height', 'Height of the returned range in rows', 1],
      ['width', 'Width of the returned range in columns', 1],
    ],
    n: 'start at {0}, move down by {1} and across by {2}, and return the range found there',
    vol: true,
  },
  CHOOSE: {
    c: 'Lookup & Reference',
    d: 'Returns a value from a list based on a position number.',
    s: 'CHOOSE(index_num, value1, [value2], ...)',
    p: [
      ['index_num', 'Which value to return (1 for the first, 2 for the second, and so on)'],
      ['value1', 'The first value in the list'],
    ],
    r: [1, 1],
    n: 'pick item number {0} from the list that follows',
  },
  TRANSPOSE: {
    c: 'Lookup & Reference',
    d: 'Flips a range on its side, turning rows into columns and columns into rows.',
    s: 'TRANSPOSE(array)',
    p: [['array', 'The range or array to flip']],
    n: 'flip {0} so its rows become columns',
  },
  ROW: {
    c: 'Lookup & Reference',
    d: 'Returns the row number of a reference.',
    s: 'ROW([reference])',
    p: [['reference', 'The cell or range to get the row number of', 1]],
  },
  COLUMN: {
    c: 'Lookup & Reference',
    d: 'Returns the column number of a reference.',
    s: 'COLUMN([reference])',
    p: [['reference', 'The cell or range to get the column number of', 1]],
  },
  ROWS: {
    c: 'Lookup & Reference',
    d: 'Returns the number of rows in a range or array.',
    s: 'ROWS(array)',
    p: [['array', 'The range or array to count rows in']],
  },
  COLUMNS: {
    c: 'Lookup & Reference',
    d: 'Returns the number of columns in a range or array.',
    s: 'COLUMNS(array)',
    p: [['array', 'The range or array to count columns in']],
  },
  ADDRESS: {
    c: 'Lookup & Reference',
    d: 'Builds a cell address as text from a row and column number.',
    s: 'ADDRESS(row_num, column_num, [abs_num], [a1], [sheet_text])',
    p: [
      ['row_num', 'The row number'],
      ['column_num', 'The column number'],
      ['abs_num', '1 absolute, 2 absolute row, 3 absolute column, 4 relative', 1],
      ['a1', 'TRUE for A1-style, FALSE for R1C1-style', 1],
      ['sheet_text', 'Sheet name to include in the address', 1],
    ],
  },
  AREAS: {
    c: 'Lookup & Reference',
    d: 'Returns the number of separate areas in a reference.',
    s: 'AREAS(reference)',
    p: [['reference', 'The reference to count areas in']],
  },
  HYPERLINK: {
    c: 'Lookup & Reference',
    d: 'Creates a clickable link to a document, web page, or location in the workbook.',
    s: 'HYPERLINK(link_location, [friendly_name])',
    p: [
      ['link_location', 'The path or URL to open'],
      ['friendly_name', 'The text to display in the cell', 1],
    ],
  },
  FORMULATEXT: {
    c: 'Lookup & Reference',
    d: 'Returns the formula in a cell as text.',
    s: 'FORMULATEXT(reference)',
    p: [['reference', 'The cell whose formula you want as text']],
  },
  GETPIVOTDATA: {
    c: 'Lookup & Reference',
    d: 'Extracts a value from a PivotTable by field and item.',
    s: 'GETPIVOTDATA(data_field, pivot_table, [field1, item1], ...)',
    p: [
      ['data_field', 'The name of the value field to pull from'],
      ['pivot_table', 'A cell inside the PivotTable'],
      ['field1', 'A field name to filter on', 1],
      ['item1', 'The item within that field', 1],
    ],
    r: [2, 2],
  },
  LOOKUP: {
    c: 'Lookup & Reference',
    d: 'Looks up a value in a one-row or one-column range and returns a value from the same position in a second range.',
    s: 'LOOKUP(lookup_value, lookup_vector, [result_vector])',
    p: [
      ['lookup_value', 'The value to search for'],
      ['lookup_vector', 'A single row or column to search, which must be sorted ascending'],
      ['result_vector', 'A single row or column to return from', 1],
    ],
    legacy: ['XLOOKUP', 'LOOKUP requires sorted data and fails silently when it is not sorted'],
  },

  // --------------------------------------------------------------- Logical
  IF: {
    c: 'Logical',
    d: 'Returns one value if a condition is true and another value if it is false.',
    s: 'IF(logical_test, value_if_true, [value_if_false])',
    p: [
      ['logical_test', 'The condition to evaluate'],
      ['value_if_true', 'Value to return if the condition is true'],
      ['value_if_false', 'Value to return if the condition is false', 1],
    ],
    n: 'if {0}, return {1}{2?; otherwise return $}',
  },
  AND: {
    c: 'Logical',
    d: 'Returns TRUE only if every argument is true.',
    s: 'AND(logical1, [logical2], ...)',
    p: [['logical1', 'First condition to evaluate']],
    r: [0, 1],
    n: 'check that every one of these conditions is true',
  },
  OR: {
    c: 'Logical',
    d: 'Returns TRUE if at least one argument is true.',
    s: 'OR(logical1, [logical2], ...)',
    p: [['logical1', 'First condition to evaluate']],
    r: [0, 1],
    n: 'check whether at least one of these conditions is true',
  },
  XOR: {
    c: 'Logical',
    d: 'Returns TRUE when an odd number of the arguments are true.',
    s: 'XOR(logical1, [logical2], ...)',
    p: [['logical1', 'First condition to evaluate']],
    r: [0, 1],
  },
  NOT: {
    c: 'Logical',
    d: 'Reverses the result of its argument: TRUE becomes FALSE and FALSE becomes TRUE.',
    s: 'NOT(logical)',
    p: [['logical', 'The value or condition to reverse']],
    n: 'reverse the result of {0}',
  },
  IFERROR: {
    c: 'Logical',
    d: 'Returns a value you specify if a formula produces any error; otherwise returns the formula result.',
    s: 'IFERROR(value, value_if_error)',
    p: [
      ['value', 'The expression to evaluate'],
      ['value_if_error', 'Value to return if the expression produces an error'],
    ],
    n: 'evaluate {0}, but return {1} instead if that produces any error',
  },
  IFNA: {
    c: 'Logical',
    d: 'Returns a value you specify only when an expression produces #N/A; other errors pass through.',
    s: 'IFNA(value, value_if_na)',
    p: [
      ['value', 'The expression to evaluate'],
      ['value_if_na', 'Value to return if the expression produces #N/A'],
    ],
    n: 'evaluate {0}, returning {1} only if the result is #N/A',
  },
  IFS: {
    c: 'Logical',
    d: 'Checks several conditions in order and returns the value paired with the first one that is true.',
    s: 'IFS(logical_test1, value_if_true1, [logical_test2, value_if_true2], ...)',
    p: [
      ['logical_test1', 'First condition to evaluate'],
      ['value_if_true1', 'Value to return if the first condition is true'],
    ],
    r: [0, 2],
    n: 'test each condition in turn and return the value paired with the first true one',
    since: 'Excel 2019',
  },
  SWITCH: {
    c: 'Logical',
    d: 'Compares one expression against a list of values and returns the result matching the first hit.',
    s: 'SWITCH(expression, value1, result1, [value2, result2], ..., [default])',
    p: [
      ['expression', 'The value to compare'],
      ['value1', 'First value to compare against'],
      ['result1', 'Result to return when the first value matches'],
    ],
    r: [1, 2],
    n: 'compare {0} against each value listed and return the matching result',
    since: 'Excel 2019',
  },
  LET: {
    c: 'Logical',
    d: 'Assigns names to intermediate results so a formula can reuse them instead of repeating the same calculation.',
    s: 'LET(name1, value1, [name2, value2], ..., calculation)',
    p: [
      ['name1', 'The first name to define'],
      ['value1', 'The expression that name stands for'],
      ['calculation', 'The final expression, which may use the names defined above'],
    ],
    r: [0, 2],
    t: 1,
    since: 'Microsoft 365',
  },
  LAMBDA: {
    c: 'Logical',
    d: 'Creates a reusable custom function from a formula, with named parameters.',
    s: 'LAMBDA([parameter1, parameter2, ...], calculation)',
    p: [
      ['parameter1', 'A name for the first input to the custom function'],
      ['calculation', 'The formula body, written in terms of the parameters'],
    ],
    r: [0, 1],
    t: 1,
    since: 'Microsoft 365',
  },

  // ------------------------------------------------------------------ Text
  CONCATENATE: {
    c: 'Text',
    d: 'Joins two or more text strings into one string.',
    s: 'CONCATENATE(text1, [text2], ...)',
    p: [['text1', 'First text string to join']],
    r: [0, 1],
    n: 'join these values together into one piece of text',
  },
  CONCAT: {
    c: 'Text',
    d: 'Joins the text from multiple ranges or strings, without a delimiter.',
    s: 'CONCAT(text1, [text2], ...)',
    p: [['text1', 'First text string or range to join']],
    r: [0, 1],
    since: 'Excel 2019',
  },
  TEXTJOIN: {
    c: 'Text',
    d: 'Joins text from multiple ranges with a delimiter between each item, optionally skipping blanks.',
    s: 'TEXTJOIN(delimiter, ignore_empty, text1, [text2], ...)',
    p: [
      ['delimiter', 'The text placed between each joined item'],
      ['ignore_empty', 'TRUE to skip empty cells, FALSE to include them'],
      ['text1', 'First text string or range to join'],
    ],
    r: [2, 1],
    n: 'join the values that follow, putting {0} between each one',
    since: 'Excel 2019',
  },
  LEFT: {
    c: 'Text',
    d: 'Returns a number of characters from the start of a text string.',
    s: 'LEFT(text, [num_chars])',
    p: [
      ['text', 'The text string to extract from'],
      ['num_chars', 'Number of characters to take, defaulting to 1', 1],
    ],
    n: 'take the first {1|1} characters of {0}',
  },
  RIGHT: {
    c: 'Text',
    d: 'Returns a number of characters from the end of a text string.',
    s: 'RIGHT(text, [num_chars])',
    p: [
      ['text', 'The text string to extract from'],
      ['num_chars', 'Number of characters to take, defaulting to 1', 1],
    ],
    n: 'take the last {1|1} characters of {0}',
  },
  MID: {
    c: 'Text',
    d: 'Returns characters from the middle of a text string, given a start position and a length.',
    s: 'MID(text, start_num, num_chars)',
    p: [
      ['text', 'The text string to extract from'],
      ['start_num', 'Position of the first character to take'],
      ['num_chars', 'How many characters to take'],
    ],
    n: 'take {2} characters from {0}, starting at character {1}',
  },
  LEN: {
    c: 'Text',
    d: 'Returns the number of characters in a text string.',
    s: 'LEN(text)',
    p: [['text', 'The text string to measure']],
    n: 'count the characters in {0}',
  },
  TRIM: {
    c: 'Text',
    d: 'Removes leading, trailing, and repeated spaces from text.',
    s: 'TRIM(text)',
    p: [['text', 'The text string to clean up']],
    n: 'strip the extra spaces from {0}',
  },
  CLEAN: {
    c: 'Text',
    d: 'Removes non-printable characters from text.',
    s: 'CLEAN(text)',
    p: [['text', 'The text string to clean']],
  },
  UPPER: {
    c: 'Text',
    d: 'Converts text to uppercase.',
    s: 'UPPER(text)',
    p: [['text', 'The text string to convert']],
    n: 'convert {0} to uppercase',
  },
  LOWER: {
    c: 'Text',
    d: 'Converts text to lowercase.',
    s: 'LOWER(text)',
    p: [['text', 'The text string to convert']],
    n: 'convert {0} to lowercase',
  },
  PROPER: {
    c: 'Text',
    d: 'Capitalizes the first letter of each word and lowercases the rest.',
    s: 'PROPER(text)',
    p: [['text', 'The text string to convert']],
  },
  TEXT: {
    c: 'Text',
    d: 'Converts a value to text using a number format code.',
    s: 'TEXT(value, format_text)',
    p: [
      ['value', 'The value to convert'],
      ['format_text', 'The format code to apply, such as "0.00" or "dd/mm/yyyy"'],
    ],
    n: 'format {0} as text using the pattern {1}',
  },
  VALUE: {
    c: 'Text',
    d: 'Converts text that looks like a number into an actual number.',
    s: 'VALUE(text)',
    p: [['text', 'The text to convert to a number']],
    n: 'convert the text {0} into a number',
  },
  NUMBERVALUE: {
    c: 'Text',
    d: 'Converts text to a number using explicit decimal and thousands separators.',
    s: 'NUMBERVALUE(text, [decimal_separator], [group_separator])',
    p: [
      ['text', 'The text to convert'],
      ['decimal_separator', 'The character used for decimals', 1],
      ['group_separator', 'The character used for thousands', 1],
    ],
  },
  SUBSTITUTE: {
    c: 'Text',
    d: 'Replaces occurrences of specific text within a string.',
    s: 'SUBSTITUTE(text, old_text, new_text, [instance_num])',
    p: [
      ['text', 'The text string to modify'],
      ['old_text', 'The text to find'],
      ['new_text', 'The replacement text'],
      ['instance_num', 'Which occurrence to replace; all of them if omitted', 1],
    ],
    n: 'in {0}, replace {1} with {2}',
  },
  REPLACE: {
    c: 'Text',
    d: 'Replaces part of a text string by position and length.',
    s: 'REPLACE(old_text, start_num, num_chars, new_text)',
    p: [
      ['old_text', 'The text string to modify'],
      ['start_num', 'Position of the first character to replace'],
      ['num_chars', 'How many characters to replace'],
      ['new_text', 'The replacement text'],
    ],
  },
  FIND: {
    c: 'Text',
    d: 'Returns the position of one text string inside another, matching case exactly.',
    s: 'FIND(find_text, within_text, [start_num])',
    p: [
      ['find_text', 'The text to look for'],
      ['within_text', 'The text to search inside'],
      ['start_num', 'Character position to start searching from', 1],
    ],
    n: 'find the position of {0} inside {1}, matching case exactly',
  },
  SEARCH: {
    c: 'Text',
    d: 'Returns the position of one text string inside another, ignoring case and allowing wildcards.',
    s: 'SEARCH(find_text, within_text, [start_num])',
    p: [
      ['find_text', 'The text to look for'],
      ['within_text', 'The text to search inside'],
      ['start_num', 'Character position to start searching from', 1],
    ],
    n: 'find the position of {0} inside {1}, ignoring case',
  },
  REPT: {
    c: 'Text',
    d: 'Repeats text a given number of times.',
    s: 'REPT(text, number_times)',
    p: [
      ['text', 'The text to repeat'],
      ['number_times', 'How many times to repeat it'],
    ],
  },
  CHAR: {
    c: 'Text',
    d: 'Returns the character for a given code number.',
    s: 'CHAR(number)',
    p: [['number', 'A code number between 1 and 255']],
  },
  UNICHAR: {
    c: 'Text',
    d: 'Returns the Unicode character for a given code point.',
    s: 'UNICHAR(number)',
    p: [['number', 'The Unicode code point']],
  },
  CODE: {
    c: 'Text',
    d: 'Returns the numeric code of the first character of text.',
    s: 'CODE(text)',
    p: [['text', 'The text whose first character you want the code for']],
  },
  EXACT: {
    c: 'Text',
    d: 'Compares two text strings and returns TRUE only if they match exactly, including case.',
    s: 'EXACT(text1, text2)',
    p: [
      ['text1', 'The first text string'],
      ['text2', 'The second text string'],
    ],
    n: 'check whether {0} and {1} are identical, including capitalisation',
  },
  TEXTBEFORE: {
    c: 'Text',
    d: 'Returns the text that appears before a given delimiter.',
    s: 'TEXTBEFORE(text, delimiter, [instance_num], [match_mode], [match_end], [if_not_found])',
    p: [
      ['text', 'The text to search'],
      ['delimiter', 'The marker to stop before'],
      ['instance_num', 'Which occurrence of the delimiter to use', 1],
      ['match_mode', '0 case-sensitive, 1 case-insensitive', 1],
      ['match_end', 'Treat the end of the text as a delimiter', 1],
      ['if_not_found', 'Value to return when the delimiter is missing', 1],
    ],
    n: 'return everything in {0} that comes before {1}',
    since: 'Microsoft 365',
  },
  TEXTAFTER: {
    c: 'Text',
    d: 'Returns the text that appears after a given delimiter.',
    s: 'TEXTAFTER(text, delimiter, [instance_num], [match_mode], [match_end], [if_not_found])',
    p: [
      ['text', 'The text to search'],
      ['delimiter', 'The marker to start after'],
      ['instance_num', 'Which occurrence of the delimiter to use', 1],
      ['match_mode', '0 case-sensitive, 1 case-insensitive', 1],
      ['match_end', 'Treat the end of the text as a delimiter', 1],
      ['if_not_found', 'Value to return when the delimiter is missing', 1],
    ],
    n: 'return everything in {0} that comes after {1}',
    since: 'Microsoft 365',
  },
  TEXTSPLIT: {
    c: 'Text',
    d: 'Splits text into separate cells using column and row delimiters.',
    s: 'TEXTSPLIT(text, col_delimiter, [row_delimiter], [ignore_empty], [match_mode], [pad_with])',
    p: [
      ['text', 'The text to split'],
      ['col_delimiter', 'The character that separates values into columns'],
      ['row_delimiter', 'The character that separates values into rows', 1],
      ['ignore_empty', 'TRUE to skip empty values', 1],
      ['match_mode', '0 case-sensitive, 1 case-insensitive', 1],
      ['pad_with', 'Value used to pad an incomplete result', 1],
    ],
    n: 'split {0} into separate cells wherever {1} appears',
    since: 'Microsoft 365',
  },
  DOLLAR: {
    c: 'Text',
    d: 'Converts a number to text in currency format.',
    s: 'DOLLAR(number, [decimals])',
    p: [
      ['number', 'The number to format'],
      ['decimals', 'How many decimal places to show', 1],
    ],
  },
  FIXED: {
    c: 'Text',
    d: 'Converts a number to text with a fixed number of decimals.',
    s: 'FIXED(number, [decimals], [no_commas])',
    p: [
      ['number', 'The number to format'],
      ['decimals', 'How many decimal places to show', 1],
      ['no_commas', 'TRUE to omit thousands separators', 1],
    ],
  },

  // ----------------------------------------------------------- Math & Trig
  SUM: {
    c: 'Math & Trig',
    d: 'Adds all the numbers in the given cells or ranges.',
    s: 'SUM(number1, [number2], ...)',
    p: [['number1', 'First number or range to add']],
    r: [0, 1],
    n: 'add up {0}',
  },
  SUMIF: {
    c: 'Math & Trig',
    d: 'Adds the values in a range that meet one condition.',
    s: 'SUMIF(range, criteria, [sum_range])',
    p: [
      ['range', 'The range of cells to test against the condition'],
      ['criteria', 'The condition that decides which cells count'],
      ['sum_range', 'The cells to actually add; the tested range is used if omitted', 1],
    ],
    n: 'add up the matching values, keeping only the rows where {0} matches {1}',
  },
  SUMIFS: {
    c: 'Math & Trig',
    d: 'Adds the values in a range that meet several conditions at once.',
    s: 'SUMIFS(sum_range, criteria_range1, criteria1, [criteria_range2, criteria2], ...)',
    p: [
      ['sum_range', 'The range of cells to add'],
      ['criteria_range1', 'First range to test'],
      ['criteria1', 'First condition to meet'],
    ],
    r: [1, 2],
    n: 'add up {0} for every row that satisfies all of the conditions that follow',
  },
  SUMPRODUCT: {
    c: 'Math & Trig',
    d: 'Multiplies corresponding items in the given arrays and adds the results.',
    s: 'SUMPRODUCT(array1, [array2], ...)',
    p: [['array1', 'First array or range']],
    r: [0, 1],
    n: 'multiply the arrays together row by row and add up the results',
  },
  SUMSQ: {
    c: 'Math & Trig',
    d: 'Adds the squares of the given numbers.',
    s: 'SUMSQ(number1, [number2], ...)',
    p: [['number1', 'First number or range']],
    r: [0, 1],
  },
  AVERAGE: {
    c: 'Math & Trig',
    d: 'Returns the arithmetic mean of the given numbers.',
    s: 'AVERAGE(number1, [number2], ...)',
    p: [['number1', 'First number or range to average']],
    r: [0, 1],
    n: 'take the average of {0}',
  },
  AVERAGEA: {
    c: 'Math & Trig',
    d: 'Averages the given values, counting text as 0 and TRUE as 1.',
    s: 'AVERAGEA(value1, [value2], ...)',
    p: [['value1', 'First value or range to average']],
    r: [0, 1],
  },
  AVERAGEIF: {
    c: 'Math & Trig',
    d: 'Averages the values in a range that meet one condition.',
    s: 'AVERAGEIF(range, criteria, [average_range])',
    p: [
      ['range', 'The range of cells to test against the condition'],
      ['criteria', 'The condition that decides which cells count'],
      ['average_range', 'The cells to actually average; the tested range is used if omitted', 1],
    ],
    n: 'average the matching values, keeping only the rows where {0} matches {1}',
  },
  AVERAGEIFS: {
    c: 'Math & Trig',
    d: 'Averages the values in a range that meet several conditions.',
    s: 'AVERAGEIFS(average_range, criteria_range1, criteria1, [criteria_range2, criteria2], ...)',
    p: [
      ['average_range', 'The range of cells to average'],
      ['criteria_range1', 'First range to test'],
      ['criteria1', 'First condition to meet'],
    ],
    r: [1, 2],
  },
  COUNT: {
    c: 'Math & Trig',
    d: 'Counts how many of the given cells contain numbers.',
    s: 'COUNT(value1, [value2], ...)',
    p: [['value1', 'First item, cell, or range to count']],
    r: [0, 1],
    n: 'count how many numeric values are in {0}',
  },
  COUNTA: {
    c: 'Math & Trig',
    d: 'Counts how many of the given cells are not empty.',
    s: 'COUNTA(value1, [value2], ...)',
    p: [['value1', 'First item, cell, or range to count']],
    r: [0, 1],
    n: 'count how many non-empty cells are in {0}',
  },
  COUNTBLANK: {
    c: 'Math & Trig',
    d: 'Counts the empty cells in a range.',
    s: 'COUNTBLANK(range)',
    p: [['range', 'The range to check for empty cells']],
  },
  COUNTIF: {
    c: 'Math & Trig',
    d: 'Counts the cells in a range that meet one condition.',
    s: 'COUNTIF(range, criteria)',
    p: [
      ['range', 'The range of cells to check'],
      ['criteria', 'The condition that decides which cells count'],
    ],
    n: 'count how many cells in {0} match {1}',
  },
  COUNTIFS: {
    c: 'Math & Trig',
    d: 'Counts the rows that meet several conditions at once.',
    s: 'COUNTIFS(criteria_range1, criteria1, [criteria_range2, criteria2], ...)',
    p: [
      ['criteria_range1', 'First range to test'],
      ['criteria1', 'First condition to meet'],
    ],
    r: [0, 2],
    n: 'count the rows that satisfy every condition listed',
  },
  SUBTOTAL: {
    c: 'Math & Trig',
    d: 'Applies one of eleven aggregate calculations, optionally ignoring hidden rows.',
    s: 'SUBTOTAL(function_num, ref1, [ref2], ...)',
    p: [
      ['function_num', 'Which calculation to run: 9 sums, 1 averages, 3 counts; add 100 to ignore hidden rows'],
      ['ref1', 'First range to aggregate'],
    ],
    r: [1, 1],
  },
  AGGREGATE: {
    c: 'Math & Trig',
    d: 'Applies an aggregate calculation while optionally ignoring errors and hidden rows.',
    s: 'AGGREGATE(function_num, options, ref1, [ref2], ...)',
    p: [
      ['function_num', 'Which calculation to run (1 AVERAGE, 9 SUM, 14 LARGE, and so on)'],
      ['options', 'What to ignore: 6 ignores errors, 5 ignores hidden rows'],
      ['ref1', 'First range to aggregate'],
    ],
    r: [2, 1],
  },
  PRODUCT: {
    c: 'Math & Trig',
    d: 'Multiplies all the given numbers together.',
    s: 'PRODUCT(number1, [number2], ...)',
    p: [['number1', 'First number or range to multiply']],
    r: [0, 1],
  },
  ROUND: {
    c: 'Math & Trig',
    d: 'Rounds a number to a set number of digits.',
    s: 'ROUND(number, num_digits)',
    p: [
      ['number', 'The number to round'],
      ['num_digits', 'Digits to keep; positive for decimals, negative rounds to tens, hundreds, and so on'],
    ],
    n: 'round {0} to {1} decimal places',
  },
  ROUNDUP: {
    c: 'Math & Trig',
    d: 'Rounds a number away from zero.',
    s: 'ROUNDUP(number, num_digits)',
    p: [
      ['number', 'The number to round up'],
      ['num_digits', 'Digits to keep'],
    ],
    n: 'always round {0} up to {1} decimal places',
  },
  ROUNDDOWN: {
    c: 'Math & Trig',
    d: 'Rounds a number toward zero.',
    s: 'ROUNDDOWN(number, num_digits)',
    p: [
      ['number', 'The number to round down'],
      ['num_digits', 'Digits to keep'],
    ],
    n: 'always round {0} down to {1} decimal places',
  },
  MROUND: {
    c: 'Math & Trig',
    d: 'Rounds a number to the nearest multiple of another number.',
    s: 'MROUND(number, multiple)',
    p: [
      ['number', 'The number to round'],
      ['multiple', 'The multiple to round to'],
    ],
  },
  CEILING: {
    c: 'Math & Trig',
    d: 'Rounds a number up to the nearest multiple of significance.',
    s: 'CEILING(number, significance)',
    p: [
      ['number', 'The number to round up'],
      ['significance', 'The multiple to round to'],
    ],
  },
  FLOOR: {
    c: 'Math & Trig',
    d: 'Rounds a number down to the nearest multiple of significance.',
    s: 'FLOOR(number, significance)',
    p: [
      ['number', 'The number to round down'],
      ['significance', 'The multiple to round to'],
    ],
  },
  INT: {
    c: 'Math & Trig',
    d: 'Rounds a number down to the nearest whole number.',
    s: 'INT(number)',
    p: [['number', 'The number to round down']],
    n: 'drop the decimal part of {0}, rounding down',
  },
  TRUNC: {
    c: 'Math & Trig',
    d: 'Cuts off the decimal part of a number without rounding.',
    s: 'TRUNC(number, [num_digits])',
    p: [
      ['number', 'The number to truncate'],
      ['num_digits', 'How many decimals to keep', 1],
    ],
  },
  MOD: {
    c: 'Math & Trig',
    d: 'Returns the remainder left after dividing one number by another.',
    s: 'MOD(number, divisor)',
    p: [
      ['number', 'The number to divide'],
      ['divisor', 'The number to divide by'],
    ],
    n: 'return the remainder when {0} is divided by {1}',
  },
  ABS: {
    c: 'Math & Trig',
    d: 'Returns a number without its sign.',
    s: 'ABS(number)',
    p: [['number', 'The number to take the absolute value of']],
    n: 'take the absolute value of {0}',
  },
  SIGN: {
    c: 'Math & Trig',
    d: 'Returns 1 for a positive number, -1 for a negative number, and 0 for zero.',
    s: 'SIGN(number)',
    p: [['number', 'The number to test']],
  },
  POWER: {
    c: 'Math & Trig',
    d: 'Raises a number to a power.',
    s: 'POWER(number, power)',
    p: [
      ['number', 'The base number'],
      ['power', 'The exponent'],
    ],
    n: 'raise {0} to the power of {1}',
  },
  SQRT: {
    c: 'Math & Trig',
    d: 'Returns the positive square root of a number.',
    s: 'SQRT(number)',
    p: [['number', 'The number to take the square root of']],
    n: 'take the square root of {0}',
  },
  EXP: {
    c: 'Math & Trig',
    d: 'Returns e raised to the given power.',
    s: 'EXP(number)',
    p: [['number', 'The exponent to apply to e']],
  },
  LN: {
    c: 'Math & Trig',
    d: 'Returns the natural logarithm of a number.',
    s: 'LN(number)',
    p: [['number', 'The number to take the natural log of']],
  },
  LOG: {
    c: 'Math & Trig',
    d: 'Returns the logarithm of a number to a base you choose.',
    s: 'LOG(number, [base])',
    p: [
      ['number', 'The number to take the logarithm of'],
      ['base', 'The base of the logarithm, defaulting to 10', 1],
    ],
  },
  LOG10: {
    c: 'Math & Trig',
    d: 'Returns the base-10 logarithm of a number.',
    s: 'LOG10(number)',
    p: [['number', 'The number to take the base-10 log of']],
  },
  PI: {
    c: 'Math & Trig',
    d: 'Returns the value of pi.',
    s: 'PI()',
    p: [],
  },
  RAND: {
    c: 'Math & Trig',
    d: 'Returns a random decimal between 0 and 1.',
    s: 'RAND()',
    p: [],
    vol: true,
  },
  RANDBETWEEN: {
    c: 'Math & Trig',
    d: 'Returns a random whole number between two bounds.',
    s: 'RANDBETWEEN(bottom, top)',
    p: [
      ['bottom', 'The smallest value that can be returned'],
      ['top', 'The largest value that can be returned'],
    ],
    vol: true,
  },
  GCD: {
    c: 'Math & Trig',
    d: 'Returns the greatest common divisor of the given numbers.',
    s: 'GCD(number1, [number2], ...)',
    p: [['number1', 'First number']],
    r: [0, 1],
  },
  LCM: {
    c: 'Math & Trig',
    d: 'Returns the least common multiple of the given numbers.',
    s: 'LCM(number1, [number2], ...)',
    p: [['number1', 'First number']],
    r: [0, 1],
  },
  SIN: { c: 'Math & Trig', d: 'Returns the sine of an angle given in radians.', s: 'SIN(number)', p: [['number', 'The angle in radians']] },
  COS: { c: 'Math & Trig', d: 'Returns the cosine of an angle given in radians.', s: 'COS(number)', p: [['number', 'The angle in radians']] },
  TAN: { c: 'Math & Trig', d: 'Returns the tangent of an angle given in radians.', s: 'TAN(number)', p: [['number', 'The angle in radians']] },
  RADIANS: { c: 'Math & Trig', d: 'Converts degrees to radians.', s: 'RADIANS(angle)', p: [['angle', 'The angle in degrees']] },
  DEGREES: { c: 'Math & Trig', d: 'Converts radians to degrees.', s: 'DEGREES(angle)', p: [['angle', 'The angle in radians']] },

  // ----------------------------------------------------------- Date & Time
  TODAY: {
    c: 'Date & Time',
    d: "Returns today's date, refreshed whenever the sheet recalculates.",
    s: 'TODAY()',
    p: [],
    n: "use today's date",
    vol: true,
  },
  NOW: {
    c: 'Date & Time',
    d: 'Returns the current date and time, refreshed whenever the sheet recalculates.',
    s: 'NOW()',
    p: [],
    n: 'use the current date and time',
    vol: true,
  },
  DATE: {
    c: 'Date & Time',
    d: 'Builds a date from separate year, month, and day numbers.',
    s: 'DATE(year, month, day)',
    p: [
      ['year', 'The year'],
      ['month', 'The month'],
      ['day', 'The day'],
    ],
    n: 'build the date {2}/{1}/{0}',
  },
  TIME: {
    c: 'Date & Time',
    d: 'Builds a time from separate hour, minute, and second numbers.',
    s: 'TIME(hour, minute, second)',
    p: [
      ['hour', 'The hour, from 0 to 23'],
      ['minute', 'The minute, from 0 to 59'],
      ['second', 'The second, from 0 to 59'],
    ],
  },
  DATEVALUE: {
    c: 'Date & Time',
    d: 'Converts a date written as text into a real date value.',
    s: 'DATEVALUE(date_text)',
    p: [['date_text', 'A date written as text, such as "2026-03-14"']],
  },
  TIMEVALUE: {
    c: 'Date & Time',
    d: 'Converts a time written as text into a real time value.',
    s: 'TIMEVALUE(time_text)',
    p: [['time_text', 'A time written as text, such as "14:30"']],
  },
  DATEDIF: {
    c: 'Date & Time',
    d: 'Returns the whole years, months, or days between two dates.',
    s: 'DATEDIF(start_date, end_date, unit)',
    p: [
      ['start_date', 'The earlier date'],
      ['end_date', 'The later date'],
      ['unit', '"Y" for whole years, "M" for months, "D" for days, "MD"/"YM"/"YD" for remainders'],
    ],
    n: 'measure the gap from {0} to {1} in units of {2}',
  },
  EOMONTH: {
    c: 'Date & Time',
    d: 'Returns the last day of the month a given number of months away.',
    s: 'EOMONTH(start_date, months)',
    p: [
      ['start_date', 'The starting date'],
      ['months', 'Months forward (positive) or back (negative)'],
    ],
    n: 'return the last day of the month {1} months from {0}',
  },
  EDATE: {
    c: 'Date & Time',
    d: 'Returns the date a given number of months before or after a start date.',
    s: 'EDATE(start_date, months)',
    p: [
      ['start_date', 'The starting date'],
      ['months', 'Months forward (positive) or back (negative)'],
    ],
    n: 'move {0} forward by {1} months',
  },
  YEAR: { c: 'Date & Time', d: 'Returns the year part of a date.', s: 'YEAR(serial_number)', p: [['serial_number', 'The date to read']], n: 'take the year from {0}' },
  MONTH: { c: 'Date & Time', d: 'Returns the month part of a date, from 1 to 12.', s: 'MONTH(serial_number)', p: [['serial_number', 'The date to read']], n: 'take the month from {0}' },
  DAY: { c: 'Date & Time', d: 'Returns the day part of a date, from 1 to 31.', s: 'DAY(serial_number)', p: [['serial_number', 'The date to read']], n: 'take the day from {0}' },
  HOUR: { c: 'Date & Time', d: 'Returns the hour part of a time, from 0 to 23.', s: 'HOUR(serial_number)', p: [['serial_number', 'The time to read']] },
  MINUTE: { c: 'Date & Time', d: 'Returns the minute part of a time, from 0 to 59.', s: 'MINUTE(serial_number)', p: [['serial_number', 'The time to read']] },
  SECOND: { c: 'Date & Time', d: 'Returns the second part of a time, from 0 to 59.', s: 'SECOND(serial_number)', p: [['serial_number', 'The time to read']] },
  WEEKDAY: {
    c: 'Date & Time',
    d: 'Returns the day of the week as a number.',
    s: 'WEEKDAY(serial_number, [return_type])',
    p: [
      ['serial_number', 'The date to read'],
      ['return_type', 'Which day counts as 1; 1 means Sunday, 2 means Monday', 1],
    ],
  },
  WEEKNUM: {
    c: 'Date & Time',
    d: 'Returns the week of the year a date falls in.',
    s: 'WEEKNUM(serial_number, [return_type])',
    p: [
      ['serial_number', 'The date to read'],
      ['return_type', 'Which day the week starts on', 1],
    ],
  },
  ISOWEEKNUM: {
    c: 'Date & Time',
    d: 'Returns the ISO 8601 week number of a date.',
    s: 'ISOWEEKNUM(date)',
    p: [['date', 'The date to read']],
  },
  WORKDAY: {
    c: 'Date & Time',
    d: 'Returns the date a number of working days away, skipping weekends and holidays.',
    s: 'WORKDAY(start_date, days, [holidays])',
    p: [
      ['start_date', 'The starting date'],
      ['days', 'Working days forward or back'],
      ['holidays', 'A range of dates to treat as non-working', 1],
    ],
    n: 'move {0} forward by {1} working days',
  },
  'WORKDAY.INTL': {
    c: 'Date & Time',
    d: 'Returns a working-day offset with a custom definition of the weekend.',
    s: 'WORKDAY.INTL(start_date, days, [weekend], [holidays])',
    p: [
      ['start_date', 'The starting date'],
      ['days', 'Working days forward or back'],
      ['weekend', 'Which days count as the weekend', 1],
      ['holidays', 'A range of dates to treat as non-working', 1],
    ],
  },
  NETWORKDAYS: {
    c: 'Date & Time',
    d: 'Counts the working days between two dates, skipping weekends and holidays.',
    s: 'NETWORKDAYS(start_date, end_date, [holidays])',
    p: [
      ['start_date', 'The starting date'],
      ['end_date', 'The ending date'],
      ['holidays', 'A range of dates to treat as non-working', 1],
    ],
    n: 'count the working days from {0} to {1}',
  },
  'NETWORKDAYS.INTL': {
    c: 'Date & Time',
    d: 'Counts working days with a custom definition of the weekend.',
    s: 'NETWORKDAYS.INTL(start_date, end_date, [weekend], [holidays])',
    p: [
      ['start_date', 'The starting date'],
      ['end_date', 'The ending date'],
      ['weekend', 'Which days count as the weekend', 1],
      ['holidays', 'A range of dates to treat as non-working', 1],
    ],
  },
  DAYS: {
    c: 'Date & Time',
    d: 'Returns the number of days between two dates.',
    s: 'DAYS(end_date, start_date)',
    p: [
      ['end_date', 'The later date'],
      ['start_date', 'The earlier date'],
    ],
  },
  DAYS360: {
    c: 'Date & Time',
    d: 'Returns days between two dates on a 360-day accounting year.',
    s: 'DAYS360(start_date, end_date, [method])',
    p: [
      ['start_date', 'The starting date'],
      ['end_date', 'The ending date'],
      ['method', 'FALSE for the US method, TRUE for the European method', 1],
    ],
  },
  YEARFRAC: {
    c: 'Date & Time',
    d: 'Returns the fraction of a year between two dates.',
    s: 'YEARFRAC(start_date, end_date, [basis])',
    p: [
      ['start_date', 'The starting date'],
      ['end_date', 'The ending date'],
      ['basis', 'The day-count convention to use', 1],
    ],
  },

  // ------------------------------------------------------------- Financial
  PV: {
    c: 'Financial',
    d: 'Calculates the present value of a loan or investment.',
    s: 'PV(rate, nper, pmt, [fv], [type])',
    p: [
      ['rate', 'Interest rate per period'],
      ['nper', 'Total number of payment periods'],
      ['pmt', 'Payment made each period'],
      ['fv', 'Future value, defaulting to 0', 1],
      ['type', '0 if payments come at the end of the period, 1 at the beginning', 1],
    ],
  },
  FV: {
    c: 'Financial',
    d: 'Calculates the future value of an investment.',
    s: 'FV(rate, nper, pmt, [pv], [type])',
    p: [
      ['rate', 'Interest rate per period'],
      ['nper', 'Total number of payment periods'],
      ['pmt', 'Payment made each period'],
      ['pv', 'Present value, defaulting to 0', 1],
      ['type', '0 if payments come at the end of the period, 1 at the beginning', 1],
    ],
  },
  PMT: {
    c: 'Financial',
    d: 'Calculates the periodic payment for a loan.',
    s: 'PMT(rate, nper, pv, [fv], [type])',
    p: [
      ['rate', 'Interest rate per period'],
      ['nper', 'Total number of payment periods'],
      ['pv', 'Present value, that is the loan amount'],
      ['fv', 'Future value, defaulting to 0', 1],
      ['type', '0 if payments come at the end of the period, 1 at the beginning', 1],
    ],
    n: 'work out the payment per period on a loan of {2} over {1} periods at {0} per period',
  },
  IPMT: {
    c: 'Financial',
    d: 'Returns the interest portion of a specific loan payment.',
    s: 'IPMT(rate, per, nper, pv, [fv], [type])',
    p: [
      ['rate', 'Interest rate per period'],
      ['per', 'Which payment period to examine'],
      ['nper', 'Total number of payment periods'],
      ['pv', 'Present value, that is the loan amount'],
      ['fv', 'Future value', 1],
      ['type', 'Payment timing', 1],
    ],
  },
  PPMT: {
    c: 'Financial',
    d: 'Returns the principal portion of a specific loan payment.',
    s: 'PPMT(rate, per, nper, pv, [fv], [type])',
    p: [
      ['rate', 'Interest rate per period'],
      ['per', 'Which payment period to examine'],
      ['nper', 'Total number of payment periods'],
      ['pv', 'Present value, that is the loan amount'],
      ['fv', 'Future value', 1],
      ['type', 'Payment timing', 1],
    ],
  },
  RATE: {
    c: 'Financial',
    d: 'Calculates the interest rate per period of an annuity.',
    s: 'RATE(nper, pmt, pv, [fv], [type], [guess])',
    p: [
      ['nper', 'Total number of payment periods'],
      ['pmt', 'Payment made each period'],
      ['pv', 'Present value'],
      ['fv', 'Future value', 1],
      ['type', 'Payment timing', 1],
      ['guess', 'Your starting guess for the rate', 1],
    ],
  },
  NPER: {
    c: 'Financial',
    d: 'Calculates how many periods a loan or investment takes.',
    s: 'NPER(rate, pmt, pv, [fv], [type])',
    p: [
      ['rate', 'Interest rate per period'],
      ['pmt', 'Payment made each period'],
      ['pv', 'Present value'],
      ['fv', 'Future value', 1],
      ['type', 'Payment timing', 1],
    ],
  },
  NPV: {
    c: 'Financial',
    d: 'Calculates net present value from a discount rate and a series of future cash flows.',
    s: 'NPV(rate, value1, [value2], ...)',
    p: [
      ['rate', 'Discount rate for one period'],
      ['value1', 'First future cash flow'],
    ],
    r: [1, 1],
  },
  XNPV: {
    c: 'Financial',
    d: 'Calculates net present value for cash flows on specific dates.',
    s: 'XNPV(rate, values, dates)',
    p: [
      ['rate', 'The discount rate'],
      ['values', 'The cash flows'],
      ['dates', 'The date of each cash flow'],
    ],
  },
  IRR: {
    c: 'Financial',
    d: 'Calculates the internal rate of return for a series of evenly spaced cash flows.',
    s: 'IRR(values, [guess])',
    p: [
      ['values', 'The range of cash flows, which must include at least one negative and one positive'],
      ['guess', 'Your starting guess for the rate', 1],
    ],
  },
  XIRR: {
    c: 'Financial',
    d: 'Calculates the internal rate of return for cash flows on specific dates.',
    s: 'XIRR(values, dates, [guess])',
    p: [
      ['values', 'The cash flows'],
      ['dates', 'The date of each cash flow'],
      ['guess', 'Your starting guess for the rate', 1],
    ],
  },
  CUMIPMT: {
    c: 'Financial',
    d: 'Returns the cumulative interest paid between two periods.',
    s: 'CUMIPMT(rate, nper, pv, start_period, end_period, type)',
    p: [
      ['rate', 'Interest rate per period'],
      ['nper', 'Total number of payment periods'],
      ['pv', 'Present value'],
      ['start_period', 'First period in the range'],
      ['end_period', 'Last period in the range'],
      ['type', 'Payment timing'],
    ],
  },
  CUMPRINC: {
    c: 'Financial',
    d: 'Returns the cumulative principal paid between two periods.',
    s: 'CUMPRINC(rate, nper, pv, start_period, end_period, type)',
    p: [
      ['rate', 'Interest rate per period'],
      ['nper', 'Total number of payment periods'],
      ['pv', 'Present value'],
      ['start_period', 'First period in the range'],
      ['end_period', 'Last period in the range'],
      ['type', 'Payment timing'],
    ],
  },
  SLN: {
    c: 'Financial',
    d: 'Returns straight-line depreciation for one period.',
    s: 'SLN(cost, salvage, life)',
    p: [
      ['cost', 'The initial cost of the asset'],
      ['salvage', 'The value at the end of its life'],
      ['life', 'The number of periods of useful life'],
    ],
  },
  DB: {
    c: 'Financial',
    d: 'Returns fixed-declining-balance depreciation for a period.',
    s: 'DB(cost, salvage, life, period, [month])',
    p: [
      ['cost', 'The initial cost of the asset'],
      ['salvage', 'The value at the end of its life'],
      ['life', 'The number of periods of useful life'],
      ['period', 'The period to calculate'],
      ['month', 'Months in the first year', 1],
    ],
  },
  DDB: {
    c: 'Financial',
    d: 'Returns double-declining-balance depreciation for a period.',
    s: 'DDB(cost, salvage, life, period, [factor])',
    p: [
      ['cost', 'The initial cost of the asset'],
      ['salvage', 'The value at the end of its life'],
      ['life', 'The number of periods of useful life'],
      ['period', 'The period to calculate'],
      ['factor', 'The rate at which the balance declines', 1],
    ],
  },
  EFFECT: {
    c: 'Financial',
    d: 'Converts a nominal annual rate to an effective annual rate.',
    s: 'EFFECT(nominal_rate, npery)',
    p: [
      ['nominal_rate', 'The stated annual rate'],
      ['npery', 'Compounding periods per year'],
    ],
  },
  NOMINAL: {
    c: 'Financial',
    d: 'Converts an effective annual rate to a nominal annual rate.',
    s: 'NOMINAL(effect_rate, npery)',
    p: [
      ['effect_rate', 'The effective annual rate'],
      ['npery', 'Compounding periods per year'],
    ],
  },

  // ----------------------------------------------------------- Statistical
  MAX: { c: 'Statistical', d: 'Returns the largest value in a set.', s: 'MAX(number1, [number2], ...)', p: [['number1', 'First number or range']], r: [0, 1], n: 'find the largest value in {0}' },
  MIN: { c: 'Statistical', d: 'Returns the smallest value in a set.', s: 'MIN(number1, [number2], ...)', p: [['number1', 'First number or range']], r: [0, 1], n: 'find the smallest value in {0}' },
  MAXIFS: {
    c: 'Statistical',
    d: 'Returns the largest value among rows that meet several conditions.',
    s: 'MAXIFS(max_range, criteria_range1, criteria1, ...)',
    p: [
      ['max_range', 'The range to find the maximum in'],
      ['criteria_range1', 'First range to test'],
      ['criteria1', 'First condition to meet'],
    ],
    r: [1, 2],
    since: 'Excel 2019',
  },
  MINIFS: {
    c: 'Statistical',
    d: 'Returns the smallest value among rows that meet several conditions.',
    s: 'MINIFS(min_range, criteria_range1, criteria1, ...)',
    p: [
      ['min_range', 'The range to find the minimum in'],
      ['criteria_range1', 'First range to test'],
      ['criteria1', 'First condition to meet'],
    ],
    r: [1, 2],
    since: 'Excel 2019',
  },
  MEDIAN: { c: 'Statistical', d: 'Returns the middle value of a set of numbers.', s: 'MEDIAN(number1, [number2], ...)', p: [['number1', 'First number or range']], r: [0, 1], n: 'find the median of {0}' },
  MODE: { c: 'Statistical', d: 'Returns the most frequently occurring value.', s: 'MODE(number1, [number2], ...)', p: [['number1', 'First number or range']], r: [0, 1], legacy: ['MODE.SNGL', 'MODE is kept for compatibility; MODE.SNGL is the current name'] },
  'MODE.SNGL': { c: 'Statistical', d: 'Returns the most frequently occurring value.', s: 'MODE.SNGL(number1, [number2], ...)', p: [['number1', 'First number or range']], r: [0, 1] },
  'MODE.MULT': { c: 'Statistical', d: 'Returns every value that ties for most frequent.', s: 'MODE.MULT(number1, [number2], ...)', p: [['number1', 'First number or range']], r: [0, 1] },
  STDEV: { c: 'Statistical', d: 'Estimates standard deviation from a sample.', s: 'STDEV(number1, [number2], ...)', p: [['number1', 'First number or range']], r: [0, 1], legacy: ['STDEV.S', 'STDEV is kept for compatibility; STDEV.S is the current name'] },
  'STDEV.S': { c: 'Statistical', d: 'Estimates standard deviation from a sample.', s: 'STDEV.S(number1, [number2], ...)', p: [['number1', 'First number or range']], r: [0, 1] },
  'STDEV.P': { c: 'Statistical', d: 'Calculates standard deviation across an entire population.', s: 'STDEV.P(number1, [number2], ...)', p: [['number1', 'First number or range']], r: [0, 1] },
  VAR: { c: 'Statistical', d: 'Estimates variance from a sample.', s: 'VAR(number1, [number2], ...)', p: [['number1', 'First number or range']], r: [0, 1], legacy: ['VAR.S', 'VAR is kept for compatibility; VAR.S is the current name'] },
  'VAR.S': { c: 'Statistical', d: 'Estimates variance from a sample.', s: 'VAR.S(number1, [number2], ...)', p: [['number1', 'First number or range']], r: [0, 1] },
  'VAR.P': { c: 'Statistical', d: 'Calculates variance across an entire population.', s: 'VAR.P(number1, [number2], ...)', p: [['number1', 'First number or range']], r: [0, 1] },
  RANK: {
    c: 'Statistical',
    d: 'Returns the position of a number within a list.',
    s: 'RANK(number, ref, [order])',
    p: [
      ['number', 'The number to rank'],
      ['ref', 'The list of numbers to rank within'],
      ['order', '0 to rank largest first, 1 to rank smallest first', 1],
    ],
    legacy: ['RANK.EQ', 'RANK is kept for compatibility; RANK.EQ is the current name'],
  },
  'RANK.EQ': {
    c: 'Statistical',
    d: 'Returns the position of a number within a list, giving ties the same rank.',
    s: 'RANK.EQ(number, ref, [order])',
    p: [
      ['number', 'The number to rank'],
      ['ref', 'The list of numbers to rank within'],
      ['order', '0 to rank largest first, 1 to rank smallest first', 1],
    ],
  },
  'RANK.AVG': {
    c: 'Statistical',
    d: 'Returns the position of a number within a list, averaging the rank of ties.',
    s: 'RANK.AVG(number, ref, [order])',
    p: [
      ['number', 'The number to rank'],
      ['ref', 'The list of numbers to rank within'],
      ['order', '0 to rank largest first, 1 to rank smallest first', 1],
    ],
  },
  LARGE: {
    c: 'Statistical',
    d: 'Returns the k-th largest value in a set.',
    s: 'LARGE(array, k)',
    p: [
      ['array', 'The range of data'],
      ['k', 'Which position from the top to return'],
    ],
    n: 'find the {1}th largest value in {0}',
  },
  SMALL: {
    c: 'Statistical',
    d: 'Returns the k-th smallest value in a set.',
    s: 'SMALL(array, k)',
    p: [
      ['array', 'The range of data'],
      ['k', 'Which position from the bottom to return'],
    ],
    n: 'find the {1}th smallest value in {0}',
  },
  PERCENTILE: {
    c: 'Statistical',
    d: 'Returns the value at a given percentile of a data set.',
    s: 'PERCENTILE(array, k)',
    p: [
      ['array', 'The range of data'],
      ['k', 'The percentile, between 0 and 1'],
    ],
    legacy: ['PERCENTILE.INC', 'PERCENTILE is kept for compatibility; PERCENTILE.INC is the current name'],
  },
  'PERCENTILE.INC': { c: 'Statistical', d: 'Returns the value at a given percentile, including the endpoints.', s: 'PERCENTILE.INC(array, k)', p: [['array', 'The range of data'], ['k', 'The percentile, between 0 and 1']] },
  'PERCENTILE.EXC': { c: 'Statistical', d: 'Returns the value at a given percentile, excluding the endpoints.', s: 'PERCENTILE.EXC(array, k)', p: [['array', 'The range of data'], ['k', 'The percentile, between 0 and 1 exclusive']] },
  QUARTILE: { c: 'Statistical', d: 'Returns the quartile of a data set.', s: 'QUARTILE(array, quart)', p: [['array', 'The range of data'], ['quart', '0 minimum, 1 first quartile, 2 median, 3 third quartile, 4 maximum']] },
  CORREL: { c: 'Statistical', d: 'Returns the correlation coefficient between two data sets.', s: 'CORREL(array1, array2)', p: [['array1', 'The first data set'], ['array2', 'The second data set']] },
  SLOPE: { c: 'Statistical', d: 'Returns the slope of the best-fit line through two data sets.', s: 'SLOPE(known_ys, known_xs)', p: [['known_ys', 'The dependent values'], ['known_xs', 'The independent values']] },
  INTERCEPT: { c: 'Statistical', d: 'Returns where the best-fit line crosses the y-axis.', s: 'INTERCEPT(known_ys, known_xs)', p: [['known_ys', 'The dependent values'], ['known_xs', 'The independent values']] },
  FORECAST: {
    c: 'Statistical',
    d: 'Predicts a value along a linear trend.',
    s: 'FORECAST(x, known_ys, known_xs)',
    p: [
      ['x', 'The point to predict for'],
      ['known_ys', 'The known dependent values'],
      ['known_xs', 'The known independent values'],
    ],
  },
  TREND: {
    c: 'Statistical',
    d: 'Returns values along a linear trend line.',
    s: 'TREND(known_ys, [known_xs], [new_xs], [const])',
    p: [
      ['known_ys', 'The known dependent values'],
      ['known_xs', 'The known independent values', 1],
      ['new_xs', 'The points to predict for', 1],
      ['const', 'FALSE to force the intercept to zero', 1],
    ],
  },
  LINEST: {
    c: 'Statistical',
    d: 'Returns the statistics of a linear regression.',
    s: 'LINEST(known_ys, [known_xs], [const], [stats])',
    p: [
      ['known_ys', 'The known dependent values'],
      ['known_xs', 'The known independent values', 1],
      ['const', 'FALSE to force the intercept to zero', 1],
      ['stats', 'TRUE to return extra regression statistics', 1],
    ],
  },

  // ---------------------------------------------------------- Dynamic Array
  FILTER: {
    c: 'Dynamic Array',
    d: 'Returns only the rows of a range that meet a condition, spilling the result into neighbouring cells.',
    s: 'FILTER(array, include, [if_empty])',
    p: [
      ['array', 'The range to filter'],
      ['include', 'A condition producing TRUE for the rows to keep'],
      ['if_empty', 'What to return when nothing matches', 1],
    ],
    n: 'keep only the rows of {0} where {1}{2?, or show $ if nothing matches}',
    since: 'Excel 2021 / Microsoft 365',
  },
  SORT: {
    c: 'Dynamic Array',
    d: 'Sorts a range and spills the sorted result.',
    s: 'SORT(array, [sort_index], [sort_order], [by_col])',
    p: [
      ['array', 'The range to sort'],
      ['sort_index', 'Which column or row to sort by', 1],
      ['sort_order', '1 for ascending, -1 for descending', 1],
      ['by_col', 'TRUE to sort left to right instead of top to bottom', 1],
    ],
    n: 'sort {0} and spill the result',
    since: 'Excel 2021 / Microsoft 365',
  },
  SORTBY: {
    c: 'Dynamic Array',
    d: 'Sorts a range using the values of another range as the sort key.',
    s: 'SORTBY(array, by_array1, [sort_order1], ...)',
    p: [
      ['array', 'The range to sort'],
      ['by_array1', 'The range whose values decide the order'],
      ['sort_order1', '1 for ascending, -1 for descending', 1],
    ],
    r: [1, 2],
    since: 'Excel 2021 / Microsoft 365',
  },
  UNIQUE: {
    c: 'Dynamic Array',
    d: 'Returns the distinct values from a range, removing duplicates.',
    s: 'UNIQUE(array, [by_col], [exactly_once])',
    p: [
      ['array', 'The range to take distinct values from'],
      ['by_col', 'TRUE to compare columns instead of rows', 1],
      ['exactly_once', 'TRUE to return only values that appear exactly once', 1],
    ],
    n: 'return the distinct values in {0}',
    since: 'Excel 2021 / Microsoft 365',
  },
  SEQUENCE: {
    c: 'Dynamic Array',
    d: 'Generates a spilled list of sequential numbers.',
    s: 'SEQUENCE(rows, [columns], [start], [step])',
    p: [
      ['rows', 'How many rows to generate'],
      ['columns', 'How many columns to generate', 1],
      ['start', 'The first number in the sequence', 1],
      ['step', 'How much to add each time', 1],
    ],
    n: 'generate a list of {0} sequential numbers',
    since: 'Excel 2021 / Microsoft 365',
  },
  RANDARRAY: {
    c: 'Dynamic Array',
    d: 'Generates a spilled array of random numbers.',
    s: 'RANDARRAY([rows], [columns], [min], [max], [whole_number])',
    p: [
      ['rows', 'How many rows to generate', 1],
      ['columns', 'How many columns to generate', 1],
      ['min', 'The smallest value', 1],
      ['max', 'The largest value', 1],
      ['whole_number', 'TRUE to return integers', 1],
    ],
    vol: true,
    since: 'Excel 2021 / Microsoft 365',
  },
  VSTACK: { c: 'Dynamic Array', d: 'Stacks ranges on top of each other into one array.', s: 'VSTACK(array1, [array2], ...)', p: [['array1', 'First range to stack']], r: [0, 1], since: 'Microsoft 365' },
  HSTACK: { c: 'Dynamic Array', d: 'Places ranges side by side into one array.', s: 'HSTACK(array1, [array2], ...)', p: [['array1', 'First range to stack']], r: [0, 1], since: 'Microsoft 365' },
  TOCOL: { c: 'Dynamic Array', d: 'Flattens an array into a single column.', s: 'TOCOL(array, [ignore], [scan_by_column])', p: [['array', 'The array to flatten'], ['ignore', 'What to skip: 1 blanks, 2 errors, 3 both', 1], ['scan_by_column', 'TRUE to read down columns first', 1]], since: 'Microsoft 365' },
  TOROW: { c: 'Dynamic Array', d: 'Flattens an array into a single row.', s: 'TOROW(array, [ignore], [scan_by_column])', p: [['array', 'The array to flatten'], ['ignore', 'What to skip: 1 blanks, 2 errors, 3 both', 1], ['scan_by_column', 'TRUE to read down columns first', 1]], since: 'Microsoft 365' },
  WRAPROWS: { c: 'Dynamic Array', d: 'Wraps a single row or column into multiple rows of a set width.', s: 'WRAPROWS(vector, wrap_count, [pad_with])', p: [['vector', 'The row or column to wrap'], ['wrap_count', 'How many values per row'], ['pad_with', 'Value used to fill the gap', 1]], since: 'Microsoft 365' },
  WRAPCOLS: { c: 'Dynamic Array', d: 'Wraps a single row or column into multiple columns of a set height.', s: 'WRAPCOLS(vector, wrap_count, [pad_with])', p: [['vector', 'The row or column to wrap'], ['wrap_count', 'How many values per column'], ['pad_with', 'Value used to fill the gap', 1]], since: 'Microsoft 365' },
  CHOOSECOLS: { c: 'Dynamic Array', d: 'Returns the chosen columns from an array.', s: 'CHOOSECOLS(array, col_num1, [col_num2], ...)', p: [['array', 'The source array'], ['col_num1', 'The first column to keep']], r: [1, 1], since: 'Microsoft 365' },
  CHOOSEROWS: { c: 'Dynamic Array', d: 'Returns the chosen rows from an array.', s: 'CHOOSEROWS(array, row_num1, [row_num2], ...)', p: [['array', 'The source array'], ['row_num1', 'The first row to keep']], r: [1, 1], since: 'Microsoft 365' },
  TAKE: { c: 'Dynamic Array', d: 'Takes a number of rows or columns from the start or end of an array.', s: 'TAKE(array, rows, [columns])', p: [['array', 'The source array'], ['rows', 'How many rows to take; negative counts from the end'], ['columns', 'How many columns to take', 1]], since: 'Microsoft 365' },
  DROP: { c: 'Dynamic Array', d: 'Removes a number of rows or columns from the start or end of an array.', s: 'DROP(array, rows, [columns])', p: [['array', 'The source array'], ['rows', 'How many rows to drop; negative drops from the end'], ['columns', 'How many columns to drop', 1]], since: 'Microsoft 365' },
  EXPAND: { c: 'Dynamic Array', d: 'Grows an array to a given size, padding the new cells.', s: 'EXPAND(array, rows, [columns], [pad_with])', p: [['array', 'The source array'], ['rows', 'The target number of rows'], ['columns', 'The target number of columns', 1], ['pad_with', 'Value used for the new cells', 1]], since: 'Microsoft 365' },
  BYROW: { c: 'Dynamic Array', d: 'Applies a LAMBDA to each row and returns one result per row.', s: 'BYROW(array, lambda)', p: [['array', 'The source array'], ['lambda', 'A LAMBDA taking one row at a time']], since: 'Microsoft 365' },
  BYCOL: { c: 'Dynamic Array', d: 'Applies a LAMBDA to each column and returns one result per column.', s: 'BYCOL(array, lambda)', p: [['array', 'The source array'], ['lambda', 'A LAMBDA taking one column at a time']], since: 'Microsoft 365' },
  MAP: { c: 'Dynamic Array', d: 'Applies a LAMBDA to every value in an array.', s: 'MAP(array1, [array2], ..., lambda)', p: [['array1', 'The source array'], ['lambda', 'A LAMBDA applied to each value']], r: [0, 1], t: 1, since: 'Microsoft 365' },
  REDUCE: { c: 'Dynamic Array', d: 'Reduces an array to a single value by applying a LAMBDA repeatedly.', s: 'REDUCE(initial_value, array, lambda)', p: [['initial_value', 'The starting accumulator value'], ['array', 'The array to reduce'], ['lambda', 'A LAMBDA taking the accumulator and the current value']], since: 'Microsoft 365' },
  SCAN: { c: 'Dynamic Array', d: 'Like REDUCE, but returns the running result at each step.', s: 'SCAN(initial_value, array, lambda)', p: [['initial_value', 'The starting accumulator value'], ['array', 'The array to scan'], ['lambda', 'A LAMBDA taking the accumulator and the current value']], since: 'Microsoft 365' },
  GROUPBY: {
    c: 'Dynamic Array',
    d: 'Groups rows by one or more fields and aggregates them, like a formula-driven PivotTable.',
    s: 'GROUPBY(row_fields, values, function, [field_headers], [total_depth], [sort_order], [filter_array])',
    p: [
      ['row_fields', 'The column to group by'],
      ['values', 'The column to aggregate'],
      ['function', 'The aggregation to apply, such as SUM'],
      ['field_headers', 'Whether the source has headers', 1],
      ['total_depth', 'How many total rows to add', 1],
      ['sort_order', 'How to sort the groups', 1],
      ['filter_array', 'A condition limiting which rows are included', 1],
    ],
    av: 'excel',
    since: 'Microsoft 365',
  },
  PIVOTBY: {
    c: 'Dynamic Array',
    d: 'Builds a two-dimensional summary from row fields, column fields, and an aggregation.',
    s: 'PIVOTBY(row_fields, col_fields, values, function, ...)',
    p: [
      ['row_fields', 'The column to group down the side'],
      ['col_fields', 'The column to group across the top'],
      ['values', 'The column to aggregate'],
      ['function', 'The aggregation to apply, such as SUM'],
    ],
    av: 'excel',
    since: 'Microsoft 365',
  },

  // ------------------------------------------------------------ Information
  ISNUMBER: { c: 'Information', d: 'Returns TRUE when a value is a number.', s: 'ISNUMBER(value)', p: [['value', 'The value to test']], n: 'check whether {0} is a number' },
  ISTEXT: { c: 'Information', d: 'Returns TRUE when a value is text.', s: 'ISTEXT(value)', p: [['value', 'The value to test']], n: 'check whether {0} is text' },
  ISBLANK: { c: 'Information', d: 'Returns TRUE when a cell is empty.', s: 'ISBLANK(value)', p: [['value', 'The cell to test']], n: 'check whether {0} is empty' },
  ISERROR: { c: 'Information', d: 'Returns TRUE for any error value.', s: 'ISERROR(value)', p: [['value', 'The value to test']], n: 'check whether {0} produces an error' },
  ISERR: { c: 'Information', d: 'Returns TRUE for any error except #N/A.', s: 'ISERR(value)', p: [['value', 'The value to test']] },
  ISNA: { c: 'Information', d: 'Returns TRUE only for the #N/A error.', s: 'ISNA(value)', p: [['value', 'The value to test']] },
  ISLOGICAL: { c: 'Information', d: 'Returns TRUE when a value is TRUE or FALSE.', s: 'ISLOGICAL(value)', p: [['value', 'The value to test']] },
  ISREF: { c: 'Information', d: 'Returns TRUE when a value is a cell reference.', s: 'ISREF(value)', p: [['value', 'The value to test']] },
  ISFORMULA: { c: 'Information', d: 'Returns TRUE when a cell contains a formula.', s: 'ISFORMULA(reference)', p: [['reference', 'The cell to test']] },
  ISODD: { c: 'Information', d: 'Returns TRUE when a number is odd.', s: 'ISODD(number)', p: [['number', 'The number to test']] },
  ISEVEN: { c: 'Information', d: 'Returns TRUE when a number is even.', s: 'ISEVEN(number)', p: [['number', 'The number to test']] },
  NA: { c: 'Information', d: 'Returns the #N/A error deliberately.', s: 'NA()', p: [] },
  TYPE: { c: 'Information', d: 'Returns a number describing a value type: 1 number, 2 text, 4 logical, 16 error, 64 array.', s: 'TYPE(value)', p: [['value', 'The value to check']] },
  'ERROR.TYPE': { c: 'Information', d: 'Returns a number identifying which error a value is.', s: 'ERROR.TYPE(error_val)', p: [['error_val', 'The error value to identify']] },
  CELL: {
    c: 'Information',
    d: 'Returns information about a cell such as its address, format, or contents.',
    s: 'CELL(info_type, [reference])',
    p: [
      ['info_type', 'What to return, such as "address", "col", "row", or "format"'],
      ['reference', 'The cell to describe', 1],
    ],
    vol: true,
  },
  INFO: { c: 'Information', d: 'Returns information about the current operating environment.', s: 'INFO(type_text)', p: [['type_text', 'What to return, such as "numfile" or "osversion"']], vol: true },
  SHEET: { c: 'Information', d: 'Returns the sheet number of a reference.', s: 'SHEET([value])', p: [['value', 'The sheet or reference to look up', 1]] },
  SHEETS: { c: 'Information', d: 'Returns the number of sheets in a reference.', s: 'SHEETS([reference])', p: [['reference', 'The reference to count sheets in', 1]] },

  // -------------------------------------------------------- Google Sheets
  QUERY: {
    c: 'Google Sheets',
    d: 'Runs a Google Visualization query, an SQL-like language, over a range of data.',
    s: 'QUERY(data, query, [headers])',
    p: [
      ['data', 'The range to query'],
      ['query', 'The query string, written in the Google Visualization query language'],
      ['headers', 'How many header rows the data has', 1],
    ],
    n: 'run the query {1} over {0}',
    av: 'sheets',
  },
  ARRAYFORMULA: {
    c: 'Google Sheets',
    d: 'Makes a formula apply to a whole range at once instead of a single cell.',
    s: 'ARRAYFORMULA(array_formula)',
    p: [['array_formula', 'The formula to apply across the range']],
    n: 'apply the enclosed formula across the whole range at once',
    av: 'sheets',
  },
  IMPORTRANGE: {
    c: 'Google Sheets',
    d: 'Pulls a range of cells from another Google Sheets spreadsheet.',
    s: 'IMPORTRANGE(spreadsheet_url, range_string)',
    p: [
      ['spreadsheet_url', 'The URL or key of the source spreadsheet'],
      ['range_string', 'The sheet and range to import, such as "Sheet1!A1:C10"'],
    ],
    av: 'sheets',
  },
  IMPORTHTML: {
    c: 'Google Sheets',
    d: 'Imports a table or list from a web page.',
    s: 'IMPORTHTML(url, query, [index])',
    p: [
      ['url', 'The page to read'],
      ['query', 'Either "table" or "list"'],
      ['index', 'Which table or list on the page to take', 1],
    ],
    av: 'sheets',
  },
  SPLIT: {
    c: 'Google Sheets',
    d: 'Splits text around a delimiter into separate cells.',
    s: 'SPLIT(text, delimiter, [split_by_each], [remove_empty_text])',
    p: [
      ['text', 'The text to split'],
      ['delimiter', 'The character or characters to split on'],
      ['split_by_each', 'TRUE to split on each character of the delimiter', 1],
      ['remove_empty_text', 'TRUE to drop empty results', 1],
    ],
    n: 'split {0} into separate cells wherever {1} appears',
    av: 'sheets',
  },
  JOIN: {
    c: 'Google Sheets',
    d: 'Joins the values of an array into one string using a delimiter.',
    s: 'JOIN(delimiter, value_or_array1, ...)',
    p: [
      ['delimiter', 'The text placed between each value'],
      ['value_or_array1', 'The first value or array to join'],
    ],
    r: [1, 1],
    av: 'sheets',
  },
  REGEXMATCH: {
    c: 'Google Sheets',
    d: 'Returns TRUE when text matches a regular expression.',
    s: 'REGEXMATCH(text, regular_expression)',
    p: [
      ['text', 'The text to test'],
      ['regular_expression', 'The pattern to match against'],
    ],
    av: 'sheets',
  },
  REGEXEXTRACT: {
    c: 'Google Sheets',
    d: 'Returns the first part of text that matches a regular expression.',
    s: 'REGEXEXTRACT(text, regular_expression)',
    p: [
      ['text', 'The text to search'],
      ['regular_expression', 'The pattern to extract'],
    ],
    n: 'pull the part of {0} that matches the pattern {1}',
    av: 'sheets',
  },
  REGEXREPLACE: {
    c: 'Google Sheets',
    d: 'Replaces the parts of text matching a regular expression.',
    s: 'REGEXREPLACE(text, regular_expression, replacement)',
    p: [
      ['text', 'The text to modify'],
      ['regular_expression', 'The pattern to find'],
      ['replacement', 'The text to put in its place'],
    ],
    av: 'sheets',
  },
  GOOGLEFINANCE: {
    c: 'Google Sheets',
    d: 'Fetches current or historical securities data from Google Finance.',
    s: 'GOOGLEFINANCE(ticker, [attribute], [start_date], [end_date], [interval])',
    p: [
      ['ticker', 'The security to look up'],
      ['attribute', 'Which figure to return, such as "price"', 1],
      ['start_date', 'Start of a historical range', 1],
      ['end_date', 'End of a historical range', 1],
      ['interval', 'DAILY or WEEKLY for historical data', 1],
    ],
    av: 'sheets',
    vol: true,
  },
  GOOGLETRANSLATE: {
    c: 'Google Sheets',
    d: 'Translates text from one language to another.',
    s: 'GOOGLETRANSLATE(text, [source_language], [target_language])',
    p: [
      ['text', 'The text to translate'],
      ['source_language', 'The language code to translate from', 1],
      ['target_language', 'The language code to translate into', 1],
    ],
    av: 'sheets',
  },
  FLATTEN: {
    c: 'Google Sheets',
    d: 'Flattens one or more ranges into a single column.',
    s: 'FLATTEN(range1, [range2], ...)',
    p: [['range1', 'The first range to flatten']],
    r: [0, 1],
    av: 'sheets',
  },
  SPARKLINE: {
    c: 'Google Sheets',
    d: 'Draws a miniature chart inside a single cell.',
    s: 'SPARKLINE(data, [options])',
    p: [
      ['data', 'The range to chart'],
      ['options', 'A range or array of chart options', 1],
    ],
    av: 'sheets',
  },
};

function normalize(name: string, raw: RawDef): ExcelFunctionDef {
  const params: ExcelParam[] = raw.p.map(([pname, pdesc, opt]) => ({
    name: pname,
    description: pdesc,
    optional: opt === 1,
  }));
  const required = params.filter((p) => !p.optional).length;
  const variadic = raw.r !== undefined;
  return {
    name,
    category: raw.c,
    description: raw.d,
    syntax: raw.s,
    params,
    minArgs: raw.min ?? required,
    maxArgs: raw.max ?? (variadic ? Infinity : params.length),
    repeatFrom: raw.r?.[0],
    repeatSize: raw.r?.[1],
    tailParams: raw.t,
    narrative: raw.n,
    availability: raw.av ?? 'both',
    since: raw.since,
    volatile: raw.vol,
    legacy: raw.legacy ? { replacement: raw.legacy[0], note: raw.legacy[1] } : undefined,
    arguments: params.map((p) => ({
      name: p.name,
      description: p.optional ? `${p.description} (optional)` : p.description,
    })),
  };
}

export const EXCEL_FUNCTIONS: Record<string, ExcelFunctionDef> = Object.fromEntries(
  Object.entries(RAW).map(([name, raw]) => [name, normalize(name, raw)])
);

export const EXCEL_FUNCTION_LIST: ExcelFunctionDef[] = Object.values(EXCEL_FUNCTIONS);

/**
 * Look a function up by the name as written in a formula. Handles lowercase
 * input and the `_xlfn.` / `_xlws.` prefixes that appear when a workbook is
 * opened in an older Excel build.
 */
export function lookupFunction(rawName: string): ExcelFunctionDef | undefined {
  const cleaned = rawName.replace(/^_xlfn\./i, '').replace(/^_xlws\./i, '').toUpperCase();
  return EXCEL_FUNCTIONS[cleaned];
}

/**
 * Returns the parameter that applies to argument `index`, expanding repeating
 * groups so the 5th argument of SUMIFS is named `criteria_range2` rather than
 * falling off the end of the list.
 *
 * `totalArgs` is only needed for functions with trailing parameters (LET,
 * LAMBDA, MAP), where the last argument is the calculation rather than another
 * repetition.
 */
export function paramForIndex(
  def: ExcelFunctionDef,
  index: number,
  totalArgs?: number
): { name: string; description: string; optional: boolean } | undefined {
  const tail = def.tailParams ?? 0;

  if (tail > 0 && totalArgs !== undefined) {
    const tailStart = totalArgs - tail;
    if (index >= tailStart) {
      const param = def.params[def.params.length - tail + (index - tailStart)];
      if (param) return { ...param };
    }
  }

  // Everything before the trailing parameters takes part in the repetition.
  const bodyParams = tail > 0 ? def.params.slice(0, def.params.length - tail) : def.params;

  if (index < bodyParams.length) return { ...bodyParams[index] };

  if (def.repeatFrom === undefined || !def.repeatSize) {
    return index < def.params.length ? { ...def.params[index] } : undefined;
  }

  const { repeatFrom, repeatSize } = def;
  const offset = index - repeatFrom;
  const cycle = Math.floor(offset / repeatSize) + 1;
  const slot = offset % repeatSize;
  const base = bodyParams[repeatFrom + slot];
  if (!base) return undefined;
  const numbered = base.name.replace(/\d+$/, '') + cycle;
  return {
    name: base.name.match(/\d+$/) ? numbered : `${base.name} ${cycle}`,
    description: base.description,
    optional: true,
  };
}
