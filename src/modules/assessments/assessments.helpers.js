/**
 * Validate that result ranges are:
 * - Non-empty array
 * - Sorted ascending by minScore
 * - Non-overlapping
 * - Contiguous (no gaps)
 * - Starting at 0
 * Returns null if valid, or an error message string if invalid.
 */
export function validateResultRanges(ranges) {
  if (!Array.isArray(ranges) || ranges.length === 0) {
    return "Result ranges must be a non-empty array";
  }

  const sorted = [...ranges].sort((a, b) => a.minScore - b.minScore);

  if (sorted[0].minScore !== 0) {
    return "Result ranges must start at minScore 0";
  }

  if (sorted[sorted.length - 1].maxScore !== 10) {
    return "Result ranges must end at maxScore 10";
  }

  for (let i = 0; i < sorted.length; i++) {
    const range = sorted[i];

    if (range.maxScore < range.minScore) {
      return `Range "${range.label}": maxScore must be >= minScore`;
    }

    if (i > 0) {
      const prev = sorted[i - 1];
      if (range.minScore !== prev.maxScore + 1) {
        return `Gap or overlap detected between ranges "${prev.label}" and "${range.label}"`;
      }
    }
  }

  return null;
}

/**
 * Determine which questions are visible for a given answers map.
 * Processes questions in ascending order order.
 * A question without a condition is always visible.
 * A question with a condition is visible only if the trigger question
 * was answered with one of the specified choiceIds.
 *
 * @param {Array} questions - the section's embedded questions
 * @param {Map<string, string>} answerMap - questionId (string) → choiceId (string)
 * @returns {Array} visibleQuestions sorted by order
 */
export function resolveVisibleQuestions(questions, answerMap) {
  const sorted = [...questions].sort((a, b) => a.order - b.order);

  return sorted.filter((q) => {
    if (!q.condition) return true;

    const triggerAnswer = answerMap.get(q.condition.questionId.toString());
    if (!triggerAnswer) return false;

    return q.condition.choiceIds
      .map((id) => id.toString())
      .includes(triggerAnswer);
  });
}

/**
 * Calculate the section score from visible answers.
 * Only visible questions contribute to the score.
 *
 * @param {Array} questions - the section's embedded questions
 * @param {Array} answers - array of { questionId, choiceId }
 * @returns {number} the section score
 */
export function calculateSectionScore(questions, answers) {
  const answerMap = new Map(
    answers.map((a) => [a.questionId.toString(), a.choiceId.toString()]),
  );

  const visibleQuestions = resolveVisibleQuestions(questions, answerMap);
  let score = 0;

  for (const q of visibleQuestions) {
    const choiceIdStr = answerMap.get(q._id.toString());
    if (!choiceIdStr) continue;
    const choice = q.choices.find((c) => c._id.toString() === choiceIdStr);
    if (choice) score += choice.score;
  }

  return score;
}

/**
 * Find the result range that matches a given score.
 * Returns the matching range object or null.
 */
export function matchResultRange(ranges, score) {
  return ranges.find((r) => score >= r.minScore && score <= r.maxScore) ?? null;
}

/**
 * Compute max possible score for a section.
 * Assumes all conditional questions are visible (worst-case upper bound).
 */
export function sectionMaxPossibleScore(questions) {
  return questions.reduce((total, q) => {
    const maxChoiceScore = Math.max(...q.choices.map((c) => c.score));
    return total + maxChoiceScore;
  }, 0);
}

/**
 * Build the answer snapshots for a section, marking conditional questions.
 * Only includes visible questions' answers.
 *
 * @param {Array} questions - the section's embedded questions
 * @param {Array} answers - array of { questionId, choiceId }
 * @returns {Array} answerSnapshots
 */
export function buildAnswerSnapshots(questions, answers) {
  const answerMap = new Map(
    answers.map((a) => [a.questionId.toString(), a.choiceId.toString()]),
  );

  const visibleQuestions = resolveVisibleQuestions(questions, answerMap);
  const snapshots = [];

  for (const q of visibleQuestions) {
    const choiceIdStr = answerMap.get(q._id.toString());
    if (!choiceIdStr) continue;
    const choice = q.choices.find((c) => c._id.toString() === choiceIdStr);
    if (!choice) continue;

    snapshots.push({
      questionId: q._id,
      questionText: q.text,
      choiceId: choice._id,
      choiceText: choice.text,
      score: choice.score,
      wasConditional: !!q.condition,
    });
  }

  return snapshots;
}

/**
 * Strip scores from choices before returning form data to a customer.
 * Returns a new form structure with choices lacking the score field.
 * If lang is provided, all { en, ar } text fields are resolved to that language.
 */
export function stripScoresFromForm(form, lang = null) {
  const plain = form.toJSON ? form.toJSON() : { ...form };

  if (plain.sections) {
    plain.sections = plain.sections.map((section) => {
      const s = section.toJSON ? section.toJSON() : { ...section };
      if (s.questions) {
        s.questions = s.questions.map((q) => {
          const question = { ...q };
          question.choices = (question.choices || []).map(
            // eslint-disable-next-line no-unused-vars
            ({ score, ...rest }) => rest,
          );
          return question;
        });
      }
      // Never expose result ranges to customers
      delete s.resultRanges;
      return s;
    });
  }

  return lang ? localizeContent(plain, lang) : plain;
}

/**
 * Deep-localize an object tree by replacing every { en, ar } leaf
 * with the value for the given language (falls back to "en").
 * Skips Mongoose ObjectIds, Dates, and other non-plain objects.
 */
export function localizeContent(obj, lang) {
  if (obj === null || obj === undefined) return obj;

  // Detect a localized text leaf: plain object where both en and ar are strings
  if (
    typeof obj === "object" &&
    !Array.isArray(obj) &&
    typeof obj.en === "string" &&
    typeof obj.ar === "string"
  ) {
    return obj[lang] ?? obj.en;
  }

  if (Array.isArray(obj)) return obj.map((item) => localizeContent(item, lang));

  if (typeof obj === "object") {
    // Skip Date objects, ObjectIds, Buffers, etc.
    if (obj instanceof Date || obj._bsontype) return obj;
    const result = {};
    for (const [key, val] of Object.entries(obj)) {
      result[key] = localizeContent(val, lang);
    }
    return result;
  }

  return obj;
}
