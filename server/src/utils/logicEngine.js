/**
 * Evaluates whether a question should be shown based on conditional rules
 * @param {Object|null} rules - The conditional rules object
 * @param {Object} answers - The current answers object
 * @returns {boolean} - Whether the question should be shown
 */
function shouldShowQuestion(rules, answers) {
    // If no rules, always show
    if (!rules || !rules.conditions || rules.conditions.length === 0) {
        return true;
    }

    const { logic, conditions } = rules;

    // Evaluate each condition
    const results = conditions.map(condition => {
        const { questionKey, operator, value } = condition;
        const answer = answers[questionKey];

        // If the answer is undefined or null, condition fails
        if (answer === undefined || answer === null || answer === '') {
            return false;
        }

        switch (operator) {
            case 'equals':
                return String(answer) === String(value);
            case 'notEquals':
                return String(answer) !== String(value);
            case 'contains':
                return String(answer).toLowerCase().includes(String(value).toLowerCase());
            default:
                return false;
        }
    });

    // Combine results based on logic operator
    if (logic === 'AND') {
        return results.every(r => r === true);
    } else if (logic === 'OR') {
        return results.some(r => r === true);
    }

    return false;
}

module.exports = {
    shouldShowQuestion
};
