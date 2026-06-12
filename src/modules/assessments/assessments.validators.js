import { body, param, query } from "express-validator";

// ─── Localized text field helper ─────────────────────────────────────────────
// Returns validators for a { en, ar } text field.
// When required=true, both sub-fields are mandatory.
// When required=false, both are optional but validated if present.
const localizedField = (
  fieldPath,
  { required = true, min = 1, max = 500 } = {},
) => {
  if (required) {
    return [
      body(`${fieldPath}.en`)
        .trim()
        .notEmpty()
        .withMessage(["REQUIRED_FIELD", { field: `${fieldPath}.en` }])
        .isLength({ min, max })
        .withMessage(["INVALID_LENGTH", { min, max }]),
      body(`${fieldPath}.ar`)
        .trim()
        .notEmpty()
        .withMessage(["REQUIRED_FIELD", { field: `${fieldPath}.ar` }])
        .isLength({ min, max })
        .withMessage(["INVALID_LENGTH", { min, max }]),
    ];
  }
  return [
    body(`${fieldPath}.en`)
      .optional()
      .trim()
      .isLength({ max })
      .withMessage(["INVALID_LENGTH", { max }]),
    body(`${fieldPath}.ar`)
      .optional()
      .trim()
      .isLength({ max })
      .withMessage(["INVALID_LENGTH", { max }]),
  ];
};

// ─── Param validators ────────────────────────────────────────────────────────

const formId = [
  param("formId")
    .isMongoId()
    .withMessage(["INVALID_MONGO_ID_FORMAT", { field: "formId" }]),
];

const sectionId = [
  param("sectionId")
    .isMongoId()
    .withMessage(["INVALID_MONGO_ID_FORMAT", { field: "sectionId" }]),
];

const questionId = [
  param("questionId")
    .isMongoId()
    .withMessage(["INVALID_MONGO_ID_FORMAT", { field: "questionId" }]),
];

const userId = [
  param("userId")
    .isMongoId()
    .withMessage(["INVALID_MONGO_ID_FORMAT", { field: "userId" }]),
];

// ─── Pagination ───────────────────────────────────────────────────────────────

const pagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage(["INVALID_PAGE_NUMBER"]),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage(["INVALID_LIMIT_NUMBER"]),
];

const submissionsFilter = [
  ...pagination,
  query("formId")
    .optional()
    .isMongoId()
    .withMessage(["INVALID_MONGO_ID_FORMAT", { field: "formId" }]),
  query("dateFrom")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage(["INVALID_FORMAT", { field: "dateFrom" }]),
  query("dateTo")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage(["INVALID_FORMAT", { field: "dateTo" }]),
];

// ─── Result range array validator helper ─────────────────────────────────────

const resultRangesBody = (fieldPath = "resultRanges") => [
  body(fieldPath)
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: fieldPath }])
    .isArray({ min: 1 })
    .withMessage(["INVALID_ARRAY", { field: fieldPath }]),
  body(`${fieldPath}.*.minScore`)
    .isInt({ min: 0 })
    .withMessage([
      "INVALID_RANGE_VALUE",
      { field: "minScore", min: 0 },
    ]),
  body(`${fieldPath}.*.maxScore`)
    .isInt({ min: 0 })
    .withMessage(["INVALID_RANGE_VALUE", { field: "maxScore", min: 0 }]),
  ...localizedField(`${fieldPath}.*.label`, { min: 1, max: 100 }),
  ...localizedField(`${fieldPath}.*.description`, { min: 1, max: 2000 }),
  body(`${fieldPath}.*.recommendations`)
    .optional()
    .isArray()
    .withMessage(["INVALID_ARRAY", { field: "recommendations" }]),
  body(`${fieldPath}.*.recommendations.*.en`)
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "recommendation.en" }]),
  body(`${fieldPath}.*.recommendations.*.ar`)
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "recommendation.ar" }]),
];

// ─── Form validators ──────────────────────────────────────────────────────────

const createForm = [
  ...localizedField("title", { min: 5, max: 200 }),
  ...localizedField("description", { required: false, max: 1000 }),
];

const updateForm = [
  body("title")
    .optional()
    .isObject()
    .withMessage(["INVALID_FORMAT", { field: "title" }]),
  ...localizedField("title", { required: false, min: 5, max: 200 }),
  body("description")
    .optional()
    .isObject()
    .withMessage(["INVALID_FORMAT", { field: "description" }]),
  ...localizedField("description", { required: false, max: 1000 }),
];

// ─── Section validators ───────────────────────────────────────────────────────

const createSectionValidators = [
  ...localizedField("title", { min: 3, max: 200 }),
  ...localizedField("description", { required: false, max: 1000 }),
  body("order")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "order" }])
    .isInt({ min: 1 })
    .withMessage(["INVALID_ORDER", { min: 1 }]),
  ...resultRangesBody("resultRanges"),
];

const updateSection = [
  body("title")
    .optional()
    .isObject()
    .withMessage(["INVALID_FORMAT", { field: "title" }]),
  ...localizedField("title", { required: false, min: 3, max: 200 }),
  body("description")
    .optional()
    .isObject()
    .withMessage(["INVALID_FORMAT", { field: "description" }]),
  ...localizedField("description", { required: false, max: 1000 }),
  body("order")
    .optional()
    .isInt({ min: 1 })
    .withMessage(["INVALID_ORDER", { min: 1 }]),
];

