# Section Visibility Conditions - Implementation Guide

## Overview

Sections in assessments can now be made conditionally visible based on user attributes (e.g., gender, age, marital status). Users who don't meet the visibility condition will not see the section and won't be required to complete it.

## Features

- ✅ Sections hidden based on user profile attributes
- ✅ Conditional visibility using AND/OR logic
- ✅ Supports multiple operators (equals, notEquals, greaterThan, etc.)
- ✅ Only visible sections required for form completion
- ✅ Non-visible sections cannot be submitted by users

---

## 1. Creating a Section with Visibility Conditions

### Admin API: Add Section with Condition

**Endpoint:** `POST /admin/assessment/forms/{formId}/sections`

#### Example 1: Female-Only Section

```json
{
  "title": {
    "en": "Women's Health Section",
    "ar": "قسم صحة المرأة"
  },
  "description": {
    "en": "This section is only for female customers",
    "ar": "هذا القسم خاص بالعملاء الإناث فقط"
  },
  "order": 1,
  "visibilityCondition": {
    "rules": [
      {
        "field": "gender",
        "operator": "equals",
        "value": "female"
      }
    ],
    "logic": "AND"
  },
  "questions": [],
  "resultRanges": []
}
```

#### Example 2: Adult Customers (18+)

```json
{
  "title": {
    "en": "Adult Assessment",
    "ar": "التقييم للبالغين"
  },
  "description": {
    "en": "This section is only for customers 18 years or older",
    "ar": "هذا القسم خاص بالعملاء 18 سنة فأكثر"
  },
  "order": 2,
  "visibilityCondition": {
    "rules": [
      {
        "field": "age",
        "operator": "greaterThanOrEquals",
        "value": 18
      }
    ],
    "logic": "AND"
  },
  "questions": [],
  "resultRanges": []
}
```

#### Example 3: Complex Condition (Female AND Married)

```json
{
  "title": {
    "en": "Married Women's Section",
    "ar": "قسم المتزوجات"
  },
  "order": 3,
  "visibilityCondition": {
    "rules": [
      {
        "field": "gender",
        "operator": "equals",
        "value": "female"
      },
      {
        "field": "maritalStatus",
        "operator": "equals",
        "value": "married"
      }
    ],
    "logic": "AND" // Both conditions must be true
  },
  "questions": [],
  "resultRanges": []
}
```

#### Example 4: OR Logic (Female OR Age >= 30)

```json
{
  "title": {
    "en": "Special Health Assessment",
    "ar": "تقييم صحي خاص"
  },
  "order": 4,
  "visibilityCondition": {
    "rules": [
      {
        "field": "gender",
        "operator": "equals",
        "value": "female"
      },
      {
        "field": "age",
        "operator": "greaterThanOrEquals",
        "value": 30
      }
    ],
    "logic": "OR" // At least one condition must be true
  },
  "questions": [],
  "resultRanges": []
}
```

---

## 2. Supported Fields and Operators

### Available Fields

