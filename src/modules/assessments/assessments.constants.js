export const SUBMISSION_STATUS = {
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
};

export const ASSESSMENT_CONDITION_LOGIC = {
  AND: "AND",
  OR: "OR",
};

export const ASSESSMENT_CONDITION_FIELDS = {
  GENDER: "profile.gender",
  AGE: "profile.age",
  MARITAL_STATUS: "profile.maritalStatus",
  ROLE: "profile.role",
};

export const ASSESSMENT_CONDITION_OPERATORS = {
  EQUALS: "equals",
  NOT_EQUALS: "notEquals",
  GREATER_THAN: "greaterThan",
  LESS_THAN: "lessThan",
  GREATER_THAN_OR_EQUALS: "greaterThanOrEquals",
  LESS_THAN_OR_EQUALS: "lessThanOrEquals",
  IN: "in",
};