const replaceSectionResultRanges = resultRangesBody("resultRanges");

// ─── Question validators ──────────────────────────────────────────────────────

const choiceValidators = [
  body("choices")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "choices" }])
    .isArray({ min: 2, max: 10 })
    .withMessage(["INVALID_ARRAY", { field: "choices" }]),
  ...localizedField("choices.*.text", { min: 1, max: 300 }),
  body("choices.*.score")
    .isInt({ min: 0, max: 10 })
    .withMessage(["INVALID_RANGE_VALUE", { field: "score", min: 0, max: 10 }]),
];

const addQuestion = [
  ...localizedField("text", { min: 5, max: 500 }),
  body("order")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "order" }])
    .isInt({ min: 1 })
    .withMessage(["INVALID_ORDER", { min: 1 }]),
  body("condition")
    .optional()
    .isObject()
    .withMessage(["INVALID_FORMAT", { field: "condition" }]),
  body("condition.questionId")
    .if(body("condition").exists())
    .isMongoId()
    .withMessage([
      "INVALID_MONGO_ID_FORMAT",
      { field: "condition.questionId" },
    ]),
  body("condition.choiceIds")
    .if(body("condition").exists())
    .isArray({ min: 1 })
    .withMessage(["INVALID_ARRAY", { field: "condition.choiceIds" }]),
  body("condition.choiceIds.*")
    .if(body("condition").exists())
    .isMongoId()
    .withMessage(["INVALID_MONGO_ID_FORMAT", { field: "condition.choiceId" }]),
  ...choiceValidators,
];

const updateQuestion = [
  body("text")
    .optional()
    .isObject()
    .withMessage(["INVALID_FORMAT", { field: "text" }]),
  ...localizedField("text", { required: false, min: 5, max: 500 }),
  body("order")
    .optional()
    .isInt({ min: 1 })
    .withMessage(["INVALID_ORDER", { min: 1 }]),
  body("condition")
    .optional({ nullable: true })
    .custom((value) => {
      if (value !== null && typeof value !== "object") {
        throw new Error("condition must be an object or null");
      }
      return true;
    }),
  body("condition.questionId")
    .if(body("condition").exists().not().equals(null))
    .isMongoId()
    .withMessage([
      "INVALID_MONGO_ID_FORMAT",
      { field: "condition.questionId" },
    ]),
  body("condition.choiceIds")
    .if(body("condition").exists().not().equals(null))
    .isArray({ min: 1 })
    .withMessage(["INVALID_ARRAY", { field: "condition.choiceIds" }]),
  body("condition.choiceIds.*")
    .if(body("condition").exists().not().equals(null))
    .isMongoId()
    .withMessage(["INVALID_MONGO_ID_FORMAT", { field: "condition.choiceId" }]),
  body("choices")
    .optional()
    .isArray({ min: 2, max: 10 })
    .withMessage(["INVALID_ARRAY", { field: "choices" }]),
  body("choices.*.text")
    .if(body("choices").exists())
    .trim()
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "choice text" }])
    .isLength({ min: 1, max: 300 })
    .withMessage(["INVALID_LENGTH", { min: 1, max: 300 }]),
  body("choices.*.score")
    .if(body("choices").exists())
    .isInt({ min: 0, max: 10 })
    .withMessage(["INVALID_RANGE_VALUE", { field: "score", min: 0, max: 10 }]),
];

// ─── Submission validators ────────────────────────────────────────────────────

const sectionAnswers = [
  body("answers")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "answers" }])
    .isArray({ min: 1 })
    .withMessage(["INVALID_ARRAY", { field: "answers" }]),
  body("answers.*.questionId")
    .isMongoId()
    .withMessage(["INVALID_MONGO_ID_FORMAT", { field: "questionId" }]),
  body("answers.*.choiceId")
    .isMongoId()
    .withMessage(["INVALID_MONGO_ID_FORMAT", { field: "choiceId" }]),
];

const submitAllSections = [
  body("formId")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "formId" }])
    .isMongoId()
    .withMessage(["INVALID_MONGO_ID_FORMAT", { field: "formId" }]),
  body("sections")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "sections" }])
    .isArray({ min: 1 })
    .withMessage(["INVALID_ARRAY", { field: "sections" }]),
  body("sections.*.sectionId")
    .isMongoId()
    .withMessage(["INVALID_MONGO_ID_FORMAT", { field: "sectionId" }]),
  body("sections.*.answers")
    .isArray({ min: 1 })
    .withMessage(["INVALID_ARRAY", { field: "answers" }]),
  body("sections.*.answers.*.questionId")
    .isMongoId()
    .withMessage(["INVALID_MONGO_ID_FORMAT", { field: "questionId" }]),
  body("sections.*.answers.*.choiceId")
    .isMongoId()
    .withMessage(["INVALID_MONGO_ID_FORMAT", { field: "choiceId" }]),
];

export default {
  formId,
  sectionId,
  questionId,
  userId,
  pagination,
  createForm,
  updateForm,
  createSection: createSectionValidators,
  updateSection,
  replaceSectionResultRanges,
  addQuestion,
  updateQuestion,
  sectionAnswers,
  submitAllSections,
  submissionsFilter,
};
