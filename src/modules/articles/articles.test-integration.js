// articles.test-integration.js
// Quick integration test to verify the articles module

import Article from "#models/article.js";
import articlesService from "#modules/articles/articles.service.js";

/**
 * Run these tests manually to verify the module works
 * Requires: Admin user ID and running MongoDB
 */

// Test Data
const testAdminId = "your-admin-user-id"; // Replace with actual admin ID
const testArticleData = {
  title: "10 Healthy Breakfast Ideas for Busy Mornings",
  description:
    "Start your day right with these delicious and nutritious breakfast options that take less than 10 minutes to prepare.",
  content:
    "In this comprehensive guide, we explore 10 amazing breakfast recipes that are both healthy and quick to make. From protein-rich smoothies to whole grain toast combinations, we cover everything you need to know about starting your day nutritiously.",
  category: "nutrition-tips",
  tags: ["breakfast", "nutrition", "healthy-eating"],
  estimatedReadTime: 5,
};

/**
 * Test Suite
 */

async function runTests() {
  console.log("🧪 Starting Articles Module Integration Tests\n");

  try {
    // Test 1: Create Article
    console.log("Test 1: Create Article");
    const createResult = await articlesService.createArticle(
      testArticleData,
      testAdminId,
    );
    const articleId = createResult.data._id;
    console.log("✅ Article created:", articleId);
    console.log("   Slug:", createResult.data.slug);
    console.log("");

    // Test 2: Get Article by ID
    console.log("Test 2: Get Article by ID");
    const article = await articlesService.getArticleById(articleId.toString());
    console.log("✅ Article retrieved:", article.title);
    console.log("");

    // Test 3: Get Article by Slug
    console.log("Test 3: Get Article by Slug");
    const slugArticle = await articlesService.getArticleBySlug(article.slug);
    console.log("✅ Article found by slug:", slugArticle.title);
    console.log("");

    // Test 4: Update Article
    console.log("Test 4: Update Article");
    const updateResult = await articlesService.updateArticle(
      articleId.toString(),
      {
        title: "15 Healthy Breakfast Ideas (Updated)",
        estimatedReadTime: 7,
      },
      testAdminId,
    );
    console.log("✅ Article updated:", updateResult.data.title);
    console.log("");

    // Test 5: Get Articles with Filters
    console.log("Test 5: Get Articles with Filters");
    const articlesResult = await articlesService.getArticles({
      page: 1,
      limit: 10,
      category: "nutrition-tips",
      sortBy: "newest",
    });
    console.log("✅ Articles retrieved:", articlesResult.data.length);
    console.log("   Total:", articlesResult.pagination.total);
    console.log("");

    // Test 6: Publish Article
    console.log("Test 6: Publish Article");
    const publishResult = await articlesService.publishArticle(
      articleId.toString(),
      true,
    );
    console.log("✅ Article published:", publishResult.data.isPublished);
    console.log("");

    // Test 7: Get Published Articles (Public)
    console.log("Test 7: Get Published Articles (Public)");
    const publicArticles = await articlesService.getArticles({
      page: 1,
      limit: 10,
    });
    console.log("✅ Published articles:", publicArticles.pagination.total);
    console.log("");

    // Test 8: Increment View Count
    console.log("Test 8: Increment View Count");
    await articlesService.incrementViewCount(articleId.toString());
    const articleAfterView = await Article.findById(articleId);
    console.log("✅ View count incremented:", articleAfterView.viewCount);
    console.log("");

    // Test 9: Get Admin Articles (All)
    console.log("Test 9: Get Admin Articles (All)");
    const adminArticles = await articlesService.getAdminArticles({
      page: 1,
      limit: 10,
    });
    console.log("✅ Admin articles retrieved:", adminArticles.data.length);
    console.log("");

    // Test 10: Change Article Status (Hide)
    console.log("Test 10: Change Article Status (Hide)");
    const hideResult = await articlesService.changeArticleStatus(
      articleId.toString(),
      true,
    );
    console.log("✅ Article hidden:", hideResult.data.isHidden);
    console.log("");

    // Test 11: Get Articles by Category
    console.log("Test 11: Get Articles by Category");
    const categoryArticles = await articlesService.getArticlesByCategory(
      "nutrition-tips",
      1,
      10,
    );
    console.log(
      "✅ Category articles retrieved:",
      categoryArticles.data.length,
    );
    console.log("");

    // Test 12: Delete Article
    console.log("Test 12: Delete Article");
    const deleteResult = await articlesService.deleteArticle(
      articleId.toString(),
    );
    console.log("✅ Article deleted");
    console.log("");

    console.log("✅ All tests passed!\n");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

// Error Handling Tests
async function runErrorTests() {
  console.log("🧪 Starting Error Handling Tests\n");

  try {
    // Test 1: Invalid Article ID
    console.log("Test 1: Invalid Article ID");
    try {
      await articlesService.getArticleById("invalid-id");
      console.log("❌ Should have thrown error");
    } catch (error) {
      console.log("✅ Correctly threw error:", error.message);
    }
    console.log("");

    // Test 2: Article Not Found
    console.log("Test 2: Article Not Found");
    try {
      await articlesService.getArticleById("507f1f77bcf86cd799439011");
      console.log("❌ Should have thrown error");
    } catch (error) {
      console.log("✅ Correctly threw error:", error.message);
    }
    console.log("");

    // Test 3: Validation Error (Missing required fields)
    console.log("Test 3: Validation Error");
    try {
      await articlesService.createArticle(
        {
          title: "Too Short",
          // missing required fields
        },
        testAdminId,
      );
      console.log("❌ Should have thrown error");
    } catch (error) {
      console.log("✅ Correctly threw error:", error.message);
    }
    console.log("");

    console.log("✅ All error tests passed!\n");
  } catch (error) {
    console.error("❌ Error test failed:", error.message);
    process.exit(1);
  }
}

// Run tests
console.log("=============================================");
console.log("   Articles Module - Integration Tests");
console.log("=============================================\n");

// Uncomment to run tests:
// await runTests();
// await runErrorTests();

console.log("📝 To run tests:");
console.log("1. Replace testAdminId with a real admin user ID");
console.log("2. Uncomment the test calls above");
console.log("3. Run: npm test or node test-file.js");
console.log("");
console.log("Note: This is a manual integration test file.");
console.log("For automated testing, use Jest or Mocha.");