- `gender` - Values: "male", "female"
- `age` - Numeric value (user's age)
- `maritalStatus` - Values: "single", "married", "other"
- `role` - Values: "customer", "specialist", "admin"

### Available Operators

| Operator              | Description    | Example                                                           |
| --------------------- | -------------- | ----------------------------------------------------------------- |
| `equals`              | Exact match    | `{ field: "gender", operator: "equals", value: "female" }`        |
| `notEquals`           | Not equal to   | `{ field: "gender", operator: "notEquals", value: "male" }`       |
| `greaterThan`         | Greater than   | `{ field: "age", operator: "greaterThan", value: 18 }`            |
| `lessThan`            | Less than      | `{ field: "age", operator: "lessThan", value: 65 }`               |
| `greaterThanOrEquals` | >=             | `{ field: "age", operator: "greaterThanOrEquals", value: 18 }`    |
| `lessThanOrEquals`    | <=             | `{ field: "age", operator: "lessThanOrEquals", value: 60 }`       |
| `in`                  | Value in array | `{ field: "gender", operator: "in", value: ["female", "other"] }` |

### Logic Options

- `AND` (default) - All rules must be true for the section to be visible
- `OR` - At least one rule must be true for the section to be visible

---

## 3. Customer Experience

### No Visibility Condition (Default)

If a section has no visibility condition rules, it's visible to **all users**.

```json
{
  "visibilityCondition": {
    "rules": [],
    "logic": "AND"
  }
  // This section is visible to everyone
}
```

### Getting the Active Form

**Endpoint:** `GET /assessment/form`

The API now filters sections based on the current user's profile:

```javascript
// Response will ONLY include sections visible to this user
{
  "success": true,
  "data": {
    "id": "form_123",
    "title": { "en": "Health Assessment", "ar": "..." },
    "sections": [
      // Only sections visible to this user are included
      {
        "id": "section_1",
        "title": { "en": "General Health", "ar": "..." },
        "order": 1
      }
      // Female-only sections are NOT here if user is male
    ]
  }
}
```

### Getting a Specific Section

**Endpoint:** `GET /assessment/sections/{sectionId}`

Returns 403 Forbidden if the section is not visible to the user:

```javascript
// If male user tries to access a female-only section:
{
  "success": false,
  "message": "This section is not available for your profile. Section \"Women's Health Section\" requires different conditions"
}
```

### Submitting Answers

**Endpoint:** `POST /assessment/sections/{sectionId}/answers`

Prevents non-visible sections from being submitted:

```javascript
// If male user tries to submit a female-only section:
{
  "success": false,
  "message": "This section is not available for your profile. Section \"Women's Health Section\" requires different conditions"
}
```

### Finalizing the Form

**Endpoint:** `POST /assessment/finalize`

Only requires visible sections to be completed:

```javascript
// Male user with these sections:
// - General Health (visible) ✓ answered
// - Women's Health (NOT visible) ✗ not required
// - Advanced Testing (visible) ✓ answered
// Result: Form can be finalized! Non-visible sections are automatically skipped.
```

---

## 4. Complete Workflow Example

### Scenario: Health Assessment Form with Gender-Specific Sections

#### Step 1: Admin Creates Form

```bash
POST /admin/assessment/forms
{
  "title": { "en": "Comprehensive Health Assessment", "ar": "..." },
  "description": { ... }
}
Response: { "id": "form_123" }
```

#### Step 2: Admin Adds General Section (visible to all)

```bash
POST /admin/assessment/forms/form_123/sections
{
  "title": { "en": "General Health", "ar": "..." },
  "order": 1,
  "visibilityCondition": {
    "rules": [],
    "logic": "AND"
  },
  "questions": [...],
  "resultRanges": [...]
}
```

#### Step 3: Admin Adds Female-Only Section

```bash
POST /admin/assessment/forms/form_123/sections
{
  "title": { "en": "Women's Health", "ar": "..." },
  "order": 2,
  "visibilityCondition": {
    "rules": [
      { "field": "gender", "operator": "equals", "value": "female" }
    ],
    "logic": "AND"
  },
  "questions": [...],
  "resultRanges": [...]
}
```

#### Step 4: Admin Adds Male-Only Section

```bash
POST /admin/assessment/forms/form_123/sections
{
  "title": { "en": "Men's Health", "ar": "..." },
  "order": 3,
  "visibilityCondition": {
    "rules": [
      { "field": "gender", "operator": "equals", "value": "male" }
    ],
    "logic": "AND"
  },
  "questions": [...],
  "resultRanges": [...]
}
```

#### Step 5: Customer Takes Assessment

**Female Customer:**

```bash
GET /assessment/form
Response:
- General Health (visible) ✓
- Women's Health (visible) ✓
- Men's Health (NOT visible) ✗
```

```bash
// She answers and submits:
POST /assessment/sections/section_1/answers → Success
POST /assessment/sections/section_2/answers → Success
POST /assessment/sections/section_3/answers → Error 403 (Can't submit male-only)

// Finalize requires only visible sections (1 & 2)
POST /assessment/finalize → Success ✓
```

**Male Customer:**

```bash
GET /assessment/form
Response:
- General Health (visible) ✓
- Women's Health (NOT visible) ✗
- Men's Health (visible) ✓
```

```bash
// He answers and submits:
POST /assessment/sections/section_1/answers → Success
POST /assessment/sections/section_2/answers → Error 403 (Can't access female-only)
POST /assessment/sections/section_3/answers → Success

// Finalize requires only visible sections (1 & 3)
POST /assessment/finalize → Success ✓
```

---

## 5. Important Notes

### How Visibility Works

1. **When Getting Form:** Sections are filtered based on user's current profile
2. **When Accessing Section:** User gets 403 error if section is not visible
3. **When Submitting:** User cannot submit non-visible sections
4. **When Finalizing:** Only visible sections are required for completion

### Profile Data Used

The visibility logic reads from `user.profile`:

- `user.profile.gender`
- `user.profile.age`
- `user.profile.maritalStatus`
- `user.role` (customer, specialist, admin)

**Important:** Users must have complete profile data for conditions to work. Empty/null fields won't match any condition.

### Updating Sections

To change visibility conditions after creation:

```bash
PUT /admin/assessment/sections/{sectionId}
{
  "visibilityCondition": {
    "rules": [...],  // Update rules
    "logic": "AND"
  }
}
```

---

## 6. Error Codes

| Error Code                       | HTTP | Description                            |
| -------------------------------- | ---- | -------------------------------------- |
| `ASSESSMENT_SECTION_NOT_VISIBLE` | 403  | Section not visible for user's profile |
| `ASSESSMENT_SECTIONS_INCOMPLETE` | 400  | Not all visible sections completed     |
| `ASSESSMENT_SECTION_NOT_FOUND`   | 404  | Section doesn't exist                  |
| `NO_ACTIVE_ASSESSMENT_FORM`      | 404  | No active assessment form              |

---

## 7. Best Practices

✅ **DO:**

- Define all visibility conditions when creating sections
- Use AND logic when conditions are requirements (e.g., female AND married)
- Use OR logic when conditions are alternatives (e.g., female OR age >= 30)
- Ensure at least one section is visible to all users (empty rules)
- Test with different user profiles before activating forms

❌ **DON'T:**

- Create forms with all sections having restrictive conditions (some users would see nothing)
- Change conditions on active forms frequently (disrupts ongoing assessments)
- Rely on null profile fields for visibility logic
- Use overly complex OR/AND combinations (consider simplifying)
