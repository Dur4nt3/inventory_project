// As the ID column is an integer
// We don't want to query the database with any other type
// This works for all ids
export function validateCategoryIdFormat(categoryId) {
    // Because numbers like 1.0 are considered integers
    // We also want to make sure '.' isn't included in the categoryId
    return Number.isInteger(Number(categoryId)) && !categoryId.includes('.');
}